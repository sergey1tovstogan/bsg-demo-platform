# Azure Support Request: Migrate to Shared Database Throughput

## Request Summary

**Request:** Migrate Azure Cosmos DB MongoDB database from per-collection throughput to shared database throughput

**Account:** `bsg-demo-platform-mongodb`  
**Resource Group:** `bsg-demo-platform`  
**Database:** `bsg_demo`  
**Target:** 400 RU/s shared across all collections

## Current Situation

- **16 collections**, each with **400 RU/s** individually (minimum per collection)
- **Total:** 6,400 RU/s
- **Cost:** ~$373/month
- **Cannot reduce below 400 RU/s per collection** (Azure minimum)

## Desired Outcome

- **Shared database throughput:** 400 RU/s total
- **Cost:** ~$23/month
- **Savings:** ~$350/month (94% reduction!)

## Why This Is Needed

1. Current setup has 16 collections × 400 RU/s = 6,400 RU/s total
2. Azure minimum is 400 RU/s per collection (cannot reduce individual collections)
3. Database only contains 3.62 MB of data (very low usage)
4. Shared throughput would be sufficient and much cheaper

## Collections in Database

1. `_connection_test` (0 documents)
2. `auth_users` (6 documents)
3. `cache` (65 documents)
4. `components` (1 document)
5. `content` (6 documents)
6. `data_architecture` (1 document)
7. `deployment` (1 document)
8. `integration` (1 document)
9. `presentation_files.chunks` (3 documents)
10. `presentation_files.files` (0 documents)
11. `presentations` (0 documents)
12. `security_docs` (0 documents)
13. `security_items` (1 document)
14. `security_presentation` (1 document)
15. `settings` (1 document)
16. `videos` (0 documents)

## Steps to Submit Request

1. Go to Azure Portal → **Help + Support**
2. Click **"New support request"**
3. Fill in:
   - **Issue type:** Technical
   - **Service:** Azure Cosmos DB
   - **Problem type:** Database Configuration
   - **Problem subtype:** Throughput/Performance
   - **Summary:** "Migrate MongoDB database from per-collection to shared database throughput"
   - **Details:** Copy the content from this document
4. Submit the request

## Expected Timeline

- **Response:** Usually within 24-48 hours
- **Migration:** Can be done during business hours (no downtime expected)
- **Duration:** 15-30 minutes

## Verification After Migration

1. Check Azure Portal → **Account Throughput**
   - Should show "Shared throughput: 400 RU/s"
   - Collections should show "Shared" or "Inherited"

2. Run test script:
   ```powershell
   python backend/scripts/test_after_serverless_migration.py
   ```

3. Monitor costs in Azure Portal → Cost Management

## Alternative: Delete Unused Collections

If you don't need the unused collections, you can delete them to save costs immediately:

**Collections with 0 documents (safe to delete):**
- `_connection_test`
- `presentation_files.files`
- `presentations`
- `security_docs`
- `videos`

**Savings from deletion:** 5 collections × 400 RU/s = 2,000 RU/s = ~$117/month

**Note:** Only delete if you're certain these collections aren't needed!
