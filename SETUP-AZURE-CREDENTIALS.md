# Quick Setup: Azure Credentials for GitHub Actions

## ⚠️ IMPORTANT: Add GitHub Secret

The deployment is failing because the `AZURE_CREDENTIALS` secret is missing or incorrectly formatted.

## Step-by-Step Instructions

### 1. Go to GitHub Secrets Page
Navigate to: **https://github.com/georgasa/bsg-demo-platform/settings/secrets/actions**

### 2. Click "New repository secret"

### 3. Set the Secret Name
**Name:** `AZURE_CREDENTIALS` (exactly as shown, case-sensitive)

### 4. Set the Secret Value
**Value:** Copy and paste the ENTIRE JSON below (make sure to include all curly braces):

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

### 5. Click "Add secret"

## Verification

After adding the secret:
1. Go to the **Actions** tab: https://github.com/georgasa/bsg-demo-platform/actions
2. Find the failed workflow run
3. Click **"Re-run jobs"** or push a new commit to trigger a new run
4. The workflow should now pass the "Azure Login" step

## Troubleshooting

### If it still fails:

1. **Check the secret name**: Must be exactly `AZURE_CREDENTIALS` (all caps)
2. **Check JSON format**: Make sure it's valid JSON (no extra characters, proper quotes)
3. **Verify the secret exists**: Go to Settings → Secrets → Actions and confirm `AZURE_CREDENTIALS` is listed

### If you need to recreate the Service Principal:

Run this command:
```bash
az ad sp create-for-rbac \
  --name "bsg-demo-platform-github-actions" \
  --role contributor \
  --scopes "/subscriptions/58a91cf0-0f39-45fd-a63e-5a9a28c7072b/resourceGroups/bsg-demo-platform" \
  --sdk-auth
```

Then copy the output JSON to the GitHub secret.

