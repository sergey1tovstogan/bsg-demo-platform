"""
MongoDB Usage Analysis Script

Analyzes MongoDB collections to understand storage usage and provide cost optimization recommendations.
Run this script to get insights into database utilization.
"""

import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timedelta
from collections import defaultdict
import json

# Add parent directory to path to import app modules
import os
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
sys.path.insert(0, backend_dir)

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


async def analyze_collection(db, collection_name: str):
    """Analyze a single collection."""
    collection = db[collection_name]
    
    # Get collection stats
    stats = await db.command("collStats", collection_name)
    
    # Count documents
    doc_count = await collection.count_documents({})
    
    # Get sample documents to understand structure
    sample = await collection.find_one()
    
    # Analyze expired cache entries (for cache collection)
    expired_count = 0
    if collection_name == "cache":
        now = datetime.utcnow()
        expired_count = await collection.count_documents({
            "expires_at": {"$lt": now}
        })
    
    # Analyze by cache key prefix (for cache collection)
    cache_prefixes = defaultdict(int)
    if collection_name == "cache":
        pipeline = [
            {"$group": {
                "_id": {"$substr": ["$cache_key", 0, {"$indexOfCP": ["$cache_key", ":"]}]},
                "count": {"$sum": 1},
                "total_size": {"$sum": {"$bsonSize": "$$ROOT"}}
            }},
            {"$sort": {"total_size": -1}}
        ]
        try:
            async for result in collection.aggregate(pipeline):
                prefix = result.get("_id", "unknown")
                cache_prefixes[prefix] = {
                    "count": result.get("count", 0),
                    "total_size_bytes": result.get("total_size", 0)
                }
        except Exception as e:
            logger.warning(f"Could not analyze cache prefixes: {e}")
    
    return {
        "name": collection_name,
        "document_count": doc_count,
        "size_bytes": stats.get("size", 0),
        "storage_size_bytes": stats.get("storageSize", 0),
        "indexes_size_bytes": stats.get("totalIndexSize", 0),
        "expired_entries": expired_count if collection_name == "cache" else None,
        "cache_prefixes": dict(cache_prefixes) if cache_prefixes else None,
        "has_sample": sample is not None
    }


