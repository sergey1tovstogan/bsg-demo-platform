"""
MongoDB Collections Inventory

Lists all collections in MongoDB and what data is stored in each.
This helps understand what's actually using storage.
"""

import asyncio
import sys
import os

script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
sys.path.insert(0, backend_dir)

from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


async def analyze_all_collections():
    """Analyze all collections and what they store."""
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    db = client[settings.DATABASE_NAME]
    
    # List all collections
    collections = await db.list_collection_names()
    
    print("=" * 80)
    print("MongoDB Collections Inventory")
    print("=" * 80)
    print(f"\nDatabase: {settings.DATABASE_NAME}")
    print(f"Total Collections: {len(collections)}\n")
    
    collection_info = []
    
    for collection_name in sorted(collections):
        collection = db[collection_name]
        
        # Get stats
        try:
            stats = await db.command("collStats", collection_name)
            doc_count = await collection.count_documents({})
            size_bytes = stats.get("size", 0)
            storage_size_bytes = stats.get("storageSize", 0)
            indexes_size_bytes = stats.get("totalIndexSize", 0)
            
            # Get sample document to understand structure
            sample = await collection.find_one()
            
            # Analyze document structure
            doc_structure = {}
            if sample:
                for key, value in sample.items():
                    if key == "_id":
                        continue
                    value_type = type(value).__name__
                    if isinstance(value, str):
                        value_size = len(value)
                        doc_structure[key] = f"{value_type} (~{value_size} chars)" if value_size > 100 else f"{value_type}"
                    elif isinstance(value, (dict, list)):
                        doc_structure[key] = f"{value_type} (nested)"
                    else:
                        doc_structure[key] = value_type
            
            collection_info.append({
                "name": collection_name,
                "doc_count": doc_count,
                "size_mb": size_bytes / (1024**2),
                "storage_mb": storage_size_bytes / (1024**2),
                "indexes_mb": indexes_size_bytes / (1024**2),
                "sample_structure": doc_structure,
                "has_sample": sample is not None
            })
        except Exception as e:
            logger.error(f"Error analyzing collection {collection_name}: {e}")
            collection_info.append({
                "name": collection_name,
                "error": str(e)
            })
    
    # Print detailed information
    total_storage = 0
    total_size = 0
    
    for info in collection_info:
        if "error" in info:
            print(f"\nCollection: {info['name']}")
            print(f"  ERROR: {info['error']}")
            continue
        
        print(f"\n{'=' * 80}")
        print(f"Collection: {info['name']}")
        print(f"{'=' * 80}")
        print(f"  Documents: {info['doc_count']:,}")
        print(f"  Data Size: {info['size_mb']:.2f} MB")
        print(f"  Storage Size: {info['storage_mb']:.2f} MB")
        print(f"  Index Size: {info['indexes_mb']:.2f} MB")
        print(f"  Total Size: {info['storage_mb'] + info['indexes_mb']:.2f} MB")
        
        total_storage += info['storage_mb'] + info['indexes_mb']
        total_size += info['size_mb']
        
        if info['has_sample'] and info['sample_structure']:
            print(f"\n  Document Structure:")
            for key, value_type in list(info['sample_structure'].items())[:10]:
                print(f"    - {key}: {value_type}")
            if len(info['sample_structure']) > 10:
                print(f"    ... and {len(info['sample_structure']) - 10} more fields")
        
        # Collection-specific notes
        if info['name'] == 'cache':
            print(f"\n  [CACHE] Stores:")
            print(f"    - RAG API responses (7-day TTL)")
            print(f"    - Component identification info (7-day TTL)")
            print(f"    - Azure resource lists (1-hour TTL)")
            print(f"    - AKS namespace data (2-hour TTL)")
        elif info['name'] == 'settings':
            print(f"\n  [SETTINGS] Stores:")
            print(f"    - RAG JWT token (global)")
            print(f"    - EventHub configuration")
        elif info['name'] == 'deployment':
            print(f"\n  [DEPLOYMENT] Stores:")
            print(f"    - User-specific JWT tokens")
            print(f"    - Deployment analysis results (optional)")
        elif info['name'] == 'security_slides':
            print(f"\n  [SECURITY] Stores:")
            print(f"    - PowerPoint slide images (base64 encoded JPEG)")
            print(f"    - Can be LARGE if many slides")
        elif info['name'] == 'security_paragraphs':
            print(f"\n  [SECURITY] Stores:")
            print(f"    - Paragraph text from security documents")
        elif info['name'] == 'security_items':
            print(f"\n  [SECURITY] Stores:")
            print(f"    - Security document items/metadata")
        elif info['name'] == 'content':
            print(f"\n  [CONTENT] Stores:")
            print(f"    - Component content items (videos, docs, etc.)")
        elif info['name'] == 'users':
            print(f"\n  [USERS] Stores:")
            print(f"    - User accounts and authentication data")
        elif info['name'] == 'components':
            print(f"\n  [COMPONENTS] Stores:")
            print(f"    - Component metadata and configuration")
    
    print(f"\n{'=' * 80}")
    print("SUMMARY")
    print(f"{'=' * 80}\n")
    print(f"Total Collections: {len(collections)}")
    print(f"Total Data Size: {total_size:.2f} MB")
    print(f"Total Storage Size: {total_storage:.2f} MB ({total_storage/1024:.3f} GB)")
    
    # Identify largest collections
    print(f"\nLargest Collections (by storage):")
    sorted_by_size = sorted([c for c in collection_info if 'storage_mb' in c], 
                           key=lambda x: x['storage_mb'] + x['indexes_mb'], 
                           reverse=True)
    for i, coll in enumerate(sorted_by_size[:10], 1):
        total_mb = coll['storage_mb'] + coll['indexes_mb']
        percentage = (total_mb / total_storage * 100) if total_storage > 0 else 0
        print(f"  {i}. {coll['name']}: {total_mb:.2f} MB ({percentage:.1f}%)")
    
    # Cost estimate
    storage_gb = total_storage / 1024
    monthly_storage_cost = storage_gb * 0.25  # $0.25/GB/month
    
    print(f"\n{'=' * 80}")
    print("Cost Estimate")
    print(f"{'=' * 80}\n")
    print(f"Total Storage: {storage_gb:.3f} GB")
    print(f"Estimated Monthly Storage Cost: ${monthly_storage_cost:.2f}")
    print(f"\nNote: This is storage cost only. RU/s (throughput) costs are separate.")
    print(f"      Connection pool optimization saves on RU/s, not storage.")
    
    # Recommendations
    print(f"\n{'=' * 80}")
    print("Recommendations")
    print(f"{'=' * 80}\n")
    
    if total_storage < 100:  # Less than 100 MB
        print(f"[INFO] Total storage is {total_storage:.2f} MB - MongoDB may be overkill")
        print(f"       Consider:")
        print(f"       - Using file-based storage for security slides/images")
        print(f"       - Using Azure Blob Storage for large documents")
        print(f"       - Using in-memory cache with Redis (cheaper for small data)")
        print(f"       - SQLite for small datasets (< 100 MB)")
    
    large_collections = [c for c in collection_info if 'storage_mb' in c and (c['storage_mb'] + c['indexes_mb']) > 10]
    if large_collections:
        print(f"\n[WARNING] Large collections found (>10 MB):")
        for coll in large_collections:
            size_mb = coll['storage_mb'] + coll['indexes_mb']
            print(f"  - {coll['name']}: {size_mb:.2f} MB")
            if 'security' in coll['name'].lower():
                print(f"    Consider: Moving slide images to Azure Blob Storage")
    
    print(f"\n{'=' * 80}\n")
    
    client.close()


if __name__ == "__main__":
    asyncio.run(analyze_all_collections())
