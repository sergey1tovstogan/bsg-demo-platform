"""
Deployment API Endpoints

Provides Azure deployment analysis endpoints.
"""

from fastapi import APIRouter, HTTPException, Depends, Request
from typing import List, Dict, Any, Optional
from pydantic import BaseModel, Field
from app.core.config import Settings, get_settings
from app.core.logging import get_logger
from app.services.azure_service import AzureService, AzureResourceGroup, AzureResource
from app.services.temenos_service import TemenosService, TemenosAnalysisResult
from app.services.aks_service import AKSService
import asyncio
import time

router = APIRouter(prefix="/deployment", tags=["deployment"])
logger = get_logger(__name__)

# Store Azure service instances per subscription
azure_service_cache: Dict[str, AzureService] = {}


class SubscriptionConnectRequest(BaseModel):
    """Request model for Azure subscription connection."""
    subscription_id: str = Field(..., description="Azure subscription ID")


class ResourcesRequest(BaseModel):
    """Request model for getting resources."""
    subscription_id: str = Field(..., description="Azure subscription ID")
    resource_group_names: List[str] = Field(..., description="List of resource group names")


class AnalyzeRequest(BaseModel):
    """Request model for analyzing services."""
    services: List[Dict[str, Any]] = Field(..., description="List of Azure resources")
    analysis_id: Optional[str] = Field(None, description="Analysis ID for progress tracking")


def get_azure_service(subscription_id: str) -> AzureService:
    """Get or create Azure service instance."""
    if subscription_id not in azure_service_cache:
        azure_service_cache[subscription_id] = AzureService(subscription_id)
    return azure_service_cache[subscription_id]


@router.post("/azure/connect")
async def connect_azure_subscription(request: SubscriptionConnectRequest):
    """
    Initialize Azure connection for a subscription.
    
    Args:
        request: Subscription connection request
        
    Returns:
        Connection status
    """
    try:
        subscription_id = request.subscription_id
        
        if not subscription_id:
            raise HTTPException(status_code=400, detail="Subscription ID is required")
        
        # Create or retrieve Azure service instance
        azure_service = get_azure_service(subscription_id)
        
        # Test the connection
        await azure_service.test_connection()
        
        return {
            "status": "success",
            "message": "Connected to Azure subscription",
            "subscriptionId": subscription_id
        }
    except RuntimeError as e:
        error_msg = str(e)
        error_type = "unknown"
        recovery_steps = []
        
        if "authentication" in error_msg.lower() or "credential" in error_msg.lower():
            error_type = "authentication"
            recovery_steps = [
                "Check if Azure CLI is installed: Run `az --version`",
                "Login to Azure: Run `az login`",
                "Verify your login: Run `az account show`",
                "Set the correct subscription: Run `az account set --subscription <subscription-id>`",
                "After logging in, restart the backend server"
            ]
        elif "permission" in error_msg.lower() or "authorization" in error_msg.lower():
            error_type = "permission"
            recovery_steps = [
                "Verify subscription access in Azure Portal",
                "Ensure your account has at least 'Reader' role on the subscription",
                "Check Azure RBAC settings",
                "Contact your Azure administrator to grant permissions"
            ]
        elif "not found" in error_msg.lower() or "subscription" in error_msg.lower():
            error_type = "subscription"
            recovery_steps = [
                f"Verify subscription ID '{subscription_id}' is correct",
                "Check Azure Portal → Subscriptions to confirm the subscription exists",
                "Ensure the subscription is active"
            ]
        else:
            recovery_steps = [
                "Check backend server logs for detailed error information",
                "Verify Azure CLI is installed and logged in",
                "Try restarting the backend server"
            ]
        
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "error": error_msg,
                "errorType": error_type,
                "recoverySteps": recovery_steps
            }
        )
    except Exception as e:
        logger.error(f"Connect error: {e}", exc_info=True)
        error_msg = str(e)
        error_type = type(e).__name__
        
        # Try to extract more information from the error
        recovery_steps = [
            "Check backend server logs for detailed error information",
            "Verify Azure CLI is installed and logged in (run: az login)",
            f"Verify subscription ID '{request.subscription_id}' is correct",
            "Run: az account set --subscription <subscription-id>",
            "Try restarting the backend server"
        ]
        
        # Check if it's an Azure-specific error
        if "azure" in error_msg.lower() or "subscription" in error_msg.lower():
            recovery_steps.insert(0, f"Verify you have access to subscription '{request.subscription_id}' in Azure Portal")
        
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "error": error_msg,
                "errorType": error_type,
                "recoverySteps": recovery_steps
            }
        )


