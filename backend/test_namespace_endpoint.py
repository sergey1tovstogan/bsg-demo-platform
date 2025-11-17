"""Test namespace listing endpoint directly."""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.azure_service import AzureService
from app.services.aks_service import AKSService
from app.core.logging import get_logger

logger = get_logger(__name__)

async def test():
    print("=" * 60)
    print("Testing Namespace Listing")
    print("=" * 60)
    
    subscription_id = "58a91cf0-0f39-45fd-a63e-5a9a28c7072b"
    resource_group = "modulartest3"
    
    # Get Azure resources
    print("\n1. Getting Azure resources...")
    azure = AzureService(subscription_id)
    resources = await azure.get_resources_by_resource_groups([resource_group])
    clusters = [r for r in resources if 'managedclusters' in r.type.lower()]
    print(f"   Found {len(clusters)} clusters")
    
    if not clusters:
        print("   ERROR: No clusters found!")
        return
    
    # Test namespace listing
    print(f"\n2. Testing namespace listing for cluster: {clusters[0].name}")
    aks = AKSService(subscription_id)
    namespaces = await aks.list_cluster_namespaces(clusters[0])
    
    print(f"\n3. Result:")
    print(f"   Namespaces found: {len(namespaces)}")
    if namespaces:
        print(f"   Namespaces: {', '.join(namespaces[:10])}")
        if len(namespaces) > 10:
            print(f"   ... and {len(namespaces) - 10} more")
        print("\n   SUCCESS! Namespace listing works!")
    else:
        print("   FAILED! No namespaces returned")
        print("   Check backend logs for errors")

if __name__ == "__main__":
    asyncio.run(test())




