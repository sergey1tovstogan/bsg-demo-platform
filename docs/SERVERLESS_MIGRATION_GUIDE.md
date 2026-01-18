# Serverless Mode Migration Guide

## Quick Decision Matrix

| Factor | Your Situation | Serverless Impact |
|--------|---------------|-------------------|
| **Traffic Level** | Low (3.62 MB) | ✅ Perfect fit |
| **Peak RU/s Needs** | Unknown, but likely < 5,000 | ✅ Should be fine |
| **Multi-Region** | Single region (US East) | ✅ No issue |
| **Cost Priority** | High (want to save $120/month) | ✅ Major benefit |
| **Cold Start Tolerance** | Acceptable (100-500ms delay) | ✅ Fine |
| **Bulk Operations** | None mentioned | ✅ No concern |

**Verdict:** ✅ **Serverless is recommended for your use case**

---

## Migration Steps

### Step 1: Verify Serverless Availability

**Check if US East region supports serverless:**
- Serverless is generally available in most regions including US East
- If unsure, check Azure Portal or contact support

### Step 2: Backup Current Settings

**Document current configuration:**
- Current RU/s: ~2,305
- Current cost: $134.67/month
- Note any custom settings or features in use

### Step 3: Switch to Serverless Mode

**Via Azure Portal (Recommended):**
1. Go to https://portal.azure.com
2. Navigate to: **Cosmos DB accounts** → `bsg-demo-platform-mongodb`
3. Click **"Scale & Settings"** or **"Features"**
4. Find **"Capacity mode"** or **"Throughput"** section
5. Select **"Serverless"**
6. Click **"Save"**
7. Wait for the change to apply (usually 1-2 minutes)

**Via Azure CLI:**
```bash
az cosmosdb update \
  --name bsg-demo-platform-mongodb \
  --resource-group bsg-demo-platform \
  --capabilities EnableServerless
```

**Via Azure PowerShell:**
```powershell
Update-AzCosmosDBAccount `
  -Name bsg-demo-platform-mongodb `
  -ResourceGroupName bsg-demo-platform `
  -EnableServerless
```

### Step 4: Verify the Change

**Check that serverless is enabled:**
- Azure Portal → Cosmos DB → Scale & Settings
- Should show "Serverless" mode
- RU/s should show "N/A" or "Pay per request"

### Step 5: Test Your Application

**Verify everything still works:**
1. Test basic read operations
2. Test write operations
3. Check for any errors in application logs
4. Monitor latency (watch for cold starts)

---

## Monitoring Setup

### 1. Cost Alerts (Critical!)

**Set up cost alerts to avoid surprises:**

**Via Azure Portal:**
1. Go to **Cost Management + Billing**
2. Click **"Budgets"**
3. Create new budget:
   - **Amount:** $30/month (2x estimated)
   - **Alert thresholds:** 50%, 75%, 100%
   - **Alert emails:** Your email

**Via Azure CLI:**
```bash
az consumption budget create \
  --budget-name cosmos-serverless-budget \
  --amount 30 \
  --time-grain Monthly \
  --start-date $(date +%Y-%m-01) \
  --end-date $(date -d "+1 year" +%Y-%m-01) \
  --resource-group bsg-demo-platform \
  --category Cost \
  --notifications amount=15 threshold=50 operator=GreaterThan \
  --notifications amount=22.5 threshold=75 operator=GreaterThan \
  --notifications amount=30 threshold=100 operator=GreaterThan
```

### 2. Performance Monitoring

**Monitor these metrics:**
- **Request Units consumed** (should be low)
- **Request latency** (watch for cold starts)
- **Throttled requests** (429 errors - shouldn't happen)
- **Request count** (track usage patterns)

**Via Azure Portal:**
- Cosmos DB → Metrics → Request Units
- Cosmos DB → Metrics → Server Latency

### 3. Application Logging

**Add logging to detect cold starts:**
```python
import time
start_time = time.time()
# ... database operation ...
duration = time.time() - start_time
if duration > 0.5:  # More than 500ms
    logger.warning(f"Slow database operation: {duration:.3f}s (possible cold start)")
