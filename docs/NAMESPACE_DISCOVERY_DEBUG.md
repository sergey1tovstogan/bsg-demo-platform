# AKS Namespace Discovery Debugging Guide

## Current Issue
"No namespaces found" when trying to discover AKS namespaces for cluster "transact" in resource group "modulartest3".

## How Namespace Discovery Works

The code tries multiple methods in order:

1. **Kubernetes Python Client** (Preferred for Azure App Service)
   - Gets kubeconfig via `_get_cluster_kubeconfig()`
   - Uses Azure credentials to fetch cluster credentials
   - Lists namespaces directly via Kubernetes API

2. **kubectl Fallback** (For local development)
   - Uses `kubectl get namespaces` command
   - Requires kubectl installed and Azure CLI credentials configured
   - Now automatically installed in Azure App Service via `startup.sh`

## Debugging Steps

### 1. Check Backend Logs

```bash
# View live logs
az webapp log tail --name bsg-demo-platform-app --resource-group bsg-demo-platform

# Or download logs
az webapp log download --name bsg-demo-platform-app --resource-group bsg-demo-platform --log-file app-logs.zip
```

Look for:
- `"=== FUNCTION ENTRY: list_cluster_namespaces ==="`
- `"Kubernetes Python client available: True/False"`
- `"Attempting to use Kubernetes Python client library..."`
- `"Failed to get kubeconfig"` or `"kubeconfig_path: ..."`
- `"kubectl not found"` errors
- `"Kubernetes API error"` messages

### 2. Test Namespace Endpoint Directly

```bash
curl -X POST https://bsg-demo-platform-app.azurewebsites.net/api/v1/deployment/aks/namespaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "subscription_id": "58a91cf0-0f39-45fd-a63e-5a9a28c7072b",
    "resource_group_names": ["modulartest3"]
  }'
```

### 3. Check Azure Credentials

The backend uses:
- **Azure App Service**: Managed Identity (DefaultAzureCredential)
- **Local**: Azure CLI credentials

Verify Managed Identity is configured:
```bash
az webapp identity show --name bsg-demo-platform-app --resource-group bsg-demo-platform
```

### 4. Verify kubectl Installation

After deployment with the new startup script, kubectl should be installed. Check:
```bash
az webapp ssh --name bsg-demo-platform-app --resource-group bsg-demo-platform
kubectl version --client
```

### 5. Check Kubernetes Python Client

The `kubernetes` package should be installed. Verify in requirements.txt:
```
kubernetes==28.1.0
```

## Common Issues

### Issue 1: Kubernetes Python Client Fails
**Symptoms:**
- Logs show "Kubernetes API error" or "Error using Kubernetes Python client"
- Falls back to kubectl

**Possible Causes:**
- Azure credentials not configured correctly
- Managed Identity doesn't have permissions to access AKS cluster
- `_get_cluster_kubeconfig()` fails to retrieve credentials

**Fix:**
1. Ensure Managed Identity has "Azure Kubernetes Service Cluster User Role" on the AKS cluster
2. Check that `_get_cluster_kubeconfig()` method works correctly
3. Verify Azure credentials in App Service settings

### Issue 2: kubectl Not Found
**Symptoms:**
- Logs show "kubectl not found in PATH"
- Returns empty namespaces list

**Fix:**
- ✅ **FIXED**: kubectl is now installed automatically in `startup.sh`
- After next deployment, kubectl will be available

### Issue 3: No kubeconfig
**Symptoms:**
- Logs show "Failed to get kubeconfig"
- kubectl can't connect to cluster

**Fix:**
- The code should get credentials via `az aks get-credentials` equivalent
- Check that Azure credentials have permission to get cluster credentials

### Issue 4: Azure Credentials Not Configured
**Symptoms:**
- All methods fail
- Authentication errors in logs

**Fix:**
1. Enable Managed Identity on App Service:
   ```bash
   az webapp identity assign --name bsg-demo-platform-app --resource-group bsg-demo-platform
   ```

2. Grant permissions to AKS cluster:
   ```bash
   # Get Managed Identity principal ID
   PRINCIPAL_ID=$(az webapp identity show --name bsg-demo-platform-app --resource-group bsg-demo-platform --query principalId -o tsv)
   
   # Grant AKS cluster user role
   az role assignment create \
     --assignee $PRINCIPAL_ID \
     --role "Azure Kubernetes Service Cluster User Role" \
     --scope /subscriptions/SUBSCRIPTION_ID/resourceGroups/RESOURCE_GROUP/providers/Microsoft.ContainerService/managedClusters/CLUSTER_NAME
   ```

## Expected Log Output (Success)

```
=== FUNCTION ENTRY: list_cluster_namespaces ===
Cluster name: transact
Kubernetes Python client available: True
Attempting to use Kubernetes Python client library...
Querying namespaces using Kubernetes Python client...
✓ Found 12 namespaces using Kubernetes Python client: ['adapterservice', 'deposits202507', ...]
```

## Next Steps

1. ✅ Check backend logs for the actual error
2. ✅ Verify Managed Identity is configured and has permissions
3. ✅ Test after next deployment (kubectl will be installed)
4. ✅ If Kubernetes Python client fails, kubectl fallback should work

## Quick Test

After deployment, test the endpoint:
```bash
# Get a test token (if auth is required)
TOKEN=$(curl -X POST https://bsg-demo-platform-app.azurewebsites.net/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test"}' | jq -r '.data.access_token')

# Test namespace discovery
curl -X POST https://bsg-demo-platform-app.azurewebsites.net/api/v1/deployment/aks/namespaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "subscription_id": "58a91cf0-0f39-45fd-a63e-5a9a28c7072b",
    "resource_group_names": ["modulartest3"]
  }' | jq
```

