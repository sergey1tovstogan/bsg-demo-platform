# Azure CLI Steps to Migrate to Shared Throughput

Since the Azure Portal doesn't show the "Scale" option for the database, we'll use Azure CLI to migrate from per-collection to shared throughput.

## Current Situation
- **16 collections**, each with **400 RU/s** individually
- **Total:** 6,400 RU/s = **~$373/month**

## Goal
- **Shared database throughput:** 400 RU/s total
- **Cost:** **~$23/month**
- **Savings:** **~$350/month (94% reduction!)**

## Migration Steps

### Step 1: Check Current Collections

```powershell
az cosmosdb mongodb collection list `
  --account-name bsg-demo-platform-mongodb `
  --resource-group bsg-demo-platform `
  --database-name bsg_demo `
  --output table
```

This will list all 16 collections.

### Step 2: Migrate Each Collection to Database Throughput

**Run this command for EACH collection** (replace `COLLECTION_NAME` with actual collection name):

```powershell
az cosmosdb mongodb collection throughput migrate `
  --account-name bsg-demo-platform-mongodb `
  --resource-group bsg-demo-platform `
  --database-name bsg_demo `
  --name COLLECTION_NAME `
  --throughput-type database
```

**Collections to migrate:**
- cache
- components
- content
- data_architecture
- deployment
- integration
- presentation_files.chunks
- presentation_files.files
- presentations
- security_docs
- security_items
- security_presentation
- settings
- videos
- auth_users
- _connection_test

### Step 3: Set Shared Database Throughput

After migrating all collections, set the shared throughput:

```powershell
az cosmosdb mongodb database throughput update `
  --account-name bsg-demo-platform-mongodb `
  --resource-group bsg-demo-platform `
  --name bsg_demo `
  --throughput 400
```

### Step 4: Verify

Check that shared throughput is set:

```powershell
az cosmosdb mongodb database throughput show `
  --account-name bsg-demo-platform-mongodb `
  --resource-group bsg-demo-platform `
  --name bsg_demo `
  --output json
```

Should show: `"throughput": 400`

## Automated Script

I've created a PowerShell script that does all of this automatically:

```powershell
cd backend
.\scripts\migrate_to_shared_throughput.ps1
```

This script will:
1. Check current configuration
2. Migrate all 16 collections automatically
3. Set shared throughput to 400 RU/s
4. Verify the migration

## After Migration

1. **Check Azure Portal:**
   - Go to "Account Throughput" page
   - Should show "Shared throughput: 400 RU/s"
   - Collections should show "Shared" or "Inherited"

2. **Run Tests:**
   ```powershell
   python backend/scripts/test_after_serverless_migration.py
   ```

3. **Monitor Costs:**
   - Check Azure Portal → Cost Management
   - Should see cost drop from ~$373/month to ~$23/month

## Expected Results

- **Before:** 6,400 RU/s = ~$373/month
- **After:** 400 RU/s = ~$23/month
- **Savings:** ~$350/month (94% reduction!)

## Troubleshooting

If you get errors:
- Make sure you're logged into Azure CLI: `az login`
- Check you have permissions: `az account show`
- Try migrating collections one at a time if batch fails
