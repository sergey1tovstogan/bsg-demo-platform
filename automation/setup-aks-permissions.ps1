# Automated AKS Permissions Setup Script
# Assigns Azure Kubernetes Service Cluster User Role to App Service Managed Identity
# Works across multiple resource groups and clusters automatically

param(
    [Parameter(Mandatory=$true)]
    [string]$SubscriptionId,
    
    [Parameter(Mandatory=$true)]
    [string]$AppServiceName,
    
    [Parameter(Mandatory=$true)]
    [string]$AppServiceResourceGroup,
    
    [string[]]$ResourceGroups = @(),  # If empty, will discover all RGs with AKS clusters
    [switch]$DryRun = $false,
    [switch]$Verbose = $false
)

$ErrorActionPreference = "Stop"

Write-Host "[AKS PERMISSIONS] Automated Setup Script" -ForegroundColor Cyan
Write-Host ""

# Check Azure CLI
try {
    az --version | Out-Null
} catch {
    Write-Host "[ERROR] Azure CLI not found. Install from: https://aka.ms/installazurecliwindows" -ForegroundColor Red
    exit 1
}

# Check authentication
try {
    $account = az account show 2>&1 | ConvertFrom-Json
    if (-not $account) {
        throw "Not authenticated"
    }
    Write-Host "[OK] Authenticated as: $($account.user.name)" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Not authenticated. Run: az login" -ForegroundColor Red
    exit 1
}

# Set subscription
Write-Host "[INFO] Setting subscription to: $SubscriptionId" -ForegroundColor Cyan
az account set --subscription $SubscriptionId | Out-Null

# Get App Service Managed Identity
Write-Host "[INFO] Getting App Service Managed Identity..." -ForegroundColor Cyan
$appService = az webapp identity show --name $AppServiceName --resource-group $AppServiceResourceGroup 2>&1 | ConvertFrom-Json

if (-not $appService.principalId) {
    Write-Host "[ERROR] Managed Identity not enabled for App Service!" -ForegroundColor Red
    Write-Host "[FIX] Enabling Managed Identity..." -ForegroundColor Yellow
    
    if (-not $DryRun) {
        az webapp identity assign --name $AppServiceName --resource-group $AppServiceResourceGroup | Out-Null
        Start-Sleep -Seconds 5
        $appService = az webapp identity show --name $AppServiceName --resource-group $AppServiceResourceGroup | ConvertFrom-Json
    } else {
        Write-Host "[DRY-RUN] Would enable Managed Identity" -ForegroundColor Cyan
        exit 0
    }
}

$managedIdentityId = $appService.principalId
Write-Host "[OK] Managed Identity ID: $managedIdentityId" -ForegroundColor Green

# Discover AKS clusters
Write-Host ""
Write-Host "[INFO] Discovering AKS clusters..." -ForegroundColor Cyan

if ($ResourceGroups.Count -eq 0) {
    Write-Host "[INFO] No resource groups specified, discovering all RGs with AKS clusters..." -ForegroundColor Gray
    $allRGs = az group list --subscription $SubscriptionId --query "[].name" -o tsv
    $ResourceGroups = @($allRGs)
    Write-Host "[INFO] Found $($ResourceGroups.Count) resource groups to check" -ForegroundColor Gray
}

$aksClusters = @()

foreach ($rg in $ResourceGroups) {
    Write-Host "[INFO] Checking resource group: $rg" -ForegroundColor Gray
    $clusters = az aks list --resource-group $rg --subscription $SubscriptionId --query "[].{name:name, resourceGroup:resourceGroup}" -o json 2>&1 | ConvertFrom-Json
    
    if ($clusters -and $clusters.Count -gt 0) {
        foreach ($cluster in $clusters) {
            $aksClusters += @{
                Name = $cluster.name
                ResourceGroup = $cluster.resourceGroup
            }
            Write-Host "  [FOUND] Cluster: $($cluster.name) in $($cluster.resourceGroup)" -ForegroundColor Green
        }
    }
}

if ($aksClusters.Count -eq 0) {
    Write-Host "[WARN] No AKS clusters found in specified resource groups" -ForegroundColor Yellow
    exit 0
}

Write-Host ""
Write-Host "[INFO] Found $($aksClusters.Count) AKS cluster(s)" -ForegroundColor Cyan
Write-Host ""

# Assign permissions to each cluster
$successCount = 0
$failCount = 0
$skippedCount = 0

foreach ($cluster in $aksClusters) {
    Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
    Write-Host "Cluster: $($cluster.Name)" -ForegroundColor Cyan
    Write-Host "Resource Group: $($cluster.ResourceGroup)" -ForegroundColor Gray
    Write-Host ""
    
    # Check if role already assigned
    Write-Host "[CHECK] Checking existing role assignments..." -ForegroundColor Cyan
    $roleId = "4abbcc35-e782-43d8-92c3-2fe7e4ba1ea7"  # Azure Kubernetes Service Cluster User Role
    $existingRoles = az role assignment list `
        --scope "/subscriptions/$SubscriptionId/resourceGroups/$($cluster.ResourceGroup)/providers/Microsoft.ContainerService/managedClusters/$($cluster.Name)" `
        --assignee $managedIdentityId `
        --query "[?roleDefinitionId=='/subscriptions/$SubscriptionId/providers/Microsoft.Authorization/roleDefinitions/$roleId']" `
        -o json 2>&1 | ConvertFrom-Json
    
    if ($existingRoles -and $existingRoles.Count -gt 0) {
        Write-Host "[SKIP] Role already assigned" -ForegroundColor Yellow
        $skippedCount++
        continue
    }
    
    # Assign role
    Write-Host "[ASSIGN] Assigning 'Azure Kubernetes Service Cluster User Role'..." -ForegroundColor Cyan
    
    if ($DryRun) {
        Write-Host "[DRY-RUN] Would assign role to cluster $($cluster.Name)" -ForegroundColor Cyan
        $successCount++
    } else {
        try {
            $result = az role assignment create `
                --role "Azure Kubernetes Service Cluster User Role" `
                --scope "/subscriptions/$SubscriptionId/resourceGroups/$($cluster.ResourceGroup)/providers/Microsoft.ContainerService/managedClusters/$($cluster.Name)" `
                --assignee $managedIdentityId `
                --output json 2>&1
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "[SUCCESS] Role assigned successfully" -ForegroundColor Green
                $successCount++
            } else {
                Write-Host "[ERROR] Failed to assign role: $result" -ForegroundColor Red
                $failCount++
            }
        } catch {
            Write-Host "[ERROR] Exception assigning role: $($_.Exception.Message)" -ForegroundColor Red
            $failCount++
        }
    }
    
    Write-Host ""
}

# Summary
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan
Write-Host "Total clusters: $($aksClusters.Count)" -ForegroundColor Gray
Write-Host "Successfully assigned: $successCount" -ForegroundColor Green
Write-Host "Already assigned (skipped): $skippedCount" -ForegroundColor Yellow
Write-Host "Failed: $failCount" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($DryRun) {
    Write-Host "[DRY-RUN] No changes were made. Remove -DryRun to apply changes." -ForegroundColor Cyan
} else {
    Write-Host "[SUCCESS] Permission setup complete!" -ForegroundColor Green
    Write-Host "[INFO] Wait 1-2 minutes for permissions to propagate, then test namespace discovery." -ForegroundColor Gray
}

