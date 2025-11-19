# Quick Fix Guide

## Issue 1: Namespace Listing Not Working

### Status
✅ Code has been fixed - kubectl commands now use KUBECONFIG env var and subprocess.run

### Action Required
**Restart the backend server** for changes to take effect:

```powershell
# Stop the current backend (Ctrl+C if running)
# Then restart:
cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Testing
After restart, test the namespace listing:
1. Open frontend: http://localhost:5173
2. Go to Demo → Deployment Analyzer
3. Select subscription → Resource Groups → Should show namespace selection

### If Still Not Working
Check backend logs for errors. The backend needs:
- `kubectl` installed and in PATH
- Azure CLI configured (`az login`)
- Access to AKS cluster (`az aks get-credentials`)

---

## Issue 2: GitHub Actions Azure Login Failure

### Status
❌ `AZURE_CREDENTIALS` secret is missing or incorrectly formatted

### Action Required
1. Go to: https://github.com/georgasa/bsg-demo-platform/settings/secrets/actions
2. Click "New repository secret"
3. Name: `AZURE_CREDENTIALS`
4. Value: Copy the JSON from `SETUP-AZURE-CREDENTIALS.md` (lines 21-32)
5. Click "Add secret"
6. Re-run the failed workflow

### Verification
After adding the secret, the workflow should pass the "Azure Login" step.

---

## Important Notes

### Azure App Service Limitations
⚠️ **kubectl may not be available in Azure App Service by default**

If namespace listing doesn't work in production:
1. Check if kubectl is installed in App Service
2. Consider using Azure Container Apps or AKS for the backend instead
3. Or use Azure Resource Manager API to get namespace info (more complex)

### Local Testing
The namespace listing should work locally if:
- Backend is restarted with latest code
- kubectl is installed (`kubectl version --client`)
- Azure CLI is configured (`az account show`)
- AKS credentials are configured (`kubectl config get-contexts`)

