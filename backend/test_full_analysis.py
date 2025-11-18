"""Test full analysis to see how many components are identified."""
import asyncio
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from app.services.azure_service import AzureService
from app.services.aks_service import AKSService
from app.services.temenos_service import TemenosService
from app.api.deployment import _deduplicate_components

async def test():
    subscription_id = "58a91cf0-0f39-45fd-a63e-5a9a28c7072b"
    resource_group = "modulartest3"
    
    print("=" * 60)
    print("Testing Full Temenos Component Analysis")
    print("=" * 60)
    
    # Get resources
    azure_service = AzureService(subscription_id)
    resources = await azure_service.get_resources_by_resource_groups([resource_group])
    print(f"\n1. Found {len(resources)} Azure resources")
    
    # Discover AKS pods
    aks_service = AKSService(subscription_id)
    aks_pods = await aks_service.discover_pods_from_resources(resources)
    print(f"2. Found {len(aks_pods)} AKS pods")
    
    if not aks_pods:
        print("ERROR: No pods found!")
        return
    
    # Group by namespace
    namespaces = {}
    for pod in aks_pods:
        ns = pod.properties.get("namespace", "unknown")
        if ns not in namespaces:
            namespaces[ns] = []
        namespaces[ns].append(pod.properties.get("pod_name", pod.name))
    
    print(f"\n3. Pods across {len(namespaces)} namespaces:")
    for ns, pods in sorted(namespaces.items()):
        print(f"   {ns}: {len(pods)} pods")
    
    # Analyze all pods
    print(f"\n4. Analyzing all {len(aks_pods)} pods...")
    temenos_service = TemenosService()
    try:
        results = await temenos_service.analyze_services(aks_pods)
        if results is None:
            print("   ERROR: analyze_services returned None")
            return
        
        identified = [r for r in results if r.component_info]
        print(f"   Identified {len(identified)} components from analysis")
    except Exception as e:
        print(f"   ERROR during analysis: {e}")
        import traceback
        traceback.print_exc()
        return
    
    # Deduplicate
    print(f"\n5. Deduplicating components...")
    deduplicated = _deduplicate_components(results)
    final_components = [r for r in deduplicated if r.component_info]
    
    print(f"   Final: {len(final_components)} unique Temenos components")
    
    if final_components:
        print(f"\n6. Components identified:")
        for result in final_components:
            ns = result.service.properties.get("namespace", "N/A")
            comp_name = result.component_info.component_name
            comp_type = result.component_info.component_type
            print(f"   - {comp_name} ({comp_type})")
            print(f"     Namespace: {ns}")
    else:
        print("\n   WARNING: No components identified!")
    
    print("\n" + "=" * 60)

if __name__ == "__main__":
    asyncio.run(test())

