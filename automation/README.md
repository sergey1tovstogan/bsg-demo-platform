# GitHub Actions Automation

This folder contains scripts for automating GitHub Actions workflow monitoring, verification, and management.

## Overview

The automation scripts help you:
- **Monitor** GitHub Actions workflows after pushes to `develop` branch
- **Poll** workflow status until completion
- **Verify** platform functionality after deployment
- **Cancel** long-running workflows if they exceed time limits
- **Detect and cancel** stuck deployments automatically
- **Fix** issues automatically and re-commit changes
- **Trigger** new workflow runs after fixes

## Scripts

### 1. `monitor-workflows.ps1` (PowerShell)
Main script for monitoring GitHub Actions workflows. Can be run interactively or scheduled.

**Features:**
- Monitors workflows triggered by pushes to `develop` branch
- Polls workflow status until completion
- Cancels workflows that exceed timeout (especially deployment steps)
- Detects stuck deployments (15 min timeout for deployment steps)
- Verifies deployment health after successful runs
- Optionally fixes issues and re-commits

**Usage:**
```powershell
# Monitor workflows after a push (interactive)
.\monitor-workflows.ps1

# Monitor with auto-fix enabled
.\monitor-workflows.ps1 -AutoFix

# Monitor with custom timeout (default: 30 minutes)
.\monitor-workflows.ps1 -TimeoutMinutes 45

# Monitor specific workflow
.\monitor-workflows.ps1 -WorkflowName "deploy-app-service.yml"
```

### 2. `cancel-stuck-deployments.ps1` (PowerShell) ⚡ NEW
Finds and cancels deployment workflows that have been running too long.

**Features:**
- Scans for running workflows
- Identifies stuck deployments (default: >25 minutes)
- Cancels stuck workflows automatically
- Provides detailed information about stuck runs

**Usage:**
```powershell
# Check for stuck deployments
.\cancel-stuck-deployments.ps1

# Custom timeout threshold
.\cancel-stuck-deployments.ps1 -MaxMinutes 20

# Dry run (see what would be canceled)
.\cancel-stuck-deployments.ps1 -DryRun
```

### 3. `check-deployment-health.ps1` (PowerShell)
Verifies that the deployed platform is working correctly.

**Features:**
- Checks backend health endpoint
- Checks frontend availability
- Validates API endpoints
- Reports deployment status

**Usage:**
```powershell
# Check deployment health
.\check-deployment-health.ps1

# Check with custom URLs
.\check-deployment-health.ps1 -BackendUrl "https://bsg-demo-platform-app.azurewebsites.net" -FrontendUrl "https://kind-beach-01c0a990f.3.azurestaticapps.net"
```

### 4. `workflow-manager.ps1` (PowerShell)
Utility script for managing GitHub Actions workflows.

**Features:**
- List recent workflow runs
- Cancel running workflows
- Trigger workflow runs manually
- Get workflow run details and logs

**Usage:**
```powershell
# List recent workflow runs
.\workflow-manager.ps1 -List

# Cancel a specific workflow run
.\workflow-manager.ps1 -Cancel -RunId 123456789

# Trigger a workflow manually
.\workflow-manager.ps1 -Trigger -WorkflowName "deploy-app-service.yml"
```

### 5. `auto-fix-and-commit.ps1` (PowerShell)
Automatically fixes common issues and re-commits changes.

**Features:**
- Detects common build/test failures
- Applies fixes automatically
- Commits and pushes fixes
- Triggers new workflow run

**Usage:**
```powershell
# Auto-fix issues from failed workflow
.\auto-fix-and-commit.ps1 -RunId 123456789

# Auto-fix with custom commit message
.\auto-fix-and-commit.ps1 -RunId 123456789 -CommitMessage "fix: resolve build errors"
```

## Quick Start

### Automatic Setup (Recommended)

**Install automation for automatic monitoring:**
```powershell
cd automation
.\install-automation.ps1
```

This will:
- Install Git hook for automatic monitoring after pushes to `develop`
- Install GitHub Actions workflow for cloud-based monitoring
- Verify all prerequisites

After installation, workflows will be monitored automatically whenever you push to `develop`!

### Manual Usage

