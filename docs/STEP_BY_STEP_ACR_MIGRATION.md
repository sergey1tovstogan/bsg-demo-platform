# Step-by-Step Guide: Switch to ACR-Based Deployment

## Prerequisites Checklist

Before starting, ensure you have:
- [ ] Azure CLI installed and logged in (`az login`)
- [ ] Access to Azure subscription with resource group `bsg-demo-platform`
- [ ] GitHub repository access
- [ ] Admin access to GitHub repository (to add secrets)
- [ ] ~30 minutes for setup

## Step 1: Verify Azure Login and Subscription

```bash
# Check if logged in
az account show

# If not logged in, run:
az login

# Verify you have access to the resource group
az group show --name bsg-demo-platform

# Note your subscription ID (you'll need it later)
SUBSCRIPTION_ID=$(az account show --query id -o tsv)
echo "Subscription ID: $SUBSCRIPTION_ID"
```

**Expected Output:**
- Should show your Azure account details
- Resource group should exist

---

## Step 2: Create Azure Container Registry (ACR)

```bash
# Set variables
RESOURCE_GROUP="bsg-demo-platform"
ACR_NAME="bsgdemoplatform"  # Must be globally unique, lowercase, alphanumeric only
LOCATION="eastus"  # Change if needed

# Create ACR
az acr create \
  --resource-group $RESOURCE_GROUP \
  --name $ACR_NAME \
  --sku Basic \
  --admin-enabled true \
  --location $LOCATION

# Verify ACR was created
az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP
```

**Expected Output:**
- ACR created successfully
- Login server: `bsgdemoplatform.azurecr.io`

**If ACR name is taken:**
```bash
# Try a different name (must be globally unique)
ACR_NAME="bsgdemoplatform$(date +%s)"
echo "Using ACR name: $ACR_NAME"
```

---

## Step 3: Get ACR Credentials

```bash
# Get ACR username
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
echo "ACR Username: $ACR_USERNAME"

# Get ACR password
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)
echo "ACR Password: $ACR_PASSWORD"

# Get ACR login server
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv)
echo "ACR Login Server: $ACR_LOGIN_SERVER"
```

**⚠️ IMPORTANT:** Save these values - you'll need them for GitHub Secrets!

---

## Step 4: Add GitHub Secrets

1. Go to your GitHub repository
2. Navigate to: **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret** and add:

   **Secret 1:**
   - Name: `ACR_USERNAME`
   - Value: `[The ACR_USERNAME from Step 3]`

   **Secret 2:**
   - Name: `ACR_PASSWORD`
   - Value: `[The ACR_PASSWORD from Step 3]`

4. Verify `AZURE_CREDENTIALS` secret exists (for Azure login in workflow)

**Verify secrets are set:**
- You should see: `ACR_USERNAME`, `ACR_PASSWORD`, `AZURE_CREDENTIALS`

---

## Step 5: Create Container Apps Environment

```bash
# Set variables
CONTAINER_APP_ENV="bsg-demo-env"

# Create Container Apps Environment
az containerapp env create \
  --name $CONTAINER_APP_ENV \
  --resource-group $RESOURCE_GROUP \
  --location $LOCATION

# Verify environment was created
az containerapp env show --name $CONTAINER_APP_ENV --resource-group $RESOURCE_GROUP
```

**Expected Output:**
- Environment created successfully
- Takes ~2-3 minutes

---

## Step 6: Get Environment Variables from Existing App Service

