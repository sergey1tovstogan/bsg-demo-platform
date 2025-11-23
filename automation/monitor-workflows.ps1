# Monitor GitHub Actions Workflows
# Monitors workflows triggered by pushes to develop branch
# Can cancel long-running workflows and verify deployment health

param(
    [string]$WorkflowName = "",
    [int]$TimeoutMinutes = 30,
    [switch]$AutoFix = $false,
    [switch]$VerifyHealth = $true,
    [string]$Branch = "develop"
)

$ErrorActionPreference = "Stop"

# Load configuration
$configPath = Join-Path $PSScriptRoot "config.json"
if (Test-Path $configPath) {
    $config = Get-Content $configPath | ConvertFrom-Json
    if ($config.monitoring) {
        $TimeoutMinutes = $config.monitoring.timeout_minutes ?? $TimeoutMinutes
    }
    if ($config.branch) {
        $Branch = $config.branch
    }
}

Write-Host "🔍 GitHub Actions Workflow Monitor" -ForegroundColor Cyan
Write-Host "Branch: $Branch" -ForegroundColor Gray
Write-Host "Timeout: $TimeoutMinutes minutes" -ForegroundColor Gray
Write-Host ""

# Check GitHub CLI availability
try {
    $ghVersion = gh --version 2>&1
    Write-Host "✓ GitHub CLI found" -ForegroundColor Green
} catch {
    Write-Host "✗ GitHub CLI not found. Please install: https://cli.github.com/" -ForegroundColor Red
    exit 1
}

# Check authentication
try {
    $authStatus = gh auth status 2>&1
    if ($LASTEXITCODE -ne 0) {
        Write-Host "✗ Not authenticated. Run: gh auth login" -ForegroundColor Red
        exit 1
    }
    Write-Host "✓ GitHub CLI authenticated" -ForegroundColor Green
} catch {
    Write-Host "✗ Authentication check failed" -ForegroundColor Red
    exit 1
}

# Get repository info
$repo = gh repo view --json nameWithOwner -q .nameWithOwner
Write-Host "Repository: $repo" -ForegroundColor Gray
Write-Host ""

# Function to get workflow runs
function Get-WorkflowRuns {
    param([string]$WorkflowFilter = "")
    
    $args = @("run", "list", "--branch", $Branch, "--limit", "10", "--json", "databaseId,status,conclusion,name,headBranch,createdAt,updatedAt,workflowDatabaseId")
    
    if ($WorkflowFilter) {
        $runs = gh run list --branch $Branch --limit 50 --json databaseId,status,conclusion,name,headBranch,createdAt,updatedAt,workflowDatabaseId | ConvertFrom-Json
        return $runs | Where-Object { $_.name -like "*$WorkflowFilter*" }
    }
    
    return gh $args | ConvertFrom-Json
}

# Function to get workflow run status
function Get-WorkflowRunStatus {
    param([int]$RunId)
    
    $run = gh run view $RunId --json status,conclusion,createdAt,updatedAt,displayTitle,workflowName,url | ConvertFrom-Json
    return $run
}

# Function to cancel workflow run
function Stop-WorkflowRun {
    param([int]$RunId)
    
    Write-Host "🛑 Canceling workflow run $RunId..." -ForegroundColor Yellow
    gh run cancel $RunId
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✓ Workflow run canceled" -ForegroundColor Green
        return $true
    } else {
        Write-Host "✗ Failed to cancel workflow run" -ForegroundColor Red
        return $false
    }
}

# Function to check if workflow exceeded timeout
function Test-WorkflowTimeout {
    param(
        [object]$Run,
        [int]$TimeoutMinutes
    )
    
    $createdAt = [DateTime]::Parse($Run.createdAt)
    $now = Get-Date
    $duration = ($now - $createdAt).TotalMinutes
    
    return $duration -gt $TimeoutMinutes
}

# Function to verify deployment health
function Test-DeploymentHealth {
    param([string]$HealthUrl)
    
    if (-not $HealthUrl) {
        return $false
    }
    
    Write-Host "🏥 Checking deployment health: $HealthUrl" -ForegroundColor Cyan
    
    try {
        $response = Invoke-WebRequest -Uri $HealthUrl -Method Get -TimeoutSec 10 -UseBasicParsing
        if ($response.StatusCode -eq 200) {
            Write-Host "✓ Health check passed" -ForegroundColor Green
            return $true
        }
    } catch {
        Write-Host "✗ Health check failed: $($_.Exception.Message)" -ForegroundColor Red
        return $false
    }
    
    return $false
}

# Get recent workflow runs
Write-Host "📋 Fetching recent workflow runs..." -ForegroundColor Cyan
$runs = Get-WorkflowRuns -WorkflowFilter $WorkflowName

if (-not $runs -or $runs.Count -eq 0) {
    Write-Host "⚠ No workflow runs found for branch '$Branch'" -ForegroundColor Yellow
    exit 0
}

