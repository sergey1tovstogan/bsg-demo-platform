# Checking JWT Token Setup for Azure Deployment

## Current Status

✅ **Local Development**: JWT token is configured in `backend/.env`  
⚠️ **Azure Deployment**: Needs verification

## How to Check if Token is Set in Azure

### Option 1: Check GitHub Secrets

1. Go to GitHub repository: https://github.com/georgasa/bsg-demo-platform
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Look for `RAG_JWT_TOKEN` secret
4. If it's missing or different, update it

### Option 2: Check Azure App Service Settings

Using Azure CLI:
```bash
az webapp config appsettings list \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --query "[?name=='RAG_JWT_TOKEN']"
```

Or check in Azure Portal:
1. Go to Azure Portal
2. Navigate to App Service: `bsg-demo-platform-app`
3. Go to **Configuration** → **Application settings**
4. Look for `RAG_JWT_TOKEN`

## How to Set the Token

### Set in GitHub Secrets

1. Go to GitHub repository → **Settings** → **Secrets and variables** → **Actions**
2. Click **New repository secret**
3. Name: `RAG_JWT_TOKEN`
4. Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYXBvc3RvbG9zLmdlb3JnYXMiLCJlbWFpbCI6ImFwb3N0b2xvcy5nZW9yZ2FzQHRlbWVub3MuY29tIiwiZXhwIjoxNzY2MjMyNjA0LCJpYXQiOjE3NjM2NDA2MDQsImlzcyI6InRic2cudGVtZW5vcy5jb20iLCJhdWQiOiJ0ZW1lbm9zLWFwaSJ9.EhemmsWu2_eFQgtS76PNcVeVywgwAKLL2HxmRU7CLek`
5. Click **Add secret**

After setting, the next deployment will automatically configure it in Azure App Service.

### Set Directly in Azure App Service

Using Azure CLI:
```bash
az webapp config appsettings set \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --settings RAG_JWT_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoiYXBvc3RvbG9zLmdlb3JnYXMiLCJlbWFpbCI6ImFwb3N0b2xvcy5nZW9yZ2FzQHRlbWVub3MuY29tIiwiZXhwIjoxNzY2MjMyNjA0LCJpYXQiOjE3NjM2NDA2MDQsImlzcyI6InRic2cudGVtZW5vcy5jb20iLCJhdWQiOiJ0ZW1lbm9zLWFwaSJ9.EhemmsWu2_eFQgtS76PNcVeVywgwAKLL2HxmRU7CLek"
```

After setting, restart the App Service:
```bash
az webapp restart \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform
```

## Token Information

**Current Token**:
- User ID: apostolos.georgas
- Email: apostolos.georgas@temenos.com
- Issuer: tbsg.temenos.com
- Expires: December 20, 2025 14:10:04 UTC
- Status: ✅ Valid (not expired)

## Verification

To verify the token is working after configuration:

1. Check backend logs in Azure:
   ```bash
   az webapp log tail \
     --name bsg-demo-platform-app \
     --resource-group bsg-demo-platform
   ```

2. Test the RAG endpoint:
   ```bash
   curl -X POST https://bsg-demo-platform-app.azurewebsites.net/api/v1/deployment/temenos/query \
     -H "Content-Type: application/json" \
     -d '{
       "question": "What is Temenos Transact?",
       "region": "global",
       "RAGmodelId": "ModularBanking"
     }'
   ```

3. Check JWT info endpoint:
   ```bash
   curl https://bsg-demo-platform-app.azurewebsites.net/api/v1/deployment/temenos/jwt-info
   ```

