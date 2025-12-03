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
from app.services.cost_service import CostService
import asyncio
import time
from datetime import datetime, timedelta

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
    selected_namespaces: Optional[List[str]] = Field(None, description="Selected AKS namespaces to analyze")
    force_refresh: Optional[bool] = Field(False, description="Force refresh RAG queries even if cached")


class NamespacesRequest(BaseModel):
    """Request model for getting AKS namespaces."""
    subscription_id: str = Field(..., description="Azure subscription ID")
    resource_group_names: List[str] = Field(..., description="List of resource group names")
    refresh: bool = Field(False, description="Force refresh, bypass cache")


class ClusterDiagnosticsRequest(BaseModel):
    """Request model for AKS cluster diagnostics."""
    subscription_id: str = Field(..., description="Azure subscription ID")
    resource_group: str = Field(..., description="Resource group name")
    cluster_name: str = Field(..., description="AKS cluster name")


class CostRequest(BaseModel):
    """Request model for getting costs."""
    subscription_id: str = Field(..., description="Azure subscription ID")
    resource_group_names: List[str] = Field(..., description="List of resource group names")
    start_date: Optional[str] = Field(None, description="Start date in ISO format (YYYY-MM-DD). Defaults to first day of current month")
    end_date: Optional[str] = Field(None, description="End date in ISO format (YYYY-MM-DD). Defaults to current date")


