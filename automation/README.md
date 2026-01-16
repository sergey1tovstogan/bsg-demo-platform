# GitHub Actions Automation

Fully automated CI/CD monitoring and auto-fix system for GitHub Actions workflows.

## 🎯 Overview

This automation system provides **zero-touch** monitoring and auto-fixing of GitHub Actions workflows. When you push to the `develop` branch, the system automatically:

- ✅ Monitors all deployment workflows
- ✅ Detects failures and analyzes errors
- ✅ Auto-fixes common issues
- ✅ Commits and pushes fixes automatically
- ✅ Triggers new deployments automatically

**No manual intervention needed!**

## 📁 Files

### Core Scripts
- **`ci-automation.ps1`** - Main automation script (consolidates all functionality)
- **`setup.ps1`** - Setup/installation script
- **`config.json`** - Configuration file

### GitHub Actions
- **`.github/workflows/auto-monitor-workflow.yml`** - Automatic monitoring workflow (runs in GitHub Actions)

## 🚀 Quick Start

### 1. Setup (One-time)

```powershell
cd automation
.\setup.ps1
```

This will:
- Install GitHub Actions workflow
- Verify prerequisites
- Configure Git hooks (optional)

### 2. Use

**Everything is automatic!** Just push to `develop`:

```bash
git push origin develop
```

The automation will:
1. Monitor workflows automatically
2. Fix issues automatically
3. Commit and push fixes automatically

### 2.1 Local Development

To run the platform locally:

```powershell
# Start all services (backend + frontend)
.\scripts\start-all.bat
```

This will start:
- **Backend:** http://localhost:8001
- **Frontend:** http://localhost:3001
- **API Docs:** http://localhost:8001/docs

Two command windows will open:
- `BSG Backend` - Backend server (FastAPI/Uvicorn on port 8001)
- `BSG Frontend` - Frontend server (Vite dev server on port 3001)

Wait a few seconds for services to fully start, then:
1. Open http://localhost:3001 in your browser (frontend dev server)
2. Go to Demo → Deployment Analyzer
3. Connect to Azure and analyze deployments

**Note:** The backend (localhost:8001) also serves the frontend static files when deployed, but for local development, always use localhost:3001 for the frontend to get hot-reload and development features.

### 3. Manual Operations (Optional)

If you need manual control:

```powershell
# Monitor workflows
.\ci-automation.ps1 monitor

# List recent workflow runs
.\ci-automation.ps1 list

# Check deployment health
.\ci-automation.ps1 health

# Cancel stuck deployments
.\ci-automation.ps1 cancel

# Show workflow status
.\ci-automation.ps1 status
```

## 🏗️ Architecture Overview

The automation system consists of two main components:

1. **GitHub Actions Workflow** (Cloud-based, automatic)
2. **Local PowerShell Scripts** (Optional, for manual operations)

```
┌─────────────────────────────────────────────────────────────┐
│                    Your Push to Develop                     │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│         GitHub Actions: Deployment Workflows                │
│  • Deploy to Azure App Service                              │
│  • Deploy to Azure Static Web Apps                          │
│  • Run Tests                                                │
└────────────────────┬────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────┐
│    GitHub Actions: Auto Monitor and Fix Workflows            │
│    (.github/workflows/auto-monitor-workflow.yml)             │
│                                                              │
│  ┌────────────────────────────────────────────────────┐      │
│  │ 1. Detect Workflow Completion                      │      │
│  │    - Monitors deployment workflows                 │      │
│  │    - Waits for completion                          │      │
│  └──────────────────┬─────────────────────────────────┘      │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────────┐      │
│  │ 2. Health Verification (if success)                │      │
│  │    - Checks backend health endpoint                │      │
│  │    - Checks frontend availability                  │      │
│  │    - Reports status                                │      │
│  └──────────────────┬─────────────────────────────────┘      │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────────┐      │
│  │ 3. Failure Analysis (if failure)                   │      │
│  │    - Analyzes workflow logs                        │      │
│  │    - Detects common error patterns                 │      │
│  │    - Identifies fixable issues                     │      │
│  └──────────────────┬─────────────────────────────────┘      │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────────┐      │
│  │ 4. Auto-Fix (if fixable issues found)              │      │
│  │    - Fixes TypeScript errors                       │      │
│  │    - Creates missing Python __init__.py files      │      │
│  │    - Fixes import paths                            │      │
│  └──────────────────┬─────────────────────────────────┘      │
│                     │                                        │
│                     ▼                                        │
│  ┌────────────────────────────────────────────────────┐      │
│  │ 5. Commit and Push                                 │      │
│  │    - Commits fixes automatically                   │      │
│  │    - Pushes to develop branch                      │      │
│  │    - Triggers new workflow run                     │      │
│  └────────────────────────────────────────────────────┘      │
└──────────────────────────────────────────────────────────────┘
```

