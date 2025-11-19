# Azure Deployment Fixes - January 2025

## Summary of Fixes Applied

This document summarizes all the fixes applied to resolve Azure App Service deployment issues.

## ✅ Fixes Completed

### 1. GitHub Actions Workflow Improvements

**File**: `.github/workflows/deploy-app-service.yml`

**Changes**:
- ✅ Improved health check with better error reporting and troubleshooting steps
- ✅ Increased initial wait time to 90 seconds for first-time startup
- ✅ Increased retry attempts from 15 to 20 for liveness checks
- ✅ Added HTTP status code checking for better diagnostics
- ✅ Enhanced error messages with troubleshooting commands
- ✅ Added logging flags to gunicorn startup command for better debugging
- ✅ Fixed build settings consistency (SCM_DO_BUILD_DURING_DEPLOYMENT and ENABLE_ORYX_BUILD)

**Key Improvements**:
```yaml
# Better health check with status codes
HTTP_CODE=$(curl -s -o /dev/null -w "%{http_code}" --max-time 30 $WEBAPP_URL/api/v1/live || echo "000")

# Enhanced startup command with logging
startup-command: 'gunicorn app.main:app --bind 0.0.0.0:${PORT:-8000} --workers 2 --worker-class uvicorn.workers.UvicornWorker --timeout 120 --access-logfile - --error-logfile - --log-level info'
```

### 2. Configuration Updates

**File**: `backend/app/core/config.py`

**Changes**:
- ✅ Added support for Azure App Service PORT environment variable
- ✅ PORT now reads from environment variable with fallback to 8000
- ✅ Added `os` import for environment variable access

**Code**:
```python
PORT: int = Field(
    default_factory=lambda: int(os.getenv("PORT", "8000")),
    description="API port (Azure App Service sets PORT automatically)"
)
```

### 3. App Settings Consistency

**File**: `infrastructure/app-settings.json`

**Changes**:
- ✅ Updated build settings to match workflow configuration
- ✅ Changed `SCM_DO_BUILD_DURING_DEPLOYMENT` from `false` to `true`
- ✅ Changed `ENABLE_ORYX_BUILD` from `false` to `true`

### 4. Startup Script

**File**: `backend/startup.sh`

**Created**: New startup script for Azure App Service
- ✅ Checks for required files and packages
- ✅ Uses Azure's PORT environment variable
- ✅ Provides better error messages
- ✅ Ensures gunicorn is available before starting

**Features**:
- Validates app structure before starting
- Installs missing packages if needed
- Uses PORT environment variable (Azure sets this automatically)
- Provides detailed logging

### 5. Health Check Improvements

**Enhanced health check endpoint**:
- ✅ Better timeout handling
- ✅ More retry attempts
- ✅ Detailed error reporting
- ✅ Troubleshooting commands in error output

## 🔧 Configuration Details

### Startup Command
```bash
gunicorn app.main:app \
  --bind 0.0.0.0:${PORT:-8000} \
  --workers 2 \
  --worker-class uvicorn.workers.UvicornWorker \
  --timeout 120 \
  --access-logfile - \
  --error-logfile - \
  --log-level info
```

### Build Settings
- `SCM_DO_BUILD_DURING_DEPLOYMENT`: `true`
- `ENABLE_ORYX_BUILD`: `true`

### App Service Settings
- **Always On**: Enabled (prevents app from sleeping)
- **Python Version**: 3.11
- **Startup Command**: Configured with logging
- **Workers**: 2 (optimized for Basic tier)

## 📋 Required GitHub Secrets

Ensure these secrets are configured in GitHub:

1. **AZURE_CREDENTIALS** (REQUIRED)
   - Service principal credentials for Azure authentication
   - Format: JSON with clientId, clientSecret, subscriptionId, tenantId

2. **DATABASE_URL** (REQUIRED)
   - MongoDB connection string
   - Used for database connectivity

3. **RAG_JWT_TOKEN** (OPTIONAL)
   - JWT token for Temenos RAG API
   - Required for RAG features to work

4. **RAG_API_URL** (OPTIONAL)
   - Default: `https://tbsg.temenos.com`
   - Can be overridden via secret

5. **JWT_SECRET_KEY** (OPTIONAL)
   - Secret key for JWT signing
   - Auto-generated if not provided

## 🚀 Deployment Process

### Automatic Deployment
Deployment triggers automatically on:
- Push to `develop` branch
- Manual workflow dispatch

