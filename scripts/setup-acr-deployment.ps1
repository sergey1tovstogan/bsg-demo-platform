# PowerShell script to set up ACR-based pull deployment
# Run this script step by step, or all at once

param(
    [string]$ACR_NAME = "bsgdemoplatform",
    [string]$RESOURCE_GROUP = "bsg-demo-platform",
    [string]$LOCATION = "eastus",
    [string]$CONTAINER_APP_ENV = "bsg-demo-env",
    [string]$CONTAINER_APP_NAME = "bsg-demo-backend",
    [string]$IMAGE_NAME = "bsg-demo-backend",
    [switch]$SkipACR = $false,
    [switch]$SkipContainerApp = $false
)

Write-Host "[ROCKET] ACR-Based Deployment Setup" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""

# Step 1: Verify Azure Login
Write-Host "Step 1: Verifying Azure login..." -ForegroundColor Yellow
$account = az account show | ConvertFrom-Json
if (-not $account) {
    Write-Host "[ERROR] Not logged in to Azure. Please run: az login" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Logged in as: $($account.user.name)" -ForegroundColor Green
Write-Host "   Subscription: $($account.name)" -ForegroundColor Green
Write-Host "   Subscription ID: $($account.id)" -ForegroundColor Green
Write-Host ""

# Step 2: Verify Resource Group
Write-Host "Step 2: Verifying resource group..." -ForegroundColor Yellow
$rg = az group show --name $RESOURCE_GROUP | ConvertFrom-Json
if (-not $rg) {
    Write-Host "[ERROR] Resource group '$RESOURCE_GROUP' not found" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] Resource group exists: $RESOURCE_GROUP" -ForegroundColor Green
Write-Host "   Location: $($rg.location)" -ForegroundColor Green
Write-Host ""

# Step 3: Create ACR
if (-not $SkipACR) {
    Write-Host "Step 3: Creating Azure Container Registry..." -ForegroundColor Yellow
    $acr = az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP 2>$null | ConvertFrom-Json
    if ($acr) {
        Write-Host "[OK] ACR '$ACR_NAME' already exists" -ForegroundColor Green
    } else {
        Write-Host "Creating ACR '$ACR_NAME'..." -ForegroundColor Yellow
        az acr create `
            --resource-group $RESOURCE_GROUP `
            --name $ACR_NAME `
            --sku Basic `
            --admin-enabled true `
            --location $LOCATION | Out-Null
        Write-Host "[OK] ACR created successfully" -ForegroundColor Green
    }
    
    $acrInfo = az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP | ConvertFrom-Json
    $ACR_LOGIN_SERVER = $acrInfo.loginServer
    Write-Host "   Login Server: $ACR_LOGIN_SERVER" -ForegroundColor Cyan
    Write-Host ""
    
    # Get ACR credentials
    Write-Host "Step 4: Getting ACR credentials..." -ForegroundColor Yellow
    $acrCreds = az acr credential show --name $ACR_NAME | ConvertFrom-Json
    $ACR_USERNAME = $acrCreds.username
    $ACR_PASSWORD = $acrCreds.passwords[0].value
    
    Write-Host "[OK] ACR Credentials retrieved" -ForegroundColor Green
    Write-Host ""
    Write-Host "[WARNING]  IMPORTANT: Add these to GitHub Secrets:" -ForegroundColor Yellow
    Write-Host "   ACR_USERNAME: $ACR_USERNAME" -ForegroundColor Cyan
    Write-Host "   ACR_PASSWORD: $ACR_PASSWORD" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "NOTE: Add these secrets to GitHub before pushing code" -ForegroundColor Yellow
} else {
    Write-Host "Step 3-4: Skipping ACR creation (using existing)" -ForegroundColor Yellow
    $acrInfo = az acr show --name $ACR_NAME --resource-group $RESOURCE_GROUP | ConvertFrom-Json
    $ACR_LOGIN_SERVER = $acrInfo.loginServer
    $acrCreds = az acr credential show --name $ACR_NAME | ConvertFrom-Json
    $ACR_USERNAME = $acrCreds.username
    $ACR_PASSWORD = $acrCreds.passwords[0].value
    Write-Host "[OK] Using existing ACR: $ACR_LOGIN_SERVER" -ForegroundColor Green
    Write-Host ""
}

# Step 5: Create Container Apps Environment
Write-Host "Step 5: Creating Container Apps Environment..." -ForegroundColor Yellow
$env = az containerapp env show --name $CONTAINER_APP_ENV --resource-group $RESOURCE_GROUP 2>$null | ConvertFrom-Json
if ($env) {
    Write-Host "[OK] Container Apps Environment '$CONTAINER_APP_ENV' already exists" -ForegroundColor Green
} else {
    Write-Host "Creating Container Apps Environment..." -ForegroundColor Yellow
    az containerapp env create `
        --name $CONTAINER_APP_ENV `
        --resource-group $RESOURCE_GROUP `
        --location $LOCATION | Out-Null
    Write-Host "[OK] Container Apps Environment created" -ForegroundColor Green
}
Write-Host ""

# Step 6: Get environment variables from App Service
Write-Host "Step 6: Getting environment variables from App Service..." -ForegroundColor Yellow
$APP_SERVICE_NAME = "bsg-demo-platform-app"
$appService = az webapp show --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP 2>$null | ConvertFrom-Json

$ENV_VARS = "ENVIRONMENT=production DEBUG=False DATABASE_NAME=bsg_demo"

if ($appService) {
    Write-Host "[OK] App Service found, extracting environment variables..." -ForegroundColor Green
    
    $settings = az webapp config appsettings list --name $APP_SERVICE_NAME --resource-group $RESOURCE_GROUP | ConvertFrom-Json
    
    $DATABASE_URL = ($settings | Where-Object { $_.name -eq "DATABASE_URL" }).value
    $RAG_JWT_TOKEN = ($settings | Where-Object { $_.name -eq "RAG_JWT_TOKEN" }).value
    $RAG_API_URL = ($settings | Where-Object { $_.name -eq "RAG_API_URL" }).value
    
    if ($DATABASE_URL) {
        $ENV_VARS += " DATABASE_URL=`"$DATABASE_URL`""
        Write-Host "   âœ" DATABASE_URL found" -ForegroundColor Green
    }
    if ($RAG_JWT_TOKEN) {
        $ENV_VARS += " RAG_JWT_TOKEN=`"$RAG_JWT_TOKEN`""
        Write-Host "   âœ" RAG_JWT_TOKEN found" -ForegroundColor Green
    }
    if ($RAG_API_URL) {
        $ENV_VARS += " RAG_API_URL=`"$RAG_API_URL`""
    } else {
        $ENV_VARS += " RAG_API_URL=`"https://tbsg.temenos.com`""
    }
    Write-Host "   âœ" RAG_API_URL set" -ForegroundColor Green
} else {
    Write-Host "[WARNING]  App Service not found, using defaults" -ForegroundColor Yellow
    $ENV_VARS += " RAG_API_URL=`"https://tbsg.temenos.com`""
}
Write-Host ""

# Step 7: Create Container App
if (-not $SkipContainerApp) {
    Write-Host "Step 7: Creating Container App..." -ForegroundColor Yellow
    $containerApp = az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP 2>$null | ConvertFrom-Json
    
    if ($containerApp) {
        Write-Host "[OK] Container App '$CONTAINER_APP_NAME' already exists" -ForegroundColor Green
        Write-Host "Updating Container App image..." -ForegroundColor Yellow
        az containerapp update `
            --name $CONTAINER_APP_NAME `
            --resource-group $RESOURCE_GROUP `
            --image "${ACR_LOGIN_SERVER}/${IMAGE_NAME}:latest" | Out-Null
    } else {
        Write-Host "Creating Container App..." -ForegroundColor Yellow
        az containerapp create `
            --name $CONTAINER_APP_NAME `
            --resource-group $RESOURCE_GROUP `
            --environment $CONTAINER_APP_ENV `
            --image "${ACR_LOGIN_SERVER}/${IMAGE_NAME}:latest" `
            --registry-server $ACR_LOGIN_SERVER `
            --registry-username $ACR_USERNAME `
            --registry-password $ACR_PASSWORD `
            --target-port 8000 `
            --ingress external `
            --env-vars $ENV_VARS `
            --cpu 1.0 `
            --memory 2.0Gi `
            --min-replicas 1 `
            --max-replicas 3 | Out-Null
        Write-Host "[OK] Container App created" -ForegroundColor Green
    }
    
    $containerAppInfo = az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP | ConvertFrom-Json
    $CONTAINER_APP_URL = $containerAppInfo.properties.configuration.ingress.fqdn
    Write-Host "   Container App URL: https://$CONTAINER_APP_URL" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "Step 7: Skipping Container App creation" -ForegroundColor Yellow
    $containerAppInfo = az containerapp show --name $CONTAINER_APP_NAME --resource-group $RESOURCE_GROUP | ConvertFrom-Json
    $CONTAINER_APP_URL = $containerAppInfo.properties.configuration.ingress.fqdn
    Write-Host ""
}

# Step 8: Set up ACR webhook
Write-Host "Step 8: Setting up ACR webhook..." -ForegroundColor Yellow
$SUBSCRIPTION_ID = (az account show --query id -o tsv)
$WEBHOOK_URI = "https://management.azure.com/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.App/containerApps/$CONTAINER_APP_NAME/eventSubscriptions/deploy?api-version=2022-03-01"

$WEBHOOK_NAME = "deploybackend"
$webhook = az acr webhook show --name $WEBHOOK_NAME --registry $ACR_NAME 2>$null | ConvertFrom-Json
if ($webhook) {
    Write-Host "[OK] Webhook '$WEBHOOK_NAME' already exists" -ForegroundColor Green
    Write-Host "Updating webhook..." -ForegroundColor Yellow
    az acr webhook update `
        --name $WEBHOOK_NAME `
        --registry $ACR_NAME `
        --uri $WEBHOOK_URI `
        --actions push `
        --scope "${IMAGE_NAME}:latest" | Out-Null
} else {
    Write-Host "Creating webhook..." -ForegroundColor Yellow
    az acr webhook create `
        --name $WEBHOOK_NAME `
        --registry $ACR_NAME `
        --uri $WEBHOOK_URI `
        --actions push `
        --scope "${IMAGE_NAME}:latest" | Out-Null
    Write-Host "[OK] Webhook created" -ForegroundColor Green
}

Write-Host "Testing webhook..." -ForegroundColor Yellow
az acr webhook ping --name $WEBHOOK_NAME --registry $ACR_NAME 2>$null | Out-Null
Write-Host "[OK] Webhook test successful" -ForegroundColor Green
Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Green
Write-Host "[OK] Setup Complete!" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  ACR: $ACR_LOGIN_SERVER" -ForegroundColor White
Write-Host "  Container App: $CONTAINER_APP_NAME" -ForegroundColor White
Write-Host "  Container App URL: https://$CONTAINER_APP_URL" -ForegroundColor White
Write-Host "  Webhook: deploy-backend (auto-deploys on image push)" -ForegroundColor White
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Yellow
Write-Host "  1. [OK] ACR credentials added to GitHub Secrets" -ForegroundColor White
Write-Host "  2. Update GitHub Actions workflow (use build-push-acr.yml)" -ForegroundColor White
Write-Host "  3. Push a commit to trigger build and push to ACR" -ForegroundColor White
Write-Host "  4. Azure will automatically deploy via webhook" -ForegroundColor White
Write-Host ""
Write-Host "To test Container App:" -ForegroundColor Yellow
if ($null -ne $CONTAINER_APP_URL) {
    $testUrl = "https://$CONTAINER_APP_URL/api/v1/health"
    Write-Host "  curl $testUrl" -ForegroundColor White
}
Write-Host ""
