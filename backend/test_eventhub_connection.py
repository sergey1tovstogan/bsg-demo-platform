"""
Test script to verify Azure Event Hub connection configuration.

This script checks if the Event Hub connection string is configured correctly
and attempts to connect to the Event Hub to verify connectivity.

Usage:
    python test_eventhub_connection.py
"""

import asyncio
import sys
import os

# Add parent directory to path to import app modules
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.services.eventhub_service import EventHubService
from app.core.logging import setup_logging, get_logger

setup_logging()
logger = get_logger(__name__)


async def test_connection():
    """Test Event Hub connection configuration."""
    print("=" * 60)
    print("Azure Event Hub Connection Test")
    print("=" * 60)
    print()
    
    # Check configuration
    print("1. Checking configuration...")
    if not settings.EVENTHUB_CONNECTION_STRING:
        print("   ❌ ERROR: EVENTHUB_CONNECTION_STRING is not set")
        print("   Please set the environment variable or add it to .env file")
        return False
    else:
        # Mask the connection string for security
        conn_str = settings.EVENTHUB_CONNECTION_STRING
        if "SharedAccessKey=" in conn_str:
            masked = conn_str.split("SharedAccessKey=")[0] + "SharedAccessKey=***"
            print(f"   ✅ EVENTHUB_CONNECTION_STRING is set: {masked}")
        else:
            print(f"   ✅ EVENTHUB_CONNECTION_STRING is set")
    
    print(f"   ✅ EVENTHUB_NAME: {settings.EVENTHUB_NAME}")
    print(f"   ✅ EVENTHUB_CONSUMER_GROUP: {settings.EVENTHUB_CONSUMER_GROUP}")
    print(f"   ✅ EVENTHUB_BUFFER_SIZE: {settings.EVENTHUB_BUFFER_SIZE}")
    print()
    
    # Test connection
    print("2. Testing Event Hub connection...")
    service = EventHubService()
    
    try:
        print("   Attempting to start Event Hub consumer...")
        await service.start()
        print("   ✅ Event Hub consumer started successfully")
        print()
        
        # Check health
        print("3. Checking consumer health...")
        health = await service.health_check()
        print(f"   Status: {health.get('status')}")
        print(f"   Running: {health.get('running')}")
        print(f"   Buffer Size: {health.get('buffer_size')}")
        print(f"   Topic: {health.get('topic')}")
        print(f"   Consumer Group: {health.get('consumer_group')}")
        print()
        
        if health.get('status') == 'healthy':
            print("   ✅ Consumer is healthy and ready to receive events")
        else:
            print(f"   ⚠️  Consumer status: {health.get('status')}")
            if health.get('error'):
                print(f"   Error: {health.get('error')}")
        print()
        
        # Wait a few seconds to see if events arrive
        print("4. Waiting for events (10 seconds)...")
        print("   (If events are being sent to the Event Hub, they should appear in the buffer)")
        await asyncio.sleep(10)
        
        # Check buffer
        result = await service.get_events(limit=5)
        print(f"   Events in buffer: {result.total}")
        if result.events:
            print("   ✅ Events are being received!")
            print(f"   Sample event IDs: {[e.id for e in result.events[:3]]}")
        else:
            print("   ℹ️  No events in buffer yet (this is normal if no events are being sent)")
        print()
        
        # Stop consumer
        print("5. Stopping consumer...")
        await service.stop()
        print("   ✅ Consumer stopped successfully")
        print()
        
        print("=" * 60)
        print("✅ Connection test completed successfully!")
        print("=" * 60)
        return True
        
    except Exception as e:
        print(f"   ❌ ERROR: Failed to connect to Event Hub")
        print(f"   Error: {str(e)}")
        print()
        print("   Troubleshooting:")
        print("   1. Verify EVENTHUB_CONNECTION_STRING is correct")
        print("   2. Check that the Event Hub exists: " + settings.EVENTHUB_NAME)
        print("   3. Verify the SAS key has 'Listen' permission")
        print("   4. Check network connectivity to Azure")
        print()
        
        try:
            await service.stop()
        except:
            pass
        
        return False


if __name__ == "__main__":
    try:
        success = asyncio.run(test_connection())
        sys.exit(0 if success else 1)
    except KeyboardInterrupt:
        print("\n\nTest interrupted by user")
        sys.exit(1)
    except Exception as e:
        print(f"\n\nUnexpected error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)