```

---

## Expected Results

### Week 1 (Immediate)
- **Cost:** Should drop to ~$0.50-2/day (vs $4.43/day before)
- **Performance:** May see occasional cold starts (100-500ms)
- **Functionality:** Everything should work normally

### Month 1 (After Full Month)
- **Cost:** ~$10-20/month (vs $134.67/month)
- **Savings:** ~$115-125/month
- **Performance:** Cold starts should be rare if app is used regularly

### Long-term
- **Cost:** Stable at ~$10-20/month (depends on usage)
- **Performance:** Consistent (cold starts only after long idle periods)

---

## Troubleshooting

### Issue: High Latency on First Request

**Symptom:** First request after idle period takes 500ms+

**Solution:**
- This is expected (cold start)
- Add keep-alive requests every 5-10 minutes
- Or schedule a health check cron job

**Keep-alive example:**
```python
# Run every 5 minutes
async def keep_alive():
    db = await get_database()
    await db.command("ping")  # Simple ping to keep connection alive
```

### Issue: Throttling (429 Errors)

**Symptom:** Requests return 429 "Too Many Requests"

**Solution:**
- You're exceeding 5,000 RU/s limit
- This is unlikely with your traffic, but if it happens:
  - Optimize queries (reduce RU consumption)
  - Add retry logic with exponential backoff
  - Consider switching to provisioned mode (400 RU/s minimum)

### Issue: Costs Higher Than Expected

**Symptom:** Monthly cost > $30

**Solution:**
- Check which operations consume most RUs
- Optimize expensive queries
- Consider caching frequently accessed data
- Review if bulk operations are happening

**Find expensive operations:**
```python
# Enable diagnostic logging
# Check Azure Portal → Cosmos DB → Diagnostic Settings
# Enable "DataPlaneRequests" logs
```

---

## Rollback Plan

**If serverless doesn't work for you:**

### Option 1: Switch to Provisioned (400 RU/s)
1. Azure Portal → Cosmos DB → Scale & Settings
2. Switch from "Serverless" to "Manual"
3. Set RU/s to 400
4. Cost: ~$23/month (still saves $111/month)

### Option 2: Use Autoscale (400-4,000 RU/s)
1. Azure Portal → Cosmos DB → Scale & Settings
2. Switch from "Serverless" to "Autoscale"
3. Set max RU/s to 4,000
4. Cost: ~$23-58/month (depends on usage)

**Note:** Once you switch from serverless to provisioned, you **cannot switch back** to serverless on the same account. You'd need to create a new account.

---

## Checklist

Before switching:
- [ ] Verified serverless is available in US East region
- [ ] Documented current RU/s and cost
- [ ] Set up cost alerts ($30/month threshold)
- [ ] Informed team about potential cold starts
- [ ] Prepared rollback plan

After switching:
- [ ] Verified serverless mode is enabled
- [ ] Tested application functionality
- [ ] Monitored costs for first week
- [ ] Monitored performance/latency
- [ ] Checked for throttling errors

After 1 month:
- [ ] Reviewed actual costs vs estimates
- [ ] Assessed performance impact
- [ ] Decided if serverless is right long-term

---

## Summary

**Serverless Mode Cons:**
1. Max 5,000 RU/s limit (should be fine)
2. Cold start latency (100-500ms, acceptable)
3. Single region only (you don't need multi-region)
4. Cost unpredictability (but still much cheaper)
5. Cannot switch back to serverless after going provisioned

**For Your Use Case:**
- ✅ **Recommended** - Serverless is ideal
- Expected savings: **~$120/month (89% reduction)**
- Risk: **Low** (can switch to 400 RU/s provisioned if needed)
- Performance impact: **Minimal** (cold starts acceptable)

**Action:** Switch to serverless and monitor for 1 week!