@router.get("/azure/resource-groups")
async def get_resource_groups(subscriptionId: str):
    """
    Get all resource groups for a subscription.
    
    Args:
        subscriptionId: Azure subscription ID
        
    Returns:
        List of resource groups
    """
    try:
        if not subscriptionId:
            raise HTTPException(status_code=400, detail="Subscription ID is required")
        
        azure_service = get_azure_service(subscriptionId)
        resource_groups = await azure_service.get_resource_groups()
        
        return {
            "status": "success",
            "data": [rg.to_dict() for rg in resource_groups],
            "count": len(resource_groups)
        }
    except Exception as e:
        logger.error(f"Error getting resource groups: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "error": str(e),
                "errorType": "unknown",
                "recoverySteps": [
                    "Check backend server logs",
                    "Verify Azure CLI is installed and logged in",
                    "Try restarting the backend server"
                ]
            }
        )


@router.post("/azure/resources")
async def get_resources(request: ResourcesRequest):
    """
    Get all resources (services) in selected resource groups.
    
    Args:
        request: Resources request
        
    Returns:
        List of resources
    """
    try:
        subscription_id = request.subscription_id
        resource_group_names = request.resource_group_names
        
        if not subscription_id:
            raise HTTPException(status_code=400, detail="Subscription ID is required")
        
        if not resource_group_names or len(resource_group_names) == 0:
            raise HTTPException(
                status_code=400,
                detail="At least one resource group name is required"
            )
        
        azure_service = get_azure_service(subscription_id)
        resources = await azure_service.get_resources_by_resource_groups(resource_group_names)
        
        # Discover pods from AKS clusters
        try:
            logger.info(f"Starting AKS pod discovery for {len(resources)} resources...")
            aks_service = AKSService(subscription_id)
            # Don't filter by specific namespaces - let auto-detection find all Temenos namespaces
            # This will discover: eventstore, adapterservice, genericconfig, holdings, partyv2, transact, etc.
            aks_pods = await aks_service.discover_pods_from_resources(resources, temenos_namespaces=None)
            
            if aks_pods:
                logger.info(f"✓ Successfully discovered {len(aks_pods)} AKS pods from Temenos namespaces")
                logger.info(f"Sample pod namespaces: {list(set([p.properties.get('namespace', 'unknown') for p in aks_pods[:5]]))}")
                resources.extend(aks_pods)
                logger.info(f"Total resources after adding pods: {len(resources)}")
            else:
                logger.warning("⚠ No AKS pods discovered - this might indicate:")
                logger.warning("  1. No AKS clusters found in resource groups")
                logger.warning("  2. AKS discovery failed (check logs above)")
                logger.warning("  3. No Temenos namespaces found in clusters")
        except Exception as e:
            logger.error(f"❌ Failed to discover AKS pods: {e}", exc_info=True)
            # Don't fail the whole request if AKS discovery fails
        
        return {
            "status": "success",
            "data": [r.to_dict() for r in resources],
            "count": len(resources)
        }
    except Exception as e:
        logger.error(f"Error getting resources: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "error": str(e),
                "errorType": "unknown",
                "recoverySteps": [
                    "Check backend server logs",
                    "Verify Azure CLI is installed and logged in",
                    "Try restarting the backend server"
                ]
            }
        )


