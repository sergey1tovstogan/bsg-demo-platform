# Deployment Issues and Fixes

## Issue 1: Frontend Not Loading (Blank Page)

### Problem
Accessing `https://bsg-demo-platform-app.azurewebsites.net` shows a blank page.

### Root Cause
The frontend static files may not be properly copied to `backend/app/static` during deployment, or the root endpoint isn't serving `index.html` correctly.

### Solution

1. **Verify Static Files Are Copied**
   - Check the deployment workflow step "Copy frontend build to backend static"
   - Verify `backend/app/static/index.html` exists after deployment

2. **Check Backend Logs**
   ```bash
   az webapp log tail --name bsg-demo-platform-app --resource-group bsg-demo-platform
   ```
   Look for:
   - "Static files mounted at /static"
   - "index.html not found" warnings

3. **Manual Fix (if needed)**
   - The deployment workflow should copy `frontend/dist/*` to `backend/app/static/`
   - If this step fails, the frontend won't load

4. **Verify Root Endpoint**
   - Access: `https://bsg-demo-platform-app.azurewebsites.net/`
   - Should serve `index.html` from `app/static/index.html`
   - If it returns JSON, static files aren't mounted

## Issue 2: AKS Namespace Discovery Not Working

### Problem
"No namespaces found" when trying to discover AKS namespaces for cluster analysis.

### Root Cause
Azure App Service doesn't have `kubectl` installed by default, and the Kubernetes Python client may not be properly configured.

### Solution Options

#### Option 1: Install kubectl in Azure App Service (Recommended)

Add to `backend/startup.sh`:
```bash
# Install kubectl if not present
if ! command -v kubectl &> /dev/null; then
    echo "Installing kubectl..."
    curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
    chmod +x kubectl
    mv kubectl /usr/local/bin/
fi
```

#### Option 2: Use Kubernetes Python Client (Better for App Service)

The code already tries this first. Ensure:
1. `kubernetes` package is in `requirements.txt` ✅ (should be there)
2. Azure credentials are properly configured
3. The `_get_cluster_kubeconfig` method works correctly

#### Option 3: Use Azure Resource Manager API (Most Reliable)

Instead of kubectl, use Azure Resource Manager API to get namespace information. This doesn't require kubectl or kubeconfig.

### Current Status

The code tries:
1. **Kubernetes Python client** (if available) - Should work in App Service
2. **kubectl fallback** - Won't work in App Service unless installed

### Recommended Fix

1. **Add kubectl installation to startup script** (Option 1)
2. **Or improve Kubernetes Python client configuration** (Option 2)
3. **Or implement Azure Resource Manager API approach** (Option 3 - most reliable)

### Debugging Steps

1. **Check backend logs** for namespace discovery:
   ```bash
   az webapp log tail --name bsg-demo-platform-app --resource-group bsg-demo-platform
   ```
   Look for:
   - "kubectl not found" errors
   - "Kubernetes API error" messages
   - "Failed to get kubeconfig" warnings

2. **Test namespace endpoint directly**:
   ```bash
   curl -X POST https://bsg-demo-platform-app.azurewebsites.net/api/v1/deployment/aks/namespaces \
     -H "Content-Type: application/json" \
     -d '{"subscription_id": "...", "resource_group_names": ["..."]}'
   ```

3. **Check if kubectl is available**:
   ```bash
   az webapp ssh --name bsg-demo-platform-app --resource-group bsg-demo-platform
   kubectl version --client
   ```

## Quick Fixes

### For Frontend Issue:
1. Re-run the deployment workflow
2. Check that "Copy frontend build to backend static" step succeeds
3. Verify `backend/app/static/index.html` exists in deployment

### For Namespace Issue:
1. Add kubectl installation to `startup.sh`
2. Or ensure Kubernetes Python client is properly configured
3. Check Azure credentials are set correctly

## Next Steps

1. ✅ Verify deployment workflow copies static files correctly
2. ✅ Add kubectl installation to startup script
3. ✅ Test namespace discovery after fix
4. ✅ Monitor backend logs for errors

