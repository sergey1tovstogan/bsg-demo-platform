# Cancel Stuck Deployments
# Finds and cancels deployment workflows that have been running too long

param(
    [int]$MaxMinutes = 25,
    [string]$Branch = "develop",
    [switch]$DryRun = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🔍 Checking for Stuck Deployments" -ForegroundColor Cyan
Write-Host "Max duration: $MaxMinutes minutes" -ForegroundColor Gray
Write-Host ""

# Check GitHub CLI
try {
    gh --version | Out-Null
} catch {
    Write-Host "✗ GitHub CLI not found" -ForegroundColor Red
    exit 1
}

# Get running workflows
Write-Host "📋 Fetching running workflows..." -ForegroundColor Cyan
$runs = gh run list --branch $Branch --limit 20 --json databaseId,status,conclusion,name,headBranch,createdAt,updatedAt,workflowName,displayTitle | ConvertFrom-Json

$runningRuns = $runs | Where-Object { $_.status -in @("in_progress", "queued") }

if ($runningRuns.Count -eq 0) {
    Write-Host "✓ No running workflows found" -ForegroundColor Green
    exit 0
}

Write-Host "Found $($runningRuns.Count) running workflow(s)" -ForegroundColor Yellow
Write-Host ""

$stuckRuns = @()

foreach ($run in $runningRuns) {
    $createdAt = [DateTime]::Parse($run.createdAt)
    $now = Get-Date
    $duration = ($now - $createdAt).TotalMinutes
    
    # Get detailed run info
    $runDetails = gh run view $run.databaseId --json status,conclusion,createdAt,updatedAt,displayTitle,workflowName,url,jobs | ConvertFrom-Json
    
    # Check if it's a deployment workflow
    $isDeployment = $run.workflowName -match "Deploy|deploy"
    
    # Check if it's stuck (exceeded max time)
    $isStuck = $duration -gt $MaxMinutes
    
    if ($isStuck) {
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Write-Host "⚠ Stuck Workflow Detected" -ForegroundColor Yellow
        Write-Host "  Name: $($run.workflowName)" -ForegroundColor Gray
        Write-Host "  Run ID: $($run.databaseId)" -ForegroundColor Gray
        Write-Host "  Duration: $([math]::Floor($duration)) minutes" -ForegroundColor Gray
        Write-Host "  Status: $($run.status)" -ForegroundColor Gray
        Write-Host "  URL: $($runDetails.url)" -ForegroundColor Gray
        
        # Check current job/step
        if ($runDetails.jobs) {
            $currentJob = $runDetails.jobs | Where-Object { $_.status -eq "in_progress" } | Select-Object -First 1
            if ($currentJob) {
                Write-Host "  Current Job: $($currentJob.name)" -ForegroundColor Gray
            }
        }
        
        Write-Host ""
        
        $stuckRuns += @{
            RunId = $run.databaseId
            Name = $run.workflowName
            Duration = $duration
            Url = $runDetails.url
        }
    } else {
        Write-Host "✓ $($run.workflowName) - Running for $([math]::Floor($duration)) minutes (OK)" -ForegroundColor Green
    }
}

Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
Write-Host ""

if ($stuckRuns.Count -eq 0) {
    Write-Host "✅ No stuck workflows found" -ForegroundColor Green
    exit 0
}

Write-Host "Found $($stuckRuns.Count) stuck workflow(s)" -ForegroundColor Yellow
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No actions will be taken" -ForegroundColor Cyan
    Write-Host ""
    foreach ($stuck in $stuckRuns) {
        Write-Host "Would cancel: $($stuck.Name) (Run ID: $($stuck.RunId))" -ForegroundColor Gray
    }
    exit 0
}

# Cancel stuck runs
foreach ($stuck in $stuckRuns) {
    Write-Host "🛑 Canceling: $($stuck.Name)" -ForegroundColor Yellow
    Write-Host "  Run ID: $($stuck.RunId)" -ForegroundColor Gray
    Write-Host "  Duration: $([math]::Floor($stuck.Duration)) minutes" -ForegroundColor Gray
    
    gh run cancel $stuck.RunId
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✅ Canceled successfully" -ForegroundColor Green
    } else {
        Write-Host "  ❌ Failed to cancel" -ForegroundColor Red
    }
    Write-Host ""
}

Write-Host "✅ Done! Canceled $($stuckRuns.Count) stuck workflow(s)" -ForegroundColor Green
Write-Host ""
Write-Host "You can now:" -ForegroundColor Cyan
Write-Host "  1. Fix any issues that may have caused the hang" -ForegroundColor Gray
Write-Host "  2. Push again to trigger a new deployment" -ForegroundColor Gray
Write-Host "  3. Monitor the new run: .\monitor-workflows.ps1" -ForegroundColor Gray