@router.post("/temenos/analyze")
async def analyze_services(request: AnalyzeRequest):
    """
    Analyze Azure services and identify Temenos components.
    
    Args:
        request: Analysis request
        
    Returns:
        Analysis results
    """
    try:
        services_data = request.services
        analysis_id = request.analysis_id or f"analysis_{int(time.time() * 1000)}"
        
        if not services_data or len(services_data) == 0:
            raise HTTPException(
                status_code=400,
                detail="Services array is required"
            )
        
        # Convert dicts to AzureResource objects
        services = []
        for svc_data in services_data:
            services.append(AzureResource(
                id=svc_data.get("id", ""),
                name=svc_data.get("name", ""),
                resource_type=svc_data.get("type", ""),
                location=svc_data.get("location", ""),
                resource_group=svc_data.get("resourceGroup", ""),
                tags=svc_data.get("tags", {}),
                properties=svc_data.get("properties", {})
            ))
        
        # Log what we're analyzing
        pod_count = sum(1 for s in services if "managedclusters/pods" in s.type.lower())
        logger.info(f"Analyzing {len(services)} services ({pod_count} AKS pods, {len(services) - pod_count} Azure resources)")
        if pod_count > 0:
            pod_namespaces = list(set([s.properties.get("namespace", "unknown") for s in services if "managedclusters/pods" in s.type.lower()]))
            logger.info(f"Pod namespaces: {pod_namespaces}")
        
        # Initialize Temenos service
        temenos_service = TemenosService()
        
        # Analyze services
        results = await temenos_service.analyze_services(services)
        
        # Deduplicate components (simplified version)
        deduplicated_results = _deduplicate_components(results)
        
        return {
            "status": "success",
            "data": [r.to_dict() for r in deduplicated_results],
            "count": len(deduplicated_results),
            "processed": len(services),
            "analysisId": analysis_id
        }
    except Exception as e:
        logger.error(f"Analysis error: {e}")
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "error": str(e),
                "serviceCount": len(request.services) if request.services else 0
            }
        )


def _deduplicate_components(results: List[TemenosAnalysisResult]) -> List[TemenosAnalysisResult]:
    """
    Deduplicate components by grouping services with the same normalized component name.
    For AKS pods, group by namespace/component rather than individual pod names.
    """
    component_map: Dict[str, TemenosAnalysisResult] = {}
    unidentified: List[TemenosAnalysisResult] = []
    
    for result in results:
        if not result.component_info:
            unidentified.append(result)
            continue
        
        # Use normalized component name for grouping (not the individual service/pod name)
        # This groups all pods from the same namespace/component together
        normalized_name = result.component_info.component_name
        
        # For AKS pods, also consider namespace for better grouping
        if "managedclusters/pods" in result.service.type.lower():
            namespace = result.service.properties.get("namespace", "")
            if namespace:
                # Use namespace as the grouping key for pods
                # This ensures all pods from the same namespace are grouped as one component
                grouping_key = f"{normalized_name}::{namespace}"
            else:
                grouping_key = normalized_name
        else:
            grouping_key = normalized_name
        
        existing = component_map.get(grouping_key)
        
        if not existing:
            component_map[grouping_key] = result
        else:
            # Merge services - add related services list
            # Keep the first result but note that there are multiple instances
            if result.service.name not in existing.component_info.related_services:
                existing.component_info.related_services.append(result.service.name)
    
    # Return identified components first, then unidentified
    identified = list(component_map.values())
    logger.info(f"Deduplication: {len(identified)} unique components from {len(results)} results")
    return identified + unidentified


@router.get("/temenos/health")
async def temenos_health():
    """Health check for Temenos API."""
    try:
        temenos_service = TemenosService()
        # Simple check - verify JWT token is set
        if not temenos_service.jwt_token:
            raise HTTPException(status_code=500, detail="RAG_JWT_TOKEN not configured")
        
        return {
            "status": "success",
            "message": "Temenos service is available"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/temenos/query")
async def query_rag(request: Dict[str, Any]):
    """
    Query Temenos RAG API directly.
    
    Args:
        request: Query request with question, region, RAGmodelId, and optional context
        
    Returns:
        RAG API response
    """
    try:
        question = request.get("question")
        region = request.get("region", "global")
        rag_model_id = request.get("RAGmodelId")
        context = request.get("context")
        
        if not question or not rag_model_id:
            raise HTTPException(
                status_code=400,
                detail="question and RAGmodelId are required"
            )
        
        temenos_service = TemenosService()
        result = await temenos_service.query_rag(
            question=question,
            region=region,
            rag_model_id=rag_model_id,
            context=context
        )
        
        return {
            "status": "success",
            "data": result.get("data", result)
        }
    except Exception as e:
        logger.error(f"RAG query error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "error": str(e)
            }
        )

