# Pull-Based Deployment - Quick Start Guide

## What We're Deploying

- **Backend**: Azure App Service → **Migrate to Azure Container Apps**
- **Frontend**: Azure Static Web Apps (already optimized)

## Current Problem

- GitHub Actions runs ~20-25 minutes per commit
- Deploys on every push to `develop`
- Risk of exceeding 1000 hours/month free tier

## Solution: Pull-Based Deployment

**GitHub Actions**: Only builds and pushes to ACR (~8-12 minutes)  
**Azure**: Automatically pulls and deploys via webhook (zero GitHub time)

**Savings**: 50-60% reduction in GitHub Actions usage

## Quick Setup (3 Steps)

### Step 1: Run Setup Script

```bash
# Make script executable (Linux/Mac)
chmod +x scripts/setup-pull-based-deployment.sh

# Run setup script
./scripts/setup-pull-based-deployment.sh
```

**Or manually:**

```bash
# 1. Create ACR
az acr create \
  --resource-group bsg-demo-platform \
  --name bsgdemoplatform \
  --sku Basic \
  --admin-enabled true

# 2. Get ACR credentials
ACR_USERNAME=$(az acr credential show --name bsgdemoplatform --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name bsgdemoplatform --query passwords[0].value -o tsv)

# 3. Create Container Apps Environment
az containerapp env create \
  --name bsg-demo-env \
  --resource-group bsg-demo-platform \
  --location eastus

# 4. Create Container App
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
  --env-vars DATABASE_URL="$DATABASE_URL" ENVIRONMENT=production
```

### Step 2: Add GitHub Secrets

Go to: **GitHub → Settings → Secrets and variables → Actions**

Add:
- `ACR_USERNAME`: (from Step 1)
- `ACR_PASSWORD`: (from Step 1)

### Step 3: Update Workflow

The new workflow `.github/workflows/build-push-acr.yml` is ready to use.

**To activate:**
1. Disable old workflow: `.github/workflows/deploy-app-service.yml`
2. Enable new workflow: `.github/workflows/build-push-acr.yml`
3. Push a commit to test

## How It Works

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐      ┌──────────────┐
│   GitHub    │      │  GitHub      │      │     ACR     │      │    Azure     │
│   Push      │─────▶│  Actions     │─────▶│  (Registry) │─────▶│  Container   │
│             │      │  (Build Only)│      │              │      │  App/Web App │
└─────────────┘      └──────────────┘      └─────────────┘      └──────────────┘
                                                      │
                                                      │ Webhook
                                                      │ (Auto-deploy)
                                                      ▼
```

1. **GitHub Push** → Triggers workflow
2. **GitHub Actions** → Builds Docker image, pushes to ACR (~8-12 min)
3. **ACR Webhook** → Notifies Azure of new image
4. **Azure** → Automatically pulls and deploys (zero GitHub time)

## Time Comparison

| Scenario | Old (Push-Based) | New (Pull-Based) | Savings |
|----------|------------------|-----------------|---------|
| Per commit | ~25 minutes | ~10 minutes | 60% |
| 100 commits/month | ~42 hours | ~17 hours | 60% |
| 200 commits/month | ~83 hours | ~33 hours | 60% |

## Verification

After setup, verify:

```bash
# Check Container App status
az containerapp show \
  --name bsg-demo-backend \
  --resource-group bsg-demo-platform \
  --query "properties.configuration.ingress.fqdn" -o tsv

# Test health endpoint
curl https://<container-app-url>/api/v1/health
```

## Troubleshooting

### Webhook Not Working

```bash
# Check webhook status
az acr webhook list --registry bsgdemoplatform

# Test webhook
az acr webhook ping --name deploy-backend --registry bsgdemoplatform
```

### Container App Not Updating

```bash
# Force new revision
az containerapp update \
  --name bsg-demo-backend \
  --resource-group bsg-demo-platform \
  --image bsgdemoplatform.azurecr.io/bsg-demo-backend:latest
```

## Alternative: Keep App Service

If you prefer to keep App Service instead of Container Apps:

```bash
# Configure App Service to pull from ACR
az webapp config container set \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --docker-custom-image-name bsgdemoplatform.azurecr.io/bsg-demo-backend:latest \
  --docker-registry-server-url https://bsgdemoplatform.azurecr.io \
  --docker-registry-server-user $ACR_USERNAME \
  --docker-registry-server-password $ACR_PASSWORD

# Enable continuous deployment
az webapp deployment container config \
  --name bsg-demo-platform-app \
  --resource-group bsg-demo-platform \
  --enable-cd true
```

## Next Steps

1. ✅ Review this guide
2. ✅ Run setup script or manual commands
3. ✅ Add GitHub Secrets
4. ✅ Test with a commit
5. ✅ Monitor GitHub Actions usage reduction

---

**See full documentation**: [PULL_BASED_DEPLOYMENT.md](./PULL_BASED_DEPLOYMENT.md)
