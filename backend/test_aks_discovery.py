"""
Test script to verify AKS discovery is working.
Run this to debug why Temenos components aren't being detected.
"""
import asyncio
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.azure_service import AzureService
from app.services.aks_service import AKSService
from app.services.temenos_service import TemenosService
from app.core.config import settings

async def test_aks_discovery():
    """Test AKS discovery for modulartest3 resource group."""
    subscription_id = "58a91cf0-0f39-45fd-a63e-5a9a28c7072b"
    resource_group = "modulartest3"
    
    print("=" * 60)
    print("Testing AKS Discovery for modulartest3")
    print("=" * 60)
    
    try:
        # Step 1: Get Azure resources
        print("\n1. Getting Azure resources...")
        azure_service = AzureService(subscription_id)
        resources = await azure_service.get_resources_by_resource_groups([resource_group])
        print(f"   Found {len(resources)} Azure resources")
        
        # Step 2: Discover AKS pods
        print("\n2. Discovering AKS pods...")
        aks_service = AKSService(subscription_id)
        aks_pods = await aks_service.discover_pods_from_resources(resources, temenos_namespaces=None)
        print(f"   Found {len(aks_pods)} AKS pods")
        
        if aks_pods:
            # Group by namespace (aks_pods are now AzureResource objects)
            namespaces = {}
            for pod_resource in aks_pods:
                ns = pod_resource.properties.get("namespace", "unknown")
                pod_name = pod_resource.properties.get("pod_name", pod_resource.name)
                if ns not in namespaces:
                    namespaces[ns] = []
                namespaces[ns].append(pod_name)
            
            print(f"\n   Pods by namespace:")
            for ns, pods in namespaces.items():
                print(f"     {ns}: {len(pods)} pods")
            
            # Step 3: Pods are already AzureResource objects
            print("\n3. Pods are already AzureResource objects...")
            azure_resources = aks_pods
            print(f"   Ready to analyze {len(azure_resources)} pods")
            
            # Check namespace in properties
            print("\n4. Checking namespace in properties...")
            for res in azure_resources[:5]:  # Check first 5
                ns = res.properties.get("namespace", "NOT FOUND")
                pod_name = res.properties.get("pod_name", res.name)
                print(f"   {pod_name} (namespace: {ns})")
            
            # Step 4: Test Temenos component detection
            print("\n5. Testing Temenos component detection...")
            temenos_service = TemenosService()
            
            # Test if pods pass the filter
            potential = [r for r in azure_resources if temenos_service._is_potential_temenos_component(r)]
            print(f"   {len(potential)}/{len(azure_resources)} pods pass potential component filter")
            
            if potential:
                print("\n   Testing component name extraction...")
                for res in potential[:3]:  # Test first 3
                    extracted = temenos_service._extract_component_name(res)
                    if extracted:
                        print(f"   {res.name}: {extracted['normalizedName']}")
                    else:
                        print(f"   {res.name}: Could not extract component name")
            
            # Step 5: Full analysis
            print("\n6. Running full analysis...")
            results = await temenos_service.analyze_services(azure_resources[:5])  # Analyze first 5
            identified = [r for r in results if r.component_info]
            print(f"   Identified {len(identified)} components from {len(results)} results")
            
            if identified:
                print("\n   Identified components:")
                for result in identified:
                    print(f"     - {result.component_info.component_name}")
            else:
                print("\n   ⚠ No components identified!")
                print("   Check logs above for reasons")
        else:
            print("\n   ⚠ No AKS pods discovered!")
            print("   This might indicate:")
            print("     - No AKS clusters in resource group")
            print("     - AKS discovery failed (check errors above)")
            print("     - No Temenos namespaces found")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(test_aks_discovery())

