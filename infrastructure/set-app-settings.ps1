# PowerShell script to set Azure App Service environment variables
# This handles the connection string with special characters properly

$appName = "bsg-demo-platform-app"
$resourceGroup = "bsg-demo-platform"

# MongoDB connection string (properly escaped with backticks for & characters)
$databaseUrl = "mongodb://bsg-demo-platform-mongodb:wC418aLYO4SazuhljALVOclZc48spvoHidWukgFDOoBCjO5Z4wjjKPziuJ44TAUyVlOs89HeL4a5ACDbdAs80w==@bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255/?ssl=true`&replicaSet=globaldb`&retrywrites=false`&maxIdleTimeMS=120000`&appName=@bsg-demo-platform-mongodb@"

# Set all app settings using a JSON approach to avoid shell escaping issues
$settingsJson = @{
    DATABASE_URL = $databaseUrl
    DATABASE_NAME = "bsg_demo"
    ENVIRONMENT = "production"
    DEBUG = "False"
    SCM_DO_BUILD_DURING_DEPLOYMENT = "false"
    ENABLE_ORYX_BUILD = "false"
} | ConvertTo-Json -Compress

# Convert to az cli format
$settingsArray = @()
foreach ($key in $settingsJson.PSObject.Properties.Name) {
    $value = $settingsJson.$key
    $settingsArray += "$key=$value"
}

# Set all app settings
az webapp config appsettings set `
    --name $appName `
    --resource-group $resourceGroup `
    --settings $settingsArray `
    --output none

Write-Host "App settings configured successfully"

