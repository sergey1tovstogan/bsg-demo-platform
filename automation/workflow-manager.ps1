# GitHub Actions Workflow Manager
# Utility script for managing GitHub Actions workflows

param(
    [switch]$List = $false,
    [switch]$Cancel = $false,
    [switch]$Trigger = $false,
    [int]$RunId = 0,
    [string]$WorkflowName = "",
    [string]$Branch = "develop",
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

Write-Host "🔧 GitHub Actions Workflow Manager" -ForegroundColor Cyan
Write-Host ""

# Check GitHub CLI availability
try {
    gh --version | Out-Null
    Write-Host "✓ GitHub CLI found" -ForegroundColor Green
} catch {
    Write-Host "✗ GitHub CLI not found. Please install: https://cli.github.com/" -ForegroundColor Red
    exit 1
}

# Check authentication
try {
    gh auth status | Out-Null
    Write-Host "✓ GitHub CLI authenticated" -ForegroundColor Green
} catch {
    Write-Host "✗ Not authenticated. Run: gh auth login" -ForegroundColor Red
    exit 1
}

# Get repository info
$repo = gh repo view --json nameWithOwner -q .nameWithOwner
Write-Host "Repository: $repo" -ForegroundColor Gray
Write-Host ""

# List workflow runs
if ($List) {
    Write-Host "📋 Recent Workflow Runs" -ForegroundColor Cyan
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    
    $runs = gh run list --branch $Branch --limit 20 --json databaseId,status,conclusion,name,headBranch,createdAt,updatedAt,url | ConvertFrom-Json
    
    if ($runs.Count -eq 0) {
        Write-Host "No workflow runs found for branch '$Branch'" -ForegroundColor Yellow
        exit 0
    }
    
    foreach ($run in $runs) {
        $status = if ($run.conclusion) { $run.conclusion } else { $run.status }
        $statusColor = switch ($status) {
            "success" { "Green" }
            "failure" { "Red" }
            "cancelled" { "Yellow" }
            "in_progress" { "Cyan" }
            "queued" { "Yellow" }
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
        if ($Verbose) {
            Write-Host "  URL: $($run.url)" -ForegroundColor DarkGray
        }
    }
    
    Write-Host ""
    exit 0
}

# Cancel workflow run
if ($Cancel) {
    if ($RunId -eq 0) {
        Write-Host "✗ Run ID required. Use -RunId <id>" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "🛑 Canceling workflow run $RunId..." -ForegroundColor Yellow
    
    # Get run details first
    try {
        $run = gh run view $RunId --json status,conclusion,workflowName,url | ConvertFrom-Json
        Write-Host "Workflow: $($run.workflowName)" -ForegroundColor Gray
        Write-Host "Status: $($run.status)" -ForegroundColor Gray
        
        if ($run.status -in @("completed", "cancelled")) {
            Write-Host "⚠ Workflow is already completed or cancelled" -ForegroundColor Yellow
            exit 0
        }
    } catch {
        Write-Host "✗ Failed to get run details: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
    
    gh run cancel $RunId
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Workflow run canceled successfully" -ForegroundColor Green
        Write-Host "View: $($run.url)" -ForegroundColor Gray
    } else {
        Write-Host "✗ Failed to cancel workflow run" -ForegroundColor Red
        exit 1
    }
    
    exit 0
}

# Trigger workflow
if ($Trigger) {
    if (-not $WorkflowName) {
        Write-Host "✗ Workflow name required. Use -WorkflowName <name>" -ForegroundColor Red
        Write-Host ""
        Write-Host "Available workflows:" -ForegroundColor Cyan
        gh workflow list
        exit 1
    }
    
    Write-Host "🚀 Triggering workflow: $WorkflowName" -ForegroundColor Cyan
    Write-Host "Branch: $Branch" -ForegroundColor Gray
    
    gh workflow run $WorkflowName --ref $Branch
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Workflow triggered successfully" -ForegroundColor Green
        Write-Host ""
        Write-Host "Run '.\workflow-manager.ps1 -List' to see the new run" -ForegroundColor Gray
    } else {
        Write-Host "✗ Failed to trigger workflow" -ForegroundColor Red
        exit 1
    }
    
    exit 0
}

# No action specified, show help
Write-Host "Usage:" -ForegroundColor Cyan
Write-Host "  .\workflow-manager.ps1 -List                    # List recent workflow runs"
Write-Host "  .\workflow-manager.ps1 -Cancel -RunId <id>     # Cancel a workflow run"
Write-Host "  .\workflow-manager.ps1 -Trigger -WorkflowName <name>  # Trigger a workflow"
Write-Host ""
Write-Host "Options:" -ForegroundColor Cyan
Write-Host "  -Branch <branch>        Branch to filter (default: develop)"
Write-Host "  -Verbose                Show detailed output"
Write-Host ""

