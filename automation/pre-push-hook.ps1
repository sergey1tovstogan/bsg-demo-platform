# Git Pre-Push Hook Script
# This script runs BEFORE the push, then monitors AFTER
# We use pre-push because Git doesn't have post-push hook

param(
    [string]$RemoteName = "",
    [string]$RemoteUrl = ""
)

# Only monitor if pushing to develop branch
$currentBranch = git branch --show-current

if ($currentBranch -eq "develop") {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "🚀 Pushing to develop branch" -ForegroundColor Cyan
    Write-Host "Workflow monitoring will start after push completes..." -ForegroundColor Gray
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    # Schedule monitoring to run after push
    # We'll use Start-Job or Start-Process to run it in background
    $repoRoot = git rev-parse --show-toplevel
    $automationDir = Join-Path $repoRoot "automation"
    $monitorScript = Join-Path $automationDir "monitor-workflows.ps1"
    
    if (Test-Path $monitorScript) {
        # Start monitoring in background after a short delay
        $jobScript = @"
Start-Sleep -Seconds 5
& '$monitorScript' -Branch develop -VerifyHealth
"@
        Start-Job -ScriptBlock ([scriptblock]::Create($jobScript)) | Out-Null
        Write-Host "✓ Monitoring scheduled (will start in 5 seconds)" -ForegroundColor Green
    }
}

# Always allow the push to proceed
exit 0

