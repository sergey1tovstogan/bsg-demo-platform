# Azure Cosmos DB Cost Optimization Guide

## Current Situation

**Azure Portal Shows:** $134.67/month for Azure Cosmos DB  
**Actual Data:** 3.62 MB  
**Problem:** Paying for provisioned throughput (RU/s) that far exceeds actual needs

## Understanding Cosmos DB Costs

Azure Cosmos DB charges for two main things:

### 1. Storage ($0.25/GB/month)
- **Your current storage:** ~3.62 MB = **$0.00/month**
- This is NOT the problem

### 2. Provisioned Throughput (RU/s) - **THIS IS THE PROBLEM**
- **Cost:** ~$0.008 per 100 RU/s per hour
- **You pay 24/7** for whatever RU/s you provision, even if unused
- **Your estimated provisioned RU/s:** ~2,000-2,500 RU/s (based on $134.67/month)

### Cost Calculation
```
Monthly cost = (RU/s / 100) × $0.008 × 730 hours/month

$134.67/month = (RU/s / 100) × $0.008 × 730
RU/s = ($134.67 / ($0.008 × 730)) × 100
RU/s ≈ 2,300 RU/s
```

**You're paying for ~2,300 RU/s, but likely only need 400-800 RU/s**

---

## Why This Happens

When you create an Azure Cosmos DB account, Azure defaults to a certain RU/s tier. Common defaults:
- **400 RU/s** = ~$23/month
- **1,000 RU/s** = ~$58/month  
- **4,000 RU/s** = ~$234/month

You likely provisioned 2,000-2,500 RU/s (or higher) during setup, which is excessive for:
- 3.62 MB of data
- Low to moderate traffic
- Simple queries

---

## Solutions to Reduce Costs

### Option 1: Reduce Provisioned RU/s (Recommended)

**Target:** 400-800 RU/s (saves ~$100-120/month)

**Steps:**
1. Go to Azure Portal → Your Cosmos DB account
2. Navigate to **"Scale & Settings"** or **"Throughput"**
3. Change from current RU/s to **400 RU/s** (minimum)
4. Monitor for a few days
5. If you see throttling (429 errors), increase to 800 RU/s

**Expected Savings:**
- Current: $134.67/month (2,300 RU/s)
- At 400 RU/s: ~$23/month
- **Savings: ~$111/month** (83% reduction)

**Risk:** Low - you can always increase if needed

---

### Option 2: Use Autoscale (Better for Variable Traffic)

**How it works:**
- Scales between 400-4,000 RU/s automatically
- Only pays for what you use
- Good for variable workloads

**Cost:**
- Minimum: 400 RU/s = ~$23/month
- Maximum: Based on peak usage
- **Typical savings:** 30-50% vs fixed provisioned

**Steps:**
1. Azure Portal → Cosmos DB → Scale & Settings
2. Enable **"Autoscale"**
3. Set max RU/s (e.g., 4,000 RU/s)
4. System auto-scales between 400-4,000 based on demand

---

### Option 3: Serverless Mode (Best for Low Traffic)

**When to use:**
- Low, unpredictable traffic
- Development/test environments
- Cost optimization priority

**Cost:**
- Pay per request: $0.25 per million RU consumed
- No minimum charge
- **For 3.62 MB and low traffic: ~$5-15/month**

**Limitations:**
- Max 5,000 RU/s per container
- Not available in all regions
- May have latency spikes on cold starts

**Steps:**
1. Azure Portal → Cosmos DB → Scale & Settings
2. Switch to **"Serverless"** mode
3. Monitor costs

**Expected Cost:** ~$5-15/month (vs $134.67/month)
**Savings: ~$120-130/month** (90%+ reduction)

---

## Recommended Action Plan

### Immediate (This Week)
1. ✅ **Check current RU/s provisioned**
   - Azure Portal → Cosmos DB → Scale & Settings
   - Note the current RU/s value

2. ✅ **Reduce to 400 RU/s** (minimum)
   - Monitor for 2-3 days
   - Check application logs for throttling errors (429)

3. ✅ **Monitor costs**
   - Azure Portal → Cost Management
   - Verify cost reduction

### Short-term (This Month)
1. **If 400 RU/s works:** Keep it, save ~$111/month
2. **If you see throttling:** Increase to 800 RU/s, still save ~$80/month
3. **Consider Autoscale:** If traffic varies significantly

### Long-term (Next Quarter)
1. **Evaluate Serverless:** If traffic remains low
2. **Optimize queries:** Reduce RU consumption per operation
3. **Review connection pooling:** Already optimized (20 max connections)

---

## How to Check Current RU/s

### Via Azure Portal
1. Navigate to your Cosmos DB account
2. Go to **"Scale & Settings"** or **"Throughput"**
3. Look for **"Manual"** or **"Autoscale"** section
4. Note the RU/s value

### Via Azure CLI
```bash
az cosmosdb sql container throughput show \
  --account-name bsg-demo-platform-mongodb \
  --database-name bsg_demo \
  --name <collection-name> \
  --resource-group bsg-demo-platform
```

### Via Azure PowerShell
```powershell
Get-AzCosmosDBSqlContainerThroughput `
  -AccountName bsg-demo-platform-mongodb `
  -DatabaseName bsg_demo `
  -Name <collection-name> `
  -ResourceGroupName bsg-demo-platform
```

---

## Connection Pool Optimization (Already Done)

✅ **Reduced max connections:** 50 → 20  
✅ **Reduced min connections:** 10 → 5

**Impact:** Reduces idle RU consumption, but the main cost is the base provisioned RU/s tier.

---

## Expected Cost Breakdown After Optimization

### Scenario 1: Reduce to 400 RU/s (Manual)
- **Throughput:** $23/month
- **Storage:** $0.00/month (3.62 MB)
- **Total:** ~$23/month
- **Savings:** $111/month (83%)

### Scenario 2: Use Autoscale (400-4,000 RU/s)
- **Throughput:** $23-58/month (depending on usage)
- **Storage:** $0.00/month
- **Total:** ~$23-58/month
- **Savings:** $76-111/month (57-83%)

### Scenario 3: Serverless Mode
- **Throughput:** $5-15/month (pay per request)
- **Storage:** $0.00/month
- **Total:** ~$5-15/month
- **Savings:** $120-130/month (90%+)

---

## Monitoring After Changes

### Key Metrics to Watch
1. **Throttled Requests (429 errors)**
   - If you see these, increase RU/s
   - Check application logs

2. **Request Units Consumed**
   - Azure Portal → Metrics
   - Monitor RU consumption vs provisioned

3. **Cost Trends**
   - Azure Portal → Cost Management
   - Verify cost reduction

---

## Additional Optimizations

### 1. Query Optimization
- Use indexes efficiently
- Avoid full collection scans
- Limit result sets

### 2. Connection Management
- ✅ Already optimized (20 max connections)
- Use connection pooling (already implemented)

### 3. Caching Strategy
- ✅ Already using MongoDB cache with TTL
- Consider Redis for frequently accessed data

### 4. Data Archival
- Move old data to cheaper storage (Azure Blob Storage)
- Keep only active data in Cosmos DB

---

## Summary

**Current Cost:** $134.67/month  
**Actual Need:** ~$5-23/month  
**Potential Savings:** $111-130/month (83-97%)

**Action Required:**
1. Check current RU/s in Azure Portal
2. Reduce to 400 RU/s (or enable Serverless)
3. Monitor for throttling
4. Adjust as needed

**The connection pool optimization we did saves ~$8/month, but reducing RU/s saves $100+/month!**