async def analyze_database():
    """Analyze entire database."""
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    db = client[settings.DATABASE_NAME]
    
    # Get database stats
    db_stats = await db.command("dbStats")
    
    # List all collections
    collections = await db.list_collection_names()
    
    print("=" * 80)
    print("MongoDB Usage Analysis")
    print("=" * 80)
    print(f"\nDatabase: {settings.DATABASE_NAME}")
    print(f"Analysis Time: {datetime.utcnow().isoformat()}")
    print(f"\nDatabase Stats:")
    print(f"  Total Size: {db_stats.get('dataSize', 0) / (1024**2):.2f} MB")
    print(f"  Storage Size: {db_stats.get('storageSize', 0) / (1024**2):.2f} MB")
    print(f"  Index Size: {db_stats.get('indexSize', 0) / (1024**2):.2f} MB")
    print(f"  Total Collections: {len(collections)}")
    print(f"  Total Documents: {db_stats.get('collections', 0)}")
    
    print(f"\n{'=' * 80}")
    print("Collection Analysis")
    print(f"{'=' * 80}\n")
    
    collection_stats = []
    total_storage = 0
    
    for collection_name in sorted(collections):
        stats = await analyze_collection(db, collection_name)
        collection_stats.append(stats)
        total_storage += stats.get("storage_size_bytes", 0)
        
        print(f"Collection: {collection_name}")
        print(f"  Documents: {stats['document_count']:,}")
        print(f"  Size: {stats['size_bytes'] / (1024**2):.2f} MB")
        print(f"  Storage Size: {stats['storage_size_bytes'] / (1024**2):.2f} MB")
        print(f"  Index Size: {stats['indexes_size_bytes'] / (1024**2):.2f} MB")
        
        if stats.get("expired_entries"):
            print(f"  ⚠️  Expired Cache Entries: {stats['expired_entries']:,} (can be cleaned)")
        
        if stats.get("cache_prefixes"):
            print(f"  Cache Key Prefixes:")
            for prefix, data in sorted(stats['cache_prefixes'].items(), 
                                      key=lambda x: x[1]['total_size_bytes'], 
                                      reverse=True)[:10]:
                size_mb = data['total_size_bytes'] / (1024**2)
                print(f"    - {prefix}: {data['count']:,} entries, {size_mb:.2f} MB")
        
        print()
    
    print(f"{'=' * 80}")
    print("Cost Optimization Recommendations")
    print(f"{'=' * 80}\n")
    
    # Find cache collection
    cache_stats = next((s for s in collection_stats if s['name'] == 'cache'), None)
    
    if cache_stats:
        cache_size_mb = cache_stats['storage_size_bytes'] / (1024**2)
        expired = cache_stats.get('expired_entries', 0)
        
        print("1. CACHE COLLECTION OPTIMIZATION:")
        print(f"   Current cache size: {cache_size_mb:.2f} MB")
        print(f"   Expired entries: {expired:,}")
        
        if expired > 0:
            print(f"   ✅ ACTION: Run cleanup to delete {expired:,} expired entries")
            print(f"      Command: POST /api/v1/cache/clear-expired")
            print(f"      Estimated savings: ~{expired * 0.001:.2f} MB (assuming ~1KB per entry)")
        
        # Analyze cache prefixes
        if cache_stats.get('cache_prefixes'):
            rag_size = 0
            component_info_size = 0
            
            for prefix, data in cache_stats['cache_prefixes'].items():
                if 'rag' in prefix.lower():
                    rag_size += data['total_size_bytes']
                elif 'component_info' in prefix.lower():
                    component_info_size += data['total_size_bytes']
            
            rag_size_mb = rag_size / (1024**2)
            component_info_size_mb = component_info_size / (1024**2)
            
            print(f"\n   Cache Breakdown:")
            print(f"   - RAG responses: {rag_size_mb:.2f} MB (7-day TTL)")
            print(f"   - Component info: {component_info_size_mb:.2f} MB (7-day TTL)")
            print(f"   - Other: {(cache_size_mb - rag_size_mb - component_info_size_mb):.2f} MB")
            
            print(f"\n   💡 RECOMMENDATIONS:")
            print(f"   - Reduce RAG cache TTL from 7 days to 3 days (saves ~57% of RAG cache)")
            print(f"   - Reduce component info TTL from 7 days to 3 days (saves ~57% of component cache)")
            print(f"   - Consider implementing cache size limits (e.g., max 100MB)")
            print(f"   - Use in-memory cache more aggressively (already implemented)")
    
    # Check for large collections
    large_collections = [s for s in collection_stats if s['storage_size_bytes'] > 10 * 1024**2]  # > 10MB
    if large_collections:
        print(f"\n2. LARGE COLLECTIONS (>10MB):")
        for coll in sorted(large_collections, key=lambda x: x['storage_size_bytes'], reverse=True):
            size_mb = coll['storage_size_bytes'] / (1024**2)
            print(f"   - {coll['name']}: {size_mb:.2f} MB")
            print(f"     Consider: Archiving old data, adding TTL indexes, or reducing retention")
    
    # Check for collections with many documents
    large_doc_collections = [s for s in collection_stats if s['document_count'] > 1000]
    if large_doc_collections:
        print(f"\n3. COLLECTIONS WITH MANY DOCUMENTS (>1000):")
        for coll in sorted(large_doc_collections, key=lambda x: x['document_count'], reverse=True):
            print(f"   - {coll['name']}: {coll['document_count']:,} documents")
            if coll['name'] == 'cache':
                print(f"     ✅ Has TTL expiration (good)")
            else:
                print(f"     ⚠️  Consider adding TTL indexes or cleanup policies")
    
    # General recommendations
    print(f"\n4. GENERAL RECOMMENDATIONS:")
    print(f"   - Enable MongoDB TTL indexes for automatic expiration")
    print(f"   - Implement periodic cleanup jobs for expired cache entries")
    print(f"   - Monitor collection growth over time")
    print(f"   - Consider using Azure Cosmos DB autoscale for cost optimization")
    print(f"   - Review connection pool settings (current: min={settings.DB_MIN_POOL_SIZE}, max={settings.DB_MAX_POOL_SIZE})")
    
    # Estimate potential savings
    if cache_stats and expired > 0:
        estimated_savings_mb = expired * 0.001  # Rough estimate
        print(f"\n5. ESTIMATED SAVINGS:")
        print(f"   - Cleaning expired cache: ~{estimated_savings_mb:.2f} MB")
        if cache_stats.get('cache_prefixes'):
            rag_size_mb = sum(d['total_size_bytes'] for p, d in cache_stats['cache_prefixes'].items() if 'rag' in p.lower()) / (1024**2)
            component_size_mb = sum(d['total_size_bytes'] for p, d in cache_stats['cache_prefixes'].items() if 'component_info' in p.lower()) / (1024**2)
            print(f"   - Reducing RAG TTL to 3 days: ~{rag_size_mb * 0.57:.2f} MB")
            print(f"   - Reducing component TTL to 3 days: ~{component_size_mb * 0.57:.2f} MB")
    
    print(f"\n{'=' * 80}")
    print("Analysis Complete")
    print(f"{'=' * 80}\n")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(analyze_database())
