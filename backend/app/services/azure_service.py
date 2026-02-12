"""
Azure Service

Handles Azure Resource Manager API interactions for deployment analysis.
"""

from typing import List, Optional, Dict, Any
import os
from azure.identity import DefaultAzureCredential, AzureCliCredential, ChainedTokenCredential
from azure.mgmt.resource import ResourceManagementClient
from azure.core.exceptions import AzureError, HttpResponseError
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class AzureResourceGroup:
    """Azure Resource Group model."""
    def __init__(self, id: str, name: str, location: str, tags: Optional[Dict[str, str]] = None):
        self.id = id
        self.name = name
        self.location = location
        self.tags = tags or {}

    def to_dict(self) -> Dict[str, Any]:
        return {
            "id": self.id,
            "name": self.name,
            "location": self.location,
            "tags": self.tags
        }


class AzureResource:
    """Azure Resource model."""
    def __init__(
        self,
        id: str,
        name: str,
        resource_type: str,
        location: str,
        resource_group: str,
        tags: Optional[Dict[str, str]] = None,
        properties: Optional[Dict[str, Any]] = None,
        description: Optional[str] = None
    ):
        self.id = id
        self.name = name
        self.type = resource_type
        self.location = location
        self.resource_group = resource_group
        self.tags = tags or {}
        self.properties = properties or {}
        self.description = description

    def to_dict(self) -> Dict[str, Any]:
        # Build Azure Portal URL
        # Format: https://portal.azure.com/#@<tenant>/resource<resource_id>
        portal_url = f"https://portal.azure.com/#resource{self.id}"
        
        result = {
            "id": self.id,
            "name": self.name,
            "type": self.type,
            "location": self.location,
            "resourceGroup": self.resource_group,
            "tags": self.tags,
            "properties": self.properties,
            "portalUrl": portal_url  # Add Azure Portal URL
        }
        
        # Add description if available
        if self.description:
            result["description"] = self.description
        
        return result


