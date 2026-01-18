# MongoDB Cost Optimization Guide

## Current Database Usage

The platform uses **Azure Cosmos DB MongoDB API** as the primary database. This document outlines current usage patterns and cost optimization strategies.

## Collections Overview

### Primary Collections

1. **`cache`** - Largest collection
   - Stores: RAG responses, component info, Azure resources, AKS namespaces
   - TTL: Varies by type (see below)
   - **Cost Impact**: HIGH (stores large JSON responses)

2. **`settings`** - Small collection
   - Stores: RAG JWT token, EventHub configuration
   - Size: < 1 MB typically
   - **Cost Impact**: LOW

3. **`deployment`** - Small collection
   - Stores: User-specific JWT tokens, deployment analysis results
   - Size: < 1 MB typically
   - **Cost Impact**: LOW

4. **`security`** - Medium collection
   - Stores: Security presentations, documents, items
   - Size: Varies (depends on uploaded content)
   - **Cost Impact**: MEDIUM

5. **`components`**, **`users`**, **`content`** - Small collections
   - **Cost Impact**: LOW

## Cache TTL Settings (Optimized)

| Cache Type | Previous TTL | New TTL | Savings |
|------------|--------------|---------|---------|
| RAG Responses | 7 days | **3 days** | ~57% |
| Component Info | 7 days | **3 days** | ~57% |
| Azure Resources | 1 hour | 1 hour | - |
| AKS Namespaces | 2 hours | 2 hours | - |
| Resource Groups | 1 hour | 1 hour | - |

## Cost Optimization Strategies

### 1. ✅ Immediate Actions (Already Implemented)

- **Reduced Cache TTLs**: RAG and component cache reduced from 7 to 3 days
- **Connection Pool Optimization**: Reduced from 50/10 to 20/5 (min/max)
- **Automatic Expiration**: Cache entries automatically expire and are cleaned up

### 2. 🔧 Recommended Actions

#### A. Run Cleanup Scripts

**Clean expired cache entries:**
```bash
# Via API endpoint
curl -X POST http://your-api/api/v1/cache/clear-expired

# Or via script
python backend/scripts/cleanup_mongodb.py
```

**Analyze database usage:**
```bash
python backend/scripts/analyze_mongodb_usage.py
```

#### B. Implement Scheduled Cleanup

Add a cron job or Azure Function to run cleanup daily:
```bash
# Daily at 2 AM UTC
0 2 * * * python /path/to/backend/scripts/cleanup_mongodb.py
```

#### C. Monitor Cache Growth

- Run `analyze_mongodb_usage.py` weekly to track growth
- Set up alerts if cache size exceeds thresholds (e.g., 500 MB)

### 3. 💡 Additional Optimization Options

#### Option A: Further Reduce Cache TTLs
- **RAG Cache**: 3 days → 1 day (saves additional ~67%)
- **Component Info**: 3 days → 1 day (saves additional ~67%)
- **Trade-off**: More frequent RAG API calls (costs more API calls, but saves DB storage)

#### Option B: Implement Cache Size Limits
- Set maximum cache size (e.g., 100 MB)
- Use LRU eviction when limit reached
- Prevents unbounded growth

#### Option C: Use In-Memory Cache More Aggressively
- Already implemented, but can be enhanced
- Store frequently accessed data in memory
- Reduces MongoDB read operations

#### Option D: Archive Old Data
- Move old deployment analysis results to cold storage
- Keep only last 30 days in MongoDB
- Archive older data to Azure Blob Storage (cheaper)

#### Option E: Optimize Azure Cosmos DB Tier
- Review current RU/s (Request Units per second)
- Consider autoscale for variable workloads
- Use serverless tier if usage is sporadic

## Connection Pool Settings

**Current (Optimized):**
- Min: 5 connections
- Max: 20 connections
- Timeout: 30 seconds

**Previous:**
- Min: 10 connections
- Max: 50 connections

**Savings**: Reduced idle connection costs

## Monitoring & Analysis

### Run Analysis Script

```bash
python backend/scripts/analyze_mongodb_usage.py
```

This script provides:
- Collection sizes and document counts
- Expired cache entry counts
- Cache breakdown by type
- Cost optimization recommendations
- Estimated savings

### Key Metrics to Monitor

1. **Cache Collection Size**: Should stay under 500 MB
2. **Expired Entries**: Should be cleaned regularly
3. **Total Database Size**: Track growth over time
4. **RU/s Consumption**: Monitor Azure Cosmos DB usage

## Estimated Cost Savings

Based on current optimizations:

1. **Cache TTL Reduction (7→3 days)**: ~57% reduction in cache storage
2. **Connection Pool Reduction**: Lower idle connection costs
3. **Automatic Cleanup**: Prevents accumulation of expired data

**Example Calculation:**
- If cache was 200 MB with 7-day TTL
- With 3-day TTL: ~86 MB (saves ~114 MB)
- At Azure Cosmos DB pricing: ~$0.25/GB/month
- **Monthly savings: ~$0.03 per GB saved**

## Maintenance Schedule

### Daily
- Automatic expiration cleanup (via TTL indexes)

### Weekly
- Run `analyze_mongodb_usage.py` to monitor growth
- Review cache statistics

### Monthly
- Review Azure Cosmos DB billing
- Adjust RU/s if needed
- Consider further optimizations based on usage patterns

## Scripts Reference

### `analyze_mongodb_usage.py`
- Analyzes all collections
- Provides size breakdowns
- Recommends optimizations
- Shows expired entry counts

### `cleanup_mongodb.py`
- Cleans expired cache entries
- Provides before/after statistics
- Safe to run regularly

## Azure Cosmos DB Cost Optimization Tips

1. **Use Autoscale**: Automatically scales RU/s based on demand
2. **Right-size RU/s**: Monitor actual usage vs provisioned
3. **Enable TTL**: Let Cosmos DB automatically delete expired documents
4. **Use Serverless**: If usage is sporadic (< 400 RU/s average)
5. **Archive Old Data**: Move to cheaper storage (Blob Storage)

## Questions?

For database usage analysis, run:
```bash
python backend/scripts/analyze_mongodb_usage.py
```

For immediate cleanup:
```bash
python backend/scripts/cleanup_mongodb.py
```
