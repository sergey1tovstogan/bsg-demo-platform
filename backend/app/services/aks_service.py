"""
AKS Service

Handles Azure Kubernetes Service (AKS) interactions to discover pods and namespaces.
"""

from typing import List, Optional, Dict, Any
from azure.identity import DefaultAzureCredential, AzureCliCredential
from azure.mgmt.containerservice import ContainerServiceClient
from azure.core.exceptions import AzureError
from app.core.logging import get_logger
from app.services.azure_service import AzureResource
import base64
import subprocess
import json
import re

logger = get_logger(__name__)


class AKSPod:
    """AKS Pod model."""
    def __init__(
        self,
        name: str,
        namespace: str,
        cluster_name: str,
        cluster_resource_group: str,
        status: str = "Unknown",
        labels: Optional[Dict[str, str]] = None,
        containers: Optional[List[str]] = None
    ):
        self.name = name
        self.namespace = namespace
        self.cluster_name = cluster_name
        self.cluster_resource_group = cluster_resource_group
        self.status = status
        self.labels = labels or {}
        self.containers = containers or []

    def to_azure_resource(self) -> AzureResource:
        """Convert pod to AzureResource for analysis."""
        # Create a synthetic resource ID
        resource_id = f"/subscriptions/{self.cluster_resource_group}/resourceGroups/{self.cluster_resource_group}/providers/Microsoft.ContainerService/managedClusters/{self.cluster_name}/namespaces/{self.namespace}/pods/{self.name}"
        
        # Use namespace as the primary identifier for Temenos components
        # This helps with component identification
        pod_display_name = f"{self.namespace}/{self.name}"
        
        # Ensure namespace is in properties for Temenos service to find it
        resource = AzureResource(
            id=resource_id,
            name=pod_display_name,
            resource_type="Microsoft.ContainerService/managedClusters/pods",
            location="",  # Pods don't have location
            resource_group=self.cluster_resource_group,
            tags={
                **self.labels,
                "namespace": self.namespace,
                "pod_name": self.name,
                "cluster": self.cluster_name
            },
            properties={
                "namespace": self.namespace,  # CRITICAL: Must be here for Temenos service
                "cluster": self.cluster_name,
                "status": self.status,
                "containers": self.containers,
                "pod_name": self.name
            }
        )
        
        # Debug logging
        logger.debug(f"Converted pod {self.name} from namespace {self.namespace} to AzureResource")
        logger.debug(f"  Resource type: {resource.type}")
        logger.debug(f"  Properties namespace: {resource.properties.get('namespace')}")
        
        return resource


