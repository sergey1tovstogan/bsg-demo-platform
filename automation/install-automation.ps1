# Install Automation Setup
# Sets up both Git hooks and GitHub Actions workflow for automatic monitoring

$ErrorActionPreference = "Stop"

Write-Host "🚀 Installing GitHub Actions Automation" -ForegroundColor Cyan
Write-Host ""

# Get repository root (works from any subdirectory)
try {
    $repoRoot = git rev-parse --show-toplevel
    if (-not $repoRoot -or -not (Test-Path (Join-Path $repoRoot ".git"))) {
        throw "Not in a git repository"
    }
} catch {
    Write-Host "✗ Not in a git repository. Please run from within the repository." -ForegroundColor Red
    exit 1
}

# Change to repo root to ensure correct paths
Push-Location $repoRoot

$hooksDir = Join-Path $repoRoot ".git\hooks"
$automationDir = Join-Path $repoRoot "automation"

Write-Host "Repository: $repoRoot" -ForegroundColor Gray
Write-Host ""

# Step 1: Install Git hook (pre-push)
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 1: Installing Git pre-push hook..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

if (-not (Test-Path $hooksDir)) {
    New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
}

$hookPath = Join-Path $hooksDir "pre-push"
$hookScript = Join-Path $automationDir "pre-push-hook.ps1"
$monitorScript = Join-Path $automationDir "post-push-monitor.ps1"

if (-not (Test-Path $hookScript)) {
    Write-Host "✗ Hook script not found: $hookScript" -ForegroundColor Red
    exit 1
}

# Create the hook file (pre-push runs before push, we'll schedule monitoring)
$hookContent = @"
#!/bin/sh
# Git Pre-Push Hook
# Schedules workflow monitoring after push to develop branch

branch=`$(git symbolic-ref --short HEAD 2>/dev/null || echo "")

if echo "`$branch" | grep -q "develop"; then
    # Schedule monitoring to run after push
    powershell.exe -ExecutionPolicy Bypass -File "$monitorScript" -Branch develop &
fi

exit 0
"@

# Also create PowerShell version
$hookContentPs1 = @"
# Git Pre-Push Hook (PowerShell)
`$branch = git branch --show-current

if (`$branch -eq "develop") {
    # Start monitoring in background
    Start-Process powershell.exe -ArgumentList "-ExecutionPolicy Bypass -File `"$monitorScript`" -Branch develop" -WindowStyle Hidden
}
"@

try {
    # Create shell script version
    Set-Content -Path $hookPath -Value $hookContent -Encoding UTF8 -NoNewline
    
    # Create PowerShell version
    $hookPathPs1 = Join-Path $hooksDir "pre-push.ps1"
    Set-Content -Path $hookPathPs1 -Value $hookContentPs1 -Encoding UTF8
    
    Write-Host "✓ Git pre-push hook installed: $hookPath" -ForegroundColor Green
    Write-Host "✓ PowerShell hook installed: $hookPathPs1" -ForegroundColor Green
    Write-Host "  Note: Monitoring will start automatically after push" -ForegroundColor Gray
} catch {
    Write-Host "✗ Failed to install Git hook: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Step 2: Check GitHub Actions workflow
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 2: Checking GitHub Actions workflow..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$workflowFile = Join-Path $automationDir "auto-monitor-workflow.yml"
$workflowDest = Join-Path $repoRoot ".github\workflows\auto-monitor-workflow.yml"

if (Test-Path $workflowFile) {
    if (-not (Test-Path (Split-Path $workflowDest))) {
        New-Item -ItemType Directory -Path (Split-Path $workflowDest) -Force | Out-Null
    }
    
    Copy-Item -Path $workflowFile -Destination $workflowDest -Force
    Write-Host "✓ GitHub Actions workflow installed: $workflowDest" -ForegroundColor Green
    Write-Host "  This workflow will automatically monitor deployment workflows" -ForegroundColor Gray
} else {
    Write-Host "⚠ Workflow file not found: $workflowFile" -ForegroundColor Yellow
}

# Step 3: Verify GitHub CLI
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 3: Verifying prerequisites..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$allGood = $true

# Check GitHub CLI
try {
    gh --version | Out-Null
    Write-Host "✓ GitHub CLI installed" -ForegroundColor Green
} catch {
    Write-Host "✗ GitHub CLI not found" -ForegroundColor Red
    Write-Host "  Install from: https://cli.github.com/" -ForegroundColor Gray
    $allGood = $false
}

# Check GitHub CLI authentication
try {
    gh auth status | Out-Null
    Write-Host "✓ GitHub CLI authenticated" -ForegroundColor Green
} catch {
    Write-Host "✗ GitHub CLI not authenticated" -ForegroundColor Red
    Write-Host "  Run: gh auth login" -ForegroundColor Gray
    $allGood = $false
}

# Check Git
try {
    git --version | Out-Null
    Write-Host "✓ Git installed" -ForegroundColor Green
} catch {
    Write-Host "✗ Git not found" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Installation Summary" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if ($allGood) {
    Write-Host "✅ Automation setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "What happens now:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Git Hook (Local - Optional):" -ForegroundColor Yellow
    Write-Host "   When you push to 'develop', monitoring will start automatically" -ForegroundColor Gray
    Write-Host "   You can also run manually: .\post-push-monitor.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "2. GitHub Actions Workflow (Cloud - Recommended):" -ForegroundColor Yellow
    Write-Host "   Automatically monitors ALL deployment workflows" -ForegroundColor Gray
    Write-Host "   - Checks health after successful deployments" -ForegroundColor Gray
    Write-Host "   - Analyzes failures and detects issues" -ForegroundColor Gray
    Write-Host "   - Creates comments on PRs (if applicable)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To test:" -ForegroundColor Cyan
    Write-Host "  1. Make a small change and commit" -ForegroundColor Gray
    Write-Host "  2. Push to develop: git push origin develop" -ForegroundColor Gray
    Write-Host "  3. Check GitHub Actions tab - 'Auto Monitor and Fix Workflows' will run" -ForegroundColor Gray
    Write-Host "  4. Or run manually: .\automation\post-push-monitor.ps1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "To disable Git hook:" -ForegroundColor Yellow
    Write-Host "  Delete: $hookPath" -ForegroundColor Gray
    Write-Host "  Delete: $hookPathPs1" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Note: GitHub Actions workflow monitoring works independently" -ForegroundColor Gray
    Write-Host "      and doesn't require the Git hook." -ForegroundColor Gray
} else {
    Write-Host "⚠ Installation completed with warnings" -ForegroundColor Yellow
    Write-Host "Please fix the issues above for full functionality" -ForegroundColor Gray
}

# Return to original directory
Pop-Location

