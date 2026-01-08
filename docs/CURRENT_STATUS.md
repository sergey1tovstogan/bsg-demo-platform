# Current Deployment Status

## What's Currently Deployed

### ✅ Still Running (Old Architecture)

1. **Azure App Service** (`bsg-demo-platform-app`)
   - URL: `https://bsg-demo-platform-app.azurewebsites.net`
   - Status: ✅ **WORKING** (still serving traffic)
   - Deployment: Via old workflow (now disabled)

2. **Azure Static Web Apps** (`bsg-demo-platform-4077`)
   - URL: `https://kind-beach-01c0a990f.3.azurestaticapps.net`
   - Status: ✅ **WORKING** (no changes)
   - Deployment: Via existing workflow

### 🆕 Newly Created (Not Working Yet)

3. **Azure Container App** (`bsg-demo-backend`)
   - URL: `https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io`
   - Status: ❌ **NOT WORKING** (no Docker image yet)
   - Reason: Container App exists but no image has been pushed to ACR
   - Deployment: Will work after first image is pushed

4. **Azure Container Registry** (`bsgdemoplatform`)
   - Status: ✅ **READY** (empty - waiting for first image)
   - Webhook: ✅ **CONFIGURED** (will auto-deploy when image is pushed)

---

## Why Container App URL Doesn't Work

**The Container App was created, but:**
- ❌ No Docker image exists in ACR yet
- ❌ Container App is trying to pull: `bsgdemoplatform.azurecr.io/bsg-demo-backend:latest`
- ❌ This image doesn't exist, so the Container App can't start

**What needs to happen:**
1. GitHub Actions builds Docker image from your code
2. Pushes image to ACR as `bsg-demo-backend:latest`
3. ACR webhook triggers
4. Container App automatically pulls and deploys the image
5. URL becomes active

**This will happen automatically when you push code after enabling the new workflow.**

---

## Architecture Comparison

### BEFORE (Current - Still Active)
```
┌─────────────┐
│   GitHub    │
│   Actions   │───25 min───▶ Azure App Service (Backend)
│             │              Azure Static Web Apps (Frontend)
└─────────────┘
```

### AFTER (New - Ready but Waiting for First Image)
```
┌─────────────┐      ┌──────┐      ┌─────────────┐
│   GitHub    │      │ ACR  │      │  Container  │
│   Actions   │──10min─▶│      │──webhook─▶│    App     │
│ (Build Only)│      └──────┘      └─────────────┘
└─────────────┘
```

---

## Resource Group Contents

**All in `bsg-demo-platform` resource group:**
- ✅ `bsg-demo-platform-app` (App Service) - **OLD, still working**
- ✅ `bsg-demo-platform-4077` (Static Web App) - **NO CHANGE**
- 🆕 `bsg-demo-backend` (Container App) - **NEW, waiting for image**
- 🆕 `bsgdemoplatform` (ACR) - **NEW, ready for images**
- 🆕 `bsg-demo-env` (Container Apps Environment) - **NEW, infrastructure**

---

## Migration Timeline

**Phase 1: Setup** ✅ **COMPLETE**
- ACR created
- Container App created
- Webhook configured
- GitHub Secrets added

**Phase 2: First Deployment** 🔄 **NEXT**
- Disable old workflow ✅ (just done)
- Enable new workflow ✅ (already enabled)
- Push code to trigger first build
- Image gets pushed to ACR
- Container App auto-deploys
- Test new URL

**Phase 3: Switch Traffic** ⏳ **FUTURE**
- Update frontend to use Container App URL (if needed)
- Test everything
- Optionally delete App Service

---

## Why Both Resources Exist

**We created Container App ALONGSIDE App Service for:**
1. **Zero-downtime migration** - App Service keeps working
2. **Testing** - Can test Container App while App Service serves traffic
3. **Rollback safety** - Can easily switch back if needed
4. **Gradual migration** - No rush, test thoroughly

**You can delete App Service later** after confirming Container App works.

---

## Next Immediate Steps

1. ✅ **Old workflow disabled** (just done)
2. ✅ **New workflow enabled** (already exists)
3. **Push a commit** to trigger first build
4. **Wait ~10-12 minutes** for build + push + auto-deploy
5. **Test Container App URL**
6. **Compare with App Service** to ensure everything works

---

**Last Updated**: January 2025
