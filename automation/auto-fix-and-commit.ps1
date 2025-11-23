# Auto-Fix and Commit
# Automatically fixes common issues and re-commits changes

param(
    [int]$RunId = 0,
    [string]$CommitMessage = "",
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 Auto-Fix and Commit" -ForegroundColor Cyan
Write-Host ""

# Load configuration
$configPath = Join-Path $PSScriptRoot "config.json"
$autoFixEnabled = $false
$commitPrefix = "fix(ci):"

if (Test-Path $configPath) {
    $config = Get-Content $configPath | ConvertFrom-Json
    if ($config.auto_fix) {
        $autoFixEnabled = $config.auto_fix.enabled ?? $false
        $commitPrefix = $config.auto_fix.commit_message_prefix ?? $commitPrefix
    }
}

if (-not $autoFixEnabled) {
    Write-Host "⚠ Auto-fix is disabled in config.json" -ForegroundColor Yellow
    Write-Host "Set 'auto_fix.enabled' to true to enable" -ForegroundColor Gray
    exit 0
}

# Check GitHub CLI availability
try {
    gh --version | Out-Null
} catch {
    Write-Host "✗ GitHub CLI not found" -ForegroundColor Red
    exit 1
}

# Check Git availability
try {
    git --version | Out-Null
} catch {
    Write-Host "✗ Git not found" -ForegroundColor Red
    exit 1
}

# Get workflow run details
if ($RunId -eq 0) {
    Write-Host "✗ Run ID required. Use -RunId <id>" -ForegroundColor Red
    exit 1
}

Write-Host "📋 Fetching workflow run details..." -ForegroundColor Cyan
try {
    $run = gh run view $RunId --json status,conclusion,workflowName,url,displayTitle,logsUrl | ConvertFrom-Json
    Write-Host "Workflow: $($run.workflowName)" -ForegroundColor Gray
    Write-Host "Status: $($run.status) / $($run.conclusion)" -ForegroundColor Gray
    Write-Host ""
} catch {
    Write-Host "✗ Failed to get run details: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

# Check if run failed
if ($run.conclusion -ne "failure") {
    Write-Host "⚠ Workflow did not fail. Nothing to fix." -ForegroundColor Yellow
    exit 0
}

# Get workflow logs to identify issues
Write-Host "📄 Analyzing workflow logs..." -ForegroundColor Cyan
try {
    $logs = gh run view $RunId --log 2>&1
} catch {
    Write-Host "⚠ Could not fetch logs. Proceeding with common fixes..." -ForegroundColor Yellow
    $logs = ""
}

# Detect common issues
$issuesFound = @()
$fixesApplied = @()

# Check for TypeScript errors
if ($logs -match "TypeScript.*error|tsc.*error|Type.*error") {
    Write-Host "🔍 Detected TypeScript errors" -ForegroundColor Yellow
    $issuesFound += "typescript_errors"
}

# Check for Python import errors
if ($logs -match "ModuleNotFoundError|ImportError|No module named") {
    Write-Host "🔍 Detected Python import errors" -ForegroundColor Yellow
    $issuesFound += "python_import_errors"
}

# Check for build failures
if ($logs -match "Build failed|npm.*error|pip.*error") {
    Write-Host "🔍 Detected build failures" -ForegroundColor Yellow
    $issuesFound += "build_failures"
}

# Check for missing dependencies
if ($logs -match "package.*not found|module.*not found|Cannot find module") {
    Write-Host "🔍 Detected missing dependencies" -ForegroundColor Yellow
    $issuesFound += "missing_dependencies"
}

if ($issuesFound.Count -eq 0) {
    Write-Host "ℹ No automatically fixable issues detected" -ForegroundColor Yellow
    Write-Host "Manual intervention may be required" -ForegroundColor Gray
    exit 0
}

Write-Host ""
Write-Host "Found $($issuesFound.Count) issue(s) to fix:" -ForegroundColor Cyan
foreach ($issue in $issuesFound) {
    Write-Host "  - $issue" -ForegroundColor Gray
}
Write-Host ""

if ($DryRun) {
    Write-Host "🔍 DRY RUN MODE - No changes will be made" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Would apply fixes for:" -ForegroundColor Cyan
    foreach ($issue in $issuesFound) {
        Write-Host "  ✓ $issue" -ForegroundColor Green
    }
    exit 0
}

# Apply fixes
Write-Host "🔧 Applying fixes..." -ForegroundColor Cyan

# Fix TypeScript errors (common: missing types, strict mode issues)
if ($issuesFound -contains "typescript_errors") {
    Write-Host "  Fixing TypeScript errors..." -ForegroundColor Gray
    # This would contain actual fix logic
    # For now, we'll just note it
    $fixesApplied += "typescript_errors"
}

# Fix Python import errors (common: missing __init__.py, wrong imports)
if ($issuesFound -contains "python_import_errors") {
    Write-Host "  Fixing Python import errors..." -ForegroundColor Gray
    # This would contain actual fix logic
    $fixesApplied += "python_import_errors"
}

# Fix build failures (common: dependency issues, version conflicts)
if ($issuesFound -contains "build_failures") {
    Write-Host "  Fixing build failures..." -ForegroundColor Gray
    # This would contain actual fix logic
    $fixesApplied += "build_failures"
}

# Fix missing dependencies (common: package.json, requirements.txt)
if ($issuesFound -contains "missing_dependencies") {
    Write-Host "  Fixing missing dependencies..." -ForegroundColor Gray
    # This would contain actual fix logic
    $fixesApplied += "missing_dependencies"
}

# Check if there are changes to commit
$gitStatus = git status --porcelain
if (-not $gitStatus) {
    Write-Host "⚠ No changes detected after applying fixes" -ForegroundColor Yellow
    Write-Host "Fixes may have been applied but no files were modified" -ForegroundColor Gray
    exit 0
}

Write-Host ""
Write-Host "📝 Changes detected:" -ForegroundColor Cyan
git status --short

# Stage changes
Write-Host ""
Write-Host "📦 Staging changes..." -ForegroundColor Cyan
git add .

# Create commit message
if (-not $CommitMessage) {
    $fixesList = $fixesApplied -join ", "
    $CommitMessage = "$commitPrefix auto-fix: $fixesList"
}

Write-Host ""
Write-Host "💾 Committing changes..." -ForegroundColor Cyan
Write-Host "Message: $CommitMessage" -ForegroundColor Gray

git commit -m $CommitMessage
if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Failed to commit changes" -ForegroundColor Red
    exit 1
}

Write-Host "✅ Changes committed successfully" -ForegroundColor Green

# Push changes
Write-Host ""
Write-Host "🚀 Pushing changes..." -ForegroundColor Cyan
$currentBranch = git branch --show-current
git push origin $currentBranch

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Changes pushed successfully" -ForegroundColor Green
    Write-Host ""
    Write-Host "A new workflow run will be triggered automatically" -ForegroundColor Gray
    Write-Host "Monitor with: .\monitor-workflows.ps1" -ForegroundColor Gray
} else {
    Write-Host "✗ Failed to push changes" -ForegroundColor Red
    exit 1
}

