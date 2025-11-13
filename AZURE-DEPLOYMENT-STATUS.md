# Azure Deployment Status & Fixes

## ✅ Completed Fixes

### 1. GitHub Actions Workflow
- ✅ Updated workflow to handle Azure credentials properly
- ✅ Added better error handling for Azure login step
- ✅ Fixed file cleanup to handle Windows paths
- ✅ Added Always On configuration to workflow
- ✅ Updated startup command configuration

### 2. App Service Configuration
- ✅ Environment variables configured (DATABASE_URL, DATABASE_NAME, ENVIRONMENT, DEBUG)
- ✅ Always On enabled (prevents app from sleeping)
- ✅ Startup command configured correctly
- ✅ Python 3.11 runtime configured

### 3. Deployment Files
- ✅ Created `.deploymentignore` to exclude problematic files
- ✅ Created `infrastructure/app-settings.json` for environment variables
- ✅ Created verification and testing scripts

## ⚠️ Current Issue: Application Timeout

**Status**: App Service is running but application endpoints are timing out.

**Possible Causes**:
1. Application code not deployed correctly
2. Gunicorn not starting properly
3. Database connection issues preventing startup
4. Application startup errors

## Next Steps to Resolve

### Step 1: Verify GitHub Actions Secret
Ensure `AZURE_CREDENTIALS` is properly set in GitHub:
1. Go to: https://github.com/georgasa/bsg-demo-platform/settings/secrets/actions
2. Verify `AZURE_CREDENTIALS` exists and contains valid JSON
3. If missing, use the JSON from `SETUP-AZURE-CREDENTIALS.md`

### Step 2: Trigger Fresh Deployment
```bash
# Option 1: Push to develop branch
git checkout develop
git push origin develop

# Option 2: Manually trigger workflow in GitHub Actions
```

### Step 3: Check Application Logs
```bash
# Stream logs in real-time
az webapp log tail --name bsg-demo-platform-app --resource-group bsg-demo-platform

# Download logs
az webapp log download --name bsg-demo-platform-app --resource-group bsg-demo-platform --log-file logs.zip
```

### Step 4: Verify Deployment
```bash
# Check if files are deployed
az webapp ssh --name bsg-demo-platform-app --resource-group bsg-demo-platform
# Then inside SSH:
cd /home/site/wwwroot
ls -la
# Check if app/main.py exists
```

### Step 5: Test Locally First
Before deploying, ensure the app works locally:
```bash
cd backend
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

## Configuration Summary

### App Service Settings
- **Name**: bsg-demo-platform-app
- **Resource Group**: bsg-demo-platform
- **Runtime**: Python 3.11
- **Always On**: ✅ Enabled
- **Startup Command**: `gunicorn app.main:app --bind 0.0.0.0:8000 --workers 2 --worker-class uvicorn.workers.UvicornWorker --timeout 120`

### Environment Variables
- ✅ DATABASE_URL: Configured
- ✅ DATABASE_NAME: bsg_demo
- ✅ ENVIRONMENT: production
- ✅ DEBUG: False

### URLs
- **Frontend**: https://bsg-demo-platform-app.azurewebsites.net
- **API**: https://bsg-demo-platform-app.azurewebsites.net/api/v1
- **Health**: https://bsg-demo-platform-app.azurewebsites.net/api/v1/health
- **Docs**: https://bsg-demo-platform-app.azurewebsites.net/docs

## Files Modified

1. `.github/workflows/deploy-app-service.yml` - Updated deployment workflow
2. `backend/.deploymentignore` - Added deployment exclusions
3. `infrastructure/app-settings.json` - Environment variables
4. `infrastructure/set-app-settings.ps1` - PowerShell setup script
5. `infrastructure/verify-deployment.ps1` - Verification script
6. `infrastructure/test-app-access.ps1` - Access testing script
7. `infrastructure/fix-app-service.sh` - Bash fix script

## Troubleshooting Commands

```bash
# Check app status
az webapp show --name bsg-demo-platform-app --resource-group bsg-demo-platform

# Restart app
az webapp restart --name bsg-demo-platform-app --resource-group bsg-demo-platform

# View configuration
az webapp config show --name bsg-demo-platform-app --resource-group bsg-demo-platform

# Check environment variables
az webapp config appsettings list --name bsg-demo-platform-app --resource-group bsg-demo-platform

# Stream logs
az webapp log tail --name bsg-demo-platform-app --resource-group bsg-demo-platform
```

## Important Notes

1. **Always On**: Critical for App Service - prevents app from sleeping. Now enabled in workflow.
2. **GitHub Secret**: Must be configured before deployment will work.
3. **Database Connection**: Ensure DATABASE_URL is correct and accessible from Azure.
4. **Startup Time**: App may take 30-60 seconds to start after deployment.

## Verification Checklist

- [x] App Service exists and is running
- [x] Environment variables configured
- [x] Always On enabled
- [x] Startup command configured
- [x] GitHub Actions workflow updated
- [ ] GitHub secret configured
- [ ] Fresh deployment triggered
- [ ] Application logs reviewed
- [ ] Health endpoint responding
- [ ] Frontend accessible