# Filter to in-progress or queued runs
$activeRuns = $runs | Where-Object { $_.status -in @("in_progress", "queued") }

if ($activeRuns.Count -eq 0) {
    Write-Host "ℹ No active workflow runs found" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Recent completed runs:" -ForegroundColor Cyan
    $runs | Select-Object -First 5 | ForEach-Object {
        $status = if ($_.conclusion) { $_.conclusion } else { $_.status }
        $statusColor = switch ($status) {
            "success" { "Green" }
            "failure" { "Red" }
            "cancelled" { "Yellow" }
            default { "Gray" }
        }
        Write-Host "  [$status] $($_.name) - Run ID: $($_.databaseId)" -ForegroundColor $statusColor
    }
    exit 0
}

Write-Host "Found $($activeRuns.Count) active workflow run(s)" -ForegroundColor Green
Write-Host ""

# Monitor each active run
$allSucceeded = $true
foreach ($run in $activeRuns) {
    $runId = $run.databaseId
    $runName = $run.name
    
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "Monitoring: $runName" -ForegroundColor Cyan
    Write-Host "Run ID: $runId" -ForegroundColor Gray
    Write-Host "Status: $($run.status)" -ForegroundColor Gray
    Write-Host ""
    
    $startTime = Get-Date
    $timeoutReached = $false
    
    # Poll until completion or timeout
    while ($true) {
        $currentRun = Get-WorkflowRunStatus -RunId $runId
        $elapsed = (Get-Date) - $startTime
        
        Write-Host "[$($elapsed.ToString('mm\:ss'))] Status: $($currentRun.status)" -ForegroundColor Gray -NoNewline
        
        if ($currentRun.conclusion) {
            Write-Host " → $($currentRun.conclusion)" -ForegroundColor $(if ($currentRun.conclusion -eq "success") { "Green" } else { "Red" })
            Write-Host ""
            
            if ($currentRun.conclusion -eq "success") {
                Write-Host "✅ Workflow completed successfully!" -ForegroundColor Green
                
                # Verify health if enabled
                if ($VerifyHealth) {
                    # Try to get health URL from config
                    $healthUrl = $null
                    if (Test-Path $configPath) {
                        $config = Get-Content $configPath | ConvertFrom-Json
                        $workflowConfig = $config.workflows.PSObject.Properties | Where-Object { 
                            $_.Value.file -eq ($runName -replace ".*/", "")
                        } | Select-Object -First 1
                        if ($workflowConfig) {
                            $healthUrl = $workflowConfig.Value.health_check_url
                        }
                    }
                    
                    if ($healthUrl) {
                        Start-Sleep -Seconds 30  # Wait for deployment to stabilize
                        $healthOk = Test-DeploymentHealth -HealthUrl $healthUrl
                        if (-not $healthOk) {
                            $allSucceeded = $false
                        }
                    }
                }
            } else {
                Write-Host "❌ Workflow failed: $($currentRun.conclusion)" -ForegroundColor Red
                Write-Host "View details: $($currentRun.url)" -ForegroundColor Gray
                $allSucceeded = $false
                
                if ($AutoFix) {
                    Write-Host "🔧 Auto-fix enabled. Checking for fixable issues..." -ForegroundColor Yellow
                    # Auto-fix logic would go here
                    # This would call auto-fix-and-commit.ps1
                }
            }
            
            break
        }
        
        # Check timeout - be more aggressive for deployment steps
        $currentStep = $currentRun.displayTitle
        $isDeploymentStep = $currentStep -match "Deploy|deploy"
        
        # Shorter timeout for deployment steps (15 min) vs general timeout
        $stepTimeout = if ($isDeploymentStep) { 15 } else { $TimeoutMinutes }
        
        if ($elapsed.TotalMinutes -gt $stepTimeout) {
            Write-Host ""
            Write-Host "⏱ Timeout reached ($stepTimeout minutes)" -ForegroundColor Yellow
            Write-Host "Current step: $currentStep" -ForegroundColor Gray
            Write-Host "Elapsed time: $([math]::Floor($elapsed.TotalMinutes)) minutes" -ForegroundColor Gray
            
            if ($isDeploymentStep -and $elapsed.TotalMinutes -gt 20) {
                Write-Host "⚠ Deployment step appears stuck (exceeded 20 minutes)" -ForegroundColor Red
                Write-Host "Canceling workflow to prevent further delays..." -ForegroundColor Yellow
            }
            
            $canceled = Stop-WorkflowRun -RunId $runId
            $timeoutReached = $true
            $allSucceeded = $false
            break
        }
        
        Write-Host ""
        Start-Sleep -Seconds 10
    }
    
    Write-Host ""
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

if ($allSucceeded) {
    Write-Host "✅ All workflows completed successfully!" -ForegroundColor Green
    exit 0
} else {
    Write-Host "❌ Some workflows failed or were canceled" -ForegroundColor Red
    exit 1
}

