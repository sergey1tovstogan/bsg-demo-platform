"""
Post-Migration Test Script

Tests database operations after migrating to serverless mode.
Verifies that all functionality still works correctly.
"""

import asyncio
import sys
import os
import time
from datetime import datetime

script_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.dirname(script_dir)
sys.path.insert(0, backend_dir)

from app.core.database import get_database
from app.core.logging import get_logger
from app.utils.datetime_utils import utc_now

logger = get_logger(__name__)

test_results = []

def log_test(name, success, message=""):
    """Log a test result."""
    status = "[PASS]" if success else "[FAIL]"
    test_results.append({
        "name": name,
        "success": success,
        "message": message
    })
    print(f"{status}: {name}")
    if message:
        print(f"      {message}")

async def test_connection():
    """Test basic database connection."""
    try:
        db = await get_database()
        start_time = time.time()
        await db.command("ping")
        duration = time.time() - start_time
        
        if duration > 0.5:
            log_test(
                "Database Connection",
                True,
                f"Connected (cold start detected: {duration:.3f}s)"
            )
        else:
            log_test(
                "Database Connection",
                True,
                f"Connected ({duration:.3f}s)"
            )
        return True
    except Exception as e:
        log_test("Database Connection", False, str(e))
        return False

async def test_read_operations():
    """Test read operations on various collections."""
    try:
        db = await get_database()
        
        # Test reading from cache collection
        cache_count = await db.cache.count_documents({})
        log_test("Read: cache collection", True, f"Found {cache_count} documents")
        
        # Test reading from settings collection
        settings_count = await db.settings.count_documents({})
        log_test("Read: settings collection", True, f"Found {settings_count} documents")
        
        # Test reading from auth_users collection
        users_count = await db.auth_users.count_documents({})
        log_test("Read: auth_users collection", True, f"Found {users_count} documents")
        
        # Test reading from content collection
        content_count = await db.content.count_documents({})
        log_test("Read: content collection", True, f"Found {content_count} documents")
        
        return True
    except Exception as e:
        log_test("Read Operations", False, str(e))
        return False

async def test_write_operations():
    """Test write operations."""
    try:
        db = await get_database()
        test_key = f"test_serverless_migration_{int(time.time())}"
        
        # Test writing to cache (with TTL)
        test_doc = {
            "cache_key": test_key,
            "content": "test content",
            "content_type": "text/plain",
            "created_at": utc_now(),
            "expires_at": utc_now()
        }
        
        await db.cache.insert_one(test_doc)
        log_test("Write: cache collection", True, "Insert successful")
        
        # Clean up test document
        await db.cache.delete_one({"cache_key": test_key})
        log_test("Write: cache cleanup", True, "Delete successful")
        
        return True
    except Exception as e:
        log_test("Write Operations", False, str(e))
        return False

async def test_query_operations():
    """Test query operations."""
    try:
        db = await get_database()
        
        # Test simple query
        result = await db.cache.find_one({"content_type": {"$exists": True}})
        log_test("Query: find_one", True, "Query executed successfully")
        
        # Test query with limit
        results = await db.cache.find({}).limit(5).to_list(length=5)
        log_test("Query: find with limit", True, f"Retrieved {len(results)} documents")
        
        return True
    except Exception as e:
        log_test("Query Operations", False, str(e))
        return False

async def test_collections_access():
    """Test access to all collections."""
    try:
        db = await get_database()
        collections = await db.list_collection_names()
        
        log_test(
            "Collections Access",
            True,
            f"Found {len(collections)} collections: {', '.join(collections[:5])}..."
        )
        
        return True
    except Exception as e:
        log_test("Collections Access", False, str(e))
        return False

async def test_performance():
    """Test performance (check for cold starts)."""
    try:
        db = await get_database()
        
        # Wait a bit to potentially trigger cold start
        await asyncio.sleep(2)
        
        # Perform multiple operations and measure latency
        latencies = []
        for i in range(5):
            start_time = time.time()
            await db.command("ping")
            duration = time.time() - start_time
            latencies.append(duration)
            await asyncio.sleep(0.5)
        
        avg_latency = sum(latencies) / len(latencies)
        max_latency = max(latencies)
        
        if max_latency > 0.5:
            log_test(
                "Performance (Cold Start Detection)",
                True,
                f"Average: {avg_latency:.3f}s, Max: {max_latency:.3f}s (cold start detected)"
            )
        else:
            log_test(
                "Performance",
                True,
                f"Average: {avg_latency:.3f}s, Max: {max_latency:.3f}s"
            )
        
        return True
    except Exception as e:
        log_test("Performance Test", False, str(e))
        return False

async def main():
    """Run all tests."""
    print("=" * 80)
    print("Post-Migration Test Suite")
    print("=" * 80)
    print(f"\nStarted at: {datetime.now().isoformat()}\n")
    
    print("Testing database operations after serverless migration...\n")
    
    # Run all tests
    tests = [
        ("Connection", test_connection),
        ("Collections Access", test_collections_access),
        ("Read Operations", test_read_operations),
        ("Write Operations", test_write_operations),
        ("Query Operations", test_query_operations),
        ("Performance", test_performance),
    ]
    
    for test_name, test_func in tests:
        try:
            await test_func()
        except Exception as e:
            log_test(test_name, False, f"Exception: {str(e)}")
        print()  # Blank line between tests
    
    # Print summary
    print("=" * 80)
    print("Test Summary")
    print("=" * 80)
    
    passed = sum(1 for r in test_results if r["success"])
    failed = len(test_results) - passed
    
    print(f"\nTotal Tests: {len(test_results)}")
    print(f"[PASS] Passed: {passed}")
    print(f"[FAIL] Failed: {failed}\n")
    
    if failed > 0:
        print("Failed Tests:")
        for result in test_results:
            if not result["success"]:
                print(f"  - {result['name']}: {result['message']}")
        print()
    
    # Overall status
    if failed == 0:
        print("[SUCCESS] All tests passed! Serverless migration is successful.")
        print("\nNext Steps:")
        print("  1. Monitor costs in Azure Portal")
        print("  2. Set up cost alerts ($30/month)")
        print("  3. Monitor application performance")
        print("  4. Watch for cold starts (acceptable: 100-500ms)")
    else:
        print("[WARNING] Some tests failed. Please review the errors above.")
        print("   Consider rolling back to provisioned mode if critical issues occur.")
    
    print("\n" + "=" * 80 + "\n")
    
    return failed == 0

if __name__ == "__main__":
    success = asyncio.run(main())
    sys.exit(0 if success else 1)
