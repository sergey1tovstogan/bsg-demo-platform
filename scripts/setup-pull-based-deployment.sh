#!/bin/bash
# Setup script for pull-based deployment
# This script sets up Azure Container Registry, Container Apps, and webhooks

set -e

# Configuration
RESOURCE_GROUP="bsg-demo-platform"
ACR_NAME="bsgdemoplatform"
CONTAINER_APP_ENV="bsg-demo-env"
CONTAINER_APP_NAME="bsg-demo-backend"
IMAGE_NAME="bsg-demo-backend"
LOCATION="eastus"

echo "🚀 Setting up pull-based deployment..."

# Check if logged in to Azure
echo "📋 Checking Azure login..."
az account show > /dev/null 2>&1 || {
    echo "❌ Not logged in to Azure. Please run: az login"
    exit 1
}

# Step 1: Create Azure Container Registry
echo ""
echo "📦 Step 1: Creating Azure Container Registry..."
if az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP > /dev/null 2>&1; then
    echo "✅ ACR '$ACR_NAME' already exists"
else
    echo "Creating ACR '$ACR_NAME'..."
    az acr create \
        --resource-group $RESOURCE_GROUP \
        --name $ACR_NAME \
        --sku Basic \
        --admin-enabled true \
        --location $LOCATION
    echo "✅ ACR created"
fi

# Get ACR credentials
echo ""
echo "🔑 Getting ACR credentials..."
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username -o tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value -o tsv)
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer -o tsv)

echo "ACR Login Server: $ACR_LOGIN_SERVER"
echo "ACR Username: $ACR_USERNAME"
echo ""
echo "⚠️  IMPORTANT: Save these credentials to GitHub Secrets:"
echo "   - ACR_USERNAME: $ACR_USERNAME"
echo "   - ACR_PASSWORD: $ACR_PASSWORD"

# Step 2: Create Container Apps Environment
echo ""
echo "🌐 Step 2: Creating Container Apps Environment..."
if az containerapp env show --name $CONTAINER_APP_ENV --resource-group $RESOURCE_GROUP > /dev/null 2>&1; then
    echo "✅ Container Apps Environment '$CONTAINER_APP_ENV' already exists"
else
    echo "Creating Container Apps Environment..."
    az containerapp env create \
        --name $CONTAINER_APP_ENV \
        --resource-group $RESOURCE_GROUP \
        --location $LOCATION
    echo "✅ Container Apps Environment created"
fi

# Step 3: Get environment variables from existing App Service (if exists)
echo ""
echo "📝 Step 3: Getting environment variables..."
APP_SERVICE_NAME="bsg-demo-platform-app"
ENV_VARS=""

if az webapp show --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP > /dev/null 2>&1; then
    echo "Found existing App Service, extracting environment variables..."
    # Get DATABASE_URL
    DATABASE_URL=$(az webapp config appsettings list \
        --name $APP_SERVICE_NAME \
        --resource-group $RESOURCE_GROUP \
        --query "[?name=='DATABASE_URL'].value" -o tsv)
    
    if [ -n "$DATABASE_URL" ]; then
        ENV_VARS="DATABASE_URL=\"$DATABASE_URL\""
    fi
    
    # Get other important env vars
    RAG_JWT_TOKEN=$(az webapp config appsettings list \
        --name $APP_SERVICE_NAME \
        --resource-group $RESOURCE_GROUP \
        --query "[?name=='RAG_JWT_TOKEN'].value" -o tsv)
    
    if [ -n "$RAG_JWT_TOKEN" ]; then
        ENV_VARS="$ENV_VARS RAG_JWT_TOKEN=\"$RAG_JWT_TOKEN\""
    fi
    
    RAG_API_URL=$(az webapp config appsettings list \
        --name $APP_SERVICE_NAME \
        --resource-group $RESOURCE_GROUP \
        --query "[?name=='RAG_API_URL'].value" -o tsv)
    
    if [ -n "$RAG_API_URL" ]; then
        ENV_VARS="$ENV_VARS RAG_API_URL=\"$RAG_API_URL\""
    fi
fi

# Add default env vars
ENV_VARS="$ENV_VARS ENVIRONMENT=production DEBUG=False DATABASE_NAME=bsg_demo"

# Step 4: Create Container App
echo ""
echo "🚢 Step 4: Creating Container App..."
if az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP > /dev/null 2>&1; then
    echo "✅ Container App '$CONTAINER_APP_NAME' already exists"
    echo "Updating Container App..."
    az containerapp update \
        --name $CONTAINER_APP_NAME \
        --resource-group $RESOURCE_GROUP \
        --image $ACR_LOGIN_SERVER/$IMAGE_NAME:latest \
        --registry-server $ACR_LOGIN_SERVER \
        --registry-username $ACR_USERNAME \
        --registry-password $ACR_PASSWORD
else
    echo "Creating Container App..."
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
    echo "✅ Container App created"
fi

# Get Container App URL
CONTAINER_APP_URL=$(az containerapp show \
    --name $CONTAINER_APP_NAME \
    --resource-group $RESOURCE_GROUP \
    --query properties.configuration.ingress.fqdn -o tsv)

echo "Container App URL: https://$CONTAINER_APP_URL"

# Step 5: Set up ACR webhook for continuous deployment
echo ""
echo "🔗 Step 5: Setting up ACR webhook for auto-deployment..."

# Get subscription ID
SUBSCRIPTION_ID=$(az account show --query id -o tsv)

# Create webhook URL for Container App
WEBHOOK_URI="https://management.azure.com/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.App/containerApps/$CONTAINER_APP_NAME/eventSubscriptions/deploy?api-version=2022-03-01"

# Check if webhook exists
if az acr webhook show --name deploy-backend --registry $ACR_NAME > /dev/null 2>&1; then
    echo "✅ Webhook 'deploy-backend' already exists"
    echo "Updating webhook..."
    az acr webhook update \
        --name deploy-backend \
        --registry $ACR_NAME \
        --uri "$WEBHOOK_URI" \
        --actions push \
        --scope "$IMAGE_NAME:latest"
else
    echo "Creating webhook..."
    az acr webhook create \
        --name deploy-backend \
        --registry $ACR_NAME \
        --uri "$WEBHOOK_URI" \
        --actions push \
        --scope "$IMAGE_NAME:latest"
    echo "✅ Webhook created"
fi

# Test webhook
echo ""
echo "🧪 Testing webhook..."
az acr webhook ping --name deploy-backend --registry $ACR_NAME > /dev/null 2>&1 && echo "✅ Webhook test successful" || echo "⚠️  Webhook test failed (may need manual verification)"

# Summary
echo ""
echo "✅ Setup complete!"
echo ""
echo "📋 Summary:"
echo "   - ACR: $ACR_LOGIN_SERVER"
echo "   - Container App: $CONTAINER_APP_NAME"
echo "   - Container App URL: https://$CONTAINER_APP_URL"
echo "   - Webhook: deploy-backend (auto-deploys on image push)"
echo ""
echo "📝 Next steps:"
echo "   1. Add ACR credentials to GitHub Secrets:"
echo "      - ACR_USERNAME: $ACR_USERNAME"
echo "      - ACR_PASSWORD: $ACR_PASSWORD"
echo "   2. Update GitHub Actions workflow to use build-push-acr.yml"
echo "   3. Push a commit to trigger build and push to ACR"
echo "   4. Azure will automatically deploy via webhook"
echo ""
echo "🔍 To verify deployment:"
echo "   curl https://$CONTAINER_APP_URL/api/v1/health"
echo ""
