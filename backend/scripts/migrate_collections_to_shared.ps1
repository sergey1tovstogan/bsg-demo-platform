# Non-interactive script to migrate collections to shared throughput
# Run with: .\migrate_collections_to_shared.ps1 -ConfirmMigration

param(
    [switch]$ConfirmMigration
)

$accountName = "bsg-demo-platform-mongodb"
$resourceGroup = "bsg-demo-platform"
$databaseName = "bsg_demo"
$targetThroughput = 400

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Cosmos DB Shared Throughput Migration" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

if (-not $ConfirmMigration) {
    Write-Host "This script will migrate all collections to shared throughput." -ForegroundColor Yellow
    Write-Host "Run with -ConfirmMigration flag to proceed." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Example: .\migrate_collections_to_shared.ps1 -ConfirmMigration" -ForegroundColor White
    exit 1
}

Write-Host "Account: $accountName" -ForegroundColor Yellow
Write-Host "Database: $databaseName" -ForegroundColor Yellow
Write-Host "Target Throughput: $targetThroughput RU/s" -ForegroundColor Yellow
Write-Host ""

# Get all collections
Write-Host "Getting list of collections..." -ForegroundColor Green
$collectionsJson = az cosmosdb mongodb collection list `
    --account-name $accountName `
    --resource-group $resourceGroup `
    --database-name $databaseName `
    --output json

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Failed to list collections" -ForegroundColor Red
    exit 1
}

$collections = $collectionsJson | ConvertFrom-Json
Write-Host "Found $($collections.Count) collections" -ForegroundColor Yellow
Write-Host ""

# Migrate each collection
Write-Host "Migrating collections to database throughput..." -ForegroundColor Green
$successCount = 0
$failCount = 0

foreach ($collection in $collections) {
    $collectionName = $collection.name
    Write-Host "  Migrating: $collectionName" -ForegroundColor Gray -NoNewline
    
    $result = az cosmosdb mongodb collection throughput migrate `
        --account-name $accountName `
        --resource-group $resourceGroup `
        --database-name $databaseName `
        --name $collectionName `
        --throughput-type database `
        --output none 2>&1
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host " [OK]" -ForegroundColor Green
        $successCount++
    } else {
        Write-Host " [FAILED]" -ForegroundColor Red
        Write-Host "    Error: $result" -ForegroundColor Red
        $failCount++
    }
}

Write-Host ""
Write-Host "Migration Summary: $successCount succeeded, $failCount failed" -ForegroundColor $(if ($failCount -eq 0) { "Green" } else { "Yellow" })
Write-Host ""

# Set shared throughput
Write-Host "Setting shared database throughput to $targetThroughput RU/s..." -ForegroundColor Green

$result = az cosmosdb mongodb database throughput update `
    --account-name $accountName `
    --resource-group $resourceGroup `
    --name $databaseName `
    --throughput $targetThroughput `
    --output json 2>&1

if ($LASTEXITCODE -eq 0) {
    Write-Host "[SUCCESS] Shared throughput set to $targetThroughput RU/s" -ForegroundColor Green
} else {
    Write-Host "[ERROR] Failed to set shared throughput" -ForegroundColor Red
    Write-Host "Error: $result" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Migration Complete!" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Before: 16 collections × 400 RU/s = 6,400 RU/s (~`$373/month)" -ForegroundColor Yellow
Write-Host "After:  Shared 400 RU/s (~`$23/month)" -ForegroundColor Green
Write-Host "Savings: ~`$350/month (94% reduction!)" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "  1. Verify in Azure Portal → Account Throughput" -ForegroundColor White
Write-Host "  2. Run: python backend/scripts/test_after_serverless_migration.py" -ForegroundColor White
Write-Host "  3. Monitor costs in Azure Portal" -ForegroundColor White
Write-Host ""
