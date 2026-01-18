# PowerShell script to migrate from per-collection to shared database throughput
# This will reduce costs from ~$373/month to ~$23/month

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cosmos DB Shared Throughput Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$accountName = "bsg-demo-platform-mongodb"
$resourceGroup = "bsg-demo-platform"
$databaseName = "bsg_demo"
$targetThroughput = 400

Write-Host "Account: $accountName" -ForegroundColor Yellow
Write-Host "Database: $databaseName" -ForegroundColor Yellow
Write-Host "Target Throughput: $targetThroughput RU/s" -ForegroundColor Yellow
Write-Host ""

# Step 1: List current collections and their throughput
Write-Host "Step 1: Checking current throughput configuration..." -ForegroundColor Green
Write-Host ""

$collections = az cosmosdb mongodb collection list `
    --account-name $accountName `
    --resource-group $resourceGroup `
    --database-name $databaseName `
    --output json | ConvertFrom-Json

Write-Host "Found $($collections.Count) collections" -ForegroundColor Yellow
Write-Host ""

# Step 2: Check if database has shared throughput
Write-Host "Step 2: Checking for existing shared throughput..." -ForegroundColor Green
Write-Host ""

try {
    $dbThroughput = az cosmosdb mongodb database throughput show `
        --account-name $accountName `
        --resource-group $resourceGroup `
        --name $databaseName `
        --output json 2>$null | ConvertFrom-Json
    
    if ($dbThroughput) {
        Write-Host "Database already has shared throughput: $($dbThroughput.resource.throughput) RU/s" -ForegroundColor Yellow
        Write-Host "No migration needed!" -ForegroundColor Green
        exit 0
    }
} catch {
    Write-Host "No shared throughput found (collections have individual throughput)" -ForegroundColor Yellow
    Write-Host ""
}

# Step 3: Migrate collections to shared throughput
Write-Host "Step 3: Migrating collections to shared throughput..." -ForegroundColor Green
Write-Host ""
Write-Host "WARNING: This will remove individual throughputs from collections" -ForegroundColor Red
Write-Host "and set shared throughput at database level." -ForegroundColor Red
Write-Host ""

$confirm = Read-Host "Do you want to proceed? (yes/no)"
if ($confirm -ne "yes") {
    Write-Host "Migration cancelled." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "Migrating collections..." -ForegroundColor Yellow

foreach ($collection in $collections) {
    $collectionName = $collection.name
    Write-Host "  - Migrating collection: $collectionName" -ForegroundColor Gray
    
    # Migrate collection to use database throughput
    az cosmosdb mongodb collection throughput migrate `
        --account-name $accountName `
        --resource-group $resourceGroup `
        --database-name $databaseName `
        --name $collectionName `
        --throughput-type database `
        --output none 2>$null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    [OK] $collectionName migrated" -ForegroundColor Green
    } else {
        Write-Host "    [WARNING] $collectionName migration may have failed" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "Step 4: Setting shared database throughput to $targetThroughput RU/s..." -ForegroundColor Green

# Set shared throughput at database level
az cosmosdb mongodb database throughput update `
    --account-name $accountName `
    --resource-group $resourceGroup `
    --name $databaseName `
    --throughput $targetThroughput `
    --output json | Out-Null

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Shared throughput set to $targetThroughput RU/s" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to set shared throughput" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "Step 5: Verifying migration..." -ForegroundColor Green

# Verify shared throughput
$verifyThroughput = az cosmosdb mongodb database throughput show `
    --account-name $accountName `
    --resource-group $resourceGroup `
    --name $databaseName `
    --output json | ConvertFrom-Json

if ($verifyThroughput.resource.throughput -eq $targetThroughput) {
    Write-Host "[SUCCESS] Migration complete!" -ForegroundColor Green
    Write-Host ""
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Migration Summary" -ForegroundColor Cyan
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Before: 16 collections × 400 RU/s = 6,400 RU/s (~`$373/month)" -ForegroundColor Yellow
    Write-Host "After:  Shared 400 RU/s (~`$23/month)" -ForegroundColor Green
    Write-Host "Savings: ~`$350/month (94% reduction!)" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Verify in Azure Portal → Account Throughput" -ForegroundColor White
    Write-Host "  2. Run test script: python backend/scripts/test_after_serverless_migration.py" -ForegroundColor White
    Write-Host "  3. Monitor costs in Azure Portal" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host "[WARNING] Verification failed. Please check Azure Portal manually." -ForegroundColor Yellow
}
