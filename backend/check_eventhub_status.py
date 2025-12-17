"""
Quick diagnostic script to check Event Hub consumer status and events.
"""

import asyncio
import sys
import os
import json

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.core.config import settings
from app.services.eventhub_service import eventhub_service
from app.core.logging import setup_logging, get_logger

setup_logging()
logger = get_logger(__name__)


async def check_status():
    """Check Event Hub status and recent events."""
    print("=" * 60)
    print("Event Hub Status Check")
    print("=" * 60)
    print()
    
    # Check configuration
    print("1. Configuration:")
    print(f"   Connection String: {'✅ Set' if settings.EVENTHUB_CONNECTION_STRING else '❌ Not Set'}")
    print(f"   Event Hub Name: {settings.EVENTHUB_NAME}")
    print(f"   Consumer Group: {settings.EVENTHUB_CONSUMER_GROUP}")
    print()
    
    # Check health
    print("2. Consumer Health:")
    health = await eventhub_service.health_check()
    print(f"   Status: {health.get('status')}")
    print(f"   Running: {health.get('running')}")
    print(f"   Buffer Size: {health.get('buffer_size')}")
    print()
    
    # Get events
    print("3. Recent Events:")
    result = await eventhub_service.get_events(limit=10)
    print(f"   Total in buffer: {result.total}")
    print(f"   Success: {result.success}")
    if result.error:
        print(f"   Error: {result.error}")
    print()
    
    if result.events:
        print("   Sample events:")
        for i, event in enumerate(result.events[:5], 1):
            entity_id = event.payload.get('entityid', 'N/A')
            entity_name = event.payload.get('entityname', 'N/A')
            print(f"   {i}. ID: {event.id[:20]}... | EntityID: {entity_id} | Entity: {entity_name} | Topic: {event.topic}")
    else:
        print("   ⚠️  No events in buffer")
        print("   This could mean:")
        print("   - Consumer is not running")
        print("   - No events have been received yet")
        print("   - Events were sent before consumer started")
    print()
    
    # Test customer filter
    print("4. Testing Customer Filter (customerId: 190583):")
    customer_result = await eventhub_service.get_events(customer_id="190583", limit=10)
    print(f"   Events for customer 190583: {customer_result.total}")
    if customer_result.events:
        print("   ✅ Found events for this customer!")
        for event in customer_result.events[:3]:
            print(f"      - {event.id[:30]}... | Topic: {event.topic}")
    else:
        print("   ⚠️  No events found for customer 190583")
        print("   This could mean:")
        print("   - Events haven't arrived yet")
        print("   - Events have different entityid")
        print("   - Consumer started after events were sent")
    print()
    
    print("=" * 60)
    print("Diagnostic Complete")
    print("=" * 60)


if __name__ == "__main__":
    try:
        asyncio.run(check_status())
    except KeyboardInterrupt:
        print("\n\nInterrupted")
    except Exception as e:
        print(f"\n\nError: {e}")
        import traceback
        traceback.print_exc()

