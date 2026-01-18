# Azure Portal Guide: Cosmos DB Throughput Management

## Where You Are Now

You're already in the correct location! The **"Account Throughput"** page under **"Settings"** is where you manage throughput.

## Current Status (From Your Screenshot)

Looking at your Azure Portal screenshot:
- **Location:** Settings → Account Throughput
- **Current Setup:** Each collection has **400 RU/s** (Manual)
- **Total Throughput:** 6,400 RU/s (16 collections × 400 RU/s)

## Understanding Your Current Configuration

### Option A: Collections Have Individual Throughput (Current Setup)
- Each collection: 400 RU/s
- Total: 6,400 RU/s
- **Cost:** ~$373/month (6,400 RU/s × $0.008/100 RU/s/hour × 730 hours)

### Option B: Shared Database Throughput (What We Want)
- Database-level: 400 RU/s shared across all collections
- **Cost:** ~$23/month (400 RU/s × $0.008/100 RU/s/hour × 730 hours)
- **Savings:** ~$350/month vs current setup!

## The Problem

You have **individual throughput per collection** (400 RU/s each), which costs much more than **shared database throughput** (400 RU/s total).

## Solution: Switch to Shared Database Throughput

### Step 1: Navigate to Database Settings

1. In Azure Portal, go to your Cosmos DB account: `bsg-demo-platform-mongodb`
2. In the left menu, under **"Data Explorer"** or **"Settings"**, look for:
   - **"Data Explorer"** → Click on your database `bsg_demo`
   - OR look for **"Scale"** or **"Throughput"** option

### Step 2: Change to Shared Throughput

**If you see individual collections:**
1. Look for a button or option that says **"Scale"** or **"Throughput"** at the **database level** (not collection level)
2. You should see an option to switch from **"Per collection"** to **"Shared (database)"**
3. Set shared throughput to **400 RU/s**
4. Click **"Save"**

**Alternative Path:**
1. Go to **"Data Explorer"** in left menu
2. Expand your database `bsg_demo`
3. Right-click on the database name (not a collection)
4. Select **"Scale"** or **"Throughput"**
5. Switch to **"Shared throughput"**
6. Set to **400 RU/s**
7. Click **"Save"**

## What This Will Do

- **Before:** 16 collections × 400 RU/s each = 6,400 RU/s total = ~$373/month
- **After:** 400 RU/s shared across all collections = ~$23/month
- **Savings:** ~$350/month (94% reduction!)

## If You Can't Find the Option

The interface may vary. Try these alternatives:

### Method 1: Via Data Explorer
1. Click **"Data Explorer"** in left menu
2. Click on database `bsg_demo` (the database, not a collection)
3. Look for **"Scale"** tab or button
4. Change from "Per collection" to "Shared"

### Method 2: Via Azure CLI
If the Portal doesn't show the option, use Azure CLI:

```bash
# First, check current throughput configuration
az cosmosdb mongodb database throughput show \
  --account-name bsg-demo-platform-mongodb \
  --resource-group bsg-demo-platform \
  --name bsg_demo

# If it shows "NotFound", collections have individual throughput
# We need to migrate to shared throughput

# Note: This may require removing individual throughputs first
# Check each collection's throughput
az cosmosdb mongodb collection throughput list \
  --account-name bsg-demo-platform-mongodb \
  --resource-group bsg-demo-platform \
  --database-name bsg_demo
```

### Method 3: Contact Azure Support
If you can't find the option, Azure Support can help migrate from per-collection to shared throughput.

## Verification

After making the change:
1. Go back to **"Account Throughput"** page
2. You should see: **"Shared throughput: 400 RU/s"** instead of individual collection throughputs
3. Total should show **400 RU/s** (not 6,400 RU/s)

## Expected Cost After Change

- **Before:** ~$373/month (6,400 RU/s)
- **After:** ~$23/month (400 RU/s shared)
- **Savings:** ~$350/month (94% reduction!)

## Testing

After making the change, run the test script:
```bash
python backend/scripts/test_after_serverless_migration.py
```

This will verify all database operations still work correctly.
