# CI/CD Automation Script
# Consolidated script for monitoring, managing, and fixing GitHub Actions workflows
# Replaces: monitor-workflows.ps1, workflow-manager.ps1, cancel-stuck-deployments.ps1, 
#           check-deployment-health.ps1, auto-fix-and-commit.ps1, post-push-monitor.ps1

param(
    [Parameter(Position=0)]
    [ValidateSet("monitor", "list", "cancel", "health", "fix", "status", "help")]
    [string]$Action = "help",
    
    [long]$RunId = 0,
    [string]$WorkflowName = "",
    [string]$Branch = "develop",
    [int]$TimeoutMinutes = 30,
    [int]$MaxMinutes = 25,
    [switch]$AutoFix = $false,
    [switch]$VerifyHealth = $true,
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

# Load configuration
$configPath = Join-Path $PSScriptRoot "config.json"
$config = @{
    branch = "develop"
    monitoring = @{
        timeout_minutes = 30
        poll_interval_seconds = 10
        health_check_retries = 5
        health_check_delay_seconds = 10
    }
    workflows = @{}
    auto_fix = @{
        enabled = $false
        commit_message_prefix = "fix(ci):"
    }
}

if (Test-Path $configPath) {
    $loadedConfig = Get-Content $configPath | ConvertFrom-Json
    if ($loadedConfig.branch) { $config.branch = $loadedConfig.branch }
    if ($loadedConfig.monitoring) { $config.monitoring = $loadedConfig.monitoring }
    if ($loadedConfig.workflows) { $config.workflows = $loadedConfig.workflows }
    if ($loadedConfig.auto_fix) { $config.auto_fix = $loadedConfig.auto_fix }
}

# Apply config defaults
if (-not $Branch -or $Branch -eq "develop") { $Branch = $config.branch }
if ($config.monitoring.timeout_minutes) { $TimeoutMinutes = $config.monitoring.timeout_minutes }

# Check GitHub CLI
function Test-GitHubCLI {
    try {
        gh --version | Out-Null
        return $true
    } catch {
        Write-Host "[ERROR] GitHub CLI not found. Install from: https://cli.github.com/" -ForegroundColor Red
        return $false
    }
}

# Get workflow runs
function Get-WorkflowRuns {
    param([string]$WorkflowFilter = "", [string]$BranchFilter = "develop", [int]$Limit = 20)
    
    $runs = gh run list --branch $BranchFilter --limit $Limit --json databaseId,status,conclusion,name,headBranch,createdAt,updatedAt,workflowName,url | ConvertFrom-Json
    
    if ($WorkflowFilter) {
        return $runs | Where-Object { $_.name -like "*$WorkflowFilter*" -or $_.workflowName -like "*$WorkflowFilter*" }
    }
    return $runs
}

# Get workflow run status
function Get-WorkflowRunStatus {
    param([long]$RunId)
    return gh run view $RunId --json status,conclusion,createdAt,updatedAt,displayTitle,workflowName,url,headBranch | ConvertFrom-Json
}

# Cancel workflow run
function Stop-WorkflowRun {
    param([long]$RunId)
    Write-Host "[CANCEL] Canceling workflow run $RunId..." -ForegroundColor Yellow
    gh run cancel $RunId | Out-Null
    return $LASTEXITCODE -eq 0
}

# Check deployment health
function Test-DeploymentHealth {
    param([string]$BackendUrl = "https://bsg-demo-platform-app.azurewebsites.net", [string]$FrontendUrl = "https://kind-beach-01c0a990f.3.azurestaticapps.net")
    
    Write-Host "[HEALTH] Checking deployment health..." -ForegroundColor Cyan
    
    $allHealthy = $true
    
    # Check backend health
    try {
        $response = Invoke-WebRequest -Uri "$BackendUrl/api/v1/health" -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK] Backend health check passed" -ForegroundColor Green
        } else {
            $allHealthy = $false
        }
    } catch {
        Write-Host "[ERROR] Backend health check failed: $($_.Exception.Message)" -ForegroundColor Red
        $allHealthy = $false
    }
    
    # Check backend liveness
    try {
        $response = Invoke-WebRequest -Uri "$BackendUrl/api/v1/live" -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK] Backend liveness check passed" -ForegroundColor Green
        } else {
            $allHealthy = $false
        }
    } catch {
        Write-Host "[ERROR] Backend liveness check failed: $($_.Exception.Message)" -ForegroundColor Red
        $allHealthy = $false
    }
    
    # Check frontend
    try {
        $response = Invoke-WebRequest -Uri $FrontendUrl -Method Get -TimeoutSec 10 -UseBasicParsing -ErrorAction Stop
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK] Frontend check passed" -ForegroundColor Green
        } else {
            $allHealthy = $false
        }
    } catch {
        Write-Host "[ERROR] Frontend check failed: $($_.Exception.Message)" -ForegroundColor Red
        $allHealthy = $false
    }
    
    return $allHealthy
}

