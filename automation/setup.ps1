# Automation Setup Script
# Sets up GitHub Actions automation (replaces install-automation.ps1 and setup-git-hook.ps1)

param(
    [switch]$SkipGitHook = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

Write-Host "[SETUP] GitHub Actions Automation Setup" -ForegroundColor Cyan
Write-Host ""

# Get repository root
try {
    $repoRoot = git rev-parse --show-toplevel
    if (-not $repoRoot -or -not (Test-Path (Join-Path $repoRoot ".git"))) {
        throw "Not in a git repository"
    }
} catch {
    Write-Host "[ERROR] Not in a git repository. Please run from within the repository." -ForegroundColor Red
    exit 1
}

Push-Location $repoRoot

$hooksDir = Join-Path $repoRoot ".git\hooks"
$automationDir = Join-Path $repoRoot "automation"

Write-Host "Repository: $repoRoot" -ForegroundColor Gray
Write-Host ""

# Step 1: Verify GitHub Actions workflow
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 1: Checking GitHub Actions workflow..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$workflowFile = Join-Path $automationDir "auto-monitor-workflow.yml"
$workflowDest = Join-Path $repoRoot ".github\workflows\auto-monitor-workflow.yml"

if (Test-Path $workflowFile) {
    if (-not (Test-Path (Split-Path $workflowDest))) {
        New-Item -ItemType Directory -Path (Split-Path $workflowDest) -Force | Out-Null
    }
    Copy-Item -Path $workflowFile -Destination $workflowDest -Force
    Write-Host "[OK] GitHub Actions workflow installed: $workflowDest" -ForegroundColor Green
    Write-Host "  This workflow automatically monitors and fixes deployment workflows" -ForegroundColor Gray
} else {
    Write-Host "[WARN] Workflow file not found: $workflowFile" -ForegroundColor Yellow
}

# Step 2: Setup Git hook (optional)
if (-not $SkipGitHook) {
    Write-Host ""
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    Write-Host "Step 2: Setting up Git hook (optional)..." -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
    
    if (-not (Test-Path $hooksDir)) {
        New-Item -ItemType Directory -Path $hooksDir -Force | Out-Null
    }
    
    $hookPath = Join-Path $hooksDir "pre-push"
    $hookContent = @"
#!/bin/sh
# Git Pre-Push Hook - Triggers workflow monitoring
branch=`$(git symbolic-ref --short HEAD 2>/dev/null || echo "")
if echo "`$branch" | grep -q "develop"; then
    echo ""
    echo "[INFO] Push to develop detected. Monitoring will start automatically via GitHub Actions."
    echo ""
fi
exit 0
"@
    
    try {
        Set-Content -Path $hookPath -Value $hookContent -Encoding UTF8 -NoNewline
        Write-Host "[OK] Git hook installed: $hookPath" -ForegroundColor Green
        Write-Host "  Note: GitHub Actions workflow provides automatic monitoring" -ForegroundColor Gray
    } catch {
        Write-Host "[WARN] Failed to install Git hook: $($_.Exception.Message)" -ForegroundColor Yellow
    }
} else {
    Write-Host "[SKIP] Git hook setup skipped" -ForegroundColor Gray
}

# Step 3: Verify prerequisites
Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Step 3: Verifying prerequisites..." -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan

$allGood = $true

# Check GitHub CLI
try {
    gh --version | Out-Null
    Write-Host "[OK] GitHub CLI installed" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] GitHub CLI not found" -ForegroundColor Red
    Write-Host "  Install from: https://cli.github.com/" -ForegroundColor Gray
    $allGood = $false
}

# Check GitHub CLI authentication
try {
    gh auth status | Out-Null
    Write-Host "[OK] GitHub CLI authenticated" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] GitHub CLI not authenticated" -ForegroundColor Red
    Write-Host "  Run: gh auth login" -ForegroundColor Gray
    $allGood = $false
}

# Check Git
try {
    git --version | Out-Null
    Write-Host "[OK] Git installed" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Git not found" -ForegroundColor Red
    $allGood = $false
}

Pop-Location

Write-Host ""
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Setup Summary" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host ""

if ($allGood) {
    Write-Host "[SUCCESS] Automation setup complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "What's configured:" -ForegroundColor Cyan
    Write-Host "  • GitHub Actions workflow: Automatically monitors and fixes workflows" -ForegroundColor Gray
    Write-Host "  • Auto-fix: Enabled in config.json" -ForegroundColor Gray
    Write-Host "  • Monitoring: Triggers on push to develop" -ForegroundColor Gray
    Write-Host ""
    Write-Host "How it works:" -ForegroundColor Cyan
    Write-Host "  1. Push to develop branch" -ForegroundColor Gray
    Write-Host "  2. Deployment workflows start" -ForegroundColor Gray
    Write-Host "  3. Auto-monitor workflow runs automatically" -ForegroundColor Gray
    Write-Host "  4. On failure → Auto-fixes issues" -ForegroundColor Gray
    Write-Host "  5. Commits and pushes fixes automatically" -ForegroundColor Gray
    Write-Host ""
    Write-Host "No manual intervention needed!" -ForegroundColor Green
} else {
    Write-Host "[WARN] Setup completed with warnings" -ForegroundColor Yellow
    Write-Host "Please fix the issues above for full functionality" -ForegroundColor Gray
}

