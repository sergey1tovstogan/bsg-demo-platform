"""Simple test of list_cluster_namespaces."""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.azure_service import AzureService
from app.services.aks_service import AKSService

async def test():
    subscription_id = "58a91cf0-0f39-45fd-a63e-5a9a28c7072b"
    resource_group = "modulartest3"
    
    azure = AzureService(subscription_id)
    resources = await azure.get_resources_by_resource_groups([resource_group])
    clusters = [r for r in resources if 'managedclusters' in r.type.lower()]
    
    print(f"Found {len(clusters)} clusters")
    
    if clusters:
        aks = AKSService(subscription_id)
        ns = await aks.list_cluster_namespaces(clusters[0])
        print(f"Namespaces: {len(ns)}")
        if ns:
            print(f"First 5: {ns[:5]}")

if __name__ == "__main__":
    asyncio.run(test())

