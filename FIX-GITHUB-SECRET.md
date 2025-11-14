# 🔧 Quick Fix: GitHub Secret Configuration

## ❌ Current Error
```
Login failed with Error: Using auth-type: SERVICE_PRINCIPAL. 
Not all values are present. Ensure 'client-id' and 'tenant-id' are supplied.
```

## ✅ Solution: Add GitHub Secret

### Step 1: Go to GitHub Secrets Page
**Direct Link**: https://github.com/georgasa/bsg-demo-platform/settings/secrets/actions

### Step 2: Add New Secret
1. Click **"New repository secret"** button (top right)
2. **Name**: `AZURE_CREDENTIALS` (exactly this, all caps, case-sensitive)
3. **Value**: Copy the ENTIRE JSON below (including all curly braces):

```json
{
  "clientId": "4f1aa8a0-dc77-4928-9ce5-5635e1a23690",
  "clientSecret": "Bpq8Q~yjwPgD4hxpS6lqyHDLcSemAAPf0lgS1aE0",
  "subscriptionId": "58a91cf0-0f39-45fd-a63e-5a9a28c7072b",
  "tenantId": "d5d2540f-f60a-45ad-86a9-e2e792ee6669",
  "activeDirectoryEndpointUrl": "https://login.microsoftonline.com",
  "resourceManagerEndpointUrl": "https://management.azure.com/",
  "activeDirectoryGraphResourceId": "https://graph.windows.net/",
  "sqlManagementEndpointUrl": "https://management.core.windows.net:8443/",
  "galleryEndpointUrl": "https://gallery.azure.com/",
  "managementEndpointUrl": "https://management.core.windows.net/"
}
```

4. Click **"Add secret"**

### Step 3: Verify Secret Was Added
- You should see `AZURE_CREDENTIALS` listed in the secrets page
- The value will be hidden (showing only `••••••••`)

### Step 4: Re-run the Workflow
1. Go to: https://github.com/georgasa/bsg-demo-platform/actions
2. Find the failed workflow run
3. Click **"Re-run jobs"** → **"Re-run failed jobs"**
   OR
   Push a new commit to trigger a fresh run

## ⚠️ Important Notes

1. **Secret Name**: Must be exactly `AZURE_CREDENTIALS` (case-sensitive)
2. **JSON Format**: Must be valid JSON with proper quotes and commas
3. **No Extra Spaces**: Don't add extra spaces or newlines outside the JSON
4. **Complete JSON**: Include all fields, especially `clientId` and `tenantId`

## 🔍 Troubleshooting

### If secret already exists but workflow still fails:
1. **Delete the old secret** and create a new one
2. **Check JSON validity**: Use a JSON validator to ensure it's valid
3. **Verify field names**: Must be `clientId` (not `client-id`) and `tenantId` (not `tenant-id`)

### If you need to recreate the Service Principal:
```bash
az ad sp create-for-rbac \
  --name "bsg-demo-platform-github-actions" \
  --role contributor \
  --scopes "/subscriptions/58a91cf0-0f39-45fd-a63e-5a9a28c7072b/resourceGroups/bsg-demo-platform" \
  --sdk-auth
```

Then copy the output JSON to the GitHub secret.

## ✅ After Fixing

Once the secret is added correctly:
1. The "Azure Login" step should pass ✅
2. Deployment will proceed to build and deploy steps
3. Your app will be deployed to Azure App Service

---

**Quick Checklist:**
- [ ] Secret name is exactly `AZURE_CREDENTIALS`
- [ ] JSON is valid and complete
- [ ] All required fields are present (`clientId`, `tenantId`, `subscriptionId`, `clientSecret`)
- [ ] Secret is saved in GitHub
- [ ] Workflow is re-run or new commit is pushed

