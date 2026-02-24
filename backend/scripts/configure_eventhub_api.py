"""
Script to configure EventHub via API endpoint.

This script configures EventHub settings in MongoDB using the API endpoint.
Can be run after backend is deployed to configure EventHub without restarting.

Usage:
    python configure_eventhub_api.py [--backend-url URL]
"""

import argparse
import requests
import sys
from typing import Optional

# Event Hub configuration (from setup_eventhub_env.py)
EVENTHUB_CONFIG = {
    "connection_string": "Endpoint=sb://bbkeventstoreehnseventstore.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=CIn9ifBO5391MMhHifUdFtYskmszxxKXo+AEhKUOTcI=",
    "name": "modelbank-event-topic",
    "consumer_group": "$Default",
    "buffer_size": 1000
}


def configure_eventhub(backend_url: str = "https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io") -> bool:
    """
    Configure EventHub via API endpoint.
    
    Args:
        backend_url: Backend API base URL
        
    Returns:
        True if successful, False otherwise
    """
    config_url = f"{backend_url}/api/v1/settings/eventhub/config"
    
    print("=" * 60)
    print("EventHub Configuration via API")
    print("=" * 60)
    print(f"Backend URL: {backend_url}")
    print(f"Config endpoint: {config_url}")
    print()
    
    try:
        print("Sending configuration request...")
        response = requests.post(
            config_url,
            json=EVENTHUB_CONFIG,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("[SUCCESS] EventHub configuration saved successfully!")
            print(f"   Message: {result.get('message', 'N/A')}")
            print()
            print("Next steps:")
            print(f"1. Start EventHub adapter: POST {backend_url}/api/v1/components/data-architecture/events/start")
            print("2. Check health: GET {}/api/v1/components/data-architecture/events/health".format(backend_url))
            return True
        else:
            print(f"[ERROR] Failed to configure EventHub: HTTP {response.status_code}")
            try:
                error_detail = response.json()
                print(f"   Error: {error_detail.get('detail', response.text)}")
            except:
                print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Failed to connect to backend: {e}")
        print(f"   Make sure the backend is running and accessible at: {backend_url}")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        import traceback
        traceback.print_exc()
        return False


def start_eventhub(backend_url: str = "https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io") -> bool:
    """
    Start EventHub adapter via API endpoint.
    
    Args:
        backend_url: Backend API base URL
        
    Returns:
        True if successful, False otherwise
    """
    start_url = f"{backend_url}/api/v1/components/data-architecture/events/start"
    
    print()
    print("Starting EventHub adapter...")
    try:
        response = requests.post(
            start_url,
            headers={"Content-Type": "application/json"},
            timeout=30
        )
        
        if response.status_code == 200:
            result = response.json()
            print("[SUCCESS] EventHub adapter started successfully!")
            print(f"   Status: {result.get('status', 'N/A')}")
            print(f"   Message: {result.get('message', 'N/A')}")
            return True
        else:
            print(f"[ERROR] Failed to start EventHub adapter: HTTP {response.status_code}")
            try:
                error_detail = response.json()
                print(f"   Error: {error_detail.get('detail', response.text)}")
            except:
                print(f"   Error: {response.text}")
            return False
            
    except requests.exceptions.RequestException as e:
        print(f"[ERROR] Failed to connect to backend: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Unexpected error: {e}")
        return False


def main():
    parser = argparse.ArgumentParser(description="Configure EventHub via API")
    parser.add_argument(
        "--backend-url",
        default="https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io",
        help="Backend API base URL"
    )
    parser.add_argument(
        "--start",
        action="store_true",
        help="Also start the EventHub adapter after configuration"
    )
    
    args = parser.parse_args()
    
    # Configure EventHub
    success = configure_eventhub(args.backend_url)
    
    if not success:
        print()
        print("Configuration failed. Please check:")
        print("1. Backend is running and accessible")
        print("2. Backend URL is correct")
        print("3. Network connectivity to backend")
        sys.exit(1)
    
    # Start adapter if requested
    if args.start:
        start_success = start_eventhub(args.backend_url)
        if not start_success:
            print()
            print("[WARNING] Configuration saved but adapter start failed.")
            print("   You can start it manually via the API endpoint.")
            sys.exit(1)
    
    print()
    print("=" * 60)
    print("[SUCCESS] All done!")
    print("=" * 60)


if __name__ == "__main__":
    main()
