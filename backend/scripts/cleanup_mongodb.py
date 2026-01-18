"""
MongoDB Cleanup Script

Cleans up expired cache entries and old data to reduce storage costs.
Run this script periodically (e.g., daily via cron) to maintain optimal storage usage.
"""

import asyncio
import sys
from datetime import datetime, timedelta

import os
script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
sys.path.insert(0, backend_dir)

from app.core.database import get_database
from app.core.logging import get_logger
from app.utils.datetime_utils import utc_now

logger = get_logger(__name__)


async def cleanup_expired_cache():
    """Clean up expired cache entries."""
    db = await get_database()
    now = utc_now()
    
    # Delete expired cache entries
    result = await db.cache.delete_many({
        "expires_at": {"$lt": now}
    })
    
    logger.info(f"Cleaned up {result.deleted_count} expired cache entries")
    return result.deleted_count


async def cleanup_old_deployment_data(days: int = 30):
    """Clean up old deployment analysis data (optional - be careful with this)."""
    db = await get_database()
    cutoff_date = utc_now() - timedelta(days=days)
    
    # Only clean up old analysis results, not user tokens or settings
    result = await db.deployment.delete_many({
        "type": {"$ne": "jwt_token"},  # Don't delete user tokens
        "created_at": {"$lt": cutoff_date}
    })
    
    logger.info(f"Cleaned up {result.deleted_count} old deployment entries (older than {days} days)")
    return result.deleted_count


async def get_cache_stats():
    """Get cache collection statistics."""
    db = await get_database()
    
    total = await db.cache.count_documents({})
    expired = await db.cache.count_documents({
        "expires_at": {"$lt": utc_now()}
    })
    
    # Get size estimates
    stats = await db.command("collStats", "cache")
    size_mb = stats.get("storageSize", 0) / (1024**2)
    
    return {
        "total_entries": total,
        "expired_entries": expired,
        "size_mb": size_mb
    }


async def main():
    """Main cleanup function."""
    print("=" * 80)
    print("MongoDB Cleanup Script")
    print("=" * 80)
    print(f"Started at: {datetime.utcnow().isoformat()}\n")
    
    # Get stats before cleanup
    print("Current Cache Statistics:")
    stats_before = await get_cache_stats()
    print(f"  Total cache entries: {stats_before['total_entries']:,}")
    print(f"  Expired entries: {stats_before['expired_entries']:,}")
    print(f"  Cache size: {stats_before['size_mb']:.2f} MB\n")
    
    # Cleanup expired cache
    print("Cleaning up expired cache entries...")
    expired_deleted = await cleanup_expired_cache()
    
    # Get stats after cleanup
    stats_after = await get_cache_stats()
    print(f"\nAfter Cleanup:")
    print(f"  Total cache entries: {stats_after['total_entries']:,}")
    print(f"  Expired entries: {stats_after['expired_entries']:,}")
    print(f"  Cache size: {stats_after['size_mb']:.2f} MB")
    print(f"  Entries deleted: {expired_deleted:,}")
    print(f"  Size reduction: {stats_before['size_mb'] - stats_after['size_mb']:.2f} MB")
    
    print(f"\n{'=' * 80}")
    print("Cleanup Complete")
    print(f"{'=' * 80}\n")


if __name__ == "__main__":
    asyncio.run(main())
