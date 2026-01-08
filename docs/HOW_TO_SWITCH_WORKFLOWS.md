# How to Disable Old Workflow and Enable New Workflow

## Step-by-Step Guide

### Step 1: Disable Old Workflow

**Option A: Rename the file (Recommended)**
1. Go to `.github/workflows/` folder
2. Rename `deploy-app-service.yml` to `deploy-app-service.yml.disabled`
   - This keeps the file for reference but disables it

**Option B: Delete the file**
- Delete `.github/workflows/deploy-app-service.yml`
- ⚠️ **Warning**: You won't be able to easily revert

**Option C: Disable in GitHub UI**
1. Go to GitHub → Actions tab
2. Click on "Deploy to Azure App Service" workflow
3. Click the "..." menu (three dots) → "Disable workflow"

### Step 2: Enable New Workflow

The new workflow `.github/workflows/build-push-acr.yml` is **already enabled** by default.

**To verify it's enabled:**
1. Go to GitHub → Actions tab
2. You should see "Build and Push to ACR (Pull-Based Deployment)" in the workflow list
3. If you don't see it, make sure the file exists in `.github/workflows/`

### Step 3: Verify Workflow Configuration

**Check the new workflow triggers:**
- File: `.github/workflows/build-push-acr.yml`
- Should trigger on: `push` to `develop` branch
- Should trigger on: `workflow_dispatch` (manual)

**Check required secrets:**
- `ACR_USERNAME` ✅ (you added this)
- `ACR_PASSWORD` ✅ (you added this)
- `AZURE_CREDENTIALS` ✅ (should already exist)

### Step 4: Test the Workflow

1. Make a small change (e.g., update a comment)
2. Commit and push to `develop` branch
3. Go to GitHub → Actions tab
4. Watch the "Build and Push to ACR" workflow run
5. Should complete in ~8-12 minutes
6. Check ACR for the new image
7. Container App should automatically deploy

---

## Quick Commands (if using Git)

```bash
# Disable old workflow (rename)
git mv .github/workflows/deploy-app-service.yml .github/workflows/deploy-app-service.yml.disabled

# Commit the change
git add .github/workflows/
git commit -m "chore: Disable App Service workflow, enable ACR-based deployment"
git push origin develop
```

---

## What Happens After Switching?

**First Push After Switch:**
1. Old workflow: ❌ Won't run (disabled)
2. New workflow: ✅ Will run
3. Builds Docker image
4. Pushes to ACR
5. ACR webhook triggers
6. Container App pulls and deploys automatically
7. New URL becomes active

**Timeline:**
- Build + Push: ~10 minutes
- Auto-deploy: ~2-3 minutes
- **Total**: ~12-13 minutes (vs ~25 minutes before)

---

## Rollback Plan

If something goes wrong, you can:

1. **Revert workflow change:**
   ```bash
   git mv .github/workflows/deploy-app-service.yml.disabled .github/workflows/deploy-app-service.yml
   git commit -m "chore: Re-enable App Service workflow"
   git push origin develop
   ```

2. **Or manually trigger old workflow:**
   - Go to GitHub → Actions
   - Find "Deploy to Azure App Service"
   - Click "Run workflow" → "Run workflow"

---

## Verification Checklist

- [ ] Old workflow disabled (renamed or deleted)
- [ ] New workflow file exists (`.github/workflows/build-push-acr.yml`)
- [ ] GitHub Secrets added (`ACR_USERNAME`, `ACR_PASSWORD`)
- [ ] Pushed a test commit
- [ ] New workflow runs successfully
- [ ] Image appears in ACR
- [ ] Container App deploys automatically
- [ ] New URL works

---

**Need Help?** See `docs/STEP_BY_STEP_ACR_MIGRATION.md` for detailed troubleshooting.