## 🔄 How It Works

### Complete Workflow

#### Step 1: Push to Develop
```bash
git push origin develop
```

#### Step 2: Deployment Workflows Start
GitHub Actions automatically triggers:
- **Deploy to Azure App Service** (`deploy-app-service.yml`)
- **Deploy to Azure Static Web Apps** (`deploy-static-webapp.yml`)
- **Run Tests** (`test.yml`)

#### Step 3: Auto-Monitor Workflow Triggers
The `auto-monitor-workflow.yml` workflow:

1. **Detects the push** or workflow completion
2. **Waits 15 seconds** for workflows to start
3. **Finds recent workflow runs** for the `develop` branch
4. **Monitors workflows** until completion

#### Step 4: Success Path
If workflows succeed:

1. **Wait for deployment** to stabilize (60 seconds)
2. **Run health checks:**
   - Backend health: `https://bsg-demo-platform-app.azurewebsites.net/api/v1/health`
   - Backend liveness: `https://bsg-demo-platform-app.azurewebsites.net/api/v1/live`
   - Frontend: `https://kind-beach-01c0a990f.3.azurestaticapps.net`
3. **Report results** in GitHub Actions summary
4. **Create success summary** with deployment URLs

**Note:** For local development, use:
- Backend: `http://localhost:8001`
- Frontend: `http://localhost:3001`
- API Docs: `http://localhost:8001/docs`

#### Step 5: Failure Path
If workflows fail:

1. **Analyze workflow logs:**
   - Fetch logs using `gh run view <id> --log`
   - Parse logs for error patterns
   - Detect fixable issues

2. **Detect common issues:**
   - TypeScript errors: `TypeScript.*error|tsc.*error`
   - Python import errors: `ModuleNotFoundError|ImportError`
   - Build failures: `Build failed|npm.*error|pip.*error`
   - Missing dependencies: `package.*not found|module.*not found`

3. **Auto-fix issues:**
   - **TypeScript errors:** Fix common syntax/type issues
   - **Python import errors:** Create missing `__init__.py` files
   - **Build failures:** Fix dependency/config issues
   - **Missing dependencies:** Update package files

4. **Commit fixes:**
   - Configure git user: `github-actions[bot]`
   - Stage all changes: `git add .`
   - Commit with message: `fix(ci): auto-fix <issue-types>`
   - Push to develop: `git push origin develop`

5. **Trigger new deployment:**
   - Push triggers new workflow runs
   - Process repeats until success or no fixable issues

## 🤔 Understanding the Auto-Monitor Workflow

### Why You Might Not See It

The **Auto Monitor and Fix Workflows** is a **separate GitHub Actions workflow**, but it works differently than your normal workflows:

#### 1. It's Triggered by OTHER Workflows

The auto-monitor workflow doesn't run when you push code directly. Instead, it runs **AFTER** your deployment workflows complete:

```
Your Push → Deploy Workflows Start → Deploy Workflows Complete → Auto-Monitor Triggers
```

#### 2. Three Ways It Can Trigger

Looking at `.github/workflows/auto-monitor-workflow.yml`, it triggers on:

**A. `workflow_run` Event (Most Common)**
```yaml
on:
  workflow_run:
    workflows: 
      - "Deploy to Azure App Service"
      - "Deploy to Azure Static Web Apps"
      - "Run Tests"
    types:
      - completed
```

**This means:** When "Deploy to Azure App Service" finishes (success or failure), the auto-monitor workflow automatically starts.

