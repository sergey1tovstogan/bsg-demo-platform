# Final Solution: Cosmos DB Cost Optimization

## The Challenge

Azure Cosmos DB MongoDB API **does not easily support** migrating from per-collection throughput to shared database throughput via CLI or Portal when collections already have individual throughput configured.

## Current Situation

- **16 collections**, each with **400 RU/s** (minimum)
- **Total:** 6,400 RU/s
- **Cost:** ~$373/month

## Solution Options

### Option 1: Reduce Individual Collection Throughputs (Simplest)

**For collections with 0 or very few documents, reduce to minimum:**

Collections likely safe to reduce (based on our analysis):
- `_connection_test` (0 documents) - Can remove throughput
- `presentations` (0 documents) - Can remove throughput  
- `security_docs` (0 documents) - Can remove throughput
- `videos` (0 documents) - Can remove throughput
- `presentation_files.files` (0 documents) - Can remove throughput

**Action:** Remove throughput from unused collections (they'll inherit from database if shared is set later, or use minimal default)

**Savings:** Removing 5 collections × 400 RU/s = 2,000 RU/s = ~$117/month savings

### Option 2: Contact Azure Support (Recommended for Full Migration)

Azure Support can help migrate from per-collection to shared throughput. This is a standard operation they can perform safely.

**Steps:**
1. Open Azure Support ticket
2. Request migration from per-collection to shared database throughput
3. Specify: Database `bsg_demo`, target 400 RU/s shared
4. They'll handle the migration

**Savings:** ~$350/month (full migration to shared)

### Option 3: Keep Current Setup (If Traffic is Actually High)

If you're actually using all 6,400 RU/s, then the current setup might be appropriate. But with only 3.62 MB of data, this seems unlikely.

## Recommended Approach

**Immediate (Today):**
1. Remove throughput from clearly unused collections (0 documents)
2. This saves ~$117/month immediately

**Short-term (This Week):**
1. Contact Azure Support to migrate remaining collections to shared throughput
2. This will save additional ~$233/month

**Total Potential Savings:** ~$350/month (94% reduction)

## Manual Steps to Remove Throughput from Unused Collections

In Azure Portal:
1. Go to **"Account Throughput"** page
2. For each unused collection (0 documents):
   - Click on the collection
   - Change throughput from "Manual 400" to "None" or remove throughput
   - Save

**Collections to target:**
- `_connection_test`
- `presentations`
- `security_docs`
- `videos`
- `presentation_files.files`

## After Changes

1. **Verify:** Check "Account Throughput" page - should show lower total
2. **Test:** Run `python backend/scripts/test_after_serverless_migration.py`
3. **Monitor:** Check costs in Azure Portal

## Email Template Updated

The email template in `docs/TEAM_EMAIL_RU_REDUCTION.md` can be updated to reflect:
- Removed throughput from 5 unused collections
- Contacted Azure Support for full migration to shared throughput
- Expected total savings: ~$350/month
