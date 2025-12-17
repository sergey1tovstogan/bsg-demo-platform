"""
Test if events module can be imported without errors.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

print("Testing imports...")

try:
    print("1. Importing eventhub_service...")
    from app.services.eventhub_service import EventHubService, get_eventhub_service
    print("   ✅ eventhub_service imported successfully")
except Exception as e:
    print(f"   ❌ Error importing eventhub_service: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("2. Importing events API...")
    from app.api import events
    print("   ✅ events API imported successfully")
    print(f"   Router: {events.router}")
    print(f"   Routes count: {len(events.router.routes)}")
except Exception as e:
    print(f"   ❌ Error importing events API: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("3. Checking route paths...")
    for route in events.router.routes:
        if hasattr(route, 'path'):
            methods = list(route.methods) if hasattr(route, 'methods') else []
            print(f"   {', '.join(methods)} {route.path}")
except Exception as e:
    print(f"   ❌ Error checking routes: {e}")
    import traceback
    traceback.print_exc()

print("\n✅ All imports successful!")

