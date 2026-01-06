"""
Quick script to check if routes are registered correctly.
Run this to verify the events routes are available.
"""

import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

try:
    from app.main import app
    from app.core.config import settings
    
    print("=" * 60)
    print("FastAPI Routes Check")
    print("=" * 60)
    print(f"API Prefix: {settings.API_V1_PREFIX}")
    print()
    
    # Get all routes
    routes = []
    for route in app.routes:
        if hasattr(route, 'path') and hasattr(route, 'methods'):
            routes.append({
                'path': route.path,
                'methods': list(route.methods),
                'name': getattr(route, 'name', 'N/A')
            })
    
    # Filter events routes
    events_routes = [r for r in routes if 'event' in r['path'].lower()]
    
    print("Events-related routes:")
    if events_routes:
        for route in events_routes:
            print(f"  {', '.join(route['methods'])} {route['path']}")
    else:
        print("  ❌ No events routes found!")
    
    print()
    print("All routes (first 20):")
    for route in routes[:20]:
        print(f"  {', '.join(route['methods'])} {route['path']}")
    
    print()
    print("=" * 60)
    print("Check complete")
    print("=" * 60)
    
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

