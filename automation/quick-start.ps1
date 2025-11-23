# Quick Start Script
# Simple wrapper to get started with workflow monitoring

param(
    [switch]$Monitor = $false,
    [switch]$Health = $false,
    [switch]$List = $false
)

Write-Host "🚀 GitHub Actions Automation - Quick Start" -ForegroundColor Cyan
Write-Host ""

if (-not $Monitor -and -not $Health -and -not $List) {
    Write-Host "Usage:" -ForegroundColor Yellow
    Write-Host "  .\quick-start.ps1 -Monitor    # Monitor workflows after push"
    Write-Host "  .\quick-start.ps1 -Health     # Check deployment health"
    Write-Host "  .\quick-start.ps1 -List       # List recent workflow runs"
    Write-Host ""
    Write-Host "For more options, use the individual scripts:" -ForegroundColor Gray
    Write-Host "  .\monitor-workflows.ps1 -Help"
    Write-Host "  .\check-deployment-health.ps1 -Help"
    Write-Host "  .\workflow-manager.ps1 -List"
    exit 0
}

if ($Monitor) {
    Write-Host "Starting workflow monitor..." -ForegroundColor Cyan
    & "$PSScriptRoot\monitor-workflows.ps1"
}

if ($Health) {
    Write-Host "Checking deployment health..." -ForegroundColor Cyan
    & "$PSScriptRoot\check-deployment-health.ps1"
}

if ($List) {
    Write-Host "Listing recent workflow runs..." -ForegroundColor Cyan
    & "$PSScriptRoot\workflow-manager.ps1" -List
}