```bash
# Get environment variables from existing App Service
APP_SERVICE_NAME="bsg-demo-platform-app"

# Check if App Service exists
if az webapp show --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP > /dev/null 2>&1; then
    echo "App Service found, extracting environment variables..."
    
    # Get DATABASE_URL
    DATABASE_URL=$(az webapp config appsettings list \
        --name $APP_SERVICE_NAME \
        --resource-group $RESOURCE_GROUP \
        --query "[?name=='DATABASE_URL'].value" -o tsv)
    
    # Get RAG_JWT_TOKEN
    RAG_JWT_TOKEN=$(az webapp config appsettings list \
        --name $APP_SERVICE_NAME \
        --resource-group $RESOURCE_GROUP \
        --query "[?name=='RAG_JWT_TOKEN'].value" -o tsv)
    
    # Get RAG_API_URL
    RAG_API_URL=$(az webapp config appsettings list \
        --name $APP_SERVICE_NAME \
        --resource-group $RESOURCE_GROUP \
        --query "[?name=='RAG_API_URL'].value" -o tsv)
    
    echo "DATABASE_URL: ${DATABASE_URL:0:50}..."
    echo "RAG_JWT_TOKEN: ${RAG_JWT_TOKEN:0:20}..."
    echo "RAG_API_URL: $RAG_API_URL"
else
    echo "App Service not found, using defaults"
    DATABASE_URL=""
    RAG_JWT_TOKEN=""
    RAG_API_URL="https://tbsg.temenos.com"
fi
```

**Note:** Save these values - you'll need them in the next step.

---

## Step 7: Create Container App

```bash
# Set variables
CONTAINER_APP_NAME="bsg-demo-backend"
IMAGE_NAME="bsg-demo-backend"

# Build environment variables string
ENV_VARS="ENVIRONMENT=production DEBUG=False DATABASE_NAME=bsg_demo"

# Add DATABASE_URL if available
if [ -n "$DATABASE_URL" ]; then
    ENV_VARS="$ENV_VARS DATABASE_URL=\"$DATABASE_URL\""
fi

# Add RAG_JWT_TOKEN if available
if [ -n "$RAG_JWT_TOKEN" ]; then
    ENV_VARS="$ENV_VARS RAG_JWT_TOKEN=\"$RAG_JWT_TOKEN\""
fi

# Add RAG_API_URL
if [ -n "$RAG_API_URL" ]; then
    ENV_VARS="$ENV_VARS RAG_API_URL=\"$RAG_API_URL\""
else
    ENV_VARS="$ENV_VARS RAG_API_URL=\"https://tbsg.temenos.com\""
fi

# Create Container App
az containerapp create \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --environment $CONTAINER_APP_ENV \
  --image $ACR_LOGIN_SERVER/$IMAGE_NAME:latest \
  --registry-server $ACR_LOGIN_SERVER \
  --registry-username $ACR_USERNAME \
  --registry-password $ACR_PASSWORD \
  --target-port 8000 \
  --ingress external \
  --env-vars $ENV_VARS \
  --cpu 1.0 \
  --memory 2.0Gi \
  --min-replicas 1 \
  --max-replicas 3

# Get Container App URL
CONTAINER_APP_URL=$(az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" -o tsv)

echo "Container App URL: https://$CONTAINER_APP_URL"
```

**Expected Output:**
- Container App created successfully
- URL: `https://bsg-demo-backend.xxxxx.azurecontainerapps.io`

**Note:** The app won't work yet because no image exists in ACR. We'll build and push the image next.

---

## Step 8: Verify Dockerfile Exists

```bash
# Check if Dockerfile exists
if [ -f "backend/Dockerfile" ]; then
    echo "✅ Dockerfile exists"
    cat backend/Dockerfile | head -20
else
    echo "❌ Dockerfile not found - it should have been created"
    exit 1
fi
```

**Expected Output:**
- Dockerfile should exist and show multi-stage build

---

## Step 9: Test Build Locally (Optional but Recommended)

```bash
# Login to ACR
az acr login --name $ACR_NAME

# Build and push test image
cd backend
docker build -t $ACR_LOGIN_SERVER/$IMAGE_NAME:test .
docker push $ACR_LOGIN_SERVER/$IMAGE_NAME:test

# Verify image was pushed
az acr repository show-tags --name $ACR_NAME --repository $IMAGE_NAME

cd ..
```