### Manual Deployment Steps

1. **Verify Secrets**:
   ```bash
   # Check GitHub Secrets are configured
   # Go to: https://github.com/georgasa/bsg-demo-platform/settings/secrets/actions
   ```

2. **Trigger Deployment**:
   ```bash
   git checkout develop
   git push origin develop
   ```

3. **Monitor Deployment**:
   - Watch GitHub Actions workflow
   - Check for errors in logs
   - Wait for health check to pass

4. **Verify Deployment**:
   ```bash
   # Test health endpoint
   curl https://bsg-demo-platform-app.azurewebsites.net/api/v1/live
   curl https://bsg-demo-platform-app.azurewebsites.net/api/v1/health
   ```

## 🔍 Troubleshooting

### If Deployment Fails

1. **Check GitHub Actions Logs**:
   - Go to Actions tab
   - Review failed workflow run
   - Check specific step errors

2. **Verify Secrets**:
   ```bash
   # Ensure AZURE_CREDENTIALS is set correctly
   # Check JSON format is valid
   ```

3. **Check App Service Status**:
   ```bash
   az webapp show --name bsg-demo-platform-app --resource-group bsg-demo-platform
   ```

4. **View Logs**:
   ```bash
   az webapp log tail --name bsg-demo-platform-app --resource-group bsg-demo-platform
   ```

### If Health Check Fails

1. **Check App Status**:
   ```bash
   az webapp show --name bsg-demo-platform-app --resource-group bsg-demo-platform --query "{state: state, defaultHostName: defaultHostName}"
   ```

2. **Verify Startup Command**:
   ```bash
   az webapp config show --name bsg-demo-platform-app --resource-group bsg-demo-platform --query appCommandLine
   ```

3. **Check Always On**:
   ```bash
   az webapp config show --name bsg-demo-platform-app --resource-group bsg-demo-platform --query alwaysOn
   ```

4. **Review Logs**:
   ```bash
   az webapp log tail --name bsg-demo-platform-app --resource-group bsg-demo-platform
   ```

### Common Issues

#### Issue: App Times Out
**Solution**:
- Ensure Always On is enabled
- Check startup command is correct
- Verify PORT environment variable is set
- Review logs for startup errors

#### Issue: Database Connection Fails
**Solution**:
- Verify DATABASE_URL secret is set correctly
- Check database firewall rules allow App Service IP
- Test database connectivity from App Service

#### Issue: Build Fails
**Solution**:
- Verify requirements.txt exists
- Check Python version matches (3.11)
- Review build logs for specific errors

## 📊 Health Check Endpoints

### Liveness Endpoint (No DB Required)
```
GET /api/v1/live
```
- Returns: `{"alive": true, "timestamp": "...", "version": "1.0.0"}`
- Use this to verify app is running

### Health Endpoint (Full Check)
```
GET /api/v1/health
```
- Returns: Full health status including database connectivity
- May return "degraded" if database is unavailable, but app is still running

## 📝 Files Modified

1. `.github/workflows/deploy-app-service.yml` - Enhanced workflow with better error handling
2. `backend/app/core/config.py` - Added PORT environment variable support
3. `infrastructure/app-settings.json` - Updated build settings
4. `backend/startup.sh` - New startup script (optional, can be used instead of startup command)

## ✅ Verification Checklist

Before considering deployment complete:

- [ ] GitHub secret `AZURE_CREDENTIALS` is configured
- [ ] GitHub secret `DATABASE_URL` is configured
- [ ] GitHub Actions workflow runs successfully
- [ ] Deployment completes without errors
- [ ] Liveness endpoint responds: `/api/v1/live`
- [ ] Health endpoint responds: `/api/v1/health`
- [ ] Frontend is accessible at root URL
- [ ] API docs are accessible at `/docs`
- [ ] Database connection is working

## 🎯 Next Steps

1. **Test Deployment**: Push to `develop` branch and verify deployment succeeds
2. **Monitor Logs**: Check application logs for any runtime issues
3. **Test Endpoints**: Verify all endpoints are working correctly
4. **Update Documentation**: Keep this document updated with any new issues or fixes

## 📞 Support

If issues persist:
1. Check GitHub Actions workflow logs
2. Review App Service logs
3. Verify all secrets are configured correctly
4. Check Azure Portal for App Service status

---

**Last Updated**: January 2025
**Status**: All fixes applied and ready for deployment

