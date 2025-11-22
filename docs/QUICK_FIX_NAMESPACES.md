# Quick Fix: Namespace Discovery "No namespaces found"

## Immediate Steps to Diagnose

### 1. Check Backend Logs

```bash
# View live logs
az webapp log tail --name bsg-demo-platform-app --resource-group bsg-demo-platform

# Or download recent logs
az webapp log download --name bsg-demo-platform-app --resource-group bsg-demo-platform --log-file app-logs.zip
```

**Look for:**
- `"=== FUNCTION ENTRY: list_cluster_namespaces ==="`
- `"Kubernetes Python client available: True/False"`
- `"kubectl not found"` errors
- `"Failed to get kubeconfig"` messages
- `"startup.sh"` execution logs
- `"kubectl installed"` messages

### 2. Verify kubectl Installation

After deployment, kubectl should be installed by `startup.sh`. Check:

```bash
# SSH into App Service
az webapp ssh --name bsg-demo-platform-app --resource-group bsg-demo-platform

# Check if kubectl exists
which kubectl
kubectl version --client

# Check if startup.sh ran
cat /home/LogFiles/application.log | grep -i "kubectl\|startup"
```

### 3. Check Managed Identity Permissions

The backend uses Managed Identity to access AKS. Verify:

```bash
# Check if Managed Identity is enabled
az webapp identity show --name bsg-demo-platform-app --resource-group bsg-demo-platform

# Get the principal ID
PRINCIPAL_ID=$(az webapp identity show --name bsg-demo-platform-app --resource-group bsg-demo-platform --query principalId -o tsv)
echo "Principal ID: $PRINCIPAL_ID"

# Check if it has AKS permissions (replace with your cluster details)
az role assignment list --assignee $PRINCIPAL_ID --scope /subscriptions/58a91cf0-0f39-45fd-a63e-5a9a28c7072b/resourceGroups/modulartest3/providers/Microsoft.ContainerService/managedClusters/transact
```

### 4. Grant Required Permissions

If Managed Identity doesn't have permissions:

```bash
# Get principal ID
PRINCIPAL_ID=$(az webapp identity show --name bsg-demo-platform-app --resource-group bsg-demo-platform --query principalId -o tsv)

# Grant "Azure Kubernetes Service Cluster User Role"
az role assignment create \
  --assignee $PRINCIPAL_ID \
  --role "Azure Kubernetes Service Cluster User Role" \
  --scope /subscriptions/58a91cf0-0f39-45fd-a63e-5a9a28c7072b/resourceGroups/modulartest3/providers/Microsoft.ContainerService/managedClusters/transact
```

## Common Issues and Fixes

### Issue: kubectl Not Installed

**Symptoms:**
- Logs show "kubectl not found in PATH"
- startup.sh may have failed

**Fix:**
1. Check startup.sh logs in App Service
2. Verify startup.sh is executable and runs
3. Manually install kubectl if needed (see startup.sh for commands)

### Issue: Kubernetes Python Client Fails

**Symptoms:**
- Logs show "Kubernetes API error" or "Failed to get kubeconfig"
- Falls back to kubectl

**Fix:**
1. Ensure Managed Identity has "Azure Kubernetes Service Cluster User Role"
2. Check that `_get_cluster_kubeconfig()` method works
3. Verify Azure credentials are configured

### Issue: No Credentials

**Symptoms:**
- "Failed to get cluster credentials"
- Authentication errors

**Fix:**
1. Enable Managed Identity (if not enabled)
2. Grant permissions to AKS cluster
3. Verify subscription ID is correct

## Test After Fix

```bash
# Test the namespace endpoint directly
curl -X POST https://bsg-demo-platform-app.azurewebsites.net/api/v1/deployment/aks/namespaces \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "subscription_id": "58a91cf0-0f39-45fd-a63e-5a9a28c7072b",
    "resource_group_names": ["modulartest3"]
  }'
```

## Expected Success Output

If working correctly, you should see namespaces like:
- adapterservice
- deposits202507
- eventstore
- genericconfig
- holdings
- modular-banking
- partyv2
- transact
- webingress

## Next Steps

1. ✅ Check backend logs first (most important)
2. ✅ Verify kubectl installation
3. ✅ Check Managed Identity permissions
4. ✅ Grant permissions if missing
5. ✅ Test namespace endpoint
6. ✅ Refresh frontend and try again

