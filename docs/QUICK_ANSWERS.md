# Quick Answers to Your Questions

## 1. How to Disable Old Workflow and Enable New One?

**✅ DONE!** I've already disabled the old workflow for you.

**What I did:**
- Renamed `.github/workflows/deploy-app-service.yml` → `.github/workflows/deploy-app-service.yml.disabled`
- This disables it but keeps it for reference

**New workflow:**
- `.github/workflows/build-push-acr.yml` is **already enabled** (it will run automatically)

**To verify:**
1. Go to GitHub → Actions tab
2. You should see "Build and Push to ACR" workflow
3. Old "Deploy to Azure App Service" won't run anymore

---

## 2. Why Container App URL Doesn't Work?

**The Container App exists but has NO Docker image yet.**

**Current Status:**
- ✅ Container App created: `bsg-demo-backend`
- ✅ Configured to use: `bsgdemoplatform.azurecr.io/bsg-demo-backend:latest`
- ❌ **This image doesn't exist in ACR yet**
- ❌ Container App can't start without an image

**What needs to happen:**
1. Push code to `develop` branch
2. GitHub Actions builds Docker image
3. Pushes image to ACR
4. ACR webhook triggers
5. Container App automatically pulls and deploys
6. **Then** the URL will work

**This is normal** - the first deployment needs to happen via GitHub Actions.

---

## 3. Did We Change the Nature of Deployed Items?

**YES, but gradually:**

### Backend Changed:
- **BEFORE**: Azure App Service (traditional web app)
- **NOW**: Azure Container App (containerized app)
- **Why**: Better for containers, auto-scaling, reduces GitHub Actions usage

### Frontend Unchanged:
- **BEFORE**: Azure Static Web Apps
- **NOW**: Azure Static Web Apps (same)
- **No changes needed**

---

## 4. Do Both Coexist in Same Resource Group?

**YES!** Both are in `bsg-demo-platform` resource group:

**Current Resources:**
1. ✅ `bsg-demo-platform-app` (App Service) - **OLD, still working**
2. ✅ `bsg-demo-platform-4077` (Static Web App) - **NO CHANGE**
3. 🆕 `bsg-demo-backend` (Container App) - **NEW, waiting for image**
4. 🆕 `bsgdemoplatform` (ACR) - **NEW**
5. 🆕 `bsg-demo-env` (Container Apps Environment) - **NEW**

**Why both exist:**
- Zero-downtime migration
- Can test Container App while App Service still works
- Can rollback easily if needed
- Delete App Service later after confirming Container App works

---

## 5. Why Did the URL Change?

**Different Azure services = Different URL formats:**

**App Service URLs:**
- Format: `{name}.azurewebsites.net`
- Example: `bsg-demo-platform-app.azurewebsites.net`

**Container Apps URLs:**
- Format: `{name}.{env-id}.{region}.azurecontainerapps.io`
- Example: `bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io`

**Why different?**
- Container Apps is a different Azure service
- More modern architecture
- Better for containerized workloads
- Auto-scaling built-in

---

## What Happens Next?

### Immediate Next Steps:

1. **✅ Old workflow disabled** (done)
2. **✅ New workflow ready** (already enabled)
3. **Push a commit** to trigger first build:
   ```bash
   git add .
   git commit -m "chore: Switch to ACR-based deployment"
   git push origin develop
   ```
4. **Watch GitHub Actions** (should take ~10-12 minutes)
5. **Container App will auto-deploy** via webhook
6. **Test new URL** after deployment completes

### Timeline:

- **Build + Push**: ~10 minutes
- **Auto-deploy**: ~2-3 minutes
- **Total**: ~12-13 minutes (vs ~25 minutes before)

---

## Summary

**What Changed:**
- ✅ Backend: App Service → Container App (new service, better architecture)
- ✅ Deployment: Push-based → Pull-based (50-60% faster)
- ✅ Frontend: No change (Static Web Apps stays the same)

**What Coexists:**
- ✅ App Service (old) - still working
- ✅ Container App (new) - waiting for first image
- ✅ Static Web App - unchanged

**Why URL Changed:**
- Different Azure service = different URL format
- Container Apps use different domain structure

**Why Container App Doesn't Work Yet:**
- No Docker image in ACR yet
- First build needs to happen via GitHub Actions
- After first push, it will work automatically

---

**See detailed docs:**
- `docs/ACR_MIGRATION_EXPLANATION.md` - Full explanation
- `docs/CURRENT_STATUS.md` - Current deployment status
- `docs/HOW_TO_SWITCH_WORKFLOWS.md` - Workflow switching guide
