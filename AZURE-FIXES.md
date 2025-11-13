# Azure Deployment Fixes - Complete Solution

## Issues Fixed

### 1. ✅ GitHub Actions Azure Credentials
**Problem**: Azure login failing with "Not all values are present. Ensure 'client-id' and 'tenant-id' are supplied."

**Solution**: 
- The `AZURE_CREDENTIALS` secret must be properly configured in GitHub
- Go to: https://github.com/georgasa/bsg-demo-platform/settings/secrets/actions
- Ensure `AZURE_CREDENTIALS` secret contains the complete JSON from `SETUP-AZURE-CREDENTIALS.md`

### 2. ✅ App Service Environment Variables
**Problem**: Missing DATABASE_URL and other environment variables.

**Solution**: 
- Created `infrastructure/app-settings.json` with all required settings
- Environment variables are now configured via:
  ```bash
  az webapp config appsettings set --name bsg-demo-platform-app --resource-group bsg-demo-platform --settings @infrastructure/app-settings.json
  ```

### 3. ✅ Deployment Path Issues
**Problem**: Windows-style backslashes causing rsync errors during deployment.

**Solution**:
- Added `.deploymentignore` file to exclude problematic files
- Updated GitHub Actions workflow to clean up Windows paths
- Fixed file cleanup steps in workflow

### 4. ⚠️ Application Startup
**Current Status**: App Service is running but health endpoint may be timing out.

**Next Steps**:
1. Verify the application is actually running
2. Check if gunicorn is starting properly
3. Verify database connectivity

## Quick Fix Commands

### Set Environment Variables
```bash
az webapp config appsettings set --name bsg-demo-platform-app --resource-group bsg-demo-platform --settings @infrastructure/app-settings.json
```

### Restart App Service
```bash
az webapp restart --name bsg-demo-platform-app --resource-group bsg-demo-platform
```

### Check App Status
```bash
az webapp show --name bsg-demo-platform-app --resource-group bsg-demo-platform --query "{state: state, defaultHostName: defaultHostName}"
```

### View Logs
```bash
az webapp log tail --name bsg-demo-platform-app --resource-group bsg-demo-platform
```

### Test Health Endpoint
```bash
curl https://bsg-demo-platform-app.azurewebsites.net/api/v1/health
```

## Files Created/Modified

1. **backend/.deploymentignore** - Excludes problematic files from deployment
2. **infrastructure/app-settings.json** - Environment variables configuration
3. **infrastructure/set-app-settings.ps1** - PowerShell script to set app settings
4. **infrastructure/verify-deployment.ps1** - Verification script
5. **.github/workflows/deploy-app-service.yml** - Updated workflow with fixes

## GitHub Actions Workflow Updates

### Key Changes:
1. Added better error handling for Azure login
2. Improved file cleanup to handle Windows paths
3. Added app settings configuration step
4. Better deployment package handling

## Verification Checklist

- [x] App Service exists and is running
- [x] Environment variables configured (DATABASE_URL, DATABASE_NAME, ENVIRONMENT)
- [x] Startup command configured correctly
- [x] GitHub Actions workflow updated
- [ ] Application responds to health check
- [ ] Frontend is accessible
- [ ] Database connection working

## Next Steps

1. **Verify GitHub Secret**: Ensure `AZURE_CREDENTIALS` is set in GitHub repository secrets
2. **Trigger Deployment**: Push to `develop` branch or manually trigger workflow
3. **Monitor Deployment**: Check GitHub Actions logs for any errors
4. **Test Application**: Verify health endpoint and frontend are accessible

## Troubleshooting

### If deployment fails:
1. Check GitHub Actions logs for specific errors
2. Verify `AZURE_CREDENTIALS` secret is correctly formatted
3. Ensure all required files are present in repository
4. Check App Service logs for runtime errors

### If app doesn't start:
1. Check startup command: `az webapp config show --name bsg-demo-platform-app --resource-group bsg-demo-platform --query appCommandLine`
2. Verify gunicorn is installed: Check `requirements.txt`
3. Check application logs for errors
4. Verify environment variables are set correctly

### If health check fails:
1. Check if app is running: `az webapp show --name bsg-demo-platform-app --resource-group bsg-demo-platform`
2. Check logs for connection errors
3. Verify DATABASE_URL is correct
4. Test database connectivity from App Service