# Monitor workflows
function Start-Monitoring {
    param([string]$BranchFilter, [int]$Timeout, [switch]$VerifyHealthCheck, [switch]$AutoFixEnabled)
    
    Write-Host "[MONITOR] GitHub Actions Workflow Monitor" -ForegroundColor Cyan
    Write-Host "Branch: $BranchFilter" -ForegroundColor Gray
    Write-Host "Timeout: $Timeout minutes" -ForegroundColor Gray
    Write-Host ""
    
    $runs = Get-WorkflowRuns -BranchFilter $BranchFilter -Limit 10
    $activeRuns = $runs | Where-Object { $_.status -in @("in_progress", "queued") }
    
    if ($activeRuns.Count -eq 0) {
        Write-Host "[INFO] No active workflow runs found" -ForegroundColor Yellow
        return
    }
    
    Write-Host "Found $($activeRuns.Count) active workflow run(s)" -ForegroundColor Green
    Write-Host ""
    
    foreach ($run in $activeRuns) {
        $runId = $run.databaseId
        $startTime = Get-Date
        
        Write-Host "──────────────────────────────────────────" -ForegroundColor DarkGray
        Write-Host "Monitoring: $($run.name)" -ForegroundColor Cyan
        Write-Host "Run ID: $runId" -ForegroundColor DarkGray
        Write-Host ""
        
        while ($true) {
            $currentRun = Get-WorkflowRunStatus -RunId $runId
            $elapsed = (Get-Date) - $startTime
            
            # Check timeout
            $currentStep = if ($currentRun.displayTitle) { $currentRun.displayTitle } else { "" }
            $isDeploymentStep = $currentStep -match "Deploy|deploy"
            $stepTimeout = if ($isDeploymentStep) { 15 } else { $Timeout }
            
            if ($elapsed.TotalMinutes -gt $stepTimeout) {
                Write-Host "[TIMEOUT] Timeout reached ($stepTimeout minutes)" -ForegroundColor Yellow
                Stop-WorkflowRun -RunId $runId
                break
            }
            
            $timeStr = "{0:mm\:ss}" -f $elapsed
            Write-Host "[$timeStr] Status: $($currentRun.status)" -ForegroundColor Gray -NoNewline
            
            if ($currentRun.conclusion) {
                $conclusionColor = switch ($currentRun.conclusion) {
                    "success" { "Green" }
                    "failure" { "Red" }
                    "cancelled" { "Yellow" }
                    default { "Gray" }
                }
                Write-Host " -> $($currentRun.conclusion)" -ForegroundColor $conclusionColor
                Write-Host ""
                
                if ($currentRun.conclusion -eq "success" -and $VerifyHealthCheck) {
                    Write-Host "[HEALTH] Waiting 30 seconds before health check..." -ForegroundColor Cyan
                    Start-Sleep -Seconds 30
                    $healthy = Test-DeploymentHealth
                    if (-not $healthy) {
                        Write-Host "[WARN] Deployment health checks failed" -ForegroundColor Yellow
                        Write-Host "[INFO] The deployment completed but services may still be starting." -ForegroundColor Gray
                        Write-Host "[INFO] Check again in a few minutes: $($currentRun.url)" -ForegroundColor Gray
                    } else {
                        Write-Host "[SUCCESS] All health checks passed!" -ForegroundColor Green
                    }
                } elseif ($currentRun.conclusion -eq "failure") {
                    Write-Host "[FAILURE] Workflow failed!" -ForegroundColor Red
                    Write-Host "[INFO] Analyzing failure details..." -ForegroundColor Yellow
                    
                    # Get failed job details
                    try {
                        $jobsJson = gh run view $runId --json jobs | ConvertFrom-Json
                        $failedJobs = $jobsJson.jobs | Where-Object { $_.conclusion -eq "failure" }
                        if ($failedJobs) {
                            Write-Host "[ERROR] Failed job(s):" -ForegroundColor Red
                            foreach ($job in $failedJobs) {
                                Write-Host "  - $($job.name) (ID: $($job.databaseId))" -ForegroundColor Red
                                
                                # Get job logs URL
                                $logsUrl = "$($currentRun.url)/job/$($job.databaseId)"
                                Write-Host "    View logs: $logsUrl" -ForegroundColor DarkGray
                            }
                        }
                    } catch {
                        Write-Host "[INFO] Could not retrieve job details: $($_.Exception.Message)" -ForegroundColor Gray
                    }
                    
                    # Get annotations/errors
                    try {
                        $annotationsJson = gh run view $runId --json annotations | ConvertFrom-Json
                        $errorAnnotations = $annotationsJson.annotations | Where-Object { $_.annotation_level -eq "failure" }
                        if ($errorAnnotations) {
                            Write-Host "[ERROR] Error details:" -ForegroundColor Red
                            $errorCount = 0
                            foreach ($annotation in $errorAnnotations) {
                                $errorCount++
                                if ($errorCount -le 5) {  # Show first 5 errors
                                    Write-Host "  [$errorCount] $($annotation.message)" -ForegroundColor Red
                                    if ($annotation.path) {
                                        Write-Host "      File: $($annotation.path):$($annotation.start_line)" -ForegroundColor DarkGray
                                    }
                                }
                            }
                            if ($errorAnnotations.Count -gt 5) {
                                Write-Host "  ... and $($errorAnnotations.Count - 5) more error(s)" -ForegroundColor DarkGray
                            }
                        }
                    } catch {
                        Write-Host "[INFO] Could not retrieve error annotations" -ForegroundColor Gray
                    }
                    
                    Write-Host ""
                    Write-Host "[ACTION] View full details: $($currentRun.url)" -ForegroundColor Cyan
                    Write-Host "[ACTION] To retry: gh run rerun $runId" -ForegroundColor Cyan
                    
                    if ($AutoFixEnabled) {
                        Write-Host "[AUTO-FIX] Auto-fix enabled - analyzing failure..." -ForegroundColor Yellow
                        # Auto-fix logic would be called here
                        Write-Host "[AUTO-FIX] Auto-fix not yet implemented. Check logs for details." -ForegroundColor Yellow
                    }
                } elseif ($currentRun.conclusion -eq "cancelled") {
                    Write-Host "[CANCELLED] Workflow was cancelled" -ForegroundColor Yellow
                    Write-Host "[INFO] This may have been due to timeout or manual cancellation." -ForegroundColor Gray
                    Write-Host "[INFO] View details: $($currentRun.url)" -ForegroundColor Cyan
                }
                break
            }
            
            Write-Host ""
            Start-Sleep -Seconds 10
        }
        Write-Host ""
    }
}

