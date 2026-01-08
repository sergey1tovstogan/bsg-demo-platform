# ACR Migration - What Changed and Why

## Current Architecture (BEFORE Migration)

**What you had:**
- **Backend**: Azure App Service (`bsg-demo-platform-app`)
  - URL: `https://bsg-demo-platform-app.azurewebsites.net`
  - Deployed via GitHub Actions (push-based)
  
- **Frontend**: Azure Static Web Apps (`bsg-demo-platform-4077`)
  - URL: `https://kind-beach-01c0a990f.3.azurestaticapps.net`
  - Deployed via GitHub Actions

**Deployment Flow:**
```
GitHub Push → GitHub Actions (Build + Test + Deploy) → Azure App Service
                                                      → Azure Static Web Apps
```
- **Time**: ~25 minutes per commit
- **GitHub Actions**: Handles everything

---

## New Architecture (AFTER Migration)

**What you have NOW:**
- **Backend**: 
  - ✅ **OLD**: Azure App Service (`bsg-demo-platform-app`) - **STILL RUNNING**
    - URL: `https://bsg-demo-platform-app.azurewebsites.net`
  - ✅ **NEW**: Azure Container App (`bsg-demo-backend`) - **CREATED BUT EMPTY**
    - URL: `https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io`
    - **Status**: No Docker image pushed yet, so it's not working

- **Frontend**: Azure Static Web Apps (`bsg-demo-platform-4077`) - **NO CHANGE**
  - URL: `https://kind-beach-01c0a990f.3.azurestaticapps.net`

**New Deployment Flow:**
```
GitHub Push → GitHub Actions (Build + Push to ACR) → ACR Webhook → Azure Container App (Auto-Deploy)
```
- **Time**: ~10 minutes per commit (50-60% reduction)
- **GitHub Actions**: Only builds and pushes
- **Azure**: Handles deployment automatically

---

## Why the URL Changed?

**App Service URLs:**
- Format: `{app-name}.azurewebsites.net`
- Example: `bsg-demo-platform-app.azurewebsites.net`

**Container Apps URLs:**
- Format: `{app-name}.{environment-id}.{region}.azurecontainerapps.io`
- Example: `bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io`

**Why different?**
- Container Apps use a different Azure service
- They're more modern, scalable, and cost-effective
- Better for containerized workloads

---

## Why Container App URL Doesn't Work Yet

The Container App was created, but **no Docker image has been pushed to ACR yet**.

**Current Status:**
1. ✅ ACR created (`bsgdemoplatform.azurecr.io`)
2. ✅ Container App created (`bsg-demo-backend`)
3. ✅ Webhook configured
4. ❌ **No Docker image in ACR** - This is why the URL doesn't work

**What needs to happen:**
1. Build Docker image from your code
2. Push image to ACR
3. Container App will automatically pull and deploy (via webhook)

---

## Both Resources Coexist

**Yes, both are in the same Resource Group:**
- `bsg-demo-platform-app` (App Service) - **Still working, still serving traffic**
- `bsg-demo-backend` (Container App) - **Created but waiting for image**

**Why both exist?**
- We created the new Container App **alongside** the old App Service
- This allows for a **gradual migration** with zero downtime
- Once Container App is working, you can:
  - Option A: Keep both (for testing)
  - Option B: Switch traffic to Container App
  - Option C: Delete App Service after confirming Container App works

---

## Migration Strategy

### Phase 1: Setup (✅ COMPLETE)
- ✅ ACR created
- ✅ Container App created
- ✅ Webhook configured
- ✅ GitHub Secrets added

### Phase 2: First Deployment (🔄 NEXT)
- Build and push Docker image to ACR
- Container App automatically deploys
- Test Container App URL

### Phase 3: Switch Traffic (⏳ FUTURE)
- Update frontend to point to Container App URL
- Test everything works
- Optionally delete App Service

---

## What Changed in Deployment?

**BEFORE (Push-Based):**
- GitHub Actions: Build + Test + Deploy (~25 min)
- Deploys directly to App Service

**NOW (Pull-Based):**
- GitHub Actions: Build + Push to ACR (~10 min)
- Azure: Automatically pulls from ACR and deploys (zero GitHub time)

**Benefits:**
- 50-60% reduction in GitHub Actions usage
- Faster builds
- Automatic deployment via webhook

---

## Next Steps

1. **Disable old workflow** (see instructions below)
2. **Enable new workflow** (see instructions below)
3. **Push a commit** to trigger first build
4. **Wait for image to be pushed** to ACR
5. **Container App will auto-deploy** via webhook
6. **Test the new URL**

---

## FAQ

**Q: Will my old App Service stop working?**
A: No, it will continue working until you delete it or switch traffic.

**Q: Can I use both at the same time?**
A: Yes, both can run simultaneously. You can test the Container App while App Service continues serving traffic.

**Q: Why did we switch to Container Apps?**
A: Better for containerized workloads, auto-scaling, and reduces GitHub Actions usage.

**Q: What about the frontend?**
A: Frontend (Static Web Apps) is unchanged - no migration needed.

**Q: When should I delete the App Service?**
A: After confirming Container App works correctly and you've updated frontend URLs (if needed).

---

**Last Updated**: January 2025
