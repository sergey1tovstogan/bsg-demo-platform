# Troubleshooting Guide

## Network Error - Backend API Not Reachable

If you see "Network Error - Unable to reach the backend API" in the frontend, check the following:

### 1. Verify Backend is Deployed

Check if the backend Azure App Service is running:

```bash
# Using Azure CLI
az webapp show \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --query "{state: state, defaultHostName: defaultHostName, httpsOnly: httpsOnly}"
```

Or check in Azure Portal:
- Go to Azure Portal → App Services → `bsg-demo-platform-app`
- Check the **Overview** tab for status
- Status should be **Running**

### 2. Check Backend URL is Correct

The frontend should point to:
- **Production**: `https://bsg-demo-platform-app.azurewebsites.net/api/v1`
- **Local**: `http://localhost:8000/api/v1`

Verify in:
- GitHub Actions workflow: `.github/workflows/deploy-static-webapp.yml` (line 40)
- Frontend code: `frontend/src/services/api.ts` (runtime detection)

### 3. Check GitHub Secrets

Ensure these secrets are set in GitHub:
- `AZURE_CREDENTIALS` - For Azure deployment
- `AZURE_STATIC_WEB_APPS_API_TOKEN` - For frontend deployment
- `RAG_JWT_TOKEN` - For RAG API access
- `DATABASE_URL` - For database connection

**To check:**
1. Go to: https://github.com/georgasa/bsg-demo-platform/settings/secrets/actions
2. Verify all required secrets exist
3. If `RAG_JWT_TOKEN` was just added, trigger a new deployment

### 4. Trigger Backend Deployment

If you just added `RAG_JWT_TOKEN`:
1. Go to GitHub Actions: https://github.com/georgasa/bsg-demo-platform/actions
2. Find "Deploy to Azure App Service" workflow
3. Click "Run workflow" → Select `develop` branch → Run
4. Wait for deployment to complete (usually 5-10 minutes)

### 5. Verify Environment Variables in Azure

Check if `RAG_JWT_TOKEN` is set in Azure App Service:

```bash
az webapp config appsettings list \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --query "[?name=='RAG_JWT_TOKEN']"
```

Or in Azure Portal:
- App Service → Configuration → Application settings
- Look for `RAG_JWT_TOKEN`

### 6. Check CORS Configuration

The backend CORS is configured to allow:
- `*.azurestaticapps.net` (all Azure Static Web Apps)
- `*.azurewebsites.net` (all Azure App Services)

If you're still getting CORS errors, check:
- `backend/app/core/config.py` - CORS origins
- `backend/app/main.py` - CORS middleware configuration

### 7. Test Backend Directly

Test if the backend is accessible:

```bash
# Health check
curl https://bsg-demo-platform-app.azurewebsites.net/api/v1/health

# JWT info endpoint (if token is set)
curl https://bsg-demo-platform-app.azurewebsites.net/api/v1/deployment/temenos/jwt-info
```

### 8. Check Backend Logs

View backend logs to see what's happening:

```bash
# Using Azure CLI
az webapp log tail \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform
```

Or in Azure Portal:
- App Service → Log stream
- Look for errors or connection issues

### 9. Restart Backend Service

If backend is running but not responding:

```bash
az webapp restart \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform
```

### 10. Verify Deployment Workflow

Check the latest GitHub Actions run:
1. Go to: https://github.com/georgasa/bsg-demo-platform/actions
2. Click on the latest "Deploy to Azure App Service" run
3. Check for any errors in the workflow steps
4. Verify all steps completed successfully

## Common Issues

### Issue: "Backend API Not Reachable"

**Possible Causes:**
- Backend not deployed yet
- Backend deployment failed
- Backend service is stopped
- Network/firewall blocking access
- Incorrect backend URL in frontend

**Solutions:**
1. Verify backend is deployed and running
2. Check GitHub Actions workflow status
3. Verify backend URL in frontend code
4. Check Azure App Service logs
5. Restart backend service

### Issue: "RAG_JWT_TOKEN not configured"

**Possible Causes:**
- Secret not set in GitHub Secrets
- Secret not set in Azure App Service
- Backend not restarted after setting secret

**Solutions:**
1. Set `RAG_JWT_TOKEN` in GitHub Secrets
2. Trigger new deployment OR manually set in Azure App Service
3. Restart backend service

### Issue: CORS Errors

**Possible Causes:**
- Frontend domain not in CORS origins
- CORS middleware not configured correctly

**Solutions:**
1. Verify frontend domain is in CORS origins
2. Check CORS configuration in backend
3. Verify CORS middleware is enabled

## Quick Diagnostic Script

Run this PowerShell script to check everything:

```powershell
# Check backend accessibility
try {
    $health = Invoke-RestMethod -Uri "https://bsg-demo-platform-app.azurewebsites.net/api/v1/health" -TimeoutSec 10
    Write-Host "✓ Backend is accessible" -ForegroundColor Green
} catch {
    Write-Host "✗ Backend is NOT accessible: $($_.Exception.Message)" -ForegroundColor Red
}

# Check JWT token status (if backend is accessible)
try {
    $jwtInfo = Invoke-RestMethod -Uri "https://bsg-demo-platform-app.azurewebsites.net/api/v1/deployment/temenos/jwt-info" -TimeoutSec 10
    if ($jwtInfo.data.configured) {
        Write-Host "✓ RAG_JWT_TOKEN is configured" -ForegroundColor Green
        if ($jwtInfo.data.has_expiration -and $jwtInfo.data.is_expired) {
            Write-Host "⚠ JWT token is EXPIRED" -ForegroundColor Yellow
        }
    } else {
        Write-Host "✗ RAG_JWT_TOKEN is NOT configured" -ForegroundColor Red
    }
} catch {
    Write-Host "⚠ Could not check JWT status: $($_.Exception.Message)" -ForegroundColor Yellow
}
```

---

**Last Updated**: November 2025  
**Maintained By**: BSG Team

