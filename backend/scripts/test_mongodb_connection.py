"""
MongoDB Connection Test Script

Tests the MongoDB connection and displays connection information.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path to import app modules
backend_dir = Path(__file__).parent.parent
sys.path.insert(0, str(backend_dir))

from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


async def test_mongodb_connection():
    """Test MongoDB connection and display information."""
    print("=" * 80)
    print("MONGODB CONNECTION TEST")
    print("=" * 80)
    print()
    
    # Display configuration
    print("Configuration:")
    print(f"  Database Name: {settings.DATABASE_NAME}")
    print(f"  Connection URL: {settings.DATABASE_URL[:50]}..." if len(settings.DATABASE_URL) > 50 else f"  Connection URL: {settings.DATABASE_URL}")
    print(f"  Max Pool Size: {settings.DB_MAX_POOL_SIZE}")
    print(f"  Min Pool Size: {settings.DB_MIN_POOL_SIZE}")
    print(f"  Connection Timeout: {settings.DB_CONNECT_TIMEOUT}s")
    print()
    
    client = None
    try:
        print("Attempting to connect to MongoDB...")
        
        # Create MongoDB client
        client = AsyncIOMotorClient(
            settings.DATABASE_URL,
            maxPoolSize=settings.DB_MAX_POOL_SIZE,
            minPoolSize=settings.DB_MIN_POOL_SIZE,
            serverSelectionTimeoutMS=settings.DB_CONNECT_TIMEOUT * 1000,
            connectTimeoutMS=settings.DB_CONNECT_TIMEOUT * 1000,
            socketTimeoutMS=settings.DB_CONNECT_TIMEOUT * 1000,
        )
        
        # Test connection
        print("  Testing connection...")
        await client.admin.command('ping')
        print("  ✓ Connection successful!")
        print()
        
        # Get server information
        print("Server Information:")
        server_info = await client.server_info()
        print(f"  MongoDB Version: {server_info.get('version', 'Unknown')}")
        print(f"  Server Type: {server_info.get('serverType', 'Unknown')}")
        print()
        
        # Get database
        db = client[settings.DATABASE_NAME]
        
        # List collections
        print("Database Collections:")
        collections = await db.list_collection_names()
        if collections:
            for coll_name in sorted(collections):
                count = await db[coll_name].count_documents({})
                print(f"  - {coll_name}: {count} document(s)")
        else:
            print("  (No collections found)")
        print()
        
        # Test database operations
        print("Testing database operations...")
        
        # Test write operation (insert a test document)
        test_collection = db["_connection_test"]
        test_doc = {"test": True, "timestamp": "connection_test"}
        await test_collection.insert_one(test_doc)
        print("  ✓ Write operation successful")
        
        # Test read operation
        result = await test_collection.find_one({"test": True})
        if result:
            print("  ✓ Read operation successful")
        
        # Clean up test document
        await test_collection.delete_one({"test": True})
        print("  ✓ Cleanup successful")
        print()
        
        print("=" * 80)
        print("✓ ALL TESTS PASSED - MongoDB connection is working correctly!")
        print("=" * 80)
        return True
        
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print()
        print("=" * 80)
        print("✗ CONNECTION FAILED")
        print("=" * 80)
        print(f"Error: {e}")
        print()
        print("Troubleshooting:")
        print("  1. Check if DATABASE_URL is correct")
        print("  2. Verify network connectivity")
        print("  3. Check if MongoDB server is running")
        print("  4. Verify firewall/security group settings")
        print("  5. For Azure Cosmos DB, ensure IP is whitelisted")
        return False
        
    except Exception as e:
        print()
        print("=" * 80)
        print("✗ ERROR")
        print("=" * 80)
        print(f"Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False
        
    finally:
        if client:
            client.close()
            print("\nConnection closed.")


if __name__ == "__main__":
    success = asyncio.run(test_mongodb_connection())
    sys.exit(0 if success else 1)

