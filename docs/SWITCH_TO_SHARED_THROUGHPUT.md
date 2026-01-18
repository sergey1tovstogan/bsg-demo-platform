# How to Switch from Per-Collection to Shared Database Throughput

## Current Situation

- **16 collections**, each with **400 RU/s** individually
- **Total:** 6,400 RU/s
- **Cost:** ~$373/month

## Goal

- **Shared database throughput:** 400 RU/s total
- **Cost:** ~$23/month
- **Savings:** ~$350/month (94% reduction!)

## Important Note

**Switching from per-collection to shared throughput requires removing individual throughputs first.** This can be done via Azure Portal or Azure CLI.

## Method 1: Via Azure Portal (Recommended)

### Step 1: Navigate to Database

1. Go to Azure Portal → Your Cosmos DB account `bsg-demo-platform-mongodb`
2. Click **"Data Explorer"** in the left menu
3. Expand your database `bsg_demo`
4. **Right-click on the database name** (not on a collection)
5. Select **"Scale"** or **"Scale & Settings"**

### Step 2: Switch to Shared Throughput

1. You should see throughput options:
   - **"Manual"** or **"Autoscale"**
   - Option to switch between **"Per collection"** and **"Shared (database)"**
2. Select **"Shared (database)"** or **"Database throughput"**
3. Set throughput to **400 RU/s**
4. Click **"Save"**

**Note:** Azure may warn you that this will remove individual collection throughputs. This is expected and safe.

### Step 3: Verify

1. Go back to **"Account Throughput"** page
2. You should see: **"Shared throughput: 400 RU/s"**
3. Collections should show **"Shared"** instead of individual RU/s values

## Method 2: Via Azure CLI (If Portal Doesn't Work)

### Step 1: Check Current Setup

```bash
# List all collections and their throughput
az cosmosdb mongodb collection throughput list \
  --account-name bsg-demo-platform-mongodb \
  --resource-group bsg-demo-platform \
  --database-name bsg_demo \
  --output table
```

### Step 2: Remove Individual Throughputs

**WARNING:** This will temporarily remove throughput from collections. Have shared throughput ready to set immediately.

```bash
# For each collection, remove individual throughput
# This switches them to "inherit from database"
# You'll need to do this for all 16 collections

# Example for one collection (repeat for all):
az cosmosdb mongodb collection throughput migrate \
  --account-name bsg-demo-platform-mongodb \
  --resource-group bsg-demo-platform \
  --database-name bsg_demo \
  --name cache \
  --throughput-type none
```

### Step 3: Set Shared Database Throughput

```bash
# Set shared throughput at database level
az cosmosdb mongodb database throughput update \
  --account-name bsg-demo-platform-mongodb \
  --resource-group bsg-demo-platform \
  --name bsg_demo \
  --throughput 400
```

## Method 3: Contact Azure Support

If the above methods don't work, Azure Support can help migrate from per-collection to shared throughput. This is a common operation and they can do it safely.

## Verification After Change

1. **Check Account Throughput page:**
   - Should show "Shared throughput: 400 RU/s"
   - Collections should show "Shared" or "Inherited"

2. **Run test script:**
   ```bash
   python backend/scripts/test_after_serverless_migration.py
   ```

3. **Monitor costs:**
   - Check Azure Portal → Cost Management
   - Should see cost drop from ~$373/month to ~$23/month

## Expected Timeline

- **Change time:** 1-2 minutes
- **Cost impact:** Immediate (next billing cycle)
- **Downtime:** None (change is seamless)

## Rollback Plan

If you need to go back to per-collection throughput:
1. Go to Data Explorer → Database → Scale
2. Switch back to "Per collection"
3. Set individual throughputs as needed

## Questions?

If you're unsure or encounter issues, Azure Support can help with this migration. It's a standard operation and they can guide you through it safely.
