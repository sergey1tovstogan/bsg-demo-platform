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

### Documentation

- **`README.md`** - This file (complete guide)
- **`AUTO_FIX_GUIDE.md`** - Detailed auto-fix documentation

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

# Cancel specific workflow run
.\ci-automation.ps1 cancel -RunId 123456789

# Show workflow status
.\ci-automation.ps1 status
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
# Monitor workflows (default action)
.\ci-automation.ps1 monitor
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
      "health_check_url": "https://..."
    }
  },
  "monitoring": {
    "timeout_minutes": 30,
    "poll_interval_seconds": 10
  },
  "auto_fix": {
    "enabled": true,
    "auto_commit": true,
    "auto_push": true
  },
  "branch": "develop"
}
```

## 🔄 How It Works

### Automatic Flow

```
Push to develop
    ↓
Deployment workflows start
    ↓
Auto-monitor workflow triggers (GitHub Actions)
    ↓
Monitors workflows until completion
    ↓
If SUCCESS → Health checks run
If FAILURE → Analyze errors → Auto-fix → Commit → Push → Retry
```

### GitHub Actions Workflow

The `.github/workflows/auto-monitor-workflow.yml` workflow:

1. **Triggers automatically** when:
   - Deployment workflows complete
   - You push to `develop` branch

2. **Monitors workflows:**
   - Finds recent workflow runs
   - Monitors until completion
   - Checks deployment health

3. **Auto-fixes failures:**
   - Analyzes workflow logs
   - Detects fixable issues
   - Applies fixes
   - Commits and pushes automatically

4. **Reports results:**
   - GitHub Actions summary
   - Comments on PRs (if applicable)

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

## 📊 Monitoring Features

### Automatic Monitoring
- Monitors all deployment workflows
- Tracks workflow status in real-time
- Detects stuck deployments (15 min timeout for deployments)
- Verifies deployment health after success

### Health Checks
- Backend health endpoint (`/api/v1/health`)
- Backend liveness endpoint (`/api/v1/live`)
- Frontend availability
- API documentation endpoint

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
- Permission/authentication issues
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

## 📚 Related Documentation

- **`AUTO_FIX_GUIDE.md`** - Detailed auto-fix documentation
- **`.github/workflows/auto-monitor-workflow.yml`** - Workflow definition
- **`config.json`** - Configuration reference

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

## ✅ Verification

After setup, verify everything works:

```powershell
# Check configuration
Get-Content automation\config.json | ConvertFrom-Json

# Check workflow exists
Test-Path .github\workflows\auto-monitor-workflow.yml

# Test monitoring
.\automation\ci-automation.ps1 status
```

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

## 🔐 Permissions

The GitHub Actions workflow needs:
- ✅ Read access to workflows
- ✅ Write access to repository (for auto-fix commits)
- ✅ GitHub token (automatically provided)

## 🚀 Next Steps

1. **Run setup:**
   ```powershell
   .\automation\setup.ps1
   ```

2. **Push to develop:**
   ```bash
   git push origin develop
   ```

3. **Watch the automation:**
   - Go to GitHub Actions tab
   - See "Auto Monitor and Fix Workflows" running
   - View automatic fixes being applied

**That's it! Everything is automated!** 🎉

---

**Last Updated:** November 2025  
**Status:** ✅ Fully Automated - Zero Touch  
**Maintained By:** BSG Team