class AKSService:
    """Service for interacting with AKS clusters."""
    
    def __init__(self, subscription_id: str):
        """
        Initialize AKS service.
        
        Args:
            subscription_id: Azure subscription ID
        """
        self.subscription_id = subscription_id
        try:
            try:
                credential = AzureCliCredential()
                logger.info("Using Azure CLI credential for AKS")
            except Exception:
                credential = DefaultAzureCredential()
                logger.info("Using DefaultAzureCredential for AKS")
            
            self.client = ContainerServiceClient(credential, subscription_id)
            logger.info(f"AKS service initialized for subscription: {subscription_id}")
        except Exception as e:
            logger.error(f"Failed to initialize AKS client: {e}", exc_info=True)
            raise RuntimeError(f"Failed to initialize AKS client: {e}")

    def _is_aks_cluster(self, resource: AzureResource) -> bool:
        """Check if resource is an AKS cluster."""
        return resource.type.lower() == "microsoft.containerservice/managedclusters"

    async def get_aks_clusters(self, resources: List[AzureResource]) -> List[AzureResource]:
        """Filter and return only AKS cluster resources."""
        return [r for r in resources if self._is_aks_cluster(r)]

    async def get_cluster_credentials(self, resource_group: str, cluster_name: str) -> Optional[Dict[str, str]]:
        """
        Get AKS cluster credentials using Azure CLI.
        
        Args:
            resource_group: Resource group name
            cluster_name: AKS cluster name
            
        Returns:
            Dict with kubeconfig path or None if failed
        """
        try:
            import tempfile
            import os
            import asyncio
            
            # Create temporary kubeconfig file
            temp_dir = tempfile.gettempdir()
            kubeconfig_path = os.path.join(temp_dir, f"{cluster_name}_kubeconfig.yaml")
            
            # Run subprocess commands in executor to avoid blocking
            loop = asyncio.get_event_loop()
            
            # Use Azure CLI to get credentials
            # On Windows, use az.cmd if az.exe doesn't work
            def _get_credentials():
                import shutil
                # Find az command
                az_cmd = shutil.which("az") or shutil.which("az.cmd") or "az"
                cmd = [
                    az_cmd, "aks", "get-credentials",
                    "--resource-group", resource_group,
                    "--name", cluster_name,
                    "--file", kubeconfig_path,
                    "--overwrite-existing"
                ]
                return subprocess.run(
                    cmd,
                    capture_output=True,
                    text=True,
                    timeout=30,
                    shell=False
                )
            
            result = await loop.run_in_executor(None, _get_credentials)
            
            # Azure CLI may return non-zero for warnings, but command might still succeed
            # Check if kubeconfig file was created
            kubeconfig_exists = os.path.exists(kubeconfig_path)
            
            if result.returncode != 0 and not kubeconfig_exists:
                error_output = result.stderr or result.stdout or "Unknown error"
                logger.warning(f"Failed to get credentials for {cluster_name}. Return code: {result.returncode}")
                logger.warning(f"Error output: {error_output[:500]}")
                # Try using default kubeconfig location as fallback
                default_kubeconfig = os.path.expanduser("~/.kube/config")
                if os.path.exists(default_kubeconfig):
                    logger.info(f"Trying default kubeconfig at {default_kubeconfig}")
                    # Check if cluster context exists in default config
                    def _check_default_config():
                        return subprocess.run(
                            [shutil.which("kubectl") or "kubectl", "config", "get-contexts", "--kubeconfig", default_kubeconfig],
                            capture_output=True,
                            text=True,
                            timeout=5
                        )
                    check_result = await loop.run_in_executor(None, _check_default_config)
                    if check_result.returncode == 0 and cluster_name in check_result.stdout:
                        logger.info(f"Found cluster context in default kubeconfig, using it")
                        return {"kubeconfig_path": default_kubeconfig, "cluster_name": cluster_name, "use_default": True}
                return None
            
            # If kubeconfig was created (even with warnings), use it
            if kubeconfig_exists:
                logger.info(f"Successfully created kubeconfig at {kubeconfig_path}")
            else:
                # Fallback to default kubeconfig
                default_kubeconfig = os.path.expanduser("~/.kube/config")
                if os.path.exists(default_kubeconfig):
                    logger.info(f"Using default kubeconfig at {default_kubeconfig}")
                    kubeconfig_path = default_kubeconfig
                else:
                    logger.warning(f"Kubeconfig not created and default not found")
                    return None
            
            # Verify kubectl can access the cluster
            def _check_kubectl():
                import shutil
                kubectl_cmd = shutil.which("kubectl") or "kubectl"
                return subprocess.run(
                    [kubectl_cmd, "version", "--client", f"--kubeconfig={kubeconfig_path}"],
                    capture_output=True,
                    text=True,
                    timeout=10,
                    shell=False
                )
            
            kubectl_result = await loop.run_in_executor(None, _check_kubectl)
            
            if kubectl_result.returncode == 0:
                return {"kubeconfig_path": kubeconfig_path, "cluster_name": cluster_name}
            
            return None
        except Exception as e:
            error_msg = str(e)
            if "timeout" in error_msg.lower() or "timed out" in error_msg.lower():
                logger.warning(f"Timeout getting credentials for {cluster_name}")
            elif "cannot find the file" in error_msg.lower() or "not found" in error_msg.lower():
                logger.error(f"Azure CLI or kubectl not found. Please ensure 'az' and 'kubectl' are installed and in PATH")
            else:
                logger.warning(f"Error getting credentials for {cluster_name}: {e}")
            return None

    async def get_pods_from_cluster(
        self,
        cluster: AzureResource,
        temenos_namespaces: Optional[List[str]] = None
    ) -> List[AKSPod]:
        """
        Get pods from an AKS cluster, optionally filtered by namespaces.
        
        Args:
            cluster: AKS cluster resource
            temenos_namespaces: Optional list of namespace names to filter (e.g., ['transact', 'eventstore', 'holdings'])
            
        Returns:
            List of pods
        """
        pods = []
        
        try:
            # Extract resource group from cluster ID
            # Format: /subscriptions/{sub}/resourceGroups/{rg}/providers/Microsoft.ContainerService/managedClusters/{name}
            id_parts = cluster.id.split("/")
            resource_group = id_parts[id_parts.index("resourceGroups") + 1] if "resourceGroups" in id_parts else cluster.resource_group
            cluster_name = cluster.name
            
            # Try to get credentials, but fallback to default kubeconfig if it fails
            creds = await self.get_cluster_credentials(resource_group, cluster_name)
            
            # Use default kubeconfig if credentials failed or use_default flag is set
            import os
            default_kubeconfig = os.path.expanduser("~/.kube/config")
            
            if not creds:
                if os.path.exists(default_kubeconfig):
                    logger.info(f"Using default kubeconfig at {default_kubeconfig} for cluster {cluster_name}")
                    kubeconfig_path = default_kubeconfig
                    # Try to switch context to this cluster
                    import asyncio
                    loop = asyncio.get_event_loop()
                    def _set_context():
                        import shutil
                        kubectl_cmd = shutil.which("kubectl") or "kubectl"
                        return subprocess.run(
                            [kubectl_cmd, "config", "use-context", cluster_name],
                            capture_output=True,
                            text=True,
                            timeout=5
                        )
                    context_result = await loop.run_in_executor(None, _set_context)
                    if context_result.returncode != 0:
                        logger.warning(f"Could not switch to context {cluster_name}, but will try anyway")
                else:
                    logger.warning(f"Could not get credentials for cluster {cluster_name} and no default kubeconfig found")
                    return pods
            else:
                kubeconfig_path = creds.get("kubeconfig_path")
                if not kubeconfig_path:
                    kubeconfig_path = default_kubeconfig if os.path.exists(default_kubeconfig) else None
                    if not kubeconfig_path:
                        logger.warning(f"No kubeconfig available for cluster {cluster_name}")
                        return pods
            
            # Get namespaces first - use async subprocess for better timeout handling
            import asyncio
            cmd = ["kubectl", "get", "namespaces", "-o", "json", f"--kubeconfig={kubeconfig_path}"]
            
            try:
                process = await asyncio.create_subprocess_exec(
                    *cmd,
                    stdout=asyncio.subprocess.PIPE,
                    stderr=asyncio.subprocess.PIPE
                )
                stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=30.0)
                
                if process.returncode != 0:
                    error_msg = stderr.decode() if stderr else "Unknown error"
                    logger.warning(f"Failed to get namespaces from {cluster_name}: {error_msg}")
                    return pods
                
                result_stdout = stdout.decode() if stdout else "{}"
            except asyncio.TimeoutError:
                logger.warning(f"Timeout getting namespaces from {cluster_name} (30s)")
                return pods
            except Exception as e:
                logger.warning(f"Error executing kubectl for namespaces: {e}")
                return pods
            
            try:
                namespaces_data = json.loads(result_stdout)
                namespaces = []
                
                for ns in namespaces_data.get("items", []):
                    ns_name = ns.get("metadata", {}).get("name", "")
                    
                    # Skip system namespaces
                    if ns_name in ["kube-system", "kube-public", "kube-node-lease", "default"]:
                        continue
                    
                    # Filter by Temenos-related namespaces if provided
                    if temenos_namespaces:
                        if any(tns.lower() in ns_name.lower() for tns in temenos_namespaces):
                            namespaces.append(ns_name)
                            logger.debug(f"Including namespace '{ns_name}' (matched filter)")
                    else:
                        # Auto-detect Temenos namespaces - use comprehensive patterns
                        # Match namespaces that contain these patterns (even with numbers/suffixes)
                        temenos_patterns = [
                            r"transact", r"eventstore", r"adapter", r"genericconfig",
                            r"holdings", r"party", r"modular", r"temenos", r"tap",
                            r"stmtgen", r"notification", r"audit", r"file", r"workflow",
                            r"deposits", r"lending", r"webingress", r"ingress"
                        ]
                        # Also check if namespace starts with or contains these patterns
                        # This handles cases like "deposits202507", "ingress-nginx-transact", etc.
                        if any(re.search(pattern, ns_name, re.IGNORECASE) for pattern in temenos_patterns):
                            namespaces.append(ns_name)
                            logger.debug(f"Including namespace '{ns_name}' (matched Temenos pattern)")
                        else:
                            logger.debug(f"Skipping namespace '{ns_name}' (doesn't match Temenos patterns)")
                
                logger.info(f"Found {len(namespaces)} Temenos-related namespaces in {cluster_name}: {namespaces}")
                
                # Get pods from each namespace - use async subprocess
                for namespace in namespaces:
                    logger.info(f"Querying pods from namespace '{namespace}' in cluster '{cluster_name}'")
                    cmd_pods = [
                        "kubectl", "get", "pods",
                        "-n", namespace,
                        "-o", "json",
                        f"--kubeconfig={kubeconfig_path}"
                    ]
                    
                    try:
                        process = await asyncio.create_subprocess_exec(
                            *cmd_pods,
                            stdout=asyncio.subprocess.PIPE,
                            stderr=asyncio.subprocess.PIPE
                        )
                        stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=30.0)
                        
                        if process.returncode == 0:
                            try:
                                pods_data = json.loads(stdout.decode() if stdout else "{}")
                                namespace_pod_count = 0
                                for pod in pods_data.get("items", []):
                                    pod_metadata = pod.get("metadata", {})
                                    pod_status = pod.get("status", {})
                                    
                                    pod_name = pod_metadata.get("name", "")
                                    pod_labels = pod_metadata.get("labels", {})
                                    
                                    # Get container names
                                    containers = []
                                    for container in pod.get("spec", {}).get("containers", []):
                                        containers.append(container.get("name", ""))
                                    
                                    # Get pod status
                                    phase = pod_status.get("phase", "Unknown")
                                    
                                    pods.append(AKSPod(
                                        name=pod_name,
                                        namespace=namespace,
                                        cluster_name=cluster_name,
                                        cluster_resource_group=resource_group,
                                        status=phase,
                                        labels=pod_labels,
                                        containers=containers
                                    ))
                                    namespace_pod_count += 1
                                
                                logger.info(f"Found {namespace_pod_count} pods in namespace '{namespace}'")
                            except json.JSONDecodeError as e:
                                logger.warning(f"Failed to parse pods JSON for namespace {namespace}: {e}")
                                logger.debug(f"Response: {(stdout.decode() if stdout else '')[:200]}")
                                continue
                        else:
                            error_msg = stderr.decode() if stderr else "Unknown error"
                            logger.warning(f"Failed to get pods from namespace {namespace}: {error_msg}")
                            logger.debug(f"Command: {' '.join(cmd_pods)}")
                    except asyncio.TimeoutError:
                        logger.warning(f"Timeout getting pods from namespace '{namespace}' (30s) - skipping")
                        continue
                    except Exception as e:
                        logger.warning(f"Error getting pods from namespace '{namespace}': {e}")
                        continue
                
                logger.info(f"Found total {len(pods)} pods across {len(namespaces)} namespaces in cluster '{cluster_name}'")
                return pods
                
            except json.JSONDecodeError:
                logger.warning(f"Failed to parse namespaces JSON for {cluster_name}")
                return pods
                
        except Exception as e:
            logger.error(f"Error getting pods from cluster {cluster.name}: {e}", exc_info=True)
            return pods

    async def list_cluster_namespaces(
        self,
        cluster: AzureResource
    ) -> List[str]:
        """
        List all namespaces in an AKS cluster (excluding system namespaces).
        
        Args:
            cluster: AKS cluster resource
            
        Returns:
            List of namespace names
        """
        namespaces = []
        
        try:
            # Extract resource group and cluster name
            id_parts = cluster.id.split("/")
            resource_group = id_parts[id_parts.index("resourceGroups") + 1] if "resourceGroups" in id_parts else cluster.resource_group
            cluster_name = cluster.name
            
            # Get credentials
            creds = await self.get_cluster_credentials(resource_group, cluster_name)
            
            import os
            default_kubeconfig = os.path.expanduser("~/.kube/config")
            
            if not creds:
                if os.path.exists(default_kubeconfig):
                    kubeconfig_path = default_kubeconfig
                    # Try to switch context
                    import asyncio
                    loop = asyncio.get_event_loop()
                    def _set_context():
                        import shutil
                        kubectl_cmd = shutil.which("kubectl") or "kubectl"
                        return subprocess.run(
                            [kubectl_cmd, "config", "use-context", cluster_name],
                            capture_output=True,
                            text=True,
                            timeout=5
                        )
                    await loop.run_in_executor(None, _set_context)
                else:
                    logger.warning(f"Could not get credentials for cluster {cluster_name}")
                    return namespaces
            else:
                kubeconfig_path = creds.get("kubeconfig_path")
                if not kubeconfig_path:
                    kubeconfig_path = default_kubeconfig if os.path.exists(default_kubeconfig) else None
                    if not kubeconfig_path:
                        return namespaces
            
            # Get namespaces
            import asyncio
            import shutil
            kubectl_cmd = shutil.which("kubectl") or "kubectl"
            cmd = [kubectl_cmd, "get", "namespaces", "-o", "json", f"--kubeconfig={kubeconfig_path}"]
            
            process = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await asyncio.wait_for(process.communicate(), timeout=30.0)
            
            if process.returncode != 0:
                error_msg = stderr.decode() if stderr else "Unknown error"
                logger.warning(f"Failed to get namespaces from {cluster_name}: {error_msg}")
                return namespaces
            
            result_stdout = stdout.decode() if stdout else "{}"
            namespaces_data = json.loads(result_stdout)
            
            for ns in namespaces_data.get("items", []):
                ns_name = ns.get("metadata", {}).get("name", "")
                # Skip system namespaces
                if ns_name not in ["kube-system", "kube-public", "kube-node-lease", "default"]:
                    namespaces.append(ns_name)
            
            logger.info(f"Found {len(namespaces)} namespaces in cluster {cluster_name}")
            return sorted(namespaces)
            
        except Exception as e:
            logger.error(f"Error listing namespaces for cluster {cluster.name}: {e}")
            return namespaces

    async def discover_pods_from_resources(
        self,
        resources: List[AzureResource],
        temenos_namespaces: Optional[List[str]] = None
    ) -> List[AzureResource]:
        """
        Discover pods from AKS clusters in the resource list.
        
        Args:
            resources: List of Azure resources
            temenos_namespaces: Optional list of namespace names to filter
            
        Returns:
            List of AzureResource objects representing pods
        """
        aks_clusters = await self.get_aks_clusters(resources)
        
        if not aks_clusters:
            logger.info("No AKS clusters found in resources")
            return []
        
        logger.info(f"Found {len(aks_clusters)} AKS cluster(s), discovering pods...")
        
        all_pods = []
        for cluster in aks_clusters:
            try:
                pods = await self.get_pods_from_cluster(cluster, temenos_namespaces)
                # Convert pods to AzureResource objects
                for pod in pods:
                    all_pods.append(pod.to_azure_resource())
            except Exception as e:
                logger.error(f"Error discovering pods from {cluster.name}: {e}", exc_info=True)
                continue
        
        logger.info(f"Discovered {len(all_pods)} pods from {len(aks_clusters)} AKS cluster(s)")
        return all_pods

