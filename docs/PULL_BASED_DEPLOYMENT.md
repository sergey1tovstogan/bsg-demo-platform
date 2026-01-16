# Pull-Based Deployment Strategy

## Current Setup

**What we're deploying:**
- **Backend**: Azure App Service (`bsg-demo-platform-app`) - Python FastAPI
- **Frontend**: Azure Static Web Apps (`bsg-demo-platform-4077`) - React/Vite

**Current Problem:**
- Both workflows run on every push to `develop`
- GitHub Actions builds, tests, and deploys (consumes ~15-25 minutes per commit)
- With frequent commits, this quickly consumes the 1000 hours/month free tier

## Solution: Pull-Based Deployment

### Architecture Overview

```
GitHub Push → GitHub Actions (Build Only) → ACR (Push Image) → Azure Webhook → Azure Pulls & Deploys
```

**Benefits:**
- GitHub Actions only builds/pushes (~5-10 minutes)
- Azure handles deployment (zero GitHub runner time)
- Can reduce GitHub Actions usage by 50-70%

## Implementation Options

### Option 1: Azure Container Apps (Recommended for Backend)

**Pros:**
- Native ACR integration with webhooks
- Auto-scaling built-in
- Better for containerized workloads
- Zero-downtime deployments

**Cons:**
- Requires migration from App Service
- Different configuration model

### Option 2: Azure Web App with ACR Continuous Deployment

**Pros:**
- Minimal changes (keep existing App Service)
- ACR webhook triggers deployment automatically
- No code changes needed

**Cons:**
- Still uses App Service (less modern than Container Apps)

### Option 3: Azure Static Web Apps with GitHub Actions (Optimized)

**Pros:**
- Static Web Apps already optimized
- Can use build artifacts instead of full deployment

**Cons:**
- Frontend deployment is already efficient
- Less room for optimization

## Recommended Approach

**Hybrid Strategy:**
1. **Backend**: Migrate to Azure Container Apps with ACR webhook
2. **Frontend**: Keep Static Web Apps but optimize workflow (build artifacts only)
3. **GitHub Actions**: Only build and push to ACR (no deployment steps)

## Implementation Steps

### Step 1: Set Up Azure Container Registry (ACR)

```bash
# Create ACR
az acr create \
  --resource-group bsg-demo-platform \
  --name bsgdemoplatform \
  --sku Basic \
  --admin-enabled true

# Get ACR login credentials
ACR_USERNAME=$(az acr credential show --name bsgdemoplatform --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name bsgdemoplatform --query passwords[0].value -o tsv)
```

### Step 2: Create Container App Environment

```bash
# Create Container Apps environment
az containerapp env create \
  --name bsg-demo-env \
  --resource-group bsg-demo-platform \
  --location eastus
```

### Step 3: Create Container App (Backend)

```bash
# Create Container App with ACR image
az containerapp create \
  --name bsg-demo-backend \
  --resource-group bsg-demo-platform \
  --environment bsg-demo-env \
  --image bsgdemoplatform.azurecr.io/bsg-demo-backend:latest \
  --registry-server bsgdemoplatform.azurecr.io \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 8000 \
  --ingress external \
  --env-vars \
    DATABASE_URL="$DATABASE_URL" \
    ENVIRONMENT=production \
    DEBUG=False \
  --cpu 1.0 \
  --memory 2.0Gi \
  --min-replicas 1 \
  --max-replicas 3
```

### Step 4: Enable ACR Webhook for Auto-Deployment

```bash
# Get Container App webhook URL
WEBHOOK_URL=$(az containerapp show \
  --name bsg-demo-backend \
  --resource-group bsg-demo-platform \
  --query properties.configuration.ingress.fqdn -o tsv)

# Create ACR webhook (triggers on image push)
az acr webhook create \
  --name deploy-backend \
  --registry bsgdemoplatform \
  --uri "https://management.azure.com/subscriptions/{subscription-id}/resourceGroups/bsg-demo-platform/providers/Microsoft.App/containerApps/bsg-demo-backend/eventSubscriptions/deploy?api-version=2022-03-01" \
  --actions push \
  --scope bsg-demo-backend:latest
```

### Step 5: Update GitHub Actions Workflow

**New workflow (build-only):**

```yaml
name: Build and Push to ACR

on:
  push:
    branches:
      - develop
  workflow_dispatch:

env:
  ACR_NAME: bsgdemoplatform
  IMAGE_NAME: bsg-demo-backend

jobs:
  build-and-push:
    runs-on: ubuntu-latest
    timeout-minutes: 15  # Reduced from 25
    
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      
      - name: Set up Docker Buildx
        uses: docker/setup-buildx-action@v3
      
      - name: Log in to ACR
        uses: azure/docker-login@v1
        with:
          login-server: ${{ env.ACR_NAME }}.azurecr.io
          username: ${{ secrets.ACR_USERNAME }}
          password: ${{ secrets.ACR_PASSWORD }}
      
      - name: Build and push Docker image
        uses: docker/build-push-action@v5
        with:
          context: ./backend
          push: true
          tags: |
            ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:latest
            ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:${{ github.sha }}
          cache-from: type=registry,ref=${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:buildcache
          cache-to: type=registry,ref=${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:buildcache,mode=max
      
      # Azure automatically pulls and deploys via webhook
      - name: Deployment Summary
        run: |
          echo "## Build Complete ✅" >> $GITHUB_STEP_SUMMARY
          echo "Image pushed to ACR: ${{ env.ACR_NAME }}.azurecr.io/${{ env.IMAGE_NAME }}:latest" >> $GITHUB_STEP_SUMMARY
          echo "Azure will automatically deploy via webhook" >> $GITHUB_STEP_SUMMARY
```