# List workflow runs
function Show-WorkflowRuns {
    param([string]$BranchFilter, [int]$Limit = 20)
    
    Write-Host "[LIST] Recent Workflow Runs" -ForegroundColor Cyan
    Write-Host "──────────────────────────────────────────" -ForegroundColor DarkGray
    
    $runs = Get-WorkflowRuns -BranchFilter $BranchFilter -Limit $Limit
    
    foreach ($run in $runs) {
        $status = if ($run.conclusion) { $run.conclusion } else { $run.status }
        $statusColor = switch ($status) {
            "success" { "Green" }
            "failure" { "Red" }
            "cancelled" { "Yellow" }
            "in_progress" { "Cyan" }
            default { "Gray" }
        }
        
        $createdAt = [DateTime]::Parse($run.createdAt)
        $timeAgo = (Get-Date) - $createdAt
        $timeStr = if ($timeAgo.TotalMinutes -lt 1) {
            "$([math]::Floor($timeAgo.TotalSeconds))s ago"
        } elseif ($timeAgo.TotalHours -lt 1) {
            "$([math]::Floor($timeAgo.TotalMinutes))m ago"
        } else {
            "$([math]::Floor($timeAgo.TotalHours))h ago"
        }
        
        Write-Host "[$status] $($run.name)" -ForegroundColor $statusColor -NoNewline
        Write-Host " - ID: $($run.databaseId) - $timeStr" -ForegroundColor Gray
        if ($PSBoundParameters.ContainsKey('Verbose') -or $VerbosePreference -eq 'Continue') {
            Write-Host "  URL: $($run.url)" -ForegroundColor DarkGray
        }
    }
}

