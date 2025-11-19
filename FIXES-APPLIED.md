# Critical Fixes Applied

## Summary

This document outlines the critical fixes applied to address K8s namespace identification and Azure deployment issues.

## ✅ Fixed Issues

### 1. K8s Namespace Identification

#### Problem
- Namespace was not always properly extracted from pod names
- Namespace information could be lost when converting pods to AzureResource objects
- Multiple pod name formats were not handled consistently

#### Solution
**File: `backend/app/services/aks_service.py`**
- Enhanced `to_azure_resource()` method to store namespace in multiple places:
  - `properties.namespace` (primary)
  - `properties.namespace_name` (redundant)
  - `tags.namespace` (for easy access)
- Added comprehensive debug logging for namespace extraction

**File: `backend/app/services/temenos_service.py`**
- Improved `_extract_component_name()` to check multiple sources for namespace:
  1. `service.properties.get("namespace")`
  2. `service.properties.get("namespace_name")`
  3. `service.tags.get("namespace")`
  4. Parse from pod name format (`namespace/pod` or `cluster/namespace/pod`)
- Added fallback logic to extract namespace from pod name if not found in properties/tags

#### Result
- Namespace is now reliably extracted and stored
- Multiple pod name formats are supported
- Component identification works correctly based on namespace

---

### 2. Azure Deployment Workflow

#### Problem
- kubectl was not installed in GitHub Actions workflow
- No error handling for kubectl unavailability
- No guidance for Azure App Service deployment

#### Solution
**File: `.github/workflows/deploy-app-service.yml`**
- Added kubectl installation step (optional, continues on error)
- Added informative messages about kubectl availability
- Improved error messages in app settings configuration

**File: `infrastructure/install-kubectl-app-service.sh`**
- Created script to install kubectl in Azure App Service
- Can be run via SSH or as part of startup command
- Includes PATH configuration instructions

**File: `backend/app/api/deployment.py`**
- Enhanced error messages when namespaces cannot be retrieved
- Added specific guidance for Azure App Service scenarios
- Better logging for troubleshooting

#### Result
- kubectl is installed during CI/CD (if possible)
- Clear error messages guide users on fixing issues
- Script available for manual kubectl installation in App Service

---

### 3. Namespace Discovery Robustness

#### Problem
- `list_cluster_namespaces()` had inconsistent error handling
- Credential retrieval was skipped, leading to failures
- No clear indication when kubectl is unavailable

#### Solution
**File: `backend/app/services/aks_service.py`**
- Improved `list_cluster_namespaces()` method:
  - Checks for kubectl availability first
  - Attempts to get cluster credentials before listing namespaces
  - Better fallback to default kubeconfig
  - More comprehensive error logging
  - Handles both Windows and Linux environments

#### Result
- More reliable namespace discovery
- Better error messages for troubleshooting
- Graceful degradation when kubectl is not available

---

## 🔧 Technical Details

### Namespace Storage Strategy

Pods now store namespace information in three places for redundancy:

```python
properties = {
    "namespace": self.namespace,           # Primary location
    "namespace_name": self.namespace,     # Redundant
    ...
}
tags = {
    "namespace": self.namespace,          # Easy access
    ...
}
```

### Namespace Extraction Priority

When extracting namespace from a pod:

1. Check `service.properties.get("namespace")`
2. Check `service.properties.get("namespace_name")`
3. Check `service.tags.get("namespace")`
4. Parse from pod name (`namespace/pod` format)
5. Parse from pod name (`cluster/namespace/pod` format)

### kubectl Availability Handling

The system gracefully handles kubectl unavailability:

- **Local Development**: kubectl should be installed and configured
- **GitHub Actions**: kubectl is installed during workflow (optional)
- **Azure App Service**: kubectl must be installed manually (script provided)

When kubectl is not available:
- Namespace discovery returns empty list
- Clear warning messages are logged
- Application continues to work (without namespace discovery)

---

## 📋 Testing Checklist

After applying these fixes, verify:

- [ ] Namespace is correctly extracted from pods
- [ ] Component identification works based on namespace
- [ ] Namespace listing endpoint returns namespaces (if kubectl available)
- [ ] Error messages are clear when kubectl is unavailable
- [ ] Azure deployment workflow completes successfully
- [ ] Application works even when kubectl is not available

---

## 🚀 Deployment Notes

### For Local Development

1. Ensure kubectl is installed: `kubectl version --client`
2. Configure Azure CLI: `az login`
3. Get AKS credentials: `az aks get-credentials --resource-group <rg> --name <cluster>`
4. Restart backend server

### For Azure App Service

**Option 1: Install kubectl via SSH**
```bash
az webapp ssh --name bsg-demo-platform-app --resource-group bsg-demo-platform
# Then run: bash infrastructure/install-kubectl-app-service.sh
```

**Option 2: Add to startup command**
```bash
export PATH="/home/site/wwwroot/bin:${PATH}" && \
bash infrastructure/install-kubectl-app-service.sh && \
gunicorn app.main:app --bind 0.0.0.0:8000 --workers 2 --worker-class uvicorn.workers.UvicornWorker --timeout 120
```

**Note**: kubectl is optional - the app works without it, but namespace discovery won't work.

---

## 📝 Files Modified

1. `backend/app/services/aks_service.py` - Enhanced namespace handling
2. `backend/app/services/temenos_service.py` - Improved namespace extraction
3. `backend/app/api/deployment.py` - Better error messages
4. `.github/workflows/deploy-app-service.yml` - Added kubectl installation
5. `infrastructure/install-kubectl-app-service.sh` - New script for App Service

---

## ⚠️ Important Notes

1. **kubectl is optional**: The application works without kubectl, but namespace discovery requires it
2. **Azure App Service**: kubectl is not available by default - must be installed manually
3. **Namespace discovery**: Will return empty list if kubectl is not available (this is expected)
4. **Error handling**: All kubectl operations are wrapped in try-catch blocks

---

## 🔍 Troubleshooting

### Namespace discovery returns empty list

1. Check if kubectl is installed: `kubectl version --client`
2. Check if Azure CLI is configured: `az account show`
3. Get AKS credentials: `az aks get-credentials --resource-group <rg> --name <cluster>`
4. Check backend logs for specific error messages

### Azure deployment fails

1. Verify `AZURE_CREDENTIALS` secret is set in GitHub
2. Check workflow logs for specific error
3. Ensure resource group and app service name are correct
4. Verify subscription has necessary permissions

### Component identification not working

1. Check backend logs for namespace extraction
2. Verify pod has namespace in properties/tags
3. Check if namespace matches Temenos patterns
4. Review component identification logic in `temenos_service.py`

---

## ✅ Status

All critical issues have been fixed:
- ✅ K8s namespace identification
- ✅ Azure deployment workflow
- ✅ Error handling and logging
- ✅ Documentation and scripts

The application is now more robust and handles edge cases gracefully.

