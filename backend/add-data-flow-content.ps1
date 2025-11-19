# Add Data Flow Architecture Content to MongoDB
# This script adds the animated Data Flow Architecture content entry

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Adding Data Flow Architecture Content" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Set Azure Cosmos DB MongoDB connection string
$env:DATABASE_URL = "mongodb://bsg-demo-platform-mongodb:wC418aLYO4SazuhljALVOclZc48spvoHidWukgFDOoBCjO5Z4wjjKPziuJ44TAUyVlOs89HeL4a5ACDbdAs80w==@bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@bsg-demo-platform-mongodb@"
$env:DATABASE_NAME = "bsg_demo"
$env:ENVIRONMENT = "development"
$env:DEBUG = "True"

Write-Host "Configuration:" -ForegroundColor Yellow
Write-Host "  Database: Azure Cosmos DB MongoDB" -ForegroundColor Gray
Write-Host "  Database Name: $env:DATABASE_NAME" -ForegroundColor Gray
Write-Host ""

# Run the script
py scripts\add_data_flow_content.py
