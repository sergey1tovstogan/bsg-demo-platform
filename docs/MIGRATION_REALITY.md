# Cosmos DB Migration Reality Check

## Important Finding

**Azure Cosmos DB does NOT allow changing an existing account from provisioned to serverless mode.**

This is a limitation of Azure Cosmos DB - you must choose serverless mode **when creating the account**, not after.

## Options Available

### Option 1: Reduce Provisioned RU/s to 400 (Recommended - Simple)

**Action:** Reduce current RU/s from ~2,305 to 400 (minimum)

**Savings:**
- Current: $134.67/month (2,305 RU/s)
- New: $23/month (400 RU/s)
- **Savings: $111/month (83% reduction)**

**Pros:**
- ✅ Simple - one command
- ✅ No data migration needed
- ✅ No downtime
- ✅ Can be done immediately
- ✅ Can increase if needed

**Cons:**
- ❌ Still paying for provisioned throughput (even if unused)
- ❌ Not as cheap as serverless (~$15/month)

**Command:**
```bash
# Set database-level throughput to 400 RU/s
az cosmosdb mongodb database throughput update \
  --account-name bsg-demo-platform-mongodb \
  --resource-group bsg-demo-platform \
  --database-name bsg_demo \
  --throughput 400
```

### Option 2: Create New Serverless Account (Complex)

**Action:** Create new serverless account and migrate all data

**Savings:**
- New cost: ~$15/month
- **Savings: $120/month (89% reduction)**

**Pros:**
- ✅ Maximum cost savings
- ✅ True serverless (pay per request)

**Cons:**
- ❌ Requires data migration
- ❌ Requires application code changes (connection string)
- ❌ More complex and risky
- ❌ Potential downtime during migration
- ❌ Need to test everything after migration

**Steps Required:**
1. Create new serverless Cosmos DB account
2. Export data from old account
3. Import data to new account
4. Update application connection strings
5. Test thoroughly
6. Delete old account

## Recommendation

**Go with Option 1 (Reduce to 400 RU/s)** because:
- Simple and safe
- Still saves $111/month (83% reduction)
- No risk or complexity
- Can be done immediately
- Can always create serverless account later if needed

## What We'll Do

We'll reduce the RU/s to 400, which will:
- Save $111/month immediately
- Require no code changes
- Have zero risk
- Take 1 minute to complete

If you want maximum savings ($120/month), we can plan a serverless account migration for later, but it requires more planning and testing.
