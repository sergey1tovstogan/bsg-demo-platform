# How to Add Azure Static Web Apps Deployment Token to GitHub

## Step-by-Step Instructions

1. **Go to GitHub Repository Settings**
   - Navigate to: https://github.com/georgasa/bsg-demo-platform/settings
   - Or: Repository → Settings (top right)

2. **Navigate to Secrets**
   - In the left sidebar, click **"Secrets and variables"**
   - Then click **"Actions"** (under Secrets and variables)

3. **Add New Secret**
   - Click the **"New repository secret"** button (top right)

4. **Enter Secret Details**
   - **Name**: `AZURE_STATIC_WEB_APPS_API_TOKEN`
   - **Secret**: Paste your token: `697be32db33a81e83f4cf8bda92bf9d07e5b5b9c8dbc2fa7a591e12ad3d26d1b03-bb733396-10f4-496b-8ce2-5d7753755d4400f220201c0a990f`
   - Click **"Add secret"**

5. **Verify**
   - The secret should now appear in the list
   - The next push to `develop` branch will trigger deployment

## What This Does

This token allows GitHub Actions to deploy your frontend to Azure Static Web Apps. Without it, the deployment step is skipped and you'll see the default Azure page.

## After Adding the Secret

Once you add the secret:
1. The next push to `develop` will trigger the deployment workflow
2. Check GitHub Actions tab to see the deployment progress
3. Your frontend should be live at: https://kind-beach-01c0a990f.3.azurestaticapps.net

## Troubleshooting

If deployment still fails:
- Verify the token is correct (copy from Azure Portal again)
- Check GitHub Actions logs for specific errors
- Ensure the workflow file references the correct secret name: `AZURE_STATIC_WEB_APPS_API_TOKEN`