**B. `push` Event (Also Works)**
```yaml
  push:
    branches:
      - develop
```

**This means:** When you push to `develop`, it can also trigger, but it waits 15 seconds for other workflows to start first.

**C. `workflow_dispatch` (Manual)**
You can manually trigger it from the GitHub Actions UI.

### How to Find It in GitHub Actions

#### Option 1: Look for It After Deployments Complete
1. Go to **Actions** tab
2. Look for workflow runs with name: **"Auto Monitor and Fix Workflows"**
3. It will appear **after** your deployment workflows finish

#### Option 2: Filter by Workflow Name
1. Go to **Actions** tab
2. Click on **"Auto Monitor and Fix Workflows"** in the left sidebar (under workflows list)
3. You'll see all runs of this workflow

#### Option 3: Check Recent Activity
When you push to `develop`, you should see:
- ✅ **Deploy to Azure App Service** (runs immediately)
- ✅ **Deploy to Azure Static Web Apps** (runs immediately)
- ✅ **Run Tests** (runs immediately)
- ⏳ **Auto Monitor and Fix Workflows** (runs AFTER the above complete)

### Example Flow

Here's what happens when you push:

```
1. You push: git push origin develop
   ↓
2. GitHub Actions triggers:
   - Deploy to Azure App Service (#132) ← You see this
   - Deploy to Azure Static Web Apps (#130) ← You see this
   - Run Tests (#34) ← You see this
   ↓
3. After ~2 minutes, deployments complete
   ↓
4. Auto Monitor workflow automatically triggers ← This is what you're looking for!
   ↓
5. It monitors the completed workflows
   ↓
6. If success: Runs health checks
   If failure: Analyzes and auto-fixes
```

## 🔧 Main Script: `ci-automation.ps1`

Consolidated script that replaces multiple individual scripts. Provides all automation functionality.

### Actions

| Action | Description |
|--------|-------------|
| `monitor` | Monitor workflows after push (default) |
| `list` | List recent workflow runs |
| `cancel` | Cancel stuck or specific workflow runs |
| `health` | Check deployment health |
| `fix` | Auto-fix issues from failed workflow |
| `status` | Show current workflow status |
| `help` | Show help message |

### Examples

```powershell
# Monitor workflows (defa.\ci-automation.ps1 monitorult action)

.\ci-automation.ps1 monitor -TimeoutMinutes 45 -AutoFix

# List workflows
.\ci-automation.ps1 list
.\ci-automation.ps1 list -Verbose

# Cancel operations
.\ci-automation.ps1 cancel                    # Cancel stuck deployments
.\ci-automation.ps1 cancel -RunId 123456     # Cancel specific run
.\ci-automation.ps1 cancel -MaxMinutes 20     # Custom timeout

# Health check
.\ci-automation.ps1 health

# Status
.\ci-automation.ps1 status
```

## ⚙️ Configuration

Edit `config.json` to customize behavior:

```json
{
  "workflows": {
    "deploy-backend": {
      "timeout_minutes": 20,
      "deployment_timeout_minutes": 15,
      "health_check_url": "https://..."
    }
  },
  "monitoring": {
    "timeout_minutes": 30,
    "poll_interval_seconds": 10,
    "health_check_retries": 5
  },
  "auto_fix": {
    "enabled": true,
    "auto_commit": true,
    "auto_push": true,
    "common_fixes": {
      "typescript_errors": true,
      "python_import_errors": true,
      "build_failures": true,
      "missing_dependencies": true
    }
  },
  "branch": "develop"
}
```

### How Configuration is Used

1. **Workflow timeouts:** Controls when to cancel stuck workflows
2. **Health check settings:** Configures retry behavior
3. **Auto-fix settings:** Enables/disables specific fix types
4. **Branch:** Which branch to monitor

## 🛠️ What Gets Auto-Fixed

### TypeScript Errors
- Missing type annotations
- Import path issues
- Common syntax errors

### Python Import Errors
- Missing `__init__.py` files (created automatically)
- Import path corrections

### Build Failures
- Dependency issues
- Configuration problems

### Missing Dependencies
- Package.json updates
- Requirements.txt updates

### SCM Container Restart Errors
- Timing issues with app settings configuration
- Automatically adjusts workflow timing