**Expected Output:**
- Image built successfully
- Image pushed to ACR
- Tags listed: `test`

---

## Step 10: Update Container App to Use Test Image

```bash
# Update Container App to use test image
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image $ACR_LOGIN_SERVER/$IMAGE_NAME:test

# Wait for deployment
echo "Waiting for deployment to complete..."
sleep 30

# Check Container App status
az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.provisioningState" -o tsv
```

**Expected Output:**
- Container App updated
- Provisioning state: `Succeeded`

---

## Step 11: Test Container App

```bash
# Test health endpoint
CONTAINER_APP_URL=$(az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" -o tsv)

echo "Testing Container App at: https://$CONTAINER_APP_URL"

# Test health endpoint
curl -f https://$CONTAINER_APP_URL/api/v1/health || echo "Health check failed - app may still be starting"

# Test liveness endpoint
curl -f https://$CONTAINER_APP_URL/api/v1/live || echo "Liveness check failed"
```

**Expected Output:**
- Health check returns 200 OK
- Liveness check returns 200 OK

**If it fails:**
- Wait 1-2 minutes (app may still be starting)
- Check logs: `az containerapp logs show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP --tail 50`

---

## Step 12: Set Up ACR Webhook for Auto-Deployment

```bash
# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Create webhook URI for Container App
WEBHOOK_URI="https://management.azure.com/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.App/containerApps/$CONTAINER_APP_NAME/eventSubscriptions/deploy?api-version=2022-03-01"

# Create ACR webhook
az acr webhook create \
  --name deploy-backend \
  --registry $ACR_NAME \
  --uri "$WEBHOOK_URI" \
  --actions push \
  --scope "$IMAGE_NAME:latest"

# Test webhook
az acr webhook ping --name deploy-backend --registry $ACR_NAME

# List webhooks to verify
az acr webhook list --registry $ACR_NAME --query "[].{Name:name, Status:status, Actions:actions}"
```

**Expected Output:**
- Webhook created successfully
- Webhook ping successful
- Webhook listed with status `enabled`

---

## Step 13: Update GitHub Actions Workflow

