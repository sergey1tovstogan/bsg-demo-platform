# Complete Automation Guide

This guide explains how to set up fully automated GitHub Actions monitoring that runs automatically whenever you push to the `develop` branch.

## 🎯 What Gets Automated

1. **Workflow Monitoring**: Automatically monitors GitHub Actions workflows after push to `develop`
2. **Health Verification**: Checks if deployments are healthy after successful workflows
3. **Failure Analysis**: Detects common issues and can auto-fix them
4. **Status Reporting**: Provides clear status reports

## 🚀 Quick Setup (One Command)

```powershell
cd automation
.\install-automation.ps1
```

This single command sets up everything you need!

## 📋 Two-Level Automation

### Level 1: GitHub Actions Workflow (Cloud - Recommended)

**What it does:**
- Runs automatically in GitHub Actions
- Monitors ALL deployment workflows (backend and frontend)
- Works even if you're not at your computer
- Checks health after successful deployments
- Analyzes failures and creates issue comments

**How it works:**
- The workflow `auto-monitor-workflow.yml` is installed to `.github/workflows/`
- It triggers automatically when deployment workflows complete
- No local setup required - works entirely in the cloud

**Status:** ✅ Installed automatically by `install-automation.ps1`

### Level 2: Local Git Hook (Optional)

**What it does:**
- Runs on your local machine after you push
- Provides immediate feedback in your terminal
- Can monitor workflows in real-time

**How it works:**
- Git hook installed to `.git/hooks/pre-push`
- Triggers automatically when you push to `develop`
- Starts monitoring script in background

**Status:** ✅ Installed automatically by `install-automation.ps1`

## 🔧 Manual Usage

If you prefer to run monitoring manually:

```powershell
# After pushing to develop, run:
.\automation\post-push-monitor.ps1

# Or use the full monitor script:
.\automation\monitor-workflows.ps1 -Branch develop
```

## 📊 How It Works

### When You Push to Develop

1. **Push happens** → Git hook detects it (if installed)
2. **GitHub Actions triggers** → Deployment workflows start
3. **Auto-monitor workflow triggers** → Watches deployment workflows
4. **Deployment completes** → Health checks run automatically
5. **If failure** → Issues are analyzed and reported

### Workflow Monitoring Flow

```
Push to develop
    ↓
Deployment workflows start (backend + frontend)
    ↓
Auto-monitor workflow starts watching
    ↓
Wait for workflows to complete
    ↓
If SUCCESS → Check deployment health
    ↓
If FAILURE → Analyze errors, detect fixable issues
    ↓
Report results (GitHub Actions summary + comments)
```

## 🎛️ Configuration

Edit `automation/config.json` to customize:

```json
{
  "workflows": {
    "deploy-backend": {
      "timeout_minutes": 30,
      "health_check_url": "https://..."
    }
  },
  "monitoring": {
    "poll_interval_seconds": 10,
    "max_poll_attempts": 180
  },
  "auto_fix": {
    "enabled": false  // Set to true to enable auto-fixing
  }
}
```

## 🔍 Monitoring Features

### Automatic Health Checks

After successful deployment, the system automatically checks:
- ✅ Backend health endpoint (`/api/v1/health`)
- ✅ Backend liveness endpoint (`/api/v1/live`)
- ✅ Frontend availability
- ✅ API documentation endpoint

### Failure Analysis

When workflows fail, the system automatically detects:
- TypeScript compilation errors
- Python import errors
- Build failures
- Missing dependencies

### Auto-Fix (Optional)

When enabled, the system can:
- Fix common TypeScript errors
- Resolve Python import issues
- Update dependencies
- Commit and push fixes automatically

## 📝 Example Workflow

```powershell
# 1. Make changes
git add .
git commit -m "feat: new feature"

# 2. Push to develop
git push origin develop

# 3. Automation kicks in automatically:
#    - GitHub Actions workflow monitors deployments
#    - Health checks run after successful deployment
#    - Status reported in GitHub Actions UI

# 4. Check results:
#    - Go to GitHub Actions tab
#    - See "Auto Monitor and Fix Workflows" run
#    - View health check results
```

## 🛠️ Troubleshooting

### GitHub Actions workflow not running?

1. Check that `auto-monitor-workflow.yml` exists in `.github/workflows/`
2. Verify it's committed and pushed
3. Check GitHub Actions tab for the workflow

### Git hook not working?

1. Verify hook exists: `.git/hooks/pre-push`
2. Check file permissions
3. Try running manually: `.\automation\post-push-monitor.ps1`

### Health checks failing?

1. Verify URLs in `config.json` are correct
2. Check if deployments actually completed
3. Wait a few minutes - deployments need time to stabilize

## 🎯 Best Practices

1. **Use GitHub Actions workflow** (cloud-based) as primary monitoring
2. **Git hook is optional** - useful for immediate local feedback
3. **Check GitHub Actions tab** regularly for monitoring results
4. **Enable auto-fix** only after testing manual fixes first
5. **Review config.json** and adjust timeouts/URLs as needed

## 📚 Related Scripts

- `monitor-workflows.ps1` - Full-featured monitoring script
- `check-deployment-health.ps1` - Standalone health checker
- `workflow-manager.ps1` - Workflow management utilities
- `auto-fix-and-commit.ps1` - Auto-fix functionality

## ✅ Verification

After installation, verify everything works:

```powershell
# 1. Check GitHub Actions workflow exists
Get-Content .github\workflows\auto-monitor-workflow.yml

# 2. Check Git hook exists
Test-Path .git\hooks\pre-push

# 3. Test monitoring manually
.\automation\post-push-monitor.ps1
```

---

**Ready to automate!** Run `.\install-automation.ps1` to get started.

