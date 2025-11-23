# Git Post-Push Hook Script
# This script is called automatically by Git after a push
# It monitors GitHub Actions workflows for the pushed branch

param(
    [string]$Branch = "",
    [string]$Remote = ""
)

# Only monitor if pushing to develop branch
if ($Branch -eq "develop" -or $Branch -eq "refs/heads/develop" -or $Branch -match "develop$") {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "🚀 Push to develop detected" -ForegroundColor Cyan
    Write-Host "Starting automatic workflow monitoring..." -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host ""
    
    # Get automation directory (relative to repo root)
    $repoRoot = git rev-parse --show-toplevel
    $automationDir = Join-Path $repoRoot "automation"
    $monitorScript = Join-Path $automationDir "monitor-workflows.ps1"
    
    if (Test-Path $monitorScript) {
        # Run monitoring script
        & PowerShell -ExecutionPolicy Bypass -File $monitorScript -Branch develop -VerifyHealth
        
        $exitCode = $LASTEXITCODE
        if ($exitCode -eq 0) {
            Write-Host ""
            Write-Host "✅ Workflow monitoring completed successfully" -ForegroundColor Green
        } else {
            Write-Host ""
            Write-Host "⚠ Workflow monitoring completed with issues" -ForegroundColor Yellow
            Write-Host "Check the output above for details" -ForegroundColor Gray
        }
    } else {
        Write-Host "⚠ Monitor script not found: $monitorScript" -ForegroundColor Yellow
        Write-Host "Run .\automation\setup-git-hook.ps1 to set up automation" -ForegroundColor Gray
    }
    
    Write-Host ""
}