class AzureService:
    """Service for interacting with Azure Resource Manager API."""
    
    def __init__(self, subscription_id: str):
        """
        Initialize Azure service.
        
        Args:
            subscription_id: Azure subscription ID
        """
        self.subscription_id = subscription_id
        # Azure App Service sets WEBSITE_SITE_NAME; Container Apps run on K8s (KUBERNETES_SERVICE_HOST)
        self.is_azure_app_service = os.getenv("WEBSITE_SITE_NAME") is not None
        self.is_azure_container_app = os.getenv("KUBERNETES_SERVICE_HOST") is not None  # Container Apps = K8s
        
        try:
            # In Azure (App Service or Container Apps): use DefaultAzureCredential (Managed Identity or SP env vars).
            # Do NOT try Azure CLI inside the container - there is no 'az' installed and the user does not run az login.
            if self.is_azure_app_service or self.is_azure_container_app:
                credential = DefaultAzureCredential()
                logger.info(
                    "Using DefaultAzureCredential (Azure %s - Managed Identity or Service Principal)",
                    "Container App" if self.is_azure_container_app else "App Service",
                )
            else:
                # Local development only: try Azure CLI first, then DefaultAzureCredential
                try:
                    credential = AzureCliCredential()
                    logger.info("Using Azure CLI credential (local development)")
                except Exception:
                    credential = DefaultAzureCredential()
                    logger.info("Using DefaultAzureCredential (tries multiple credential sources)")

            # Store credential as instance property for export operations
            self.credential = credential
            self.client = ResourceManagementClient(credential, subscription_id)
            logger.info(f"Azure service initialized for subscription: {subscription_id}")
        except Exception as e:
            logger.error(f"Failed to initialize Azure client: {e}", exc_info=True)
            error_msg = str(e)
            error_type = type(e).__name__
            
            # Provide environment-specific error messages
            if self.is_azure_app_service or self.is_azure_container_app:
                # Azure App Service specific error messages
                if "CredentialUnavailableError" in error_type or "credential" in error_msg.lower():
                    raise RuntimeError(
                        "Azure authentication failed in Azure App Service. Please ensure:\n"
                        "1. Managed Identity is enabled for the App Service\n"
                        "2. OR configure Service Principal credentials via App Settings:\n"
                        "   - AZURE_CLIENT_ID\n"
                        "   - AZURE_CLIENT_SECRET\n"
                        "   - AZURE_TENANT_ID\n"
                        f"3. Verify subscription ID '{subscription_id}' is correct\n"
                        "4. Ensure the identity has 'Reader' role on the subscription"
                    )
                else:
                    raise RuntimeError(
                        f"Failed to initialize Azure client in Azure App Service: {error_msg}\n"
                        f"Error type: {error_type}\n\n"
                        "Please check:\n"
                        "1. Managed Identity is enabled and has proper permissions\n"
                        "2. Service Principal credentials are configured (if using)\n"
                        f"3. Subscription ID '{subscription_id}' is correct"
                    )
            else:
                # Local development error messages
                if "CredentialUnavailableError" in error_type or "credential" in error_msg.lower():
                    raise RuntimeError(
                        "Azure authentication failed. You need to log in to Azure CLI first.\n\n"
                        "Please follow these steps:\n"
                        "1. Open PowerShell or Command Prompt\n"
                        "2. Check if Azure CLI is installed: Run 'az --version'\n"
                        "3. If not installed, download from: https://aka.ms/installazurecliwindows\n"
                        "4. Login to Azure: Run 'az login --use-device-code'\n"
                        "5. Complete authentication in browser when prompted\n"
                        "6. Verify login: Run 'az account show'\n"
                        f"7. Set the subscription: Run 'az account set --subscription {subscription_id}'\n"
                        "8. After logging in, refresh the page and try connecting again\n\n"
                        "Alternative: Configure service principal credentials via environment variables:\n"
                        "   - AZURE_CLIENT_ID\n"
                        "   - AZURE_CLIENT_SECRET\n"
                        "   - AZURE_TENANT_ID"
                    )
                else:
                    raise RuntimeError(
                        f"Failed to initialize Azure client: {error_msg}\n"
                        f"Error type: {error_type}\n\n"
                        "Please ensure:\n"
                        "1. Azure CLI is installed: https://aka.ms/installazurecliwindows\n"
                        "2. For interactive login: Run 'az login'\n"
                        "3. For non-interactive environments: Run 'az login --use-device-code'"
                    )

    async def test_connection(self) -> bool:
        """
        Test Azure connection.
        
        Returns:
            True if connection successful
        """
        try:
            # Try to list resource groups to test connection
            # Azure SDK is synchronous, so we run it in executor
            import asyncio
            loop = asyncio.get_event_loop()
            
            def _test():
                try:
                    iterator = self.client.resource_groups.list()
                    # Get first item to verify connection
                    return next(iterator, None)
                except Exception as inner_e:
                    # Re-raise with more context
                    error_details = {
                        "message": str(inner_e),
                        "type": type(inner_e).__name__,
                        "subscription_id": self.subscription_id
                    }
                    logger.error(f"Azure connection test inner error: {error_details}")
                    raise inner_e
            
            first_item = await loop.run_in_executor(None, _test)
            logger.info(f"Successfully connected to Azure subscription: {self.subscription_id}")
            return True
        except Exception as e:
            logger.error(f"Azure connection test failed: {e}", exc_info=True)
            error_msg = str(e)
            error_type = type(e).__name__
            
            # Check for specific Azure SDK errors
            status_code = None
            if hasattr(e, 'status_code'):
                status_code = e.status_code
            elif isinstance(e, HttpResponseError):
                status_code = e.status_code
            
            if status_code == 401:
                err_lower = error_msg.lower()
                if "expired" in err_lower or "refresh token" in err_lower:
                    raise RuntimeError(
                        "Azure credential may have expired (401). "
                        "If using Service Principal: renew the client secret in Azure Portal (App registration → Certificates & secrets). "
                        "If using Managed Identity: ensure it still has Reader role on the subscription. "
                        "Then restart the backend."
                    )
                raise RuntimeError(
                    "Azure authentication failed (401 Unauthorized). Please ensure:\n"
                    "1. Azure CLI is installed: https://aka.ms/installazurecliwindows\n"
                    "2. For interactive login: Run 'az login'\n"
                    "3. For non-interactive environments (CI/CD, remote servers): Run 'az login --use-device-code'\n"
                    "4. Verify your account: Run 'az account show'\n"
                    "5. Set the correct subscription: Run 'az account set --subscription <subscription-id>'\n"
                    "6. For Azure App Service: Configure Managed Identity or Service Principal credentials\n"
                    f"7. Verify subscription ID '{self.subscription_id}' is correct"
                )
            elif status_code == 403:
                raise RuntimeError(
                    "Insufficient permissions (403 Forbidden). Please ensure your Azure account has "
                    "'Reader' role on the subscription. Check Azure Portal → Subscriptions → Access control (IAM)"
                )
            elif status_code == 404:
                raise RuntimeError(
                    f"Subscription '{self.subscription_id}' not found (404). "
                    "Please verify:\n"
                    "1. The subscription ID is correct\n"
                    "2. You have access to this subscription\n"
                    "3. The subscription is active (not disabled)"
                )
            
            # Check for expired credential (SP secret or token) so admins can renew proactively
            err_lower = error_msg.lower()
            if "expired" in err_lower or "refresh token" in err_lower or ("token" in err_lower and "invalid" in err_lower):
                raise RuntimeError(
                    "Azure credential may have expired. "
                    "If using Service Principal: renew the client secret in Azure Portal (App registration → Certificates & secrets). "
                    "If using Managed Identity: ensure it still has Reader role on the subscription. Then restart the backend."
                )
            # Check error message for common issues
            if "credential" in err_lower or "authentication" in err_lower or "unauthorized" in err_lower:
                if self.is_azure_app_service or self.is_azure_container_app:
                    raise RuntimeError(
                        "Azure authentication failed in Azure (App Service / Container App). Please ensure:\n"
                        "1. Managed Identity is enabled for the app and has 'Reader' role on the subscription\n"
                        "2. OR configure Service Principal via environment variables: AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID\n"
                        "3. Verify subscription ID is correct"
                    )
                else:
                    raise RuntimeError(
                        "Azure authentication failed. Please ensure:\n"
                        "1. Azure CLI is installed: https://aka.ms/installazurecliwindows\n"
                        "2. For interactive login: Run 'az login'\n"
                        "3. For non-interactive environments: Run 'az login --use-device-code'\n"
                        "4. Verify subscription ID is correct\n"
                        "5. Run: az account set --subscription <subscription-id>"
                    )
            elif "permission" in error_msg.lower() or "authorization" in error_msg.lower() or "forbidden" in error_msg.lower():
                raise RuntimeError(
                    "Insufficient permissions. Please ensure your Azure account has "
                    "'Reader' role on the subscription."
                )
            elif "not found" in error_msg.lower() or "subscription" in error_msg.lower() or "does not exist" in error_msg.lower():
                raise RuntimeError(
                    f"Subscription '{self.subscription_id}' not found or you don't have access to it. "
                    "Please verify:\n"
                    "1. The subscription ID is correct\n"
                    "2. You have access to this subscription\n"
                    "3. The subscription is active (not disabled)"
                )
            else:
                # Generic error with more details
                raise RuntimeError(
                    f"Failed to connect to Azure: {error_msg}\n"
                    f"Error type: {error_type}\n"
                    f"Subscription ID: {self.subscription_id}\n\n"
                    "Please check:\n"
                    "1. Azure CLI is installed and logged in (run: az login)\n"
                    "2. Subscription ID is correct\n"
                    "3. You have access to the subscription"
                )

    async def get_resource_groups(self) -> List[AzureResourceGroup]:
        """
        Get all resource groups in a subscription.
        
        Returns:
            List of resource groups
        """
        try:
            import asyncio
            loop = asyncio.get_event_loop()
            
            # Azure SDK is synchronous, run in executor
            def _get_rgs():
                rgs = []
                iterator = self.client.resource_groups.list()
                for rg in iterator:
                    rgs.append(rg)
                return rgs
            
            rg_list = await loop.run_in_executor(None, _get_rgs)
            
            resource_groups = []
            for rg in rg_list:
                resource_groups.append(AzureResourceGroup(
                    id=rg.id or "",
                    name=rg.name or "",
                    location=rg.location or "",
                    tags=rg.tags
                ))
            
            logger.info(f"Retrieved {len(resource_groups)} resource groups")
            return resource_groups
        except Exception as e:
            logger.error(f"Failed to retrieve resource groups: {e}")
            raise RuntimeError(f"Failed to retrieve resource groups: {e}")

    async def get_resources_by_resource_groups(
        self, resource_group_names: List[str]
    ) -> List[AzureResource]:
        """
        Get all resources in specified resource groups.
        
        Args:
            resource_group_names: List of resource group names
            
        Returns:
            List of resources
        """
        try:
            import asyncio
            loop = asyncio.get_event_loop()
            resources = []
            
            for rg_name in resource_group_names:
                try:
                    # Azure SDK is synchronous, run in executor
                    def _get_resources():
                        res_list = []
                        iterator = self.client.resources.list_by_resource_group(rg_name)
                        for resource in iterator:
                            res_list.append(resource)
                        return res_list
                    
                    resource_list = await loop.run_in_executor(None, _get_resources)
                    
                    for resource in resource_list:
                        resources.append(AzureResource(
                            id=resource.id or "",
                            name=resource.name or "",
                            resource_type=resource.type or "",
                            location=resource.location or "",
                            resource_group=rg_name,
                            tags=resource.tags,
                            properties=resource.properties
                        ))
                except Exception as e:
                    logger.warning(f"Failed to get resources from {rg_name}: {e}")
                    continue
            
            logger.info(f"Retrieved {len(resources)} resources from {len(resource_group_names)} resource groups")
            return resources
        except Exception as e:
            logger.error(f"Failed to retrieve resources: {e}")
            raise RuntimeError(f"Failed to retrieve resources: {e}")