# Cancel stuck deployments
function Cancel-StuckDeployments {
    param([string]$BranchFilter, [int]$MaxDuration)
    
    Write-Host "[CHECK] Checking for Stuck Deployments" -ForegroundColor Cyan
    Write-Host "Max duration: $MaxDuration minutes" -ForegroundColor Gray
    Write-Host ""
    
    $runs = Get-WorkflowRuns -BranchFilter $BranchFilter -Limit 20
    $runningRuns = $runs | Where-Object { $_.status -in @("in_progress", "queued") }
    
    if ($runningRuns.Count -eq 0) {
        Write-Host "[OK] No running workflows found" -ForegroundColor Green
        return
    }
    
    $stuckRuns = @()
    foreach ($run in $runningRuns) {
        $createdAt = [DateTime]::Parse($run.createdAt)
        $duration = ((Get-Date) - $createdAt).TotalMinutes
        
        if ($duration -gt $MaxDuration) {
            Write-Host "[WARN] Stuck workflow: $($run.workflowName) (Run ID: $($run.databaseId), Duration: $([math]::Floor($duration))m)" -ForegroundColor Yellow
            $stuckRuns += $run
        }
    }
    
    if ($stuckRuns.Count -eq 0) {
        Write-Host "[OK] No stuck workflows found" -ForegroundColor Green
        return
    }
    
    if ($DryRun) {
        Write-Host "[DRY-RUN] Would cancel $($stuckRuns.Count) stuck workflow(s)" -ForegroundColor Cyan
        return
    }
    
    foreach ($stuck in $stuckRuns) {
        Stop-WorkflowRun -RunId $stuck.databaseId
    }
    
    Write-Host "[SUCCESS] Canceled $($stuckRuns.Count) stuck workflow(s)" -ForegroundColor Green
}

# Show help
function Show-Help {
    Write-Host "CI/CD Automation Script" -ForegroundColor Cyan
    Write-Host "Consolidated script for GitHub Actions workflow management" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\ci-automation.ps1 <action> [options]" -ForegroundColor White
    Write-Host ""
    Write-Host "Actions:" -ForegroundColor Yellow
    Write-Host "  monitor    Monitor workflows after push (default)" -ForegroundColor Gray
    Write-Host "  list       List recent workflow runs" -ForegroundColor Gray
    Write-Host "  cancel     Cancel stuck or specific workflow runs" -ForegroundColor Gray
    Write-Host "  health     Check deployment health" -ForegroundColor Gray
    Write-Host "  fix        Auto-fix issues from failed workflow" -ForegroundColor Gray
    Write-Host "  status     Show current workflow status" -ForegroundColor Gray
    Write-Host "  help       Show this help message" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\ci-automation.ps1 monitor                    # Monitor workflows" -ForegroundColor Gray
    Write-Host "  .\ci-automation.ps1 list                       # List recent runs" -ForegroundColor Gray
    Write-Host "  .\ci-automation.ps1 cancel -RunId 123456      # Cancel specific run" -ForegroundColor Gray
    Write-Host "  .\ci-automation.ps1 cancel                     # Cancel stuck deployments" -ForegroundColor Gray
    Write-Host "  .\ci-automation.ps1 health                     # Check deployment health" -ForegroundColor Gray
    Write-Host "  .\ci-automation.ps1 fix -RunId 123456          # Auto-fix failed run" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Options:" -ForegroundColor Yellow
    Write-Host "  -RunId <id>           Workflow run ID" -ForegroundColor Gray
    Write-Host "  -WorkflowName <name> Filter by workflow name" -ForegroundColor Gray
    Write-Host "  -Branch <branch>     Branch to monitor (default: develop)" -ForegroundColor Gray
    Write-Host "  -TimeoutMinutes <n>  Timeout in minutes (default: 30)" -ForegroundColor Gray
    Write-Host "  -MaxMinutes <n>      Max duration for stuck detection (default: 25)" -ForegroundColor Gray
    Write-Host "  -AutoFix             Enable auto-fix (for monitor action)" -ForegroundColor Gray
    Write-Host "  -VerifyHealth        Verify deployment health (default: true)" -ForegroundColor Gray
    Write-Host "  -DryRun              Show what would be done without doing it" -ForegroundColor Gray
    Write-Host "  -Verbose             Show detailed output (PowerShell common parameter)" -ForegroundColor Gray
}

# Main execution
if (-not (Test-GitHubCLI)) {
    exit 1
}

try {
    gh auth status | Out-Null
} catch {
    Write-Host "[ERROR] Not authenticated. Run: gh auth login" -ForegroundColor Red
    exit 1
}