class CloudLogsAnalyzeRequest(BaseModel):
    """Request model for cloud logs analysis."""
    platform: str = Field(..., description="Platform: 'aks' or 'aca'")
    component_name: str = Field(..., description="Temenos component name (e.g. transact-app, transact-web, irf-provider)")
    environment: str = Field(..., description="Environment description (e.g. zkb_poc, dev, test)")
    log_snippet: str = Field(..., description="Log snippet to analyze (max a few hundred lines)")
    symptoms: Optional[str] = Field(None, description="Optional symptoms (e.g. COB hangs, API 500s, CrashLoopBackOff)")
    recent_changes: Optional[str] = Field(None, description="Optional recent changes (deploy, Helm values, DB password, scaling, etc.)")
    resource_group: Optional[str] = Field(None, description="Azure resource group name")
    subscription_id: Optional[str] = Field(None, description="Azure subscription ID")


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
        try:
            azure_service = get_azure_service(subscription_id)
        except Exception as init_error:
            logger.error(f"Failed to initialize Azure service: {init_error}", exc_info=True)
            error_msg = str(init_error)
            error_type = type(init_error).__name__
            
            # Provide specific guidance for initialization errors
            recovery_steps = [
                "Check if Azure CLI is installed: Run `az --version`",
                "Login to Azure: Run `az login` or `az login --use-device-code`",
                "Verify your login: Run `az account show`",
                f"Set the correct subscription: Run `az account set --subscription {subscription_id}`",
                "For Azure App Service: Ensure Managed Identity is enabled or Service Principal credentials are configured",
                "After configuration, restart the backend server"
            ]
            
            raise HTTPException(
                status_code=500,
                detail={
                    "status": "error",
                    "error": f"Failed to initialize Azure service: {error_msg}",
                    "errorType": error_type,
                    "recoverySteps": recovery_steps
                }
            )
        
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
            # Check if running in Azure App Service
            import os
            is_azure_app_service = os.getenv("WEBSITE_SITE_NAME") is not None
            
            if is_azure_app_service:
                recovery_steps = [
                    "Enable Managed Identity for the App Service in Azure Portal",
                    "Grant the Managed Identity 'Reader' role on the subscription",
                    "OR configure Service Principal credentials in App Settings:",
                    "  - AZURE_CLIENT_ID",
                    "  - AZURE_CLIENT_SECRET", 
                    "  - AZURE_TENANT_ID",
                    "Restart the App Service after configuration"
                ]
            else:
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
async def get_resource_groups(subscriptionId: str, refresh: bool = False):
    """
    Get all resource groups for a subscription.
    
    Args:
        subscriptionId: Azure subscription ID
        refresh: If True, bypass cache and fetch fresh data
        
    Returns:
        List of resource groups
    """
    try:
        if not subscriptionId:
            raise HTTPException(status_code=400, detail="Subscription ID is required")
        
        # Check cache first unless refresh is requested
        from app.services.cache_service import get_cache_service
        cache_service = await get_cache_service()
        cached_resource_groups = None
        if not refresh:
            cached_resource_groups = await cache_service.get_azure_resource_groups(subscriptionId)
            if cached_resource_groups:
                logger.info(f"Using cached resource groups for subscription {subscriptionId}")
                return {
                    "status": "success",
                    "data": cached_resource_groups,
                    "count": len(cached_resource_groups),
                    "cached": True
                }
        
        # Fetch fresh data
        azure_service = get_azure_service(subscriptionId)
        resource_groups = await azure_service.get_resource_groups()
        resource_groups_dict = [rg.to_dict() for rg in resource_groups]
        
        # Cache the results
        await cache_service.set_azure_resource_groups(subscriptionId, resource_groups_dict)
        logger.info(f"Cached {len(resource_groups_dict)} resource groups for subscription {subscriptionId}")
        
        return {
            "status": "success",
            "data": resource_groups_dict,
            "count": len(resource_groups_dict),
            "cached": False
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


@router.post("/aks/namespaces")
async def get_aks_namespaces(request: NamespacesRequest):
    """
    Get all namespaces from AKS clusters in the specified resource groups.
    
    Args:
        request: Namespaces request with subscription ID and resource group names
        
    Returns:
        List of namespaces grouped by cluster
    """
    # CRITICAL: Use both logger AND print for visibility
    print("=" * 80)
    print("=== API ENDPOINT CALLED: /aks/namespaces ===")
    print(f"Request subscription_id: {request.subscription_id}")
    print(f"Request resource_group_names: {request.resource_group_names}")
    print("=" * 80)
    logger.info("=" * 80)
    logger.info("=== API ENDPOINT CALLED: /aks/namespaces ===")
    logger.info(f"Request subscription_id: {request.subscription_id}")
    logger.info(f"Request resource_group_names: {request.resource_group_names}")
    logger.info("=" * 80)
    
    try:
        subscription_id = request.subscription_id
        resource_group_names = request.resource_group_names
        
        logger.info(f"Step 1: Validating request...")
        
        if not subscription_id:
            raise HTTPException(status_code=400, detail="Subscription ID is required")
        
        if not resource_group_names or len(resource_group_names) == 0:
            raise HTTPException(
                status_code=400,
                detail="At least one resource group name is required"
            )
        
        azure_service = get_azure_service(subscription_id)
        resources = await azure_service.get_resources_by_resource_groups(resource_group_names)
        
        # Find AKS clusters
        logger.info(f"Searching for AKS clusters in {len(resources)} resources...")
        aks_clusters = [
            r for r in resources 
            if "microsoft.containerservice/managedclusters" in r.type.lower()
        ]
        
        logger.info(f"Found {len(aks_clusters)} AKS cluster(s)")
        for cluster in aks_clusters:
            logger.info(f"  - Cluster: {cluster.name}, Type: {cluster.type}, RG: {cluster.resource_group}")
        
        if not aks_clusters:
            logger.warning("No AKS clusters found in selected resource groups")
            return {
                "status": "success",
                "data": [],
                "message": "No AKS clusters found in selected resource groups"
            }
        
        # Check cache for AKS namespaces first (unless refresh is requested)
        from app.services.cache_service import get_cache_service
        cache_service = await get_cache_service()
        
        if not request.refresh:
            cached_namespaces = await cache_service.get_aks_namespaces(subscription_id, resource_group_names)
            if cached_namespaces:
                logger.info(f"Using cached AKS namespaces for {len(resource_group_names)} resource groups")
                return {
                    "status": "success",
                    "data": cached_namespaces,
                    "count": len(cached_namespaces)
                }
        else:
            logger.info(f"Refresh requested, bypassing cache and clearing old cache for AKS namespaces")
            # Clear cache for these resource groups to ensure fresh data
            try:
                # Generate the same cache key that would be used for this request
                cache_key = cache_service._generate_cache_key(
                    "aks_namespaces",
                    subscription_id=subscription_id,
                    resource_groups=",".join(sorted(resource_group_names))
                )
                deleted = await cache_service.delete(cache_key)
                if deleted:
                    logger.info(f"✓ Cleared cache for key: {cache_key}")
                else:
                    logger.info(f"No cache entry found for key: {cache_key} (will fetch fresh data)")
            except Exception as e:
                logger.warning(f"Failed to clear cache (non-fatal, will continue with fresh fetch): {e}")
        
        # Get namespaces from each cluster
        logger.info(f"Initializing AKS service for subscription: {subscription_id}")
        aks_service = AKSService(subscription_id)
        cluster_namespaces = {}
        
        logger.info(f"Step 4: Processing {len(aks_clusters)} cluster(s) for namespace discovery...")
        logger.info(f"Selected resource groups: {resource_group_names}")
        logger.info(f"AKS clusters found: {[c.name for c in aks_clusters]}")
        
        for idx, cluster in enumerate(aks_clusters, 1):
            # CRITICAL: Only process clusters that are in the selected resource groups
            if cluster.resource_group not in resource_group_names:
                logger.warning(f"Skipping cluster {cluster.name} - not in selected resource groups. Cluster RG: {cluster.resource_group}, Selected RGs: {resource_group_names}")
                continue
                
            try:
                logger.info("=" * 80)
                logger.info(f"=== CLUSTER {idx}/{len(aks_clusters)}: {cluster.name} ===")
                logger.info(f"Cluster type: {cluster.type}")
                logger.info(f"Cluster ID: {cluster.id}")
                logger.info(f"Resource Group: {cluster.resource_group}")
                logger.info(f"Verifying cluster is in selected RGs: {resource_group_names}")
                logger.info("Calling aks_service.list_cluster_namespaces()...")
                logger.info("=" * 80)
                
                # Dynamically retrieve namespaces from the actual cluster
                namespaces = await aks_service.list_cluster_namespaces(cluster)
                logger.info(f"✓ Got {len(namespaces)} namespaces from cluster {cluster.name} in RG {cluster.resource_group}")
                if namespaces:
                    logger.info(f"Namespaces retrieved from cluster {cluster.name}: {namespaces}")
                else:
                    logger.error(f"⚠ CRITICAL: No namespaces returned for cluster {cluster.name} in RG {cluster.resource_group}")
                    logger.error("This indicates one of the following issues:")
                    logger.error("  1. kubectl command failed (check backend logs for kubectl errors)")
                    logger.error("  2. Cluster credentials not configured or expired")
                    logger.error("  3. Cluster has no non-system namespaces (unlikely)")
                    logger.error("  4. Network/connectivity issues to the cluster")
                    logger.error("  5. Insufficient permissions to list namespaces")
                    
                    # Build detailed error message with actionable steps
                    error_details = {
                        "message": "Failed to retrieve namespaces from cluster",
                        "cluster": cluster.name,
                        "resource_group": cluster.resource_group,
                        "troubleshooting_steps": [
                            "1. Check if you're logged in to Azure CLI: `az account show`",
                            f"2. Refresh cluster credentials: `az aks get-credentials --resource-group {cluster.resource_group} --name {cluster.name} --overwrite-existing`",
                            "3. Verify kubectl can connect: `kubectl cluster-info`",
                            "4. Check backend logs for detailed kubectl error messages",
                            "5. Ensure you have 'Azure Kubernetes Service Cluster User Role' on the cluster"
                        ],
                        "for_azure_app_service": [
                            "1. Verify Managed Identity has 'Azure Kubernetes Service Cluster User Role' on the AKS cluster",
                            "2. Check App Service logs for startup.sh execution",
                            "3. Verify kubectl was installed by startup.sh",
                            "4. Check if Kubernetes Python client library is available"
                        ]
                    }
                    
                    # Return error so frontend knows retrieval failed
                    cluster_namespaces[cluster.name] = {
                        "cluster_name": cluster.name,
                        "resource_group": cluster.resource_group,
                        "namespaces": [],
                        "error": f"Failed to retrieve namespaces from cluster '{cluster.name}'. Check backend logs for kubectl errors. Ensure cluster credentials are configured (run: az aks get-credentials --resource-group {cluster.resource_group} --name {cluster.name} --overwrite-existing).",
                        "error_details": error_details
                    }
                    continue
                
                cluster_namespaces[cluster.name] = {
                    "cluster_name": cluster.name,
                    "resource_group": cluster.resource_group,
                    "namespaces": namespaces
                }
                
                if len(namespaces) == 0:
                    logger.warning(f"No namespaces found for cluster {cluster.name}. This might indicate:")
                    logger.warning("  1. kubectl is not installed or not in PATH")
                    logger.warning("  2. Kubernetes Python client failed and kubectl fallback also failed")
                    logger.warning("  3. Cluster credentials are not configured (run: az aks get-credentials)")
                    logger.warning("  4. No non-system namespaces exist in the cluster")
                    logger.warning("  5. Backend is running in Azure App Service and kubectl installation failed")
                    logger.warning("  Note: In Azure App Service, kubectl should be installed by startup.sh")
                    logger.warning("  Check App Service logs for startup.sh execution and kubectl installation")
                    logger.warning("  Also check if Managed Identity has permissions to access AKS cluster")
            except Exception as e:
                logger.error(f"Error getting namespaces from cluster {cluster.name}: {e}", exc_info=True)
                import traceback
                error_trace = traceback.format_exc()
                logger.error(f"Full traceback: {error_trace}")
                
                # Build detailed error message
                error_message = str(e)
                if "kubectl" in error_message.lower() or "kubeconfig" in error_message.lower():
                    error_message = f"kubectl/kubeconfig error: {error_message}"
                elif "credential" in error_message.lower() or "authentication" in error_message.lower():
                    error_message = f"Authentication error: {error_message}. Try refreshing credentials: az aks get-credentials --resource-group {cluster.resource_group} --name {cluster.name} --overwrite-existing"
                
                cluster_namespaces[cluster.name] = {
                    "cluster_name": cluster.name,
                    "resource_group": cluster.resource_group,
                    "namespaces": [],
                    "error": f"Failed to retrieve namespaces: {error_message}",
                    "error_details": {
                        "message": error_message,
                        "cluster": cluster.name,
                        "resource_group": cluster.resource_group,
                        "troubleshooting_steps": [
                            f"1. Refresh credentials: `az aks get-credentials --resource-group {cluster.resource_group} --name {cluster.name} --overwrite-existing`",
                            "2. Verify Azure CLI login: `az account show`",
                            "3. Check backend logs for full error details",
                            "4. Test kubectl manually: `kubectl get namespaces`"
                        ]
                    }
                }
        
        result_data = list(cluster_namespaces.values())
        
        # Check if we have any successful retrievals
        successful_clusters = [c for c in result_data if c.get("namespaces") and len(c.get("namespaces", [])) > 0]
        failed_clusters = [c for c in result_data if c.get("error") or not c.get("namespaces") or len(c.get("namespaces", [])) == 0]
        
        if failed_clusters:
            logger.error(f"⚠ {len(failed_clusters)} cluster(s) failed to retrieve namespaces:")
            for fc in failed_clusters:
                logger.error(f"  - Cluster: {fc.get('cluster_name')}, RG: {fc.get('resource_group')}, Error: {fc.get('error', 'No namespaces found')}")
        
        # Only cache if we successfully retrieved namespaces (don't cache empty/error results)
        if successful_clusters:
            await cache_service.set_aks_namespaces(
                subscription_id,
                resource_group_names,
                successful_clusters  # Only cache successful retrievals
            )
            logger.info(f"Cached AKS namespaces for {len(successful_clusters)} successful cluster(s)")
        else:
            logger.error(f"⚠ CRITICAL: No namespaces retrieved from any cluster! Not caching.")
            logger.error(f"All {len(result_data)} cluster(s) failed. Check backend logs for kubectl errors.")
        
        # Return all results (including errors) so frontend can show appropriate messages
        return {
            "status": "success" if successful_clusters else "partial" if result_data else "error",
            "data": result_data,
            "count": len(result_data),
            "successful_clusters": len(successful_clusters),
            "failed_clusters": len(failed_clusters)
        }
        
        return {
            "status": "success",
            "data": result_data,
            "count": len(cluster_namespaces)
        }
    except Exception as e:
            logger.error(f"Error getting AKS namespaces: {e}", exc_info=True)
            import traceback
            error_detail = {
                "status": "error",
                "error": str(e),
                "traceback": traceback.format_exc()
            }
            logger.error(f"Full traceback: {traceback.format_exc()}")
            raise HTTPException(
                status_code=500,
                detail=error_detail
            )


@router.post("/aks/diagnostics")
async def diagnose_aks_cluster(request: ClusterDiagnosticsRequest):
    """
    Diagnose AKS cluster connection and namespace discovery issues.
    
    This endpoint helps troubleshoot why namespace discovery might be failing.
    
    Args:
        request: Cluster diagnostics request with subscription ID, resource group, and cluster name
        
    Returns:
        Diagnostic information about the cluster connection
    """
    logger.info("=" * 80)
    logger.info("=== AKS CLUSTER DIAGNOSTICS ===")
    logger.info(f"Cluster: {request.cluster_name}")
    logger.info(f"Resource Group: {request.resource_group}")
    logger.info(f"Subscription: {request.subscription_id}")
    logger.info("=" * 80)
    
    try:
        # Initialize AKS service
        aks_service = AKSService(request.subscription_id)
        
        # Test cluster connection
        logger.info("Running connection test...")
        connection_test = await aks_service.test_cluster_connection(
            request.resource_group,
            request.cluster_name
        )
        
        # Try to get namespaces
        logger.info("Attempting to list namespaces...")
        from app.services.azure_service import AzureResource
        cluster_resource = AzureResource(
            id=f"/subscriptions/{request.subscription_id}/resourceGroups/{request.resource_group}/providers/Microsoft.ContainerService/managedClusters/{request.cluster_name}",
            name=request.cluster_name,
            resource_type="Microsoft.ContainerService/managedClusters",
            location="",
            resource_group=request.resource_group,
            tags={},
            properties={}
        )
        
        namespaces = []
        namespace_error = None
        try:
            namespaces = await aks_service.list_cluster_namespaces(cluster_resource)
        except Exception as e:
            namespace_error = str(e)
            logger.error(f"Failed to list namespaces: {e}", exc_info=True)
        
        # Compile diagnostics
        diagnostics = {
            "cluster_name": request.cluster_name,
            "resource_group": request.resource_group,
            "subscription_id": request.subscription_id,
            "connection_test": connection_test,
            "namespaces_found": len(namespaces),
            "namespaces": namespaces,
            "namespace_error": namespace_error,
            "is_azure_app_service": aks_service.is_azure_app_service,
            "recommendations": []
        }
        
        # Add recommendations based on diagnostics
        if not connection_test.get("can_get_kubeconfig"):
            diagnostics["recommendations"].append({
                "issue": "Cannot get kubeconfig from Azure API",
                "solution": "Assign 'Azure Kubernetes Service Cluster User Role' to the App Service Managed Identity on the AKS cluster",
                "steps": [
                    "1. Go to Azure Portal → AKS cluster → Access control (IAM)",
                    "2. Click 'Add role assignment'",
                    "3. Select role: 'Azure Kubernetes Service Cluster User Role'",
                    "4. Assign to: Managed Identity → Select your App Service",
                    "5. Save and wait 1-2 minutes for propagation"
                ]
            })
        
        if not connection_test.get("kubectl_available"):
            diagnostics["recommendations"].append({
                "issue": "kubectl not available",
                "solution": "kubectl should be installed by startup.sh - check App Service logs",
                "steps": [
                    "1. Check App Service logs for startup.sh execution",
                    "2. Verify kubectl installation in startup.sh",
                    "3. Check if startup.sh has execute permissions"
                ]
            })
        
        if not connection_test.get("kubernetes_client_available"):
            diagnostics["recommendations"].append({
                "issue": "Kubernetes Python client not available",
                "solution": "Install kubernetes package: pip install kubernetes",
                "steps": [
                    "1. Check requirements.txt includes 'kubernetes==28.1.0'",
                    "2. Verify pip install completed successfully",
                    "3. Check App Service build logs"
                ]
            })
        
        if len(namespaces) == 0 and not namespace_error:
            diagnostics["recommendations"].append({
                "issue": "No namespaces found (but connection succeeded)",
                "solution": "Cluster may only have system namespaces, or all namespaces are filtered out",
                "steps": [
                    "1. Verify cluster has non-system namespaces",
                    "2. Check if namespaces exist: kubectl get namespaces",
                    "3. System namespaces (kube-system, kube-public, default) are excluded"
                ]
            })
        
        if namespace_error:
            diagnostics["recommendations"].append({
                "issue": f"Namespace discovery failed: {namespace_error}",
                "solution": "Check the error message and follow recommendations above",
                "steps": [
                    "1. Verify Managed Identity permissions",
                    "2. Check kubectl installation",
                    "3. Review App Service logs for detailed error messages"
                ]
            })
        
        return {
            "status": "success",
            "diagnostics": diagnostics
        }
        
    except Exception as e:
        logger.error(f"Error running diagnostics: {e}", exc_info=True)
        import traceback
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "error": str(e),
                "traceback": traceback.format_exc()
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
        
        # Check cache first
        from app.services.cache_service import get_cache_service
        cache_service = await get_cache_service()
        
        cached_resources = await cache_service.get_azure_resources(subscription_id, resource_group_names)
        if cached_resources:
            logger.info(f"Using cached Azure resources for {len(resource_group_names)} resource groups")
            # Convert cached resources (which have 'type') to AzureResource (which expects 'resource_type')
            resources = []
            for r in cached_resources:
                # Map 'type' to 'resource_type' for AzureResource constructor
                resource_dict = r.copy()
                if 'type' in resource_dict and 'resource_type' not in resource_dict:
                    resource_dict['resource_type'] = resource_dict.pop('type')
                # Also map 'resourceGroup' to 'resource_group' if needed
                if 'resourceGroup' in resource_dict and 'resource_group' not in resource_dict:
                    resource_dict['resource_group'] = resource_dict.pop('resourceGroup')
                # Remove fields that are not in AzureResource constructor (like portalUrl)
                resource_dict_clean = {
                    'id': resource_dict.get('id', ''),
                    'name': resource_dict.get('name', ''),
                    'resource_type': resource_dict.get('type', resource_dict.get('resource_type', '')),
                    'location': resource_dict.get('location', ''),
                    'resource_group': resource_dict.get('resource_group', ''),
                    'tags': resource_dict.get('tags', {}),
                    'properties': resource_dict.get('properties', {})
                }
                resources.append(AzureResource(**resource_dict_clean))
        else:
            azure_service = get_azure_service(subscription_id)
            resources = await azure_service.get_resources_by_resource_groups(resource_group_names)
            # Cache the resources
            await cache_service.set_azure_resources(
                subscription_id,
                resource_group_names,
                [r.to_dict() for r in resources]
            )
            logger.info(f"Cached {len(resources)} Azure resources")
        
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
    """Analyze Azure services for Temenos components (uses cache by default)."""
    return await _analyze_services_impl(request)


@router.post("/temenos/analyze/refresh")
async def refresh_analysis(request: AnalyzeRequest):
    """Refresh analysis - forces RAG queries even if cached."""
    request.force_refresh = True
    return await _analyze_services_impl(request)


async def _analyze_services_impl(request: AnalyzeRequest):
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
        
        # Discover AKS pods from ALL Temenos namespaces (not just selected ones)
        # This ensures we find all pods, then we can filter if needed
        selected_namespaces = request.selected_namespaces if request.selected_namespaces else None
        
        # Extract subscription ID from first resource
        subscription_id = None
        if services and services[0].id:
            id_parts = services[0].id.split("/")
            if "subscriptions" in id_parts:
                subscription_id = id_parts[id_parts.index("subscriptions") + 1]
        
        if subscription_id:
            try:
                # Find AKS clusters in the resources
                aks_clusters = [s for s in services if "microsoft.containerservice/managedclusters" in s.type.lower()]
                if aks_clusters:
                    aks_service = AKSService(subscription_id)
                    
                    # ALWAYS discover from ALL Temenos namespaces (auto-detection)
                    # This ensures we find all pods regardless of selection
                    logger.info(f"Discovering pods from ALL Temenos namespaces (auto-detection)...")
                    aks_pods = await aks_service.discover_pods_from_resources(services, temenos_namespaces=None)
                    
                    # Log what we found
                    if aks_pods:
                        all_pod_namespaces = list(set([p.properties.get('namespace', 'unknown') for p in aks_pods]))
                        logger.info(f"✓ Discovered pods from {len(all_pod_namespaces)} namespaces: {all_pod_namespaces}")
                        
                        # If namespaces were selected, log which ones match
                        if selected_namespaces and len(selected_namespaces) > 0:
                            matching_namespaces = [ns for ns in all_pod_namespaces if ns in selected_namespaces]
                            logger.info(f"Selected namespaces {selected_namespaces} match {len(matching_namespaces)} discovered namespaces: {matching_namespaces}")
                    
                    if aks_pods:
                        logger.info(f"✓ Successfully discovered {len(aks_pods)} AKS pods")
                        pod_namespaces = list(set([p.properties.get('namespace', 'unknown') for p in aks_pods]))
                        logger.info(f"Pod namespaces found: {pod_namespaces}")
                        services.extend(aks_pods)
                        logger.info(f"Total services after adding pods: {len(services)}")
                    else:
                        logger.warning("No AKS pods discovered")
            except Exception as e:
                logger.error(f"Failed to discover AKS pods: {e}", exc_info=True)
                # Continue with analysis even if AKS discovery fails
        
        # Log what we're analyzing
        pod_count = sum(1 for s in services if "managedclusters/pods" in s.type.lower())
        logger.info(f"Analyzing {len(services)} services ({pod_count} AKS pods, {len(services) - pod_count} Azure resources)")
        if pod_count > 0:
            pod_namespaces = list(set([s.properties.get("namespace", "unknown") for s in services if "managedclusters/pods" in s.type.lower()]))
            logger.info(f"Pod namespaces: {pod_namespaces}")
        
        # Initialize Temenos service
        temenos_service = TemenosService()
        
        # Analyze services (use cache by default, unless force_refresh is True)
        force_refresh = getattr(request, 'force_refresh', False)
        results = await temenos_service.analyze_services(services, use_cache=True, force_refresh=force_refresh)
        
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
        
        # For AKS pods, group by namespace ONLY - all pods in same namespace = one component
        # This way: eventstore namespace = 1 component, adapterservice = 1 component, etc.
        if "managedclusters/pods" in result.service.type.lower():
            namespace = result.service.properties.get("namespace", "")
            if namespace:
                # Use namespace as the PRIMARY grouping key
                # All pods from the same namespace should be grouped as ONE component
                # This ensures: adapterservice (3 pods) = 1 component, eventstore (3 pods) = 1 component
                grouping_key = namespace.lower()  # Use lowercase for consistency
            else:
                # Fallback if namespace not found (shouldn't happen)
                grouping_key = normalized_name
        else:
            # For non-pod resources, use normalized name
            # But exclude infrastructure types
            if any(infra_type in result.service.type.lower() for infra_type in [
                "microsoft.storage", "microsoft.keyvault", "microsoft.network",
                "microsoft.insights", "microsoft.operationalinsights"
            ]):
                # Skip infrastructure resources - they shouldn't be Temenos components
                logger.debug(f"Skipping infrastructure resource: {result.service.name} ({result.service.type})")
                unidentified.append(result)
                continue
            grouping_key = normalized_name
        
        existing = component_map.get(grouping_key)
        
        if not existing:
            component_map[grouping_key] = result
        else:
            # Merge services - add related services list
            # Keep the first result but note that there are multiple instances
            if result.service.name not in existing.component_info.related_services:
                existing.component_info.related_services.append(result.service.name)
    
    # Filter out infrastructure services from unidentified
    # Infrastructure services are not meaningful to show as "Other Azure Services"
    infrastructure_types = [
        "microsoft.storage", "microsoft.keyvault", "microsoft.network",
        "microsoft.insights", "microsoft.operationalinsights", "microsoft.compute/virtualmachines",
        "microsoft.compute/virtualmachinescalesets"
    ]
    
    filtered_unidentified = []
    for result in unidentified:
        resource_type = result.service.type.lower()
        # Skip infrastructure resources
        if any(infra_type in resource_type for infra_type in infrastructure_types):
            logger.debug(f"Filtering out infrastructure resource: {result.service.name} ({result.service.type})")
            continue
        filtered_unidentified.append(result)
    
    # Return identified components first, then filtered unidentified
    identified = list(component_map.values())
    logger.info(f"Deduplication: {len(identified)} unique components from {len(results)} results")
    logger.info(f"Filtered out {len(unidentified) - len(filtered_unidentified)} infrastructure services")
    return identified + filtered_unidentified


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
    except HTTPException:
        # Re-raise HTTP exceptions as-is
        raise
    except ValueError as e:
        # Configuration errors
        logger.error(f"RAG configuration error: {e}", exc_info=True)
        error_detail = f"RAG configuration error: {str(e)}. Please check RAG_JWT_TOKEN and RAG_API_URL environment variables."
        raise HTTPException(
            status_code=500,
            detail=error_detail
        )
    except RuntimeError as e:
        # Runtime errors (e.g., adapter not initialized)
        logger.error(f"RAG runtime error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=str(e)
        )
    except Exception as e:
        # Other exceptions - provide more context
        error_msg = str(e)
        error_type = type(e).__name__
        logger.error(f"RAG query error ({error_type}): {e}", exc_info=True)
        
        # Provide more helpful error messages based on error type
        if "timeout" in error_msg.lower() or "TimeoutException" in error_type:
            error_msg = f"RAG API request timed out. The RAG service may be slow or unavailable. Original error: {error_msg}"
        elif "401" in error_msg or "403" in error_msg or "unauthorized" in error_msg.lower():
            error_msg = f"RAG API authentication failed. Please check RAG_JWT_TOKEN. Original error: {error_msg}"
        elif "connection" in error_msg.lower() or "network" in error_msg.lower():
            error_msg = f"Failed to connect to RAG API. Please check RAG_API_URL and network connectivity. Original error: {error_msg}"
        elif "RAG_JWT_TOKEN" in error_msg or "RAG_API_URL" in error_msg:
            error_msg = f"RAG configuration issue: {error_msg}. Please check environment variables."
        
        raise HTTPException(
            status_code=500,
            detail=f"[{error_type}] {error_msg}"
        )


@router.post("/azure/costs")
async def get_resource_group_costs(request: CostRequest):
    """
    Get cost data for one or more resource groups.
    
    Args:
        request: Cost request with subscription ID and resource group names
        
    Returns:
        List of cost information for each resource group
    """
    try:
        subscription_id = request.subscription_id
        resource_group_names = request.resource_group_names
        
        if not subscription_id:
            raise HTTPException(status_code=400, detail="Subscription ID is required")
        
        if not resource_group_names or len(resource_group_names) == 0:
            raise HTTPException(status_code=400, detail="At least one resource group name is required")
        
        # Parse dates if provided
        start_date = None
        end_date = None
        
        if request.start_date:
            try:
                start_date = datetime.fromisoformat(request.start_date.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid start_date format: {request.start_date}. Use ISO format (YYYY-MM-DD)")
        
        if request.end_date:
            try:
                end_date = datetime.fromisoformat(request.end_date.replace('Z', '+00:00'))
            except ValueError:
                raise HTTPException(status_code=400, detail=f"Invalid end_date format: {request.end_date}. Use ISO format (YYYY-MM-DD)")
        
        # Create cost service
        cost_service = CostService(subscription_id)
        
        # Calculate timeout based on number of resource groups
        # Each resource group takes ~2-3 seconds, plus delays
        # For large batches, increase timeout significantly
        num_rgs = len(resource_group_names)
        if num_rgs > 50:
            timeout_seconds = 300.0  # 5 minutes for 50+ resource groups
        elif num_rgs > 20:
            timeout_seconds = 180.0  # 3 minutes for 20-50 resource groups
        elif num_rgs == 1:
            timeout_seconds = 30.0   # 30 seconds for single resource group
        else:
            timeout_seconds = 60.0   # 60 seconds for small batches (2-20)
        
        logger.info(f"Fetching costs for {num_rgs} resource groups with {timeout_seconds}s timeout")
        
        # Wrap the cost fetching in a timeout
        # Run the synchronous cost service in a thread pool to avoid blocking
        async def fetch_costs_with_timeout():
            loop = asyncio.get_event_loop()
            try:
                # Run the synchronous cost service call in a thread pool
                cost_results = await asyncio.wait_for(
                    loop.run_in_executor(
                        None,
                        cost_service.get_multiple_resource_group_costs,
                        resource_group_names,
                        start_date,
                        end_date
                    ),
                    timeout=timeout_seconds
                )
                return cost_results
            except asyncio.TimeoutError:
                logger.error(f"Cost fetching timed out after {timeout_seconds} seconds for {num_rgs} resource groups")
                # Return error results for all resource groups
                return [
                    {
                        'resource_group': rg_name,
                        'total_cost': 0.0,
                        'services': {},
                        'error': f'Request timed out after {int(timeout_seconds)}s. Cost Management API is taking too long to respond. Try selecting fewer resource groups or try again later.',
                        'start_date': start_date.isoformat() if start_date else None,
                        'end_date': end_date.isoformat() if end_date else None
                    }
                    for rg_name in resource_group_names
                ]
        
        # Get costs for all resource groups with timeout
        cost_results = await fetch_costs_with_timeout()
        
        return {
            "status": "success",
            "data": cost_results,
            "count": len(cost_results)
        }
        
    except HTTPException:
        raise
    except asyncio.TimeoutError:
        logger.error("Cost fetching timed out at endpoint level")
        raise HTTPException(
            status_code=504,
            detail={
                "status": "error",
                "error": "Request timed out. Cost Management API is taking too long to respond.",
                "errorType": "TimeoutError",
                "recoverySteps": [
                    "Try again later - Azure Cost Management API may be experiencing delays",
                    "Verify you have 'Cost Management Reader' role on the subscription",
                    "Check that the subscription has billing enabled",
                    "Cost data may take 24-48 hours to appear after resource creation"
                ]
            }
        )
    except Exception as e:
        logger.error(f"Error getting costs: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail={
                "status": "error",
                "error": str(e),
                "errorType": type(e).__name__,
                "recoverySteps": [
                    "Verify you have 'Cost Management Reader' role on the subscription",
                    "Check that the subscription has billing enabled",
                    "Ensure resource groups exist and are accessible",
                    "Cost data may take 24-48 hours to appear after resource creation"
                ]
            }
        )


@router.post("/cloud-logs/analyze")
async def analyze_cloud_logs(request: CloudLogsAnalyzeRequest):
    """
    Analyze Temenos cloud logs using AI sub-agent.
    
    This endpoint uses the Temenos RAG API to analyze logs from Temenos components
    deployed on AKS or ACA and provides structured troubleshooting guidance.
    
    Args:
        request: Cloud logs analysis request
        
    Returns:
        Structured analysis result with summary, classification, root causes,
        recommended actions, and impact assessment
    """
    try:
        # Validate platform
        if request.platform not in ['aks', 'aca']:
            raise HTTPException(
                status_code=400,
                detail="platform must be 'aks' or 'aca'"
            )
        
        # Construct the analysis prompt based on the sub-agent specification
        prompt_parts = [
            "You are the 'Temenos Cloud Logs Analyzer' AI sub-agent.",
            "",
            "YOUR ROLE:",
            "- You analyze and explain logs coming from Temenos core banking components",
            f"  (e.g. Transact app/web, IRIS/IRF providers, batch/COB services, ingesters, adapters)",
            f"  deployed on: {request.platform.upper()} ({'Azure Kubernetes Service' if request.platform == 'aks' else 'Azure Container Apps'})",
            "",
            "GOAL:",
            "- Help cloud/DevOps/BSG engineers quickly understand what is going wrong.",
            "- Propose concrete next troubleshooting steps and Azure / kubectl commands.",
            "- When possible, map the issue to the most likely infrastructure or application layer.",
            "",
            "INPUT PROVIDED:",
            f"- platform: {request.platform}",
            f"- component_name: {request.component_name}",
            f"- environment: {request.environment}",
            f"- log_snippet: (provided below)",
            f"- symptoms: {request.symptoms or 'Not specified'}",
            f"- recent_changes: {request.recent_changes or 'Not specified'}",
            "",
            "LOG SNIPPET:",
            "```",
            request.log_snippet[:5000],  # Limit log snippet to 5000 chars
            "```",
            "",
            "EXPECTED OUTPUT:",
            "Respond ALWAYS using the following structure:",
            "",
            "1. Short Summary",
            "- 2–4 sentences explaining in plain language what seems to be the problem.",
            "",
            "2. Classification",
            f"- Platform: {request.platform.upper()}",
            "- Layer: choose one or more: [Application, Database, Network, Configuration, Resource/Capacity, Azure Platform]",
            "- Severity: choose one: [Info, Warning, Major, Critical]",
            "- Category: short tag (e.g. 'DB connection', 'Timeout', 'Authentication', 'CrashLoopBackOff', 'OutOfMemory', 'Config mismatch')",
            "",
            "3. Most Likely Root Causes (bullet list)",
            "- 2–5 bullets with concrete hypotheses linked to specific log lines.",
            "- For each bullet, quote the minimum necessary log fragment (no more than one line) to justify your reasoning.",
            "",
            "4. Recommended Actions for Engineer",
            "Split by platform:",
            "",
            "4.1. Checks to perform",
            "- Concrete checks, e.g. verify DB connectivity, test DNS resolution, check secret/ConfigMap values, etc.",
            "",
            "4.2. Suggested commands",
            f"- For {request.platform.upper()}, propose specific `{'kubectl' if request.platform == 'aks' else 'az containerapp'}` commands",
            "- Include placeholders for names (e.g. <NAMESPACE>, <POD_NAME>, <RESOURCE_GROUP>, <CONTAINERAPP_NAME>).",
            "",
            "4.3. Possible configuration fixes",
            "- Suggest which Helm values, environment variables, secrets, or scaling settings the engineer should review.",
            "- When relevant, mention typical Temenos settings (e.g. DB URL, user, connection pool, JVM heap limits, thread pools)",
            "  but do NOT invent proprietary values.",
            "",
            "5. Impact Assessment",
            "- Briefly describe how this issue likely impacts the bank:",
            "  e.g. 'Only COB batch affected', 'Only back-office UI', 'All APIs unavailable', 'Non-critical background job'.",
            "",
            "6. If Information Is Insufficient",
            "- If the logs are not enough to be confident, clearly say what is missing.",
            "- Ask 2–4 very specific follow-up questions.",
            "",
            "STYLE & RULES:",
            "- Be concise but actionable. Prefer bullet points over long paragraphs.",
            "- Never fabricate exact configuration values, passwords, or internal hostnames.",
            "- If you are uncertain, explicitly say so and offer multiple plausible hypotheses.",
            "- When suggesting commands, always provide them in code blocks.",
            "- Assume the engineer is familiar with Azure and kubectl, but not necessarily with all Temenos internals.",
            "",
            "Now analyze the provided log snippet and respond in the exact structure specified above.",
            "",
            "IMPORTANT: Respond in valid JSON format with the following structure:",
            "{",
            '  "summary": "2-4 sentence summary",',
            '  "classification": {',
            f'    "platform": "{request.platform}",',
            '    "layer": ["Application"],',
            '    "severity": "Warning",',
            '    "category": "category name"',
            '  },',
            '  "root_causes": [',
            '    {"hypothesis": "...", "log_evidence": "..."}',
            '  ],',
            '  "recommended_actions": {',
            '    "checks": ["check1", "check2"],',
            f'    "commands": {{"{request.platform}": ["command1", "command2"]}},',
            '    "configuration_fixes": ["fix1", "fix2"]',
            '  },',
            '  "impact_assessment": "impact description",',
            '  "insufficient_info": {',
            '    "message": "if info is insufficient (optional)",',
            '    "follow_up_questions": ["q1", "q2"]',
            '  }',
            '}'
        ]
        
        analysis_prompt = "\n".join(prompt_parts)
        
        # Call RAG API with the analysis prompt
        temenos_service = TemenosService()
        rag_result = await temenos_service.query_rag(
            question=analysis_prompt,
            region="global",
            rag_model_id="ModularBanking, TechnologyOverview",
            context=f"Analyzing logs from {request.component_name} component in {request.environment} environment on {request.platform.upper()}. "
                   f"Resource group: {request.resource_group or 'Not specified'}. "
                   f"Symptoms: {request.symptoms or 'Not specified'}. "
                   f"Recent changes: {request.recent_changes or 'Not specified'}. "
                   f"IMPORTANT: Provide actionable, professional guidance. If specific details are not available, focus on general best practices, "
                   f"common troubleshooting approaches, and standard Azure/kubectl commands that would apply to similar scenarios. "
                   f"Avoid phrases like 'I cannot provide' or 'information not available' - instead provide helpful, constructive guidance."
        )
        
        # Parse the RAG response
        answer = rag_result.get("data", {}).get("answer", rag_result.get("answer", ""))
        
        # Try to extract and parse JSON from the response
        import json
        import re
        
        try:
            # Try to extract JSON from the response (look for JSON object)
            json_match = re.search(r'\{[\s\S]*\}', answer, re.MULTILINE)
            if json_match:
                json_str = json_match.group()
                parsed_result = json.loads(json_str)
                # Ensure all required fields are present
                if "summary" in parsed_result and "classification" in parsed_result:
                    return {
                        "status": "success",
                        "data": parsed_result
                    }
        except (json.JSONDecodeError, AttributeError, KeyError) as e:
            logger.warning(f"Failed to parse JSON from RAG response: {e}. Using fallback structure.")
        
        # Fallback: Return structured format with full analysis text
        # Frontend can parse or display the full text
        return {
            "status": "success",
            "data": {
                "summary": answer.split('\n')[0] if answer else "Analysis completed. Please review the full analysis text.",
                "classification": {
                    "platform": request.platform,
                    "layer": ["Application", "Infrastructure"],
                    "severity": "Warning",
                    "category": "Log Analysis"
                },
                "root_causes": [
                    {
                        "hypothesis": "See full analysis below for detailed root cause analysis",
                        "log_evidence": "Refer to log snippet provided in the request"
                    }
                ],
                "recommended_actions": {
                    "checks": ["Review full analysis text for specific checks to perform"],
                    "commands": {
                        request.platform: ["See full analysis text for specific commands"]
                    },
                    "configuration_fixes": ["See full analysis text for configuration recommendations"]
                },
                "impact_assessment": "See full analysis text for impact assessment",
                "full_analysis": answer,
                "note": "Structured JSON parsing unavailable. Full analysis text provided. The AI sub-agent response is in the 'full_analysis' field."
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cloud logs analysis error: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Failed to analyze cloud logs: {str(e)}"
        )


@router.get("/temenos/jwt-info")
async def get_jwt_info(settings: Settings = Depends(get_settings)):
    """
    Get JWT token information including expiration status.

    Returns:
        JWT token expiration information
    """
    import jwt
    from datetime import datetime

    try:
        if not settings.RAG_JWT_TOKEN:
            raise HTTPException(
                status_code=500,
                detail="RAG_JWT_TOKEN not configured"
            )

        # Decode JWT without verification to get payload
        payload = jwt.decode(
            settings.RAG_JWT_TOKEN,
            options={"verify_signature": False}
        )

        exp_timestamp = payload.get("exp")
        iat_timestamp = payload.get("iat")

        if not exp_timestamp:
            jwt_data = {
                "configured": True,
                "has_expiration": False,
                "user_id": payload.get("user_id"),
                "email": payload.get("email")
            }
            return {"success": True, "data": jwt_data}

        exp_date = datetime.fromtimestamp(exp_timestamp)
        iat_date = datetime.fromtimestamp(iat_timestamp) if iat_timestamp else None
        now = datetime.now()

        is_expired = exp_date < now
        days_remaining = (exp_date - now).days if not is_expired else 0

        jwt_data = {
            "configured": True,
            "has_expiration": True,
            "is_expired": is_expired,
            "expires_at": exp_date.isoformat(),
            "issued_at": iat_date.isoformat() if iat_date else None,
            "days_remaining": days_remaining,
            "user_id": payload.get("user_id"),
            "email": payload.get("email"),
            "issuer": payload.get("iss"),
            "audience": payload.get("aud")
        }

        return {"success": True, "data": jwt_data}
    except jwt.DecodeError:
        raise HTTPException(
            status_code=500,
            detail="Invalid JWT token format"
        )
    except Exception as e:
        logger.error(f"Error getting JWT info: {e}", exc_info=True)
        raise HTTPException(
            status_code=500,
            detail=f"Error retrieving JWT information: {str(e)}"
        )

