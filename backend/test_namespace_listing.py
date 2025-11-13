"""Test namespace listing functionality."""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.azure_service import AzureService
from app.services.aks_service import AKSService
from app.core.logging import get_logger

logger = get_logger(__name__)

async def test_namespace_listing():
    print("=" * 60)
    print("Testing Namespace Listing")
    print("=" * 60)
    
    subscription_id = "58a91cf0-0f39-45fd-a63e-5a9a28c7072b"
    resource_group = "modulartest3"
    
    # Get Azure resources
    print("\n1. Getting Azure resources...")
    azure_service = AzureService(subscription_id)
    resources = await azure_service.get_resources_by_resource_groups([resource_group])
    print(f"   Found {len(resources)} resources")
    
    # Find AKS clusters
    aks_clusters = [
        r for r in resources 
        if "microsoft.containerservice/managedclusters" in r.type.lower()
    ]
    print(f"\n2. Found {len(aks_clusters)} AKS clusters")
    
    if not aks_clusters:
        print("   ERROR: No AKS clusters found!")
        return
    
    # Test namespace listing for each cluster
    aks_service = AKSService(subscription_id)
    
    for cluster in aks_clusters:
        print(f"\n3. Testing namespace listing for cluster: {cluster.name}")
        print(f"   Resource Group: {cluster.resource_group}")
        
        try:
            namespaces = await aks_service.list_cluster_namespaces(cluster)
            print(f"   ✓ Successfully retrieved {len(namespaces)} namespaces")
            if namespaces:
                print(f"   Namespaces: {', '.join(namespaces[:10])}")
                if len(namespaces) > 10:
                    print(f"   ... and {len(namespaces) - 10} more")
            else:
                print("   ⚠ No namespaces found")
        except Exception as e:
            print(f"   ✗ Error: {e}")
            import traceback
            traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_namespace_listing())

