# Post-Push Monitor Script
# Run this manually after pushing, or it will be triggered automatically
# This is a more reliable alternative to Git hooks

param(
    [string]$Branch = "develop",
    [switch]$WaitForPush = $true,
    [int]$WaitSeconds = 10
)

$ErrorActionPreference = "Stop"

Write-Host "🔍 Post-Push Workflow Monitor" -ForegroundColor Cyan
Write-Host ""

# Get repository info
$repoRoot = git rev-parse --show-toplevel
$automationDir = Join-Path $repoRoot "automation"
$monitorScript = Join-Path $automationDir "monitor-workflows.ps1"

if (-not (Test-Path $monitorScript)) {
    Write-Host "✗ Monitor script not found: $monitorScript" -ForegroundColor Red
    exit 1
}

# Get current branch
$currentBranch = git branch --show-current

if ($currentBranch -ne $Branch) {
    Write-Host "⚠ Current branch is '$currentBranch', not '$Branch'" -ForegroundColor Yellow
    Write-Host "Monitoring workflows for branch: $Branch" -ForegroundColor Gray
}

if ($WaitForPush) {
    Write-Host "⏳ Waiting $WaitSeconds seconds for push to complete and workflows to start..." -ForegroundColor Gray
    Start-Sleep -Seconds $WaitSeconds
}

Write-Host ""
Write-Host "Starting workflow monitoring..." -ForegroundColor Cyan
Write-Host ""

# Run the monitor script
& $monitorScript -Branch $Branch -VerifyHealth

exit $LASTEXITCODE

