# Setup Git Hook for Automatic Workflow Monitoring
# Installs a post-push hook that monitors workflows after pushing to develop

$ErrorActionPreference = "Stop"

Write-Host "🔧 Setting up Git Hook for Automatic Workflow Monitoring" -ForegroundColor Cyan
Write-Host ""

# Check if we're in a git repository
if (-not (Test-Path ".git")) {
    Write-Host "✗ Not in a git repository root" -ForegroundColor Red
    exit 1
}

# Get repository root
$repoRoot = git rev-parse --show-toplevel
$hooksDir = Join-Path $repoRoot ".git\hooks"

if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
}

$hookPath = Join-Path $hooksDir "post-push"
$automationDir = Join-Path $repoRoot "automation"
$monitorScript = Join-Path $automationDir "monitor-workflows.ps1"

# Check if monitor script exists
if (-not (Test-Path $monitorScript)) {
    Write-Host "✗ Monitor script not found: $monitorScript" -ForegroundColor Red
    exit 1
}

# Create the hook script
$hookContent = @"
# Git Post-Push Hook
# Automatically monitors GitHub Actions workflows after pushing to develop branch

`$branch = `$args[0]
`$remote = `$args[1]

# Only monitor if pushing to develop branch
if (`$branch -eq "develop" -or `$branch -eq "refs/heads/develop") {
    Write-Host ""
    Write-Host "🚀 Push to develop detected. Starting workflow monitoring..." -ForegroundColor Cyan
    Write-Host ""
    
    # Get automation directory (relative to repo root)
    `$repoRoot = git rev-parse --show-toplevel
    `$automationDir = Join-Path `$repoRoot "automation"
    `$monitorScript = Join-Path `$automationDir "monitor-workflows.ps1"
    
    if (Test-Path `$monitorScript) {
        # Run monitoring script in background or foreground
        # Using Start-Process to run in new window, or & to run in same window
        & PowerShell -ExecutionPolicy Bypass -File `$monitorScript -Branch develop
    } else {
        Write-Host "⚠ Monitor script not found: `$monitorScript" -ForegroundColor Yellow
    }
}
"@

try {
    Set-Content -Path $hookPath -Value $hookContent -Encoding UTF8
    Write-Host "✓ Git hook installed: $hookPath" -ForegroundColor Green
    
    # Make it executable (for Unix-like systems, though we're on Windows)
    # On Windows, PowerShell scripts don't need execute permissions
    
    Write-Host ""
    Write-Host "✅ Git hook setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "The hook will automatically monitor workflows when you push to develop branch." -ForegroundColor Gray
    Write-Host ""
    Write-Host "To test:" -ForegroundColor Cyan
    Write-Host "  1. Make a small change and commit" -ForegroundColor Gray
    Write-Host "  2. Push to develop: git push origin develop" -ForegroundColor Gray
    Write-Host "  3. The monitoring script will run automatically" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To disable, delete: $hookPath" -ForegroundColor Gray
    
} catch {
    Write-Host "✗ Failed to install hook: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