1. **Disable old workflow:**
   - Go to `.github/workflows/deploy-app-service.yml`
   - Rename it to `deploy-app-service.yml.disabled` (or delete if you're confident)

2. **Enable new workflow:**
   - The file `.github/workflows/build-push-acr.yml` should already exist
   - Verify it exists: `ls -la .github/workflows/build-push-acr.yml`

3. **Update workflow if needed:**
   - Open `.github/workflows/build-push-acr.yml`
   - Verify `ACR_NAME` matches your ACR name (should be `bsgdemoplatform`)
   - Verify `IMAGE_NAME` is `bsg-demo-backend`

**Verify workflow file:**
```bash
# Check workflow file exists
cat .github/workflows/build-push-acr.yml | head -30
```

---

## Step 14: Test GitHub Actions Workflow

1. **Create a test commit:**
   ```bash
   # Make a small change
   echo "# Test ACR deployment" >> backend/README.md
   
   # Commit and push
   git add backend/README.md
   git commit -m "test: Test ACR-based deployment"
   git push origin develop
   ```

2. **Monitor GitHub Actions:**
   - Go to GitHub → Actions tab
   - Watch the "Build and Push to ACR" workflow
   - Should complete in ~8-12 minutes

3. **Verify image was pushed:**
   ```bash
   # Check ACR for new image
   az acr repository show-tags --name $ACR_NAME --repository $IMAGE_NAME --orderby time_desc
   ```

4. **Verify Container App updated:**
   ```bash
   # Check Container App revision
   az containerapp revision list \
     --name $CONTAINER_APP_NAME \
     --resource-group $RESOURCE_GROUP \
     --query "[].{Name:name, Created:properties.createdTime, Active:properties.active}" -o table
   ```

**Expected Output:**
- GitHub Actions workflow completes successfully
- New image tag appears in ACR
- New Container App revision created
- Container App automatically updated

---

## Step 15: Verify Deployment

```bash
# Get Container App URL
CONTAINER_APP_URL=$(az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" -o tsv)

# Test endpoints
echo "Testing Container App endpoints..."

# Health check
curl -f https://$CONTAINER_APP_URL/api/v1/health && echo " ✅ Health check passed"

# Liveness check
curl -f https://$CONTAINER_APP_URL/api/v1/live && echo " ✅ Liveness check passed"

# API docs
curl -f https://$CONTAINER_APP_URL/docs && echo " ✅ API docs accessible"

echo ""
echo "Container App URL: https://$CONTAINER_APP_URL"
```

**Expected Output:**
- All endpoints return 200 OK
- App is fully functional

---

## Step 16: Update Frontend Configuration (If Needed)

If your frontend points to the old App Service URL, update it:

```bash
# Check current frontend config
grep -r "bsg-demo-platform-app.azurewebsites.net" frontend/

# Update to new Container App URL
CONTAINER_APP_URL=$(az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.configuration.ingress.fqdn" -o tsv)

echo "Update frontend to use: https://$CONTAINER_APP_URL"
```

**Note:** You may need to update:
- `frontend/public/config.json`
- `frontend/src/services/api.ts`
- Any hardcoded API URLs

---

## Step 17: Monitor First Few Deployments

```bash
# Watch Container App logs
az containerapp logs show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --follow

# Check Container App metrics
az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.template.scale" -o json
```

**Monitor for:**
- Successful deployments
- No errors in logs
- Proper scaling behavior
- Health checks passing

---

## Step 18: Clean Up (Optional)

Once everything is working, you can:

1. **Keep old App Service as backup** (recommended for first week)
2. **Or delete old App Service** (if confident):
   ```bash
   # WARNING: This deletes the old App Service
   # Only do this after confirming new deployment works!
   az webapp delete \
     --name $APP_SERVICE_NAME \
     --resource-group $RESOURCE_GROUP
   ```

---

## Troubleshooting

### Issue: ACR name already taken
```bash
# Use a different name
ACR_NAME="bsgdemoplatform$(date +%s)"
```

### Issue: Container App not updating
```bash
# Force update
az containerapp update \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --image $ACR_LOGIN_SERVER/$IMAGE_NAME:latest
```

### Issue: Webhook not working
```bash
# Check webhook status
az acr webhook list --registry $ACR_NAME

# Test webhook
az acr webhook ping --name deploy-backend --registry $ACR_NAME

# Check webhook logs
az acr webhook list-events --name deploy-backend --registry $ACR_NAME
```

### Issue: Container App health check failing
```bash
# Check logs
az containerapp logs show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --tail 100

# Check environment variables
az containerapp show \
  --name $CONTAINER_APP_NAME \
  --resource-group $RESOURCE_GROUP \
  --query "properties.template.containers[0].env" -o json
```

---

## Success Checklist

- [ ] ACR created and accessible
- [ ] GitHub Secrets added (ACR_USERNAME, ACR_PASSWORD)
- [ ] Container Apps Environment created
- [ ] Container App created
- [ ] Dockerfile exists and builds successfully
- [ ] Test image pushed to ACR
- [ ] Container App running with test image
- [ ] ACR webhook created and tested
- [ ] GitHub Actions workflow updated
- [ ] First deployment via GitHub Actions successful
- [ ] Container App automatically updated via webhook
- [ ] All endpoints working
- [ ] Frontend updated (if needed)

---

## Next Steps After Migration

1. **Monitor for 1 week** - Watch deployments closely
2. **Update documentation** - Update any docs referencing old App Service URL
3. **Team notification** - Inform team of new Container App URL
4. **Clean up** - Remove old App Service after confirmation period

---

**Congratulations!** You've successfully migrated to pull-based deployment! 🎉

Your GitHub Actions usage should now be reduced by 50-60%.