1. **Monitor workflows after pushing to develop:**
   ```powershell
   cd automation
   .\monitor-workflows.ps1
   ```

2. **Check for stuck deployments:**
   ```powershell
   .\cancel-stuck-deployments.ps1
   ```

3. **Check deployment health:**
   ```powershell
   .\check-deployment-health.ps1
   ```

4. **List recent workflow runs:**
   ```powershell
   .\workflow-manager.ps1 -List
   ```

## Automatic Monitoring Setup

### Git Hook (Local)
The Git hook automatically monitors workflows after pushing to `develop`:

```powershell
# Install the hook
.\install-automation.ps1

# Or manually install
.\setup-git-hook.ps1
```

**What it does:**
- Triggers automatically after `git push origin develop`
- Monitors workflow runs until completion
- Verifies deployment health
- Reports status in terminal

### GitHub Actions Workflow (Cloud)
The `auto-monitor-workflow.yml` workflow runs in GitHub Actions and:
- Monitors deployment workflows automatically
- Checks health after successful deployments
- Analyzes failures and detects fixable issues
- Creates comments on PRs (if applicable)

**Installation:** The workflow is automatically installed when you run `install-automation.ps1`

## Handling Stuck Deployments

If a deployment appears to be stuck (running for more than 15-20 minutes):

1. **Quick check:**
   ```powershell
   .\cancel-stuck-deployments.ps1
   ```

2. **Manual cancellation:**
   ```powershell
   .\workflow-manager.ps1 -Cancel -RunId <run-id>
   ```

3. **Monitor will auto-cancel:**
   - The monitor script automatically cancels deployment steps that exceed 15 minutes
   - General workflows timeout at 30 minutes (configurable)

## Integration with CI/CD

You can integrate these scripts into your workflow:

1. **Post-push hook:** Automatically runs after pushing to `develop` (installed via `install-automation.ps1`)
2. **GitHub Actions:** The `auto-monitor-workflow.yml` monitors workflows in the cloud
3. **Scheduled task:** Run health checks periodically using Windows Task Scheduler
4. **Manual:** Run scripts manually when needed

## Configuration

Edit `config.json` to customize:
- Workflow timeouts (general and deployment-specific)
- Health check endpoints
- Retry attempts and delays
- Auto-fix behavior

**Deployment Timeout:** Deployment steps have a shorter timeout (15 minutes) than general workflows (20-30 minutes) to catch stuck deployments faster.

## Troubleshooting

### Deployment Never Ends / Stuck

**Quick fix:**
```powershell
# Cancel stuck deployments
.\cancel-stuck-deployments.ps1

# Or cancel specific run
.\workflow-manager.ps1 -Cancel -RunId <run-id>
```

**Prevention:**
- Monitor script automatically cancels deployments >15 minutes
- Workflow has 15-minute timeout for deployment step
- Use `cancel-stuck-deployments.ps1` to proactively check

### GitHub CLI not authenticated
```powershell
gh auth login
```

### Workflows not found
Ensure you're in the correct repository directory and have proper permissions.

### Health checks failing
Verify that deployment URLs in `config.json` are correct and services are accessible.

## Notes

- Scripts use GitHub CLI (`gh`) for GitHub API interactions
- All scripts support `-Verbose` flag for detailed output
- Scripts are designed to be idempotent and safe to run multiple times
- Auto-fix features are conservative and only fix well-known issues
- **Deployment timeouts are shorter** (15 min) to catch stuck deployments faster

## Examples

### Example 1: Monitor after push
```powershell
# After pushing to develop branch
git push origin develop

# In another terminal, monitor workflows
cd automation
.\monitor-workflows.ps1 -TimeoutMinutes 30
```

### Example 2: Cancel stuck deployment
```powershell
# Check for stuck deployments
.\cancel-stuck-deployments.ps1

# Or list and cancel manually
.\workflow-manager.ps1 -List
.\workflow-manager.ps1 -Cancel -RunId 123456789
```

### Example 3: Auto-fix and re-deploy
```powershell
# Monitor with auto-fix enabled
.\monitor-workflows.ps1 -AutoFix -TimeoutMinutes 30
```

---

**Last Updated:** November 2025  
**Maintained By:** BSG Team
