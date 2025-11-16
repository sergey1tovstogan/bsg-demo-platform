# What You Need To Do - Simple Steps

## Current Situation

✅ **Code is fixed** - All the namespace listing and kubectl fixes are done and committed  
❌ **Backend needs restart** - Your local backend server is still running old code  
❌ **GitHub deployment failing** - Missing Azure credentials secret

---

## Step 1: Test Namespace Listing Locally (5 minutes)

### What to do:
1. **Stop your current backend server** (if it's running)
   - Press `Ctrl+C` in the terminal where backend is running

2. **Restart the backend** with the new code:
   ```powershell
   cd backend
   python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

3. **Test in browser**:
   - Open: http://localhost:5173 (or wherever your frontend is running)
   - Go to: **Demo** → **Deployment Analyzer**
   - Select subscription → Select resource groups
   - **You should now see namespace selection screen with namespaces!**

### Expected Result:
- Namespace selection screen shows all AKS namespaces (adapterservice, eventstore, transact, etc.)
- You can select which namespaces to analyze
- Temenos components are correctly identified

---

## Step 2: Fix GitHub Deployment (Optional - only if you want Azure deployment)

### What to do:
1. **Go to GitHub**: https://github.com/georgasa/bsg-demo-platform/settings/secrets/actions

2. **Click "New repository secret"**

3. **Fill in**:
   - **Name**: `AZURE_CREDENTIALS` (exactly like this)
   - **Value**: Copy the JSON from `SETUP-AZURE-CREDENTIALS.md` (the whole JSON block)

4. **Click "Add secret"**

5. **Re-run the failed workflow**:
   - Go to Actions tab
   - Click on the failed "Deploy to Azure App Service" run
   - Click "Re-run jobs"

### Expected Result:
- GitHub Actions deployment succeeds
- Backend is deployed to Azure App Service

---

## Summary

**Most Important**: **Restart your backend server** to test the namespace listing feature locally.

The GitHub deployment fix is only needed if you want to deploy to Azure. For local testing, you just need to restart the backend.

---

## Quick Test Checklist

After restarting backend:
- [ ] Backend starts without errors
- [ ] Frontend can connect to backend
- [ ] Namespace selection screen appears
- [ ] Namespaces are listed (not "No namespaces found")
- [ ] Can select namespaces and analyze

If any of these fail, check backend logs for errors.

