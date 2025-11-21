# Azure Deployment Fix - Network Errors

## Problem

The frontend on Azure Static Web Apps cannot connect to the backend on Azure App Service, showing "Network Error" messages. This works fine on localhost but fails in production.

## Root Cause

The backend Azure App Service is returning **HTTP 503 (Service Unavailable)**, which means:
- The service exists but is not responding
- The service might be starting up, restarting, or stopped
- The service might not be properly configured

## Solution Steps

### Step 1: Verify Backend is Running

Check if the backend is actually running:

```bash
# Using Azure CLI
az webapp show \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --query "{state: state, defaultHostName: defaultHostName, httpsOnly: httpsOnly}"
```

**Expected output:**
- `state: Running`
- `defaultHostName: bsg-demo-platform-app.azurewebsites.net`

### Step 2: Check Backend Health

Test if the backend is accessible:

```bash
# Health check
curl https://bsg-demo-platform-app.azurewebsites.net/api/v1/health

# Liveness check (doesn't require DB)
curl https://bsg-demo-platform-app.azurewebsites.net/api/v1/live
```

**If you get 503:**
- Backend is starting up (wait 2-3 minutes)
- Backend needs to be restarted
- Backend deployment might have failed

### Step 3: Trigger Backend Deployment

Since you just added `RAG_JWT_TOKEN` to GitHub Secrets:

1. **Go to GitHub Actions**: https://github.com/georgasa/bsg-demo-platform/actions
2. **Find "Deploy to Azure App Service" workflow**
3. **Click "Run workflow"** → Select `develop` branch → **Run**
4. **Wait 5-10 minutes** for deployment to complete
5. **Check the workflow logs** for any errors

### Step 4: Verify Environment Variables

After deployment, verify `RAG_JWT_TOKEN` is set in Azure:

```bash
az webapp config appsettings list \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --query "[?name=='RAG_JWT_TOKEN']"
```

**Or in Azure Portal:**
- App Service → Configuration → Application settings
- Look for `RAG_JWT_TOKEN`

### Step 5: Restart Backend Service

If the backend is running but still not responding:

```bash
az webapp restart \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform
```

Wait 1-2 minutes, then test again.

### Step 6: Check Backend Logs

View backend logs to see what's happening:

```bash
az webapp log tail \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform
```

**Or in Azure Portal:**
- App Service → Log stream
- Look for errors or startup issues

### Step 7: Verify Frontend is Using Correct Backend URL

The frontend should automatically detect Azure Static Web Apps and use:
- `https://bsg-demo-platform-app.azurewebsites.net/api/v1`

**To verify:**
1. Open browser console (F12)
2. Look for `[API] Final API Base URL:` log message
3. Should show: `https://bsg-demo-platform-app.azurewebsites.net/api/v1`

**If it shows `/api/v1` instead:**
- The build-time environment variable might not be set
- Check `.github/workflows/deploy-static-webapp.yml` line 40
- Rebuild and redeploy the frontend

### Step 8: Check CORS Configuration

The backend CORS is configured to allow:
- `*.azurestaticapps.net` (all Azure Static Web Apps)
- `*.azurewebsites.net` (all Azure App Services)

**To verify CORS is working:**
1. Open browser console (F12)
2. Go to Network tab
3. Try to connect to Azure
4. Check if you see CORS errors

**If you see CORS errors:**
- Backend CORS might not be configured correctly
- Check `backend/app/main.py` line 75
- Verify the regex pattern matches your frontend domain

## Quick Fix Checklist

- [ ] Backend is deployed and running (check Azure Portal)
- [ ] `RAG_JWT_TOKEN` is set in GitHub Secrets ✓ (you already did this)
- [ ] Backend deployment completed successfully (check GitHub Actions)
- [ ] `RAG_JWT_TOKEN` is set in Azure App Service (check Configuration)
- [ ] Backend service is running (not stopped)
- [ ] Backend health endpoint returns 200 (not 503)
- [ ] Frontend is using correct backend URL (check browser console)
- [ ] CORS is configured correctly (no CORS errors in console)

## Testing After Fix

1. **Open the frontend**: https://kind-beach-01c0a990f.3.azurestaticapps.net
2. **Open browser console** (F12)
3. **Check API logs**: Look for `[API] Final API Base URL:` message
4. **Try to connect to Azure**: Go to Deployment → Demo → Connect to Azure
5. **Check for errors**: Look in console for any network or CORS errors

## Common Issues

### Issue: Backend returns 503

**Solution:**
- Wait 2-3 minutes for backend to start
- Restart the backend service
- Check backend logs for startup errors

### Issue: Frontend shows "Network Error"

**Solution:**
- Verify backend is accessible (not 503)
- Check frontend is using correct backend URL
- Verify CORS is configured
- Check browser console for detailed error messages

### Issue: CORS errors

**Solution:**
- Verify backend CORS configuration
- Check frontend domain is in allowed origins
- Restart backend after CORS changes

---

**Last Updated**: November 2025  
**Maintained By**: BSG Team