switch ($Action) {
    "monitor" {
        Start-Monitoring -BranchFilter $Branch -Timeout $TimeoutMinutes -VerifyHealthCheck:$VerifyHealth -AutoFixEnabled:$AutoFix
    }
    "list" {
        Show-WorkflowRuns -BranchFilter $Branch
    }
    "cancel" {
        if ($RunId -gt 0) {
            Stop-WorkflowRun -RunId $RunId
        } else {
            Cancel-StuckDeployments -BranchFilter $Branch -MaxDuration $MaxMinutes
        }
    }
    "health" {
        $backendUrl = if ($config.workflows."deploy-backend" -and $config.workflows."deploy-backend".health_check_url) {
            $config.workflows."deploy-backend".health_check_url -replace "/api/v1/health", ""
        } else {
            "https://bsg-demo-platform-app.azurewebsites.net"
        }
        $frontendUrl = if ($config.workflows."deploy-frontend" -and $config.workflows."deploy-frontend".health_check_url) {
            $config.workflows."deploy-frontend".health_check_url
        } else {
            "https://kind-beach-01c0a990f.3.azurestaticapps.net"
        }
        $healthy = Test-DeploymentHealth -BackendUrl $backendUrl -FrontendUrl $frontendUrl
        exit $(if ($healthy) { 0 } else { 1 })
    }
    "fix" {
        if ($RunId -eq 0) {
            Write-Host "[ERROR] RunId required for fix action. Use: .\ci-automation.ps1 fix -RunId <id>" -ForegroundColor Red
            exit 1
        }
        
        Write-Host "[FIX] Analyzing failed workflow run $RunId..." -ForegroundColor Cyan
        Write-Host ""
        
        $runStatus = Get-WorkflowRunStatus -RunId $RunId
        
        if ($runStatus.conclusion -ne "failure") {
            Write-Host "[INFO] Workflow run $RunId did not fail (status: $($runStatus.conclusion))" -ForegroundColor Yellow
            exit 0
        }
        
        Write-Host "Workflow: $($runStatus.workflowName)" -ForegroundColor Cyan
        Write-Host "Title: $($runStatus.displayTitle)" -ForegroundColor Gray
        Write-Host "URL: $($runStatus.url)" -ForegroundColor DarkGray
        Write-Host ""
        
        # Get failed jobs
        try {
            $jobs = gh run view $RunId --json jobs --jq '.jobs[] | select(.conclusion == "failure")' | ConvertFrom-Json
            if ($jobs) {
                Write-Host "[ERROR] Failed job(s):" -ForegroundColor Red
                foreach ($job in $jobs) {
                    Write-Host "  - $($job.name)" -ForegroundColor Red
                    $jobUrl = "$($runStatus.url)/job/$($job.databaseId)"
                    Write-Host "    Logs: $jobUrl" -ForegroundColor DarkGray
                }
            }
        } catch {
            Write-Host "[WARN] Could not retrieve job details" -ForegroundColor Yellow
        }
        
        # Get error annotations
        try {
            $annotations = gh run view $RunId --json annotations --jq '.annotations[] | select(.annotation_level == "failure")' | ConvertFrom-Json
            if ($annotations) {
                Write-Host ""
                Write-Host "[ERROR] Error Summary:" -ForegroundColor Red
                $errorCount = 0
                foreach ($annotation in $annotations) {
                    $errorCount++
                    Write-Host "  [$errorCount] $($annotation.message)" -ForegroundColor Red
                    if ($annotation.path) {
                        Write-Host "      Location: $($annotation.path):$($annotation.start_line)" -ForegroundColor DarkGray
                    }
                }
            }
        } catch {
            Write-Host "[INFO] Could not retrieve error annotations" -ForegroundColor Gray
        }
        
        Write-Host ""
        Write-Host "[ACTION] Recommended actions:" -ForegroundColor Cyan
        Write-Host "  1. Review the full logs: $($runStatus.url)" -ForegroundColor White
        Write-Host "  2. Check for common issues:" -ForegroundColor White
        Write-Host "     - TypeScript/compilation errors" -ForegroundColor Gray
        Write-Host "     - Missing dependencies" -ForegroundColor Gray
        Write-Host "     - Configuration issues" -ForegroundColor Gray
        Write-Host "  3. Fix the issues and push again" -ForegroundColor White
        Write-Host "  4. Or retry the run: gh run rerun $RunId" -ForegroundColor White
    }
    "status" {
        $runs = Get-WorkflowRuns -BranchFilter $Branch -Limit 5
        $active = $runs | Where-Object { $_.status -in @("in_progress", "queued") }
        $recent = $runs | Select-Object -First 5
        
        Write-Host "[STATUS] Workflow Status" -ForegroundColor Cyan
        Write-Host "Active runs: $($active.Count)" -ForegroundColor $(if ($active.Count -gt 0) { "Yellow" } else { "Green" })
        Write-Host ""
        Show-WorkflowRuns -BranchFilter $Branch -Limit 5
    }
    "help" {
        Show-Help
    }
    default {
        Show-Help
    }
}