### AKS Namespace Discovery Failures
- kubectl installation issues
- Missing kubernetes package
- Permission documentation

## 📊 Monitoring Features

### Automatic Monitoring
- Monitors all deployment workflows
- Tracks workflow status in real-time
- Detects stuck deployments (15 min timeout for deployments)
- Verifies deployment health after success

### Health Checks
- Backend health endpoint (`/api/v1/health`)
  - Local: `http://localhost:8000/api/v1/health`
  - Production: `https://bsg-demo-platform-app.azurewebsites.net/api/v1/health`
- Backend liveness endpoint (`/api/v1/live`)
  - Local: `http://localhost:8000/api/v1/live`
  - Production: `https://bsg-demo-platform-app.azurewebsites.net/api/v1/live`
- Frontend availability
  - Local: `http://localhost:3000`
  - Production: `https://kind-beach-01c0a990f.3.azurestaticapps.net`
- API documentation endpoint
  - Local: `http://localhost:8000/docs`
  - Production: `https://bsg-demo-platform-app.azurewebsites.net/docs`

### Failure Detection
- Analyzes workflow logs
- Detects common error patterns
- Identifies fixable issues
- Reports non-fixable issues

## 🚫 What Requires Manual Intervention

Some issues **cannot** be auto-fixed:
- Complex logic errors
- Architecture changes
- External service failures
- Permission/authentication issues (some can be documented)
- Database schema changes

## 🔍 Troubleshooting

### Auto-fix not running?

1. Check `config.json`:
   ```json
   "auto_fix": { "enabled": true }
   ```

2. Check GitHub Actions:
   - Go to Actions tab
   - Look for "Auto Monitor and Fix Workflows"
   - Check workflow logs

### Monitoring not working?

1. Verify GitHub CLI:
   ```powershell
   gh auth status
   ```

2. Check workflow file exists:
   ```powershell
   Test-Path .github\workflows\auto-monitor-workflow.yml
   ```

### Health checks failing?

1. Verify URLs in `config.json`
2. Check if deployments actually completed
3. Wait a few minutes - deployments need time to stabilize

### "I don't see the auto-monitor workflow running"

1. **Check if deployments completed:** The auto-monitor only runs AFTER deployments finish
2. **Check branch:** It only runs for `develop` branch
3. **Check workflow file:** Make sure `.github/workflows/auto-monitor-workflow.yml` exists
4. **Check recent runs:** Go to Actions → Filter by "Auto Monitor and Fix Workflows"

### "It's not triggering"

1. **Verify workflow file is committed:** The workflow file must be in the repository
2. **Check workflow syntax:** GitHub Actions validates YAML syntax
3. **Check permissions:** The workflow needs `GITHUB_TOKEN` (automatically provided)
4. **Check if parent workflows exist:** The `workflow_run` trigger requires the parent workflows to exist

## 🎛️ Advanced Usage

### Custom Timeouts

```powershell
# Monitor with custom timeout
.\ci-automation.ps1 monitor -TimeoutMinutes 45

# Check for stuck deployments with custom threshold
.\ci-automation.ps1 cancel -MaxMinutes 20
```

### Filter by Workflow

```powershell
# List only deployment workflows
.\ci-automation.ps1 list -WorkflowName "Deploy"

# Monitor specific workflow
.\ci-automation.ps1 monitor -WorkflowName "deploy-app-service.yml"
```

### Dry Run

```powershell
# See what would be canceled without actually canceling
.\ci-automation.ps1 cancel -DryRun
```

### Adjust Timeouts in Config

Edit `config.json`:
```json
{
  "monitoring": {
    "timeout_minutes": 45  // Increase timeout
  }
}
```

### Disable Auto-Fix

Edit `config.json`:
```json
{
  "auto_fix": {
    "enabled": false
  }
}
```

### Change Health Check URLs

Edit `config.json`:
```json
{
  "workflows": {
    "deploy-backend": {
      "health_check_url": "https://your-backend-url.com/api/v1/health"
    }
  }
}
```

## ✅ Verification Checklist

After setup, verify everything works:

```powershell
# Check configuration
Get-Content automation\config.json | ConvertFrom-Json

# Check workflow exists
Test-Path .github\workflows\auto-monitor-workflow.yml

# Test monitoring
.\automation\ci-automation.ps1 status
```

Checklist:
- [ ] GitHub Actions workflow exists: `.github/workflows/auto-monitor-workflow.yml`
- [ ] Config file exists: `automation/config.json`
- [ ] Auto-fix enabled: `config.json` → `auto_fix.enabled = true`
- [ ] GitHub CLI authenticated: `gh auth status`
- [ ] Test push works: Push to develop and check Actions tab

## 🎯 Best Practices

1. **Let automation handle it** - The system is fully automatic
2. **Check GitHub Actions tab** - View monitoring results there
3. **Review auto-fixes** - Check commit messages to see what was fixed
4. **Monitor health** - Use `.\ci-automation.ps1 health` to verify deployments
5. **Customize config** - Adjust timeouts and URLs in `config.json` as needed

## 📝 Commit Messages

Auto-fixes use this format:
```
fix(ci): auto-fix typescript_errors, python_import_errors
```

Customize prefix in `config.json`:
```json
"commit_message_prefix": "fix(ci):"
```

## 🔐 Permissions & Security

### GitHub Token

The workflow uses `GITHUB_TOKEN` which provides:
- ✅ Read access to workflows
- ✅ Write access to repository (for commits)
- ✅ Access to workflow runs

### Git Configuration

Auto-commits use:
- **User:** `github-actions[bot]`
- **Email:** `github-actions[bot]@users.noreply.github.com`

This ensures commits are clearly identified as automated.

## 📊 Monitoring & Reporting

### GitHub Actions Summary

The workflow creates a summary showing:
- Workflow status
- Health check results
- Deployment URLs
- Fixes applied (if any)

### Issue Comments

If a PR exists, the workflow creates comments:
- Failure notifications
- Detected issues
- Fixes applied

## 📈 Performance Optimizations

### Deployment Speed
- Reduced SCM wait: 55s → 3s
- Optimized health checks: 2min → 1min
- Single API call for app settings
- Faster frontend copy (rsync)

### Monitoring Efficiency
- Smart timeout detection (15min for deployments)
- Parallel health checks
- Efficient log parsing
- Quick issue detection

## 🚨 Error Handling

### Workflow Failures
- Analyzes logs automatically
- Categorizes errors
- Attempts fixes for known issues
- Reports non-fixable issues

### Health Check Failures
- Retries with exponential backoff
- Reports failures but doesn't block
- Provides diagnostic information

### Auto-Fix Failures
- Only fixes well-known patterns
- Reports what couldn't be fixed
- Creates clear commit messages
- Doesn't break working code

## 🔧 Manual Trigger (For Testing)

You can manually trigger the auto-monitor workflow:

1. Go to **Actions** tab
2. Click **"Auto Monitor and Fix Workflows"** in left sidebar
3. Click **"Run workflow"** button (top right)
4. Select branch: `develop`
5. Optionally provide a workflow run ID to monitor
6. Click **"Run workflow"**

## 📍 File Locations

- **Actual workflow file:** `.github/workflows/auto-monitor-workflow.yml` ← This is what GitHub uses
- **Template/example:** `automation/auto-monitor-workflow.yml` ← This is just documentation

**Important:** Only the file in `.github/workflows/` is actually used by GitHub Actions!

## 🎓 Summary

The automation system provides:

1. **Automatic monitoring** - No manual checks needed
2. **Intelligent fixing** - Detects and fixes common issues
3. **Automatic retry** - Pushes fixes and retries deployments
4. **Health verification** - Ensures deployments actually work
5. **Clear reporting** - Shows what happened and why

**Key Points:**
- ✅ It **IS** a separate workflow
- ✅ It **DOES** appear in GitHub Actions
- ⏰ It runs **AFTER** your deployment workflows complete
- 🔍 Look for it in the **Actions** tab after deployments finish
- 📋 It's called **"Auto Monitor and Fix Workflows"**

**Result:** Fully automated CI/CD with zero manual intervention! 🚀

---

**Last Updated:** November 2025  
**Status:** ✅ Production Ready  
**Maintained By:** BSG Team