**Time Savings:**
- Old workflow: ~25 minutes (build + test + deploy)
- New workflow: ~8-10 minutes (build + push only)
- **Savings: ~60% reduction in GitHub Actions usage**

## Alternative: Web App with ACR Continuous Deployment

If you prefer to keep App Service:

### Step 1: Configure App Service to Pull from ACR

```bash
# Configure App Service to use ACR
az webapp config container set \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --docker-custom-image-name bsgdemoplatform.azurecr.io/bsg-demo-backend:latest \
  --docker-registry-server-url https://bsgdemoplatform.azurecr.io \
  --docker-registry-server-user $ACR_USERNAME \
  --docker-registry-server-password $ACR_PASSWORD \
  --enable-app-service-storage false
```

### Step 2: Enable Continuous Deployment

```bash
# Enable continuous deployment from ACR
az webapp deployment container config \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --enable-cd true
```

### Step 3: Set Up ACR Webhook

```bash
# Get App Service deployment webhook URL
WEBHOOK_URL=$(az webapp deployment container show-cd-url \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --query CI_CD_URL -o tsv)

# Create ACR webhook
az acr webhook create \
  --name deploy-webapp \
  --registry bsgdemoplatform \
  --uri $WEBHOOK_URL \
  --actions push \
  --scope bsg-demo-backend:latest
```

## Frontend Optimization

For Static Web Apps, the workflow is already efficient, but we can optimize further:

```yaml
# Optimized frontend workflow
name: Build Frontend Artifacts

on:
  push:
    branches:
      - develop
    paths:
      - 'frontend/**'  # Only run if frontend changes
  workflow_dispatch:

jobs:
  build:
    runs-on: ubuntu-latest
    timeout-minutes: 10  # Reduced from 15
    
    steps:
      - uses: actions/checkout@v4
      
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json
      
      - name: Build frontend
        working-directory: ./frontend
        run: npm ci && npm run build
      
      # Upload artifacts instead of deploying
      - name: Upload build artifacts
        uses: actions/upload-artifact@v4
        with:
          name: frontend-dist
          path: frontend/dist
          retention-days: 1
      
      # Separate deployment job (can be triggered manually or via webhook)
      - name: Deploy to Static Web Apps
        uses: Azure/static-web-apps-deploy@v1
        with:
          azure_static_web_apps_api_token: ${{ secrets.AZURE_STATIC_WEB_APPS_API_TOKEN }}
          repo_token: ${{ secrets.GITHUB_TOKEN }}
          action: "upload"
          app_location: "/frontend/dist"
          output_location: "."
          skip_app_build: true
```

## Cost Comparison

### Current Setup (Push-Based)
- **Per commit**: ~20-25 minutes
- **100 commits/month**: ~33-42 hours
- **200 commits/month**: ~67-83 hours
- **Risk**: Exceeding 1000 hours with frequent commits

### New Setup (Pull-Based)
- **Per commit**: ~8-12 minutes (build + push only)
- **100 commits/month**: ~13-20 hours
- **200 commits/month**: ~27-40 hours
- **Savings**: 50-60% reduction

## Migration Checklist

- [ ] Create Azure Container Registry
- [ ] Create Container App Environment (or keep App Service)
- [ ] Create Container App (or configure App Service for ACR)
- [ ] Set up ACR webhook for auto-deployment
- [ ] Update Dockerfile for backend
- [ ] Update GitHub Actions workflow (build-only)
- [ ] Test deployment flow
- [ ] Monitor first few deployments
- [ ] Update documentation

## Troubleshooting

### Webhook Not Triggering

```bash
# Check webhook status
az acr webhook list \
  --registry bsgdemoplatform \
  --query "[].{Name:name, Status:status, Actions:actions}"

# Test webhook manually
az acr webhook ping \
  --name deploy-backend \
  --registry bsgdemoplatform
```

### Container App Not Updating

```bash
# Check Container App revision
az containerapp revision list \
  --name bsg-demo-backend \
  --resource-group bsg-demo-platform

# Force new revision
az containerapp update \
  --name bsg-demo-backend \
  --resource-group bsg-demo-platform \
  --image bsgdemoplatform.azurecr.io/bsg-demo-backend:latest
```

## Next Steps

1. Review this document
2. Choose Option 1 (Container Apps) or Option 2 (App Service + ACR)
3. Create ACR and set up webhook
4. Update GitHub Actions workflow
5. Test with a test branch
6. Monitor GitHub Actions usage reduction

---

**Last Updated**: January 2025  
**Maintained By**: BSG Team
