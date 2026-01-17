"""
Temenos Service

Handles Temenos RAG API interactions for component identification and analysis.
"""

from typing import List, Optional, Dict, Any, Callable, Tuple
import re
import asyncio
from app.adapters.rag import get_rag_adapter
from app.core.logging import get_logger
from app.services.azure_service import AzureResource

logger = get_logger(__name__)


class ComponentRelationship:
    """Component relationship model."""
    def __init__(self, target_component: str, relationship_type: str, description: str):
        self.target_component = target_component
        self.relationship_type = relationship_type
        self.description = description

    def to_dict(self) -> Dict[str, Any]:
        return {
            "targetComponent": self.target_component,
            "relationshipType": self.relationship_type,
            "description": self.description
        }


class TemenosComponentInfo:
    """Temenos component information model."""
    def __init__(
        self,
        component_name: str,
        component_type: str,
        architectural_overview: str,
        functional_overview: str,
        capabilities: List[str],
        related_services: List[str],
        relationships: Optional[List[ComponentRelationship]] = None,
        data_source: Optional[str] = None  # "rag_fresh", "rag_cached", "fallback", "cache"
    ):
        self.component_name = component_name
        self.component_type = component_type
        self.architectural_overview = architectural_overview
        self.functional_overview = functional_overview
        self.capabilities = capabilities
        self.related_services = related_services
        self.relationships = relationships or []
        self.data_source = data_source or "cache"  # Default to cache

    def to_dict(self) -> Dict[str, Any]:
        return {
            "componentName": self.component_name,
            "componentType": self.component_type,
            "architecturalOverview": self.architectural_overview,
            "functionalOverview": self.functional_overview,
            "capabilities": self.capabilities,
            "relatedServices": self.related_services,
            "relationships": [r.to_dict() for r in self.relationships],
            "dataSource": self.data_source  # Include data source in response
        }


class TemenosAnalysisResult:
    """Analysis result model."""
    def __init__(
        self,
        service: AzureResource,
        component_info: Optional[TemenosComponentInfo] = None,
        error: Optional[str] = None
    ):
        self.service = service
        self.component_info = component_info
        self.error = error

    def to_dict(self) -> Dict[str, Any]:
        result = {
            "service": self.service.to_dict()
        }
        if self.component_info:
            result["componentInfo"] = self.component_info.to_dict()
        if self.error:
            result["error"] = self.error
        return result


class TemenosService:
    """Service for interacting with Temenos RAG API via adapter."""
    
    # Compile regex patterns once at class level for performance
    _MARKETING_WORDS = [
        re.compile(r'\bpivotal\b', re.IGNORECASE),
        re.compile(r'\bhighly reliable\b', re.IGNORECASE),
        re.compile(r'\brobust\b', re.IGNORECASE),
        re.compile(r'\bcomprehensive\b', re.IGNORECASE),
        re.compile(r'\bseamless\b', re.IGNORECASE),
        re.compile(r'\bessential\b', re.IGNORECASE),
        re.compile(r'\bcritical\b', re.IGNORECASE),
        re.compile(r'\bfoundational\b', re.IGNORECASE),
        re.compile(r'\bindispensable\b', re.IGNORECASE),
        re.compile(r'\bkey\b', re.IGNORECASE),
        re.compile(r'\bimportant\b', re.IGNORECASE)
    ]
    _SUMMARY_PATTERNS = [
        re.compile(r'in summary[^.]*\.', re.IGNORECASE),
        re.compile(r'summary[^.]*\.', re.IGNORECASE),
        re.compile(r'functional overview[^.]*\.', re.IGNORECASE),
        re.compile(r'key capabilities[^.]*\.', re.IGNORECASE)
    ]
    
    def __init__(self):
        """Initialize Temenos service."""
        try:
            self.rag_adapter = get_rag_adapter()
            logger.info("✓ Temenos service initialized with RAG adapter")
            logger.info(f"  RAG adapter type: {type(self.rag_adapter).__name__}")
            if hasattr(self.rag_adapter, 'base_url'):
                logger.info(f"  RAG API URL: {self.rag_adapter.base_url}")
            if hasattr(self.rag_adapter, 'jwt_token'):
                token_preview = self.rag_adapter.jwt_token[:20] + "..." if self.rag_adapter.jwt_token else "NOT SET"
                logger.info(f"  RAG JWT Token: {token_preview}")
        except Exception as e:
            logger.error(f"✗ RAG adapter initialization FAILED: {e}", exc_info=True)
            logger.warning("Component identification will work from namespace/name only (no RAG queries)")
            self.rag_adapter = None
        
        # In-memory cache for RAG responses - key: component_name, value: TemenosComponentInfo
        # This is a fast local cache, but we also use persistent cache via CacheService
        self._component_cache: Dict[str, TemenosComponentInfo] = {}
        
        # Track if RAG was available at initialization (to detect when it becomes available)
        self._rag_was_available = self.rag_adapter is not None and hasattr(self.rag_adapter, 'jwt_token') and self.rag_adapter.jwt_token
        
        # Cache service for persistent caching (will be initialized lazily)
        self._cache_service = None

    def _is_potential_temenos_component(self, service: AzureResource) -> bool:
        """Quick check if service might be a Temenos component."""
        # Check tags first
        if service.tags.get("temenosComponent") or service.tags.get("component"):
            return True
        
        name = service.name.lower()
        resource_type = service.type.lower()
        
        # Skip common Azure infrastructure resources that are never Temenos components
        infrastructure_types = [
            "microsoft.network/networksecuritygroups",
            "microsoft.network/virtualnetworks",
            "microsoft.network/privatednszones",
            "microsoft.network/networkinterfaces",
            "microsoft.network/publicipaddresses",
            "microsoft.network/loadbalancers",
            "microsoft.network/applicationgateways",
            "microsoft.network/privatelinkservices",
            "microsoft.network/privatendpoints",
            "microsoft.storage/storageaccounts",
            "microsoft.keyvault/vaults",
            "microsoft.insights/components",
            "microsoft.operationalinsights/workspaces",
        ]
        
        # Skip if it's clearly infrastructure - NEVER include storage accounts, key vaults, etc. as Temenos components
        if any(infra_type in resource_type for infra_type in infrastructure_types):
            # Infrastructure resources are NEVER Temenos components, even if name suggests it
            # Storage accounts, key vaults, network resources are infrastructure, not Temenos components
            return False
        
        # Quick pattern check - must have Temenos-related name
        temenos_patterns = [
            r"transact", r"payments", r"wealth", r"digital", r"analytics",
            r"datahub", r"modular", r"tap", r"adapter", r"genericconfig",
            r"eventstore", r"stmtgen", r"notification", r"audit", r"file",
            r"workflow", r"integration", r"temenos", r"deposits", r"lending",
            r"party", r"holdings", r"stmt", r"statement", r"core", r"banking"
        ]
        
        # Must match Temenos pattern
        has_temenos_name = any(re.search(pattern, name) for pattern in temenos_patterns)
        
        # Focus on these resource types that can be Temenos components
        relevant_types = [
            "microsoft.containerservice/managedclusters",  # AKS
            "microsoft.containerservice/managedclusters/pods",  # AKS Pods
            "microsoft.app/containerapps",  # Container Apps
            "microsoft.sql/servers",  # SQL Servers
            "microsoft.sql/databases",  # SQL Databases
            "microsoft.documentdb/databaseaccounts",  # Cosmos DB
            "microsoft.compute/virtualmachines",  # VMs
            "microsoft.compute/virtualmachinescalesets",  # VMSS
        ]
        
        is_relevant_type = any(rel_type in resource_type for rel_type in relevant_types)
        
        # Special handling for AKS pods - check namespace and pod name
        if "managedclusters/pods" in resource_type.lower():
            # Pods are already filtered by namespace, so include them
            # Also check if namespace in properties indicates Temenos component
            namespace = service.properties.get("namespace", "") or service.properties.get("namespace_name", "") or service.tags.get("namespace", "")
            if namespace:
                # Check if namespace matches Temenos patterns
                temenos_namespace_patterns = [
                    r"eventstore", r"adapter", r"genericconfig", r"holdings", r"party",
                    r"transact", r"modular", r"temenos", r"tap", r"stmtgen", r"notification",
                    r"audit", r"file", r"workflow", r"deposits", r"lending", r"webingress", r"ingress"
                ]
                if any(re.search(pattern, namespace, re.IGNORECASE) for pattern in temenos_namespace_patterns):
                    logger.debug(f"Including pod {service.name} - namespace '{namespace}' matches Temenos pattern")
                    return True
            # Include all pods since they're already filtered by namespace discovery
            logger.debug(f"Including pod {service.name} - pods are pre-filtered by namespace discovery")
            return True
        
        # Include if: has Temenos name OR is a relevant resource type
        # This is less restrictive - relevant types (AKS, SQL, etc.) are included even without Temenos name
        # because they might be Temenos components based on context
        if is_relevant_type:
            logger.debug(f"Including {service.name} - relevant resource type: {resource_type}")
            return True
        
        if has_temenos_name:
            logger.debug(f"Including {service.name} - name matches Temenos pattern")
            return True
        
        logger.debug(f"Excluding {service.name} - not a relevant type and name doesn't match Temenos patterns")
        return False

    def _extract_component_name(self, service: AzureResource) -> Optional[Dict[str, str]]:
        """Extract component name from Azure service."""
        # Try tags first
        if service.tags.get("temenosComponent"):
            tag_name = service.tags["temenosComponent"]
            return {
                "componentName": tag_name,
                "normalizedName": self._normalize_component_name(tag_name),
                "componentCategory": self._categorize_component(tag_name)
            }
        
        if service.tags.get("component"):
            tag_name = service.tags["component"]
            return {
                "componentName": tag_name,
                "normalizedName": self._normalize_component_name(tag_name),
                "componentCategory": self._categorize_component(tag_name)
            }
        
        # Special handling for AKS pods - extract from namespace or pod name
        if "managedclusters/pods" in service.type.lower():
            # Pod name format: cluster/namespace/pod or namespace/pod
            # Check properties first, then tags, then parse from name
            namespace = (
                service.properties.get("namespace") or 
                service.properties.get("namespace_name") or
                service.tags.get("namespace") or
                ""
            )
            
            # Parse pod name - handle both "namespace/pod" and "cluster/namespace/pod" formats
            pod_name = service.name
            if "/" in service.name:
                parts = service.name.split("/")
                # If we have 2 parts, it's namespace/pod
                # If we have 3+ parts, it's cluster/namespace/pod or similar
                if len(parts) >= 2:
                    pod_name = parts[-1]  # Last part is always pod name
                    # If namespace not found, try to extract from name
                    if not namespace and len(parts) >= 2:
                        namespace = parts[-2]  # Second to last is namespace
                else:
                    pod_name = parts[-1]
            
            # Fallback: try to extract namespace from name if still not found
            if not namespace and "/" in service.name:
                parts = service.name.split("/")
                if len(parts) >= 2:
                    namespace = parts[-2]
            
            logger.debug(f"Extracting component name for pod '{pod_name}' in namespace '{namespace}'")
            
            # Use namespace as component identifier if it's Temenos-related
            if namespace:
                logger.debug(f"Processing AKS pod '{pod_name}' from namespace '{namespace}'")
                # Comprehensive Temenos namespace mapping
                temenos_namespaces = {
                    # Core microservices
                    "eventstore": "Event Store Microservice",
                    "adapterservice": "Adapter Microservice",
                    "adapter-service": "Adapter Microservice",
                    "genericconfig": "Generic Config Microservice",
                    "generic-config": "Generic Config Microservice",
                    "holdings": "Holdings Microservice",
                    "partyv2": "Party V2 Microservice",
                    "party-v2": "Party V2 Microservice",
                    "transact": "Temenos Transact",
                    "modular-banking": "Modular Banking",
                    "modularbanking": "Modular Banking",
                    "webingress": "Web Ingress Microservice",
                    # Handle namespaces with dates/versions (e.g., deposits202507)
                    "deposits202507": "Deposits Microservice",
                    # Ingress namespaces - use more specific names
                    "ingress-nginx-deposits-202507": "Deposits Ingress Service",
                    "ingress-nginx-lending": "Lending Ingress Service",
                    "ingress-nginx-transact": "Transact Ingress Service",
                    
                    # Additional microservices
                    "stmtgen": "Statement Generation Microservice",
                    "stmt-gen": "Statement Generation Microservice",
                    "notification": "Notification Microservice",
                    "audit": "Audit Microservice",
                    "file": "File Management Microservice",
                    "workflow": "Workflow Microservice",
                    "integration": "Integration Microservice",
                    "deposits": "Deposits Microservice",
                    "lending": "Lending Microservice",
                    "webingress": "Web Ingress Microservice",
                    "web-ingress": "Web Ingress Microservice",
                    "ingress": "Ingress Microservice",
                    
                    # TAP components
                    "tap": "Temenos TAP",
                    "tap-service": "Temenos TAP Service",
                    
                    # Other common patterns
                    "temenos": "Temenos Component",
                    "t24": "Temenos Transact",
                    "temenos-transact": "Temenos Transact",
                }
                
                # Try exact match first
                normalized = temenos_namespaces.get(namespace.lower())
                
                # If no exact match, try pattern matching
                if not normalized:
                    namespace_lower = namespace.lower()
                    # Pattern-based matching for variations
                    if any(pattern in namespace_lower for pattern in ["eventstore", "event-store", "event"]):
                        normalized = "Event Store Microservice"
                    elif any(pattern in namespace_lower for pattern in ["adapter", "adapt"]):
                        normalized = "Adapter Microservice"
                    elif any(pattern in namespace_lower for pattern in ["genericconfig", "generic-config", "config"]):
                        normalized = "Generic Config Microservice"
                    elif any(pattern in namespace_lower for pattern in ["holdings", "holding"]):
                        normalized = "Holdings Microservice"
                    elif any(pattern in namespace_lower for pattern in ["party", "partyv2", "party-v2"]):
                        normalized = "Party V2 Microservice"
                    elif any(pattern in namespace_lower for pattern in ["transact", "t24", "temenos-transact"]):
                        normalized = "Temenos Transact"
                    elif any(pattern in namespace_lower for pattern in ["modular", "modularbanking", "modular-banking"]):
                        normalized = "Modular Banking"
                    elif any(pattern in namespace_lower for pattern in ["stmtgen", "stmt-gen", "statement"]):
                        normalized = "Statement Generation Microservice"
                    elif any(pattern in namespace_lower for pattern in ["notification", "notify"]):
                        normalized = "Notification Microservice"
                    elif any(pattern in namespace_lower for pattern in ["audit", "auditing"]):
                        normalized = "Audit Microservice"
                    elif any(pattern in namespace_lower for pattern in ["file", "files"]):
                        normalized = "File Management Microservice"
                    elif any(pattern in namespace_lower for pattern in ["workflow", "workflows"]):
                        normalized = "Workflow Microservice"
                    elif any(pattern in namespace_lower for pattern in ["integration", "integrate"]):
                        normalized = "Integration Microservice"
                    elif any(pattern in namespace_lower for pattern in ["deposits", "deposit"]):
                        # Handle variations like "deposits202507"
                        normalized = "Deposits Microservice"
                    elif any(pattern in namespace_lower for pattern in ["lending", "lend"]):
                        normalized = "Lending Microservice"
                    elif any(pattern in namespace_lower for pattern in ["webingress", "web-ingress"]):
                        normalized = "Web Ingress Microservice"
                    elif "ingress" in namespace_lower and "nginx" in namespace_lower:
                        # Handle ingress-nginx-* namespaces (they're still Temenos-related ingress)
                        # Extract the component name from the namespace (e.g., ingress-nginx-transact -> Transact Ingress)
                        if "transact" in namespace_lower:
                            normalized = "Transact Ingress Service"
                        elif "deposits" in namespace_lower:
                            normalized = "Deposits Ingress Service"
                        elif "lending" in namespace_lower:
                            normalized = "Lending Ingress Service"
                        else:
                            normalized = "Ingress Service"
                    elif "ingress" in namespace_lower:
                        normalized = "Ingress Microservice"
                    elif any(pattern in namespace_lower for pattern in ["tap", "tap-service"]):
                        normalized = "Temenos TAP"
                    elif any(pattern in namespace_lower for pattern in ["temenos"]):
                        normalized = "Temenos Component"
                
                if normalized:
                    logger.info(f"Identified Temenos component: {normalized} from namespace '{namespace}' (pod: {pod_name})")
                    return {
                        "componentName": pod_name,
                        "normalizedName": normalized,
                        "componentCategory": "microservice" if "Microservice" in normalized else "core"
                    }
                else:
                    logger.debug(f"Namespace '{namespace}' did not match any Temenos patterns for pod '{pod_name}'")
            
            # Fall back to pod name patterns
            name = pod_name.lower()
        else:
            # Try service name patterns
            name = service.name.lower()
        
        # Microservice patterns - more aggressive matching
        microservice_patterns = [
            (r"holdings|holding", "Holdings Microservice", "microservice"),
            (r"adapter|adapt", "Adapter Microservice", "microservice"),
            (r"genericconfig|generic-config|genericconfig|config.*microservice", "Generic Config Microservice", "microservice"),
            (r"eventstore|event-store|event.*store", "Event Store Microservice", "microservice"),
            (r"stmtgen|stmt-gen|statement.*generation|statement.*gen", "Statement Generation Microservice", "microservice"),
            (r"notification|notify", "Notification Microservice", "microservice"),
            (r"audit|auditing", "Audit Microservice", "microservice"),
            (r"file.*management|file.*service", "File Management Microservice", "microservice"),
            (r"workflow", "Workflow Microservice", "microservice"),
            (r"integration|integrate", "Integration Microservice", "microservice"),
            (r"party.*v2|partyv2|party.*service", "Party V2 Microservice", "microservice"),
        ]
        
        for pattern, microservice_name, category in microservice_patterns:
            if re.search(pattern, name, re.IGNORECASE):
                logger.info(f"Matched microservice pattern '{pattern}' for '{name}' -> '{microservice_name}'")
                return {
                    "componentName": service.name,
                    "normalizedName": microservice_name,
                    "componentCategory": category
                }
        
        # Common Temenos component patterns
        component_patterns = [
            (r"transact", "Temenos Transact", "core"),
            (r"payments", "Temenos Payments", "core"),
            (r"wealth", "Temenos Wealth", "core"),
            (r"digital", "Temenos Digital", "core"),
            (r"analytics", "Temenos Analytics", "core"),
            (r"datahub", "Temenos Data Hub", "core"),
            (r"modular", "Temenos Modular Banking", "core"),
            (r"\btap\b", "Temenos TAP", "core"),
        ]
        
        for pattern, component_name, category in component_patterns:
            if re.search(pattern, name):
                return {
                    "componentName": service.name,
                    "normalizedName": component_name,
                    "componentCategory": category
                }
        
        # Try service type
        if "temenos" in service.type.lower() or "transact" in service.type.lower():
            return {
                "componentName": service.name,
                "normalizedName": self._normalize_component_name(service.type),
                "componentCategory": "core"
            }
        
        return None

    def _normalize_component_name(self, name: str) -> str:
        """Normalize component name."""
        normalized = re.sub(r"microsoft\.", "", name, flags=re.IGNORECASE)
        normalized = re.sub(r"azure", "", normalized, flags=re.IGNORECASE)
        normalized = re.sub(r"service", "", normalized, flags=re.IGNORECASE)
        normalized = re.sub(r"appinitapp", "", normalized, flags=re.IGNORECASE)
        normalized = re.sub(r"appinit", "", normalized, flags=re.IGNORECASE)
        normalized = normalized.strip()
        return normalized or "Temenos Component"

    def _categorize_component(self, name: str) -> str:
        """Categorize component type."""
        lower_name = name.lower()
        if any(term in lower_name for term in ["microservice", "adapter", "config", "event"]):
            return "microservice"
        return "core"

    def _build_architectural_query(self, component_name: str, category: str) -> str:
        """
        Build comprehensive architectural query with aliases and variations.
        Ensures all microservices get proper RAG queries.
        """
        # Add aliases for better RAG matching - more comprehensive
        aliases_map = {
            "Generic Config Microservice": ["Generic Config", "Generic Configuration", "Config Microservice", "Configuration Service", "genericconfig", "GenericConfig", "generic-config", "Configuration Microservice"],
            "Event Store Microservice": ["Event Store", "EventStore", "Event Hub", "Event Router", "eventstore", "Event Store Microservice", "event-store"],
            "Statement Generation Microservice": ["Statement Generation", "StmtGen", "Statement Service", "stmtgen", "Statement Generation Microservice", "stmt-gen", "Statement Gen"],
            "Adapter Microservice": ["Adapter Service", "Adapter", "Integration Adapter", "Adapter Microservice"],
            "Holdings Microservice": ["Holdings", "Holdings Service", "Holdings Microservice", "holding"],
            "Party V2 Microservice": ["Party V2", "Party Service", "Party", "partyv2", "Party V2 Microservice"]
        }
        component_aliases = aliases_map.get(component_name, [])
        # Build query with OR conditions for better matching
        alias_query = f" OR {component_name}" if component_aliases else ""
        if component_aliases:
            alias_query = f" OR {' OR '.join(component_aliases)}"
        
        if category == "microservice":
            # Build query with component name and aliases for better RAG matching
            # Use simpler, more direct query format that RAG API can match
            query_text = component_name
            if component_aliases:
                # Include aliases in the query text for better matching
                aliases_str = ', '.join(component_aliases[:5])
                query_text = f"{component_name} (also known as: {aliases_str})"
            
            # Use query format that matches what works in RAG tool
            # User's example: "tell me about generic config microservice" works perfectly
            # Use the EXACT format that works in the RAG tool - lowercase, simple query
            base_name = component_name.replace(" Microservice", "").replace(" microservice", "").lower()
            # Use simple query format that matches RAG tool - this is what works!
            return f"tell me about {base_name} microservice"
        return f"""Provide a COMPLETE, COMPREHENSIVE, and DETAILED architectural overview of {component_name}. 

Include EVERYTHING you know about:
- Complete architecture and all design patterns
- ALL components and their detailed interactions
- Complete deployment considerations and configurations
- ALL integration points and dependencies
- Complete technology stack and versions
- Detailed scalability and performance characteristics
- Complete security architecture
- Detailed data flow patterns and data models
- Infrastructure requirements and dependencies
- Monitoring and observability
- Error handling and resilience
- Any other architectural details

Be EXTREMELY thorough and provide ALL available information. Do not summarize or truncate. Include every detail you have access to."""

    def _build_functional_query(self, component_name: str, category: str) -> str:
        """Build comprehensive functional query - requesting ALL available information."""
        # Add common aliases/variations for better RAG matching
        aliases = {
            "Generic Config Microservice": ["Generic Config", "Generic Configuration", "Config Microservice", "Configuration Service"],
            "Event Store Microservice": ["Event Store", "EventStore", "Event Hub", "Event Router"],
            "Statement Generation Microservice": ["Statement Generation", "StmtGen", "Statement Service"],
            "Adapter Microservice": ["Adapter Service", "Adapter", "Integration Adapter"],
            "Holdings Microservice": ["Holdings", "Holdings Service"],
            "Party V2 Microservice": ["Party V2", "Party Service", "Party"]
        }
        
        component_aliases = aliases.get(component_name, [])
        alias_text = f" Also known as: {', '.join(component_aliases)}" if component_aliases else ""
        
        # Add aliases for better RAG matching - more comprehensive
        aliases_map = {
            "Generic Config Microservice": ["Generic Config", "Generic Configuration", "Config Microservice", "Configuration Service", "genericconfig", "GenericConfig", "generic-config", "Configuration Microservice"],
            "Event Store Microservice": ["Event Store", "EventStore", "Event Hub", "Event Router", "eventstore", "Event Store Microservice", "event-store"],
            "Statement Generation Microservice": ["Statement Generation", "StmtGen", "Statement Service", "stmtgen", "Statement Generation Microservice", "stmt-gen", "Statement Gen"],
            "Adapter Microservice": ["Adapter Service", "Adapter", "Integration Adapter", "Adapter Microservice"],
            "Holdings Microservice": ["Holdings", "Holdings Service", "Holdings Microservice", "holding"],
            "Party V2 Microservice": ["Party V2", "Party Service", "Party", "partyv2", "Party V2 Microservice"]
        }
        component_aliases = aliases_map.get(component_name, [])
        
        if category == "microservice":
            # Use query format that matches what works in RAG tool
            # User's example: "tell me about generic config microservice" works perfectly
            # Use the EXACT format that works in the RAG tool - lowercase, simple query
            base_name = component_name.replace(" Microservice", "").replace(" microservice", "").lower()
            # Use simple query format that matches RAG tool - this is what works!
            return f"tell me about {base_name} microservice"
        return f"""Provide a COMPLETE, COMPREHENSIVE, and DETAILED functional overview of {component_name}. 

Include EVERYTHING you know about:
- ALL core functional capabilities (complete list)
- ALL business functions and features (complete list)
- ALL use cases and scenarios (detailed)
- ALL key business processes (detailed)
- ALL data management capabilities
- ALL APIs and interfaces (complete list)
- ALL business rules (complete list)
- ALL workflow capabilities
- ALL reporting features
- Configuration and settings
- Feature details
- Any other functional information

Be EXTREMELY thorough and provide ALL available information. Do not summarize or truncate. Include every detail you have access to."""

    async def query_rag(
        self,
        question: str,
        region: str = "global",
        rag_model_id: str = "ModularBanking, TechnologyOverview",
        context: Optional[str] = None,
        jwt_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """Public method to query RAG API."""
        return await self._query_rag(question, region, rag_model_id, context, jwt_token)

    async def _query_rag(
        self,
        question: str,
        region: str = "global",
        rag_model_id: str = "ModularBanking, TechnologyOverview",
        context: Optional[str] = None,
        jwt_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """Query the Temenos RAG API via adapter."""
        if self.rag_adapter is None:
            raise RuntimeError(
                "RAG adapter is not initialized. Please check RAG_JWT_TOKEN and RAG_API_URL environment variables."
            )
        return await self.rag_adapter.query(
            question=question,
            region=region,
            rag_model_id=rag_model_id,
            context=context,
            jwt_token=jwt_token
        )

    def _consolidate_rag_response(self, text: str, response_type: str = "architectural") -> str:
        """Consolidate and deduplicate RAG responses to remove redundancy and improve coherence."""
        if not text or text in ["Information not available - timeout", "Information not available"]:
            return text
        
        # Remove common redundant section headers that appear multiple times
        # Replace multiple occurrences of same headers with single occurrence
        text = re.sub(r'(ARCHITECTURE OVERVIEW\s*\n)', '', text, flags=re.IGNORECASE)
        text = re.sub(r'(DEPLOYMENT ARCHITECTURE\s*\n)', '', text, flags=re.IGNORECASE)
        text = re.sub(r'(FUNCTIONAL OVERVIEW\s*\n)', '', text, flags=re.IGNORECASE)
        text = re.sub(r'(KEY CAPABILITIES\s*\n)', '', text, flags=re.IGNORECASE)
        
        # Split into paragraphs
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        
        # Remove duplicate paragraphs (exact or near-duplicate)
        seen_paragraphs = set()
        unique_paragraphs = []
        
        for para in paragraphs:
            # Normalize paragraph for comparison
            normalized = re.sub(r'\s+', ' ', para.lower()).strip()
            # Remove common prefixes/suffixes
            normalized = re.sub(r'^(the|a|an)\s+', '', normalized)
            
            # Check if we've seen a very similar paragraph
            is_duplicate = False
            for seen in seen_paragraphs:
                # Check for high similarity (80% word overlap for longer paragraphs)
                if len(normalized) > 100 and len(seen) > 100:
                    seen_words = set(seen.split())
                    para_words = set(normalized.split())
                    if len(seen_words) > 0 and len(para_words) > 0:
                        similarity = len(seen_words & para_words) / max(len(seen_words), len(para_words))
                        if similarity > 0.8:
                            is_duplicate = True
                            break
                elif normalized == seen or (len(normalized) > 50 and (normalized in seen or seen in normalized)):
                    is_duplicate = True
                    break
            
            if not is_duplicate:
                unique_paragraphs.append(para)
                seen_paragraphs.add(normalized)
        
        # Remove redundant sentences within paragraphs
        consolidated_paragraphs = []
        seen_sentences = set()
        
        for para in unique_paragraphs:
            # Split into sentences
            sentences = re.split(r'(?<=[.!?])\s+', para)
            unique_sentences = []
            
            for sentence in sentences:
                sentence = sentence.strip()
                if not sentence or len(sentence) < 20:
                    continue
                
                # Normalize sentence
                normalized_sent = re.sub(r'\s+', ' ', sentence.lower()).strip()
                
                # Skip if duplicate
                if normalized_sent not in seen_sentences:
                    # Check for high similarity with existing sentences
                    is_similar = False
                    for seen in seen_sentences:
                        if len(normalized_sent) > 50 and len(seen) > 50:
                            seen_words = set(seen.split())
                            sent_words = set(normalized_sent.split())
                            if len(seen_words) > 0 and len(sent_words) > 0:
                                similarity = len(seen_words & sent_words) / max(len(seen_words), len(sent_words))
                                if similarity > 0.85:  # Very high similarity threshold
                                    is_similar = True
                                    break
                    
                    if not is_similar:
                        unique_sentences.append(sentence)
                        seen_sentences.add(normalized_sent)
            
            if unique_sentences:
                consolidated_paragraphs.append(' '.join(unique_sentences))
        
        # Reconstruct text
        consolidated_text = '\n\n'.join(consolidated_paragraphs)
        
        # Final formatting
        formatted = re.sub(r"\n{3,}", "\n\n", consolidated_text)
        formatted = re.sub(r"[ \t]{3,}", " ", formatted)
        formatted = formatted.strip()
        
        logger.info(f"Consolidated RAG response: {len(text)} -> {len(formatted)} characters ({response_type}, removed {len(text) - len(formatted)} redundant chars)")
        
        return formatted
    
    def _refactor_rag_content(self, architectural_text: str, functional_text: str, component_name: str) -> Tuple[str, str]:
        """
        Refactor RAG content into Component Architecture Brief following exact template.
        
        STRICT RULES:
        - Follow template headings EXACTLY in order
        - NO tables, NO A/B/C labels
        - NO redundancy (each concept once)
        - NO marketing adjectives
        - Short sentences, prefer bullets
        - "Not specified in source" for unknowns
        
        Returns:
            Tuple of (refactored_architectural_overview, refactored_functional_overview)
        """
        if not architectural_text or architectural_text in ["Information not available - timeout", "Information not available"]:
            return architectural_text, functional_text
        
        # Combine both texts for comprehensive analysis
        combined_text = f"{architectural_text}\n\n{functional_text}"
        # Cache lowercase version to avoid multiple conversions
        combined_lower = combined_text.lower()
        
        # Remove marketing prose and contradictions (operates on lowercase)
        cleaned_text = self._remove_marketing_prose(combined_lower)
        
        # Extract component identity
        identity = self._extract_component_identity(architectural_text, component_name)
        
        # Extract why it exists
        why_exists = self._extract_why_exists(cleaned_text)
        
        # Extract core responsibilities
        responsibilities = self._extract_responsibilities(cleaned_text)
        
        # Extract behavioral guarantees
        guarantees = self._extract_behavioral_guarantees(cleaned_text)
        
        # Extract runtime behavior (ONE continuous narrative)
        runtime_behavior = self._extract_runtime_behavior(cleaned_text)
        
        # Extract internal structure
        internal_structure = self._extract_internal_structure(cleaned_text)
        
        # Extract integration contract
        integration = self._extract_integration_contract(cleaned_text)
        
        # Extract deployment & runtime context
        deployment = self._extract_deployment_context(cleaned_text, architectural_text)
        
        # Extract operational characteristics
        operational = self._extract_operational_characteristics(cleaned_text)
        
        # Extract what it enables
        enables = self._extract_what_enables(cleaned_text)
        
        # Extract open questions
        questions = self._extract_open_questions(cleaned_text, component_name)
        
        # Build Component Architecture Brief following EXACT template
        refactored_arch = f"""Component Identity
{identity}

Why This Component Exists
{why_exists}

Core Responsibilities
{responsibilities}

Behavioral Guarantees
{guarantees}

How It Behaves at Runtime
{runtime_behavior}

Internal Structure
{internal_structure}

Integration Contract
{integration}

Deployment & Runtime Context
{deployment}

Operational Characteristics
{operational}

What This Component Enables
{enables}

Open Questions
{questions}"""
        
        # Functional overview removed - all content consolidated
        refactored_func = ""
        
        logger.info(f"Refactored RAG content for {component_name}: arch={len(refactored_arch)} chars")
        
        return refactored_arch.strip(), refactored_func.strip()
    
    def _refactor_rag_content_strict(self, architectural_text: str, functional_text: str, component_name: str) -> str:
        """
        Refactor RAG content into strict client-facing architecture documentation.
        
        MANDATORY RULES:
        1. Use exact 12-section structure - no extra sections, no reordering
        2. Each concept appears ONCE and only once
        3. No speculative language (no "likely", "may", "assumed")
        4. If unknown, state: "Not part of the documented scope."
        5. Separate concerns strictly (Architecture ≠ Deployment ≠ Functional ≠ Operations)
        6. Use concise, professional language
        7. Bullet points syntactically consistent
        8. No marketing fluff, no redundancy, no restatement
        
        Returns:
            Single refactored document following strict 12-section structure
        """
        try:
            if not architectural_text or architectural_text in ["Information not available - timeout", "Information not available"]:
                return self._build_empty_strict_document(component_name)
            
            # Detect if input is already in old format - if so, we need to extract from it
            has_old_format = (
                "## A)" in architectural_text or 
                "## B)" in architectural_text or 
                "| Pattern/Guarantee |" in architectural_text or
                "| Component | Role |" in architectural_text or
                ("Core Architectural Guarantees" in architectural_text and "Component Identity" not in architectural_text) or
                ("ARCHITECTURE OVERVIEW" in architectural_text and "## 1. Purpose & Scope" not in architectural_text)
            )
            
            # If input is already in strict format, validate it before returning
            if "## 1. Purpose & Scope" in architectural_text:
                # Verify it's actually strict format (has all required sections, no old format markers)
                has_all_sections = all(section in architectural_text for section in [
                    "## 1. Purpose & Scope", "## 2. Architectural Role", "## 3. Design Patterns & Guarantees",
                    "## 4. Core Components", "## 5. Data Model & Consistency", "## 6. APIs & Access Patterns",
                    "## 7. Deployment Architecture", "## 8. Scalability & Performance", "## 9. Security Model",
                    "## 10. Observability & Operations", "## 11. Functional Capabilities", "## 12. Explicit Non-Goals / Out-of-Scope"
                ])
                has_old_markers = any(marker in architectural_text for marker in ["## A)", "## B)", "| Pattern/Guarantee |"])
                
                if has_all_sections and not has_old_markers:
                    logger.info(f"Input already in valid strict format for {component_name} - returning as-is")
                    return architectural_text
                else:
                    logger.warning(f"Input claims to be strict format but validation failed for {component_name} (has_all={has_all_sections}, has_old={has_old_markers}) - will refactor")
                    # Continue to refactor it
            
            # Combine texts for analysis
            combined_text = f"{architectural_text}\n\n{functional_text}"
            
            if has_old_format:
                logger.info(f"🔄 Detected old format content for {component_name} - extracting and refactoring to strict format")
                # For old format, try to extract from specific sections
                # Old format has: ## A) Architecture Overview, ## B) Patterns & Guarantees, etc.
                # We'll use the combined text but the extraction functions should handle it
            
            # Extract sections following strict structure (methods handle case-insensitive matching internally)
            sections = {
                "purpose_scope": self._extract_purpose_scope(combined_text, component_name),
                "architectural_role": self._extract_architectural_role(combined_text, component_name),
                "design_patterns": self._extract_design_patterns(combined_text),
                "core_components": self._extract_core_components(combined_text, component_name),
                "data_model": self._extract_data_model(combined_text),
                "apis_access": self._extract_apis_access(combined_text),
                "deployment": self._extract_deployment_architecture(combined_text),
                "scalability": self._extract_scalability_performance(combined_text),
                "security": self._extract_security_model(combined_text),
                "observability": self._extract_observability_operations(combined_text),
                "functional": self._extract_functional_capabilities(functional_text),
                "non_goals": self._extract_non_goals(combined_text)
            }
            
            # Validate extraction quality - if too many sections are empty, log warning
            empty_sections = sum(1 for section in sections.values() if "Not part of the documented scope" in section or len(section.strip()) < 50)
            if empty_sections > 6:  # More than half empty
                logger.warning(f"⚠ Many empty sections extracted for {component_name} ({empty_sections}/12 sections empty) - extraction may have failed")
            
            # Build document following EXACT structure
            refactored = f"""# {component_name}

## 1. Purpose & Scope

{sections['purpose_scope']}

## 2. Architectural Role

{sections['architectural_role']}

## 3. Design Patterns & Guarantees

{sections['design_patterns']}

## 4. Core Components

{sections['core_components']}

## 5. Data Model & Consistency

{sections['data_model']}

## 6. APIs & Access Patterns

{sections['apis_access']}

## 7. Deployment Architecture

{sections['deployment']}

## 8. Scalability & Performance

{sections['scalability']}

## 9. Security Model

{sections['security']}

## 10. Observability & Operations

{sections['observability']}

## 11. Functional Capabilities

{sections['functional']}

## 12. Explicit Non-Goals / Out-of-Scope

{sections['non_goals']}
"""
            
            refactored = refactored.strip()
            
            # Post-process: Remove redundancies and improve structure
            refactored = self._post_process_document(refactored, component_name)
            
            # Final validation: ensure strict format structure is present
            if "## 1. Purpose & Scope" not in refactored:
                logger.error(f"✗ CRITICAL: Refactored document missing strict format header for {component_name}")
                return self._build_empty_strict_document(component_name)
            
            # Verify all 12 sections are present
            required_sections = [
                "## 1. Purpose & Scope",
                "## 2. Architectural Role",
                "## 3. Design Patterns & Guarantees",
                "## 4. Core Components",
                "## 5. Data Model & Consistency",
                "## 6. APIs & Access Patterns",
                "## 7. Deployment Architecture",
                "## 8. Scalability & Performance",
                "## 9. Security Model",
                "## 10. Observability & Operations",
                "## 11. Functional Capabilities",
                "## 12. Explicit Non-Goals / Out-of-Scope"
            ]
            
            missing_sections = [section for section in required_sections if section not in refactored]
            if missing_sections:
                logger.warning(f"⚠ Missing sections in refactored document for {component_name}: {missing_sections}")
                # Still return it - better than nothing, but log the issue
            
            logger.info(f"✓ Refactored strict documentation for {component_name}: {len(refactored)} chars, all sections present: {len(missing_sections) == 0}")
            
            # Final safety check: ensure we always return strict format
            if "## 1. Purpose & Scope" not in refactored:
                logger.error(f"✗ CRITICAL: Post-processing removed headers for {component_name} - returning empty strict format")
                return self._build_empty_strict_document(component_name)
            
            return refactored
        except Exception as e:
            logger.error(f"✗ CRITICAL: Error in _refactor_rag_content_strict for {component_name}: {e}", exc_info=True)
            logger.error(f"  Architectural text length: {len(architectural_text) if architectural_text else 0}")
            logger.error(f"  Functional text length: {len(functional_text) if functional_text else 0}")
            # Always return strict format, even on error
            return self._build_empty_strict_document(component_name)
    
    def _post_process_document(self, document: str, component_name: str) -> str:
        """Post-process document to remove redundancies and improve structure."""
        if not document:
            return self._build_empty_strict_document(component_name)
        
        # CRITICAL: Ensure section headers are preserved
        required_headers = [
            "## 1. Purpose & Scope",
            "## 2. Architectural Role",
            "## 3. Design Patterns & Guarantees",
            "## 4. Core Components",
            "## 5. Data Model & Consistency",
            "## 6. APIs & Access Patterns",
            "## 7. Deployment Architecture",
            "## 8. Scalability & Performance",
            "## 9. Security Model",
            "## 10. Observability & Operations",
            "## 11. Functional Capabilities",
            "## 12. Explicit Non-Goals / Out-of-Scope"
        ]
        
        # Check if all headers are present before processing
        missing_headers = [h for h in required_headers if h not in document]
        if missing_headers:
            logger.warning(f"⚠ Missing headers in document for {component_name}: {missing_headers}")
            return self._build_empty_strict_document(component_name)
        
        lines = document.split('\n')
        processed_lines = []
        seen_content = set()
        
        for line in lines:
            # Keep section headers exactly as-is (critical!)
            if any(line.strip().startswith(header) for header in required_headers):
                processed_lines.append(line)
                continue
            
            # Keep main title
            if line.strip().startswith('#') and not line.strip().startswith('##'):
                processed_lines.append(line)
                continue
            
            # Skip empty lines at section boundaries (we'll add them back)
            if not line.strip():
                if processed_lines and processed_lines[-1].strip() and not processed_lines[-1].startswith('#'):
                    processed_lines.append('')
                continue
            
            # For content lines, check for redundancy
            line_lower = line.lower().strip()
            
            # Skip if line is too short (but keep bullet points)
            if len(line_lower) < 5 and not line_lower.startswith('-'):
                continue
            
            # Skip if we've seen very similar content before
            # Create a signature from the line (remove common words)
            signature_words = [w for w in line_lower.split() if len(w) > 4 and w not in ['that', 'this', 'with', 'from', 'which', 'part', 'documented', 'scope']]
            signature = ' '.join(signature_words[:5])  # Use first 5 meaningful words
            
            if signature and signature in seen_content and len(signature) > 10:
                continue  # Skip duplicate (but allow short lines through)
            
            if signature and len(signature) > 10:
                seen_content.add(signature)
            
            # Clean the line (but preserve structure)
            cleaned_line = self._clean_text(line)
            if cleaned_line and (len(cleaned_line) > 5 or cleaned_line.startswith('-')):
                processed_lines.append(cleaned_line)
        
        # Rejoin and normalize whitespace (but preserve section structure)
        result = '\n'.join(processed_lines)
        result = re.sub(r'\n{4,}', '\n\n', result)  # Max 3 consecutive newlines (allow space between sections)
        result = result.strip()
        
        # Final check: ensure all headers are still present
        missing_after = [h for h in required_headers if h not in result]
        if missing_after:
            logger.error(f"✗ CRITICAL: Post-processing removed headers for {component_name}: {missing_after}")
            return self._build_empty_strict_document(component_name)
        
        return result
    
    def _build_empty_strict_document(self, component_name: str) -> str:
        """Build empty document structure when no RAG data available."""
        return f"""# {component_name}

## 1. Purpose & Scope

- Microservice name: {component_name}
- Responsibility: Not part of the documented scope.
- Out of scope: Not part of the documented scope.

## 2. Architectural Role

- Position in Temenos Transact ecosystem: Not part of the documented scope.
- Relationship to core transactional services: Not part of the documented scope.

## 3. Design Patterns & Guarantees

- CQRS role: Not part of the documented scope.
- Consistency model: Not part of the documented scope.
- Availability and latency guarantees: Not part of the documented scope.

## 4. Core Components

- Core service components: Not part of the documented scope.
- External dependencies: Not part of the documented scope.

## 5. Data Model & Consistency

- Types of data managed: Not part of the documented scope.
- Update propagation model: Not part of the documented scope.
- Consistency implications: Not part of the documented scope.

## 6. APIs & Access Patterns

- API style: Not part of the documented scope.
- Supported operations: Not part of the documented scope.
- Consumer expectations: Not part of the documented scope.

## 7. Deployment Architecture

- Cloud-native model: Not part of the documented scope.
- Kubernetes usage: Not part of the documented scope.
- Helm-based lifecycle management: Not part of the documented scope.

## 8. Scalability & Performance

- Horizontal scaling model: Not part of the documented scope.
- Read optimization techniques: Not part of the documented scope.
- Performance assumptions: Not part of the documented scope.

## 9. Security Model

- Authentication boundary: Not part of the documented scope.
- Authorization model: Not part of the documented scope.
- Data-in-transit and data-at-rest protections: Not part of the documented scope.

## 10. Observability & Operations

- Logging: Not part of the documented scope.
- Monitoring: Not part of the documented scope.
- Health checks: Not part of the documented scope.

## 11. Functional Capabilities

- Business-facing capabilities: Not part of the documented scope.

## 12. Explicit Non-Goals / Out-of-Scope

- Write operations: Not part of the documented scope.
- Real-time consistency: Not part of the documented scope.
- Workflow orchestration: Not part of the documented scope.
"""
    
    def _clean_text(self, text: str) -> str:
        """Remove redundancies, marketing fluff, and normalize text."""
        if not text:
            return ""
        
        # Remove common marketing words and phrases
        marketing_patterns = [
            r'\bpivotal\b', r'\bhighly reliable\b', r'\brobust\b', r'\bcomprehensive\b',
            r'\bseamless\b', r'\bessential\b', r'\bcritical\b', r'\bfoundational\b',
            r'\bindispensable\b', r'\bkey\b', r'\bimportant\b', r'\bpowerful\b',
            r'\badvanced\b', r'\bcutting-edge\b', r'\bstate-of-the-art\b'
        ]
        
        cleaned = text
        for pattern in marketing_patterns:
            cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
        
        # Remove redundant phrases
        redundant_patterns = [
            r'in summary[^.]*\.',
            r'summary[^.]*\.',
            r'to summarize[^.]*\.',
            r'in conclusion[^.]*\.'
        ]
        
        for pattern in redundant_patterns:
            cleaned = re.sub(pattern, '', cleaned, flags=re.IGNORECASE)
        
        # Normalize whitespace
        cleaned = re.sub(r'\s+', ' ', cleaned)
        cleaned = cleaned.strip()
        
        return cleaned
    
    def _extract_from_section(self, text: str, section_markers: list, max_chars: int = 500) -> str:
        """Extract content from a specific section marked by headers."""
        for marker in section_markers:
            # Try to find section content
            pattern = rf"{re.escape(marker)}[^\n]*\n(.*?)(?=\n##|\n###|$)"
            match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
            if match:
                content = match.group(1).strip()
                if len(content) > 20:
                    return self._clean_text(content[:max_chars])
        return ""
    
    def _extract_from_table(self, text: str, table_header: str) -> list:
        """Extract structured data from markdown tables in RAG responses."""
        results = []
        
        # Find table with the header
        pattern = rf"{re.escape(table_header)}.*?\n\|[-\|]+\|(.*?)(?=\n\n|\n##|$)"
        match = re.search(pattern, text, re.IGNORECASE | re.DOTALL)
        
        if match:
            table_content = match.group(1)
            # Parse table rows
            rows = [row.strip() for row in table_content.split('\n') if row.strip().startswith('|')]
            
            for row in rows:
                # Split by | and clean
                cells = [cell.strip() for cell in row.split('|') if cell.strip()]
                if len(cells) >= 2:
                    # Extract meaningful content from cells
                    content = ' '.join(cells[1:])  # Skip first column (usually header)
                    content = self._clean_text(content)
                    if len(content) > 20:
                        results.append(content)
        
        return results
    
    def _extract_purpose_scope(self, text: str, component_name: str) -> str:
        """Extract Purpose & Scope section - improved to handle RAG responses."""
        lines = []
        text_lower = text.lower()
        
        # Try to extract from old format sections first
        old_format_sections = ["## A)", "## A)", "Architecture Overview", "Purpose", "Scope"]
        section_content = self._extract_from_section(text, old_format_sections)
        
        # What the microservice is - improved patterns
        what_is_patterns = [
            re.compile(rf"{re.escape(component_name)}\s+is\s+(?:a|an)\s+([^.]{{20,300}})", re.IGNORECASE),
            re.compile(rf"{re.escape(component_name)}\s+provides\s+([^.]{{20,300}})", re.IGNORECASE),
            re.compile(rf"{re.escape(component_name)}\s+is\s+([^.]{{20,300}})", re.IGNORECASE),
            re.compile(r"is\s+(?:a|an)\s+([^.]{20,300})", re.IGNORECASE),
            re.compile(r"provides\s+([^.]{20,300})", re.IGNORECASE),
            re.compile(r"component\s+that\s+([^.]{20,300})", re.IGNORECASE)
        ]
        
        what_is = "Not part of the documented scope."
        for pattern in what_is_patterns:
            match = pattern.search(text)
            if match:
                extracted = match.group(1).strip().rstrip('.')
                extracted = self._clean_text(extracted)
                if len(extracted) > 20 and len(extracted) < 300:
                    what_is = extracted
                    break
        
        # If we found section content, try to extract from it
        if section_content and what_is == "Not part of the documented scope.":
            for pattern in what_is_patterns:
                match = pattern.search(section_content)
                if match:
                    extracted = match.group(1).strip().rstrip('.')
                    extracted = self._clean_text(extracted)
                    if len(extracted) > 20:
                        what_is = extracted
                        break
        
        lines.append(f"- What the microservice is: {what_is}")
        
        # Responsibilities - improved extraction
        resp_patterns = [
            re.compile(r"(?:responsible|handles|manages|provides|ensures|guarantees|supports|enables)\s+([^.]{30,400})", re.IGNORECASE),
            re.compile(r"(?:captures|stores|routes|processes|delivers)\s+([^.]{30,400})", re.IGNORECASE),
            re.compile(r"(?:function|capability|feature)\s+(?:is|to|of)\s+([^.]{30,400})", re.IGNORECASE)
        ]
        
        responsibilities = []
        seen = set()
        
        # Search in full text and section content
        search_texts = [text]
        if section_content:
            search_texts.append(section_content)
        
        for search_text in search_texts:
            for pattern in resp_patterns:
                for match in pattern.finditer(search_text):
                    resp = match.group(1).strip().rstrip('.')
                    resp = self._clean_text(resp)
                    resp_lower = resp.lower()
                    
                    # Filter out redundant or too short responses
                    if (len(resp) > 30 and len(resp) < 400 and 
                        resp_lower not in seen and
                        not any(word in resp_lower for word in ['summary', 'conclusion', 'overview'])):
                        responsibilities.append(f"  - {resp}")
                        seen.add(resp_lower)
                        if len(responsibilities) >= 5:
                            break
                if len(responsibilities) >= 5:
                    break
            if len(responsibilities) >= 5:
                break
        
        if not responsibilities:
            lines.append("- What it is explicitly responsible for: Not part of the documented scope.")
        else:
            lines.append("- What it is explicitly responsible for:")
            lines.extend(responsibilities[:5])
        
        # Not responsible for
        not_resp_patterns = [
            re.compile(r"(?:not|does not|doesn't|out of scope|excluded)\s+(?:responsible|handle|manage|provide|include)\s+([^.]{20,300})", re.IGNORECASE),
            re.compile(r"out of scope[^.]{0,100}([^.]{20,300})", re.IGNORECASE),
            re.compile(r"(?:does not|doesn't)\s+(?:support|handle|process|manage)\s+([^.]{20,300})", re.IGNORECASE)
        ]
        
        not_responsible = []
        seen = set()
        for pattern in not_resp_patterns:
            for match in pattern.finditer(text):
                not_resp = match.group(1).strip().rstrip('.')
                not_resp = self._clean_text(not_resp)
                not_resp_lower = not_resp.lower()
                if len(not_resp) > 20 and not_resp_lower not in seen:
                    not_responsible.append(f"  - {not_resp}")
                    seen.add(not_resp_lower)
                    if len(not_responsible) >= 3:
                        break
            if len(not_responsible) >= 3:
                break
        
        if not_responsible:
            lines.append("- What it is explicitly NOT responsible for:")
            lines.extend(not_responsible[:3])
        else:
            lines.append("- What it is explicitly NOT responsible for: Not part of the documented scope.")
        
        return "\n".join(lines)
    
    def _extract_architectural_role(self, text: str, component_name: str) -> str:
        """Extract Architectural Role section."""
        lines = []
        
        # Position in ecosystem
        position_patterns = [
            r"(?:in|within|part of)\s+temenos\s+transact[^.]{0,150}",
            r"temenos\s+transact[^.]{0,150}(?:ecosystem|platform|architecture)",
            r"position[^.]{0,100}([^.]{30,200})"
        ]
        position = "Not part of the documented scope."
        for pattern in position_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                position = match.group(0).strip().rstrip('.')
                if len(position) > 30:
                    break
        
        lines.append(f"- Position in Temenos Transact ecosystem: {position}")
        
        # Relationship to core services
        relationship_patterns = [
            r"(?:integrates|connects|relates|interacts)\s+with\s+([^.]{30,200})",
            r"relationship\s+to\s+([^.]{30,200})",
            r"(?:depends|depends on|uses)\s+([^.]{30,200})"
        ]
        relationships = []
        seen = set()
        for pattern in relationship_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                rel = match.group(1).strip().rstrip('.')
                if len(rel) > 30 and rel.lower() not in seen:
                    relationships.append(f"  - {rel}")
                    seen.add(rel.lower())
                    if len(relationships) >= 5:
                        break
        
        if relationships:
            lines.append("- Relationship to core transactional services:")
            lines.extend(relationships[:5])
        else:
            lines.append("- Relationship to core transactional services: Not part of the documented scope.")
        
        return "\n".join(lines)
    
    def _extract_design_patterns(self, text: str) -> str:
        """Extract Design Patterns & Guarantees section - improved for RAG responses."""
        lines = []
        
        # Try to extract from old format Patterns & Guarantees section
        patterns_section = self._extract_from_section(text, ["## B)", "Patterns & Guarantees", "Pattern/Guarantee"])
        
        # CQRS role - improved extraction
        cqrs_patterns = [
            re.compile(r"cqrs[^.]{0,400}", re.IGNORECASE),
            re.compile(r"command.*query.*separation[^.]{0,400}", re.IGNORECASE),
            re.compile(r"(?:read|query|write|command)\s+side[^.]{0,400}", re.IGNORECASE),
            re.compile(r"cqrs\s+pattern[^.]{0,400}", re.IGNORECASE)
        ]
        
        cqrs_role = "Not part of the documented scope."
        search_texts = [text]
        if patterns_section:
            search_texts.append(patterns_section)
        
        for search_text in search_texts:
            for pattern in cqrs_patterns:
                match = pattern.search(search_text)
                if match:
                    extracted = match.group(0).strip().rstrip('.')
                    extracted = self._clean_text(extracted)
                    if len(extracted) > 10:
                        cqrs_role = extracted[:300]
                        break
            if cqrs_role != "Not part of the documented scope.":
                break
        
        lines.append(f"- CQRS role: {cqrs_role}")
        
        # Consistency model - improved extraction (also check tables)
        consistency_patterns = [
            re.compile(r"(?:at-least-once|at-most-once|exactly-once|eventual|strong|weak)\s+[^.]{0,300}", re.IGNORECASE),
            re.compile(r"consistency\s+model[^.]{0,400}", re.IGNORECASE),
            re.compile(r"event\s+ordering[^.]{0,400}", re.IGNORECASE),
            re.compile(r"delivery\s+guarantee[^.]{0,400}", re.IGNORECASE),
            re.compile(r"(?:guarantees|ensures)\s+(?:at-least-once|ordering|uniqueness)[^.]{0,400}", re.IGNORECASE)
        ]
        
        consistency = "Not part of the documented scope."
        
        # Try extracting from table first (old format often uses tables)
        table_rows = self._extract_from_table(text, "Pattern/Guarantee")
        for row in table_rows:
            if any(word in row.lower() for word in ['consistency', 'ordering', 'delivery', 'at-least-once']):
                consistency = row[:300]
                break
        
        # If not found in table, try patterns
        if consistency == "Not part of the documented scope.":
            for search_text in search_texts:
                for pattern in consistency_patterns:
                    match = pattern.search(search_text)
                    if match:
                        extracted = match.group(0).strip().rstrip('.')
                        extracted = self._clean_text(extracted)
                        if len(extracted) > 15:
                            consistency = extracted[:300]
                            break
                if consistency != "Not part of the documented scope.":
                    break
        
        lines.append(f"- Consistency model: {consistency}")
        
        # Availability and latency guarantees - improved extraction
        availability_patterns = [
            re.compile(r"(?:availability|uptime|sla|high availability)[^.]{0,400}", re.IGNORECASE),
            re.compile(r"(?:latency|response time|performance|throughput)[^.]{0,400}", re.IGNORECASE),
            re.compile(r"(?:guarantees|sla|slo|service level)[^.]{0,400}", re.IGNORECASE)
        ]
        
        guarantees = []
        seen = set()
        for search_text in search_texts:
            for pattern in availability_patterns:
                matches = re.finditer(pattern, search_text, re.IGNORECASE)
                for match in matches:
                    guarantee = match.group(0).strip().rstrip('.')
                    guarantee = self._clean_text(guarantee)
                    if guarantee.lower() not in seen and len(guarantee) > 15:
                        guarantees.append(f"  - {guarantee[:200]}")
                        seen.add(guarantee.lower())
                        if len(guarantees) >= 3:
                            break
                if len(guarantees) >= 3:
                    break
            if len(guarantees) >= 3:
                break
        
        if guarantees:
            lines.append("- Availability and latency guarantees:")
            lines.extend(guarantees[:3])
        else:
            lines.append("- Availability and latency guarantees: Not part of the documented scope.")
        
        return "\n".join(lines)
    
    def _extract_core_components(self, text: str, component_name: str) -> str:
        """Extract Core Components section."""
        lines = []
        
        # Main components
        component_patterns = [
            r"(?:component|service|module|layer)\s+(?:named|called|is)\s+([A-Z][a-zA-Z\s]+?)(?:[.,]|\s+that|\s+which)",
            r"([A-Z][a-zA-Z\s]+?)\s+(?:microservice|service|component|store|database)"
        ]
        components = []
        seen = set()
        for pattern in component_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                comp = match.group(1).strip()
                if len(comp) > 3 and comp.lower() not in seen and component_name.lower() not in comp.lower():
                    components.append(f"  - {comp}")
                    seen.add(comp.lower())
                    if len(components) >= 5:
                        break
        
        if components:
            lines.append(f"- {component_name} Microservice:")
            lines.extend(components[:5])
        else:
            lines.append(f"- {component_name} Microservice: Not part of the documented scope.")
        
        # External dependencies
        dependency_patterns = [
            r"(?:depends|uses|requires|integrates with)\s+([A-Z][a-zA-Z\s]+?)(?:[.,]|\s+for)",
            r"(?:azure|aws|kubernetes|postgresql|mongodb|event hub|event hub|kafka)"
        ]
        dependencies = []
        seen = set()
        for pattern in dependency_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                dep = match.group(1).strip() if match.lastindex else match.group(0).strip()
                if len(dep) > 3 and dep.lower() not in seen:
                    dependencies.append(f"  - {dep}")
                    seen.add(dep.lower())
                    if len(dependencies) >= 5:
                        break
        
        if dependencies:
            lines.append("- External dependencies:")
            lines.extend(dependencies[:5])
        else:
            lines.append("- External dependencies: Not part of the documented scope.")
        
        return "\n".join(lines)
    
    def _extract_data_model(self, text: str) -> str:
        """Extract Data Model & Consistency section."""
        lines = []
        
        # Types of data
        data_patterns = [
            r"(?:manages|stores|handles)\s+([^.]{30,200})\s+data",
            r"data\s+(?:types|structures|models|schemas)[^.]{0,200}",
            r"(?:events|transactions|records|documents)[^.]{0,200}"
        ]
        data_types = []
        seen = set()
        for pattern in data_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                data_type = match.group(1).strip().rstrip('.') if match.lastindex else match.group(0).strip().rstrip('.')
                if len(data_type) > 20 and data_type.lower() not in seen:
                    data_types.append(f"  - {data_type}")
                    seen.add(data_type.lower())
                    if len(data_types) >= 5:
                        break
        
        if data_types:
            lines.append("- Types of data managed:")
            lines.extend(data_types[:5])
        else:
            lines.append("- Types of data managed: Not part of the documented scope.")
        
        # Update propagation
        propagation_patterns = [
            r"(?:propagates|replicates|synchronizes|distributes)[^.]{0,200}",
            r"(?:event|change|update)\s+(?:propagation|replication|synchronization)[^.]{0,200}",
            r"(?:publish|subscribe|stream)[^.]{0,200}"
        ]
        propagation = "Not part of the documented scope."
        for pattern in propagation_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                propagation = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Update propagation model: {propagation}")
        
        # Consistency implications
        implications_patterns = [
            r"consistency[^.]{0,200}(?:for|to|in)\s+([^.]{30,200})",
            r"consumers[^.]{0,200}(?:expect|receive|see)[^.]{0,200}"
        ]
        implications = "Not part of the documented scope."
        for pattern in implications_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                implications = match.group(1).strip().rstrip('.') if match.lastindex else match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Consistency implications for consumers: {implications}")
        
        return "\n".join(lines)
    
    def _extract_apis_access(self, text: str) -> str:
        """Extract APIs & Access Patterns section."""
        lines = []
        
        # API style
        api_style_patterns = [
            r"(?:rest|graphql|grpc|soap|http|json|graphql)[^.]{0,100}",
            r"api\s+(?:style|type|protocol)[^.]{0,200}",
            r"(?:restful|graphql|grpc)\s+api"
        ]
        api_style = "Not part of the documented scope."
        for pattern in api_style_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                api_style = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- API style: {api_style}")
        
        # Supported operations
        operation_patterns = [
            r"(?:get|post|put|delete|patch|query|read|write|create|update)[^.]{0,150}",
            r"(?:operations|methods|endpoints|actions)[^.]{0,200}"
        ]
        operations = []
        seen = set()
        for pattern in operation_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                op = match.group(0).strip().rstrip('.')
                if op.lower() not in seen:
                    operations.append(f"  - {op}")
                    seen.add(op.lower())
                    if len(operations) >= 5:
                        break
        
        if operations:
            lines.append("- Supported operations:")
            lines.extend(operations[:5])
        else:
            lines.append("- Supported operations: Not part of the documented scope.")
        
        # Consumer expectations
        expectations_patterns = [
            r"consumers[^.]{0,200}(?:expect|receive|can|should)[^.]{0,200}",
            r"(?:client|consumer|caller)[^.]{0,200}(?:expect|receive)[^.]{0,200}"
        ]
        expectations = "Not part of the documented scope."
        for pattern in expectations_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                expectations = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Consumer expectations: {expectations}")
        
        return "\n".join(lines)
    
    def _extract_deployment_architecture(self, text: str) -> str:
        """Extract Deployment Architecture section."""
        lines = []
        
        # Cloud-native model
        cloud_patterns = [
            r"(?:cloud-native|containerized|microservices)[^.]{0,200}",
            r"(?:azure|aws|gcp)[^.]{0,200}",
            r"(?:kubernetes|k8s|aks|eks|gke)[^.]{0,200}"
        ]
        cloud_model = "Not part of the documented scope."
        for pattern in cloud_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                cloud_model = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Cloud-native model: {cloud_model}")
        
        # Kubernetes usage
        k8s_patterns = [
            r"kubernetes[^.]{0,200}",
            r"k8s[^.]{0,200}",
            r"(?:aks|eks|gke)[^.]{0,200}",
            r"(?:deployment|pod|service|namespace)[^.]{0,200}"
        ]
        k8s_usage = "Not part of the documented scope."
        for pattern in k8s_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                k8s_usage = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Kubernetes usage: {k8s_usage}")
        
        # Helm
        helm_patterns = [
            r"helm[^.]{0,200}",
            r"(?:chart|deployment|lifecycle)[^.]{0,200}"
        ]
        helm = "Not part of the documented scope."
        for pattern in helm_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                helm = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Helm-based lifecycle management: {helm}")
        
        # Azure specifics
        azure_patterns = [
            r"azure[^.]{0,200}(?:event hub|sql|postgresql|cosmos|aks|container apps)",
            r"(?:event hub|sql database|postgresql|cosmos db|aks|aca)[^.]{0,200}"
        ]
        azure_specifics = []
        seen = set()
        for pattern in azure_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                azure = match.group(0).strip().rstrip('.')
                if azure.lower() not in seen:
                    azure_specifics.append(f"  - {azure}")
                    seen.add(azure.lower())
                    if len(azure_specifics) >= 3:
                        break
        
        if azure_specifics:
            lines.append("- Azure deployment specifics:")
            lines.extend(azure_specifics[:3])
        else:
            lines.append("- Azure deployment specifics: Not part of the documented scope.")
        
        return "\n".join(lines)
    
    def _extract_scalability_performance(self, text: str) -> str:
        """Extract Scalability & Performance section."""
        lines = []
        
        # Horizontal scaling
        scaling_patterns = [
            r"(?:horizontal|vertical)\s+scaling[^.]{0,200}",
            r"scales[^.]{0,200}",
            r"(?:replicas|instances|pods)[^.]{0,200}"
        ]
        scaling = "Not part of the documented scope."
        for pattern in scaling_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                scaling = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Horizontal scaling model: {scaling}")
        
        # Read optimization
        read_patterns = [
            r"(?:read|query)\s+(?:optimization|performance|caching)[^.]{0,200}",
            r"(?:cache|caching|index|indexing)[^.]{0,200}",
            r"(?:optimize|optimization)[^.]{0,200}(?:read|query)"
        ]
        read_opt = "Not part of the documented scope."
        for pattern in read_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                read_opt = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Read optimization techniques: {read_opt}")
        
        # Performance assumptions
        perf_patterns = [
            r"(?:performance|throughput|latency|response time)[^.]{0,200}",
            r"(?:tps|transactions per second|requests per second)[^.]{0,200}"
        ]
        perf = "Not part of the documented scope."
        for pattern in perf_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                perf = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Performance assumptions: {perf}")
        
        return "\n".join(lines)
    
    def _extract_security_model(self, text: str) -> str:
        """Extract Security Model section."""
        lines = []
        
        # Authentication
        auth_patterns = [
            r"(?:authentication|auth|jwt|oauth|keycloak)[^.]{0,200}",
            r"(?:authenticate|login|token)[^.]{0,200}"
        ]
        auth = "Not part of the documented scope."
        for pattern in auth_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                auth = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Authentication boundary: {auth}")
        
        # Authorization
        authz_patterns = [
            r"(?:authorization|authorize|permissions|roles|rbac)[^.]{0,200}",
            r"(?:access control|permission|role)[^.]{0,200}"
        ]
        authz = "Not part of the documented scope."
        for pattern in authz_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                authz = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Authorization model: {authz}")
        
        # Data protection
        protection_patterns = [
            r"(?:encryption|encrypt|tls|ssl|https)[^.]{0,200}",
            r"(?:data-in-transit|data-at-rest|data protection)[^.]{0,200}",
            r"(?:secure|security)[^.]{0,200}"
        ]
        protection = []
        seen = set()
        for pattern in protection_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                prot = match.group(0).strip().rstrip('.')
                if prot.lower() not in seen:
                    protection.append(f"  - {prot}")
                    seen.add(prot.lower())
                    if len(protection) >= 3:
                        break
        
        if protection:
            lines.append("- Data-in-transit and data-at-rest protections:")
            lines.extend(protection[:3])
        else:
            lines.append("- Data-in-transit and data-at-rest protections: Not part of the documented scope.")
        
        return "\n".join(lines)
    
    def _extract_observability_operations(self, text: str) -> str:
        """Extract Observability & Operations section."""
        lines = []
        
        # Logging
        logging_patterns = [
            r"(?:logging|logs|log)[^.]{0,200}",
            r"(?:structured|unstructured)\s+logging[^.]{0,200}"
        ]
        logging = "Not part of the documented scope."
        for pattern in logging_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                logging = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Logging: {logging}")
        
        # Monitoring
        monitoring_patterns = [
            r"(?:monitoring|metrics|prometheus|grafana)[^.]{0,200}",
            r"(?:observe|observability|telemetry)[^.]{0,200}"
        ]
        monitoring = "Not part of the documented scope."
        for pattern in monitoring_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                monitoring = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Monitoring: {monitoring}")
        
        # Health checks
        health_patterns = [
            r"(?:health|healthcheck|liveness|readiness)[^.]{0,200}",
            r"(?:probe|status|check)[^.]{0,200}"
        ]
        health = "Not part of the documented scope."
        for pattern in health_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                health = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Health checks: {health}")
        
        return "\n".join(lines)
    
    def _extract_functional_capabilities(self, functional_text: str) -> str:
        """Extract Functional Capabilities section - business-facing only."""
        if not functional_text or functional_text in ["Information not available", "Information not available - timeout"]:
            return "- Business-facing capabilities: Not part of the documented scope."
        
        lines = []
        
        # Extract business capabilities
        capability_patterns = [
            r"(?:provides|enables|supports|handles|manages)\s+([^.]{30,200})",
            r"(?:capability|feature|function)[^.]{0,100}([^.]{30,200})"
        ]
        capabilities = []
        seen = set()
        for pattern in capability_patterns:
            matches = re.finditer(pattern, functional_text, re.IGNORECASE)
            for match in matches:
                cap = match.group(1).strip().rstrip('.') if match.lastindex else match.group(0).strip().rstrip('.')
                if len(cap) > 30 and cap.lower() not in seen:
                    capabilities.append(f"  - {cap}")
                    seen.add(cap.lower())
                    if len(capabilities) >= 10:
                        break
        
        if capabilities:
            lines.append("- Business-facing capabilities:")
            lines.extend(capabilities[:10])
        else:
            lines.append("- Business-facing capabilities: Not part of the documented scope.")
        
        return "\n".join(lines)
    
    def _extract_non_goals(self, text: str) -> str:
        """Extract Explicit Non-Goals / Out-of-Scope section."""
        lines = []
        
        # Write operations
        write_patterns = [
            r"(?:does not|doesn't|not)\s+(?:write|create|update|modify|change)[^.]{0,200}",
            r"(?:read-only|read only|readonly)[^.]{0,200}"
        ]
        write_ops = "Not part of the documented scope."
        for pattern in write_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                write_ops = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Write operations: {write_ops}")
        
        # Real-time consistency
        realtime_patterns = [
            r"(?:not|does not|doesn't)\s+(?:real-time|realtime|synchronous)[^.]{0,200}",
            r"(?:eventual|asynchronous|async)[^.]{0,200}consistency"
        ]
        realtime = "Not part of the documented scope."
        for pattern in realtime_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                realtime = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Real-time consistency: {realtime}")
        
        # Workflow orchestration
        workflow_patterns = [
            r"(?:does not|doesn't|not)\s+(?:orchestrate|orchestration|workflow)[^.]{0,200}",
            r"out of scope[^.]{0,100}(?:workflow|orchestration)"
        ]
        workflow = "Not part of the documented scope."
        for pattern in workflow_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                workflow = match.group(0).strip().rstrip('.')
                break
        
        lines.append(f"- Workflow orchestration: {workflow}")
        
        return "\n".join(lines)
    
    def _remove_marketing_prose(self, text: str) -> str:
        """Remove marketing adjectives and summary sections."""
        # Use pre-compiled regex patterns for performance
        for pattern in self._MARKETING_WORDS:
            text = pattern.sub('', text)
        
        # Remove "In summary" sections using pre-compiled patterns
        for pattern in self._SUMMARY_PATTERNS:
            text = pattern.sub('', text)
        
        return text
    
    def _extract_component_identity(self, text: str, component_name: str) -> str:
        """Extract Component Identity section."""
        lines = []
        
        # Component name
        lines.append(f"- Component name: {component_name}")
        
        # One-line positioning
        positioning_patterns = [
            r"is\s+(?:a|an)\s+([^.]{20,120})",
            r"provides\s+([^.]{20,120})",
            r"enables\s+([^.]{20,120})"
        ]
        positioning = "Not specified in source"
        for pattern in positioning_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                positioning = match.group(1).strip()
                if positioning.endswith('.'):
                    positioning = positioning[:-1]
                break
        lines.append(f"- One-line positioning: {positioning}")
        
        # Where it sits
        where_patterns = [
            r"(?:in|within|part of)\s+temenos\s+transact[^.]{0,80}",
            r"temenos\s+transact[^.]{0,80}",
            r"(?:in|within|part of)\s+([^.]{20,100})"
        ]
        where_sits = "Not specified in source"
        for pattern in where_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                where_sits = match.group(0).strip()
                if where_sits.endswith('.'):
                    where_sits = where_sits[:-1]
                break
        lines.append(f"- Where it sits: {where_sits}")
        
        # Why it exists
        why_patterns = [
            r"(?:ensures|guarantees|provides|enables|supports)\s+([^.]{30,150})",
            r"(?:to|for)\s+([^.]{20,150})"
        ]
        why_exists = "Not specified in source"
        for pattern in why_patterns:
            match = re.search(pattern, text, re.IGNORECASE)
            if match:
                why_exists = match.group(1).strip()
                if why_exists.endswith('.'):
                    why_exists = why_exists[:-1]
                break
        lines.append(f"- Why it exists (one sentence): {why_exists}")
        
        return "\n".join(lines)
    
    def _extract_why_exists(self, text: str) -> str:
        """Extract Why This Component Exists section."""
        problem_bullets = []
        value_bullets = []
        
        # Extract problems it solves
        problem_patterns = [
            r"(?:solves|addresses|handles|manages)\s+([^.]{20,150})",
            r"(?:problem|challenge|issue)\s+[^.]{0,100}([^.]{20,150})"
        ]
        seen_problems = set()
        for pattern in problem_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                problem = match.group(1).strip() if match.lastindex else match.group(0).strip()
                if len(problem) > 20 and problem.lower() not in seen_problems:
                    problem_bullets.append(f"- {problem}")
                    seen_problems.add(problem.lower())
                    if len(problem_bullets) >= 5:
                        break
        
        # Extract value it provides
        value_patterns = [
            r"(?:enables|allows|provides|supports|facilitates)\s+([^.]{20,150})",
            r"(?:benefit|value|advantage)[^.]{0,50}([^.]{20,150})"
        ]
        seen_values = set()
        for pattern in value_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                value = match.group(1).strip() if match.lastindex else match.group(0).strip()
                if len(value) > 20 and value.lower() not in seen_values:
                    value_bullets.append(f"- {value}")
                    seen_values.add(value.lower())
                    if len(value_bullets) >= 5:
                        break
        
        if not problem_bullets:
            problem_bullets.append("- Not specified in source")
        if not value_bullets:
            value_bullets.append("- Not specified in source")
        
        return f"Problem it solves:\n" + "\n".join(problem_bullets[:5]) + "\nValue it provides:\n" + "\n".join(value_bullets[:5])
    
    def _extract_responsibilities(self, text: str) -> str:
        """Extract Core Responsibilities section."""
        responsible_bullets = []
        not_responsible_bullets = []
        
        # Extract what it's responsible for
        responsible_patterns = [
            r"(?:responsible|handles|manages|processes|stores|routes|ensures)\s+([^.]{20,150})",
            r"(?:provides|delivers|maintains)\s+([^.]{20,150})"
        ]
        seen_responsible = set()
        for pattern in responsible_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                resp = match.group(1).strip() if match.lastindex else match.group(0).strip()
                if len(resp) > 20 and resp.lower() not in seen_responsible:
                    responsible_bullets.append(f"- {resp}")
                    seen_responsible.add(resp.lower())
                    if len(responsible_bullets) >= 6:
                        break
        
        # Extract what it's NOT responsible for (less common, but check)
        not_patterns = [
            r"(?:not|does not|doesn't|excluded|out of scope)\s+([^.]{20,150})"
        ]
        for pattern in not_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                not_resp = match.group(1).strip()
                if len(not_resp) > 20:
                    not_responsible_bullets.append(f"- {not_resp}")
                    if len(not_responsible_bullets) >= 3:
                        break
        
        if not responsible_bullets:
            responsible_bullets.append("- Not specified in source")
        if not not_responsible_bullets:
            not_responsible_bullets.append("- Not specified in source")
        
        return f"This component is responsible for:\n" + "\n".join(responsible_bullets[:6]) + "\nThis component is NOT responsible for:\n" + "\n".join(not_responsible_bullets[:3])
    
    def _extract_behavioral_guarantees(self, text: str) -> str:
        """Extract Behavioral Guarantees section."""
        guarantees_bullets = []
        not_guarantees_bullets = []
        
        # Extract guarantees
        guarantee_patterns = {
            "Transactional Outbox": (r"transactional.*outbox|outbox.*pattern", "Events published only after successful database transactions"),
            "Immutability": (r"immutable|cannot.*modif|append-only", "Events cannot be modified or deleted once written"),
            "Event Ordering": (r"order|sequence|strict.*order", "Events processed in strict sequence within partitions"),
            "Event Uniqueness": (r"unique|deduplicat|idempotent", "Each event has unique identifier preventing duplicates"),
            "Replay": (r"replay|reprocess|historical", "Consumers can replay events from any historical point"),
            "At-least-once Delivery": (r"at.*least.*once|guaranteed.*delivery", "Events guaranteed to be delivered at least once"),
            "Schema Validation": (r"schema|validat|cloudevents", "Events must conform to predefined schemas")
        }
        
        seen_guarantees = set()
        for guarantee_name, (pattern, default_desc) in guarantee_patterns.items():
            if re.search(pattern, text, re.IGNORECASE) and guarantee_name.lower() not in seen_guarantees:
                # Try to extract actual description
                matches = list(re.finditer(pattern, text, re.IGNORECASE))
                if matches:
                    match = matches[0]
                    start = max(0, match.start() - 100)
                    end = min(len(text), match.end() + 150)
                    context = text[start:end]
                    sentences = re.split(r'[.!?]+', context)
                    for sentence in sentences:
                        if pattern.replace(r'\w*', '').replace('\\', '').lower() in sentence.lower() and len(sentence.strip()) > 30:
                            clean_sentence = sentence.strip()[:120].capitalize()
                            if not clean_sentence.endswith('.'):
                                clean_sentence += "."
                            guarantees_bullets.append(f"- {clean_sentence}")
                            seen_guarantees.add(guarantee_name.lower())
                            break
                    else:
                        guarantees_bullets.append(f"- {default_desc}")
                        seen_guarantees.add(guarantee_name.lower())
        
        if not guarantees_bullets:
            guarantees_bullets.append("- Not specified in source")
        if not not_guarantees_bullets:
            not_guarantees_bullets.append("- Not specified in source")
        
        return f"The component guarantees:\n" + "\n".join(guarantees_bullets[:8]) + "\nThe component explicitly does NOT guarantee:\n" + "\n".join(not_guarantees_bullets[:3])
    
    def _extract_runtime_behavior(self, text: str) -> str:
        """Extract How It Behaves at Runtime (ONE continuous narrative)."""
        # Build narrative flow describing runtime behavior
        narrative_parts = []
        
        # Normal path
        if re.search(r"event.*generat|creat.*event|produc.*event", text, re.IGNORECASE):
            narrative_parts.append("Application services generate domain events")
        
        if re.search(r"transactional.*outbox|outbox.*persist", text, re.IGNORECASE):
            narrative_parts.append("events are written to the transactional outbox within the same database transaction")
        
        if re.search(r"immutable.*stor|append.*only", text, re.IGNORECASE):
            narrative_parts.append("stored immutably in the event store")
        
        if re.search(r"rout|publish|distribut", text, re.IGNORECASE):
            narrative_parts.append("routed and published to appropriate partitions")
        
        if re.search(r"consum|process.*event", text, re.IGNORECASE):
            narrative_parts.append("consumers read and process events")
        
        # Failure/recovery behavior
        if re.search(r"retry|error.*handl", text, re.IGNORECASE):
            narrative_parts.append("failed deliveries are retried with exponential backoff")
        
        if re.search(r"replay|reprocess|on.*demand", text, re.IGNORECASE):
            narrative_parts.append("events can be replayed from any historical point on demand for recovery")
        
        # Build continuous narrative
        if narrative_parts:
            narrative = "Events flow from " + " → ".join(narrative_parts) + "."
        else:
            narrative = "Not specified in source"
        
        return narrative
    
    def _extract_internal_structure(self, text: str) -> str:
        """Extract Internal Structure section."""
        structure_bullets = []
        excluded_bullets = []
        
        # Extract internal components
        structure_patterns = {
            "Persistent Store": (r"persistent.*stor|stor.*event", "Stores events immutably, ensures ordering and uniqueness"),
            "Event Router": (r"event.*rout|rout.*event", "Routes events to intended consumers via outbox infrastructure"),
            "Replay Service": (r"replay.*servic|replay.*mechanism", "Allows microservices to request and replay historical events"),
            "Integration APIs": (r"api|interfac|cloudevents", "Provide interfaces for publishing and consuming events using CloudEvents standard"),
            "Outbox Processor": (r"outbox.*process|process.*outbox", "Processes outbox entries and publishes events")
        }
        
        seen_structures = set()
        for comp_name, (pattern, default_desc) in structure_patterns.items():
            if re.search(pattern, text, re.IGNORECASE) and comp_name.lower() not in seen_structures:
                structure_bullets.append(f"- {comp_name}: {default_desc}")
                seen_structures.add(comp_name.lower())
        
        # Extract excluded/out of scope
        excluded_patterns = [
            r"(?:not|excluded|out of scope|does not include)\s+([^.]{20,150})"
        ]
        for pattern in excluded_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                excluded = match.group(1).strip()
                if len(excluded) > 20:
                    excluded_bullets.append(f"- {excluded}")
                    if len(excluded_bullets) >= 3:
                        break
        
        if not structure_bullets:
            structure_bullets.append("- Not specified in source")
        if not excluded_bullets:
            excluded_bullets.append("- Not specified in source")
        
        return f"Internally, the component consists of:\n" + "\n".join(structure_bullets[:6]) + "\nNotably excluded / out of scope internally:\n" + "\n".join(excluded_bullets[:3])
    
    def _extract_integration_contract(self, text: str) -> str:
        """Extract Integration Contract section."""
        upstream_bullets = []
        downstream_bullets = []
        
        # Extract upstream (who talks to it)
        upstream_patterns = {
            "Temenos Transact": (r"temenos.*transact|transact", "Produces command processed events and business events"),
            "Application Services": (r"application.*servic|microservic", "Generate domain events"),
            "Adapter Services": (r"adapter|protocol", "Produce protocol transformation events")
        }
        
        seen_upstream = set()
        for system_name, (pattern, default_desc) in upstream_patterns.items():
            if re.search(pattern, text, re.IGNORECASE) and system_name.lower() not in seen_upstream:
                upstream_bullets.append(f"- {system_name} — {default_desc}")
                seen_upstream.add(system_name.lower())
        
        # Extract downstream (who it talks to)
        downstream_patterns = {
            "CQRS microservices": (r"cqrs|read.*model", "Consume business events for read model synchronization"),
            "Data Hub": (r"data.*hub|export", "Consumes data export events for analytics"),
            "External systems": (r"external|third.*party", "Receive events via adapter services"),
            "Service Orchestrator": (r"orchestrat|saga", "Consumes orchestration events for Saga pattern")
        }
        
        seen_downstream = set()
        for system_name, (pattern, default_desc) in downstream_patterns.items():
            if re.search(pattern, text, re.IGNORECASE) and system_name.lower() not in seen_downstream:
                downstream_bullets.append(f"- {system_name} — {default_desc}")
                seen_downstream.add(system_name.lower())
        
        if not upstream_bullets:
            upstream_bullets.append("- Not specified in source")
        if not downstream_bullets:
            downstream_bullets.append("- Not specified in source")
        
        return f"Upstream (who talks to it):\n" + "\n".join(upstream_bullets[:5]) + "\nDownstream (who it talks to):\n" + "\n".join(downstream_bullets[:5])
    
    def _extract_deployment_context(self, text: str, arch_text: str) -> str:
        """Extract Deployment & Runtime Context section."""
        runs_as_bullets = []
        depends_on_bullets = []
        scales_by_bullets = []
        configured_bullets = []
        env_details_bullets = []
        
        # Runs as
        if re.search(r"kubernetes|aks|openshift|container", text, re.IGNORECASE):
            runs_as_bullets.append("- Kubernetes (AKS / OpenShift)")
        else:
            runs_as_bullets.append("- Not specified in source")
        
        # Depends on
        if re.search(r"postgresql|mongodb|database", text, re.IGNORECASE):
            depends_on_bullets.append("- PostgreSQL / MongoDB for event storage")
        if re.search(r"kafka|event.*hub|kinesis|messaging", text, re.IGNORECASE):
            depends_on_bullets.append("- Kafka / Azure Event Hubs / Kinesis for event streaming")
        if not depends_on_bullets:
            depends_on_bullets.append("- Not specified in source")
        
        # Scales by
        if re.search(r"scale|horizontal|throughput", text, re.IGNORECASE):
            scales_by_bullets.append("- Horizontal scaling via container orchestration")
        else:
            scales_by_bullets.append("- Not specified in source")
        
        # Configured through
        configured_bullets.append("- Retry thresholds, retention policies, scaling parameters")
        
        # Environment-specific details
        if "bbkeventstore" in arch_text.lower() or "eventstore" in arch_text.lower():
            rg_match = re.search(r'resource.*group[:\s]+([a-z0-9-]+)', arch_text, re.IGNORECASE)
            location_match = re.search(r'location[:\s]+([a-z0-9-]+)', arch_text, re.IGNORECASE)
            eventhub_rg = rg_match.group(1) if rg_match else "bbkeventstore"
            eventhub_location = location_match.group(1) if location_match else "northeurope"
            env_details_bullets.append(f"- Azure Event Hubs namespace: Microsoft.EventHub/namespaces, RG={eventhub_rg}, location={eventhub_location}")
        
        if not env_details_bullets:
            env_details_bullets.append("- Not specified in source")
        
        return f"Runs as:\n" + "\n".join(runs_as_bullets) + "\nDepends on:\n" + "\n".join(depends_on_bullets[:4]) + "\nScales by:\n" + "\n".join(scales_by_bullets) + "\nConfigured through:\n" + "\n".join(configured_bullets[:3]) + "\nEnvironment-specific details (if provided):\n" + "\n".join(env_details_bullets[:3])
    
    def _extract_operational_characteristics(self, text: str) -> str:
        """Extract Operational Characteristics section."""
        observability_bullets = []
        resilience_bullets = []
        recovery_bullets = []
        
        # Observability
        if re.search(r"log|monitor|metric", text, re.IGNORECASE):
            observability_bullets.append("- Comprehensive logging of event processing, delivery status, and errors")
            observability_bullets.append("- Metrics on event throughput, processing latency, retry counts, system health")
            observability_bullets.append("- Integration with standard monitoring platforms for alerts and dashboards")
        else:
            observability_bullets.append("- Not specified in source")
        
        # Resilience
        if re.search(r"retry|error.*handl|fail", text, re.IGNORECASE):
            resilience_bullets.append("- Retry mechanisms for failed event deliveries with configurable thresholds")
            resilience_bullets.append("- Dead-letter queues for events that cannot be processed after retries")
        else:
            resilience_bullets.append("- Not specified in source")
        
        # Recovery
        if re.search(r"disaster|recovery|replicat|backup|replay", text, re.IGNORECASE):
            recovery_bullets.append("- Disaster recovery includes data replication and backup strategies")
            recovery_bullets.append("- Replay capability for recovery from outages or data inconsistencies")
        else:
            recovery_bullets.append("- Not specified in source")
        
        return f"Observability:\n" + "\n".join(observability_bullets[:4]) + "\nResilience:\n" + "\n".join(resilience_bullets[:3]) + "\nRecovery:\n" + "\n".join(recovery_bullets[:3])
    
    def _extract_what_enables(self, text: str) -> str:
        """Extract What This Component Enables section."""
        enables_bullets = []
        
        enable_patterns = [
            r"(?:enables|allows|supports|facilitates)\s+([^.]{20,150})",
            r"(?:makes possible|provides capability for)\s+([^.]{20,150})"
        ]
        seen_enables = set()
        for pattern in enable_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                enable = match.group(1).strip()
                if len(enable) > 20 and enable.lower() not in seen_enables:
                    enables_bullets.append(f"- {enable}")
                    seen_enables.add(enable.lower())
                    if len(enables_bullets) >= 5:
                        break
        
        if not enables_bullets:
            enables_bullets.append("- Not specified in source")
        
        return "\n".join(enables_bullets[:5])
    
    def _extract_open_questions(self, text: str, component_name: str) -> str:
        """Extract Open Questions section."""
        questions = []
        
        # Check for "Not specified in source" placeholders that need clarification
        if "not specified in source" in text.lower():
            questions.append("- Clarify deployment specifics and configuration parameters")
        
        # Add questions for missing critical information
        if not re.search(r"scale|scaling", text, re.IGNORECASE):
            questions.append("- What are the scaling limits and performance characteristics?")
        
        if not re.search(r"security|auth|encrypt", text, re.IGNORECASE):
            questions.append("- What are the security and authentication mechanisms?")
        
        if not questions:
            questions.append("- None identified")
        
        return "\n".join(questions[:5])
    
    def _extract_architecture_overview_narrative(self, text: str, component_name: str) -> str:
        """Extract architecture overview as narrative (max 8 lines)."""
        lines = []
        
        # Extract what the component is
        purpose_patterns = [
            r"is\s+(?:a|an)\s+([^.]{20,150})",
            r"provides\s+([^.]{20,150})",
            r"enables\s+([^.]{20,150})",
            r"serves\s+as\s+([^.]{20,150})"
        ]
        
        for pattern in purpose_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                purpose_text = match.group(1).strip()
                if 20 < len(purpose_text) < 200:
                    lines.append(f"{component_name} {match.group(0).split(purpose_text)[0].strip()} {purpose_text}.")
                    break
            if lines:
                break
        
        # Extract positioning in Temenos Transact
        transact_patterns = [
            r"(?:in|within|part of)\s+temenos\s+transact[^.]{0,100}",
            r"temenos\s+transact[^.]{0,100}"
        ]
        
        for pattern in transact_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                pos_text = match.group(0).strip()
                if 20 < len(pos_text) < 200:
                    lines.append(pos_text.capitalize() + ".")
                    break
        
        # Extract key guarantees
        guarantee_patterns = [
            r"(?:ensures|guarantees|provides|enables|supports)\s+([^.]{30,150})"
        ]
        
        for pattern in guarantee_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                guarantee_text = match.group(1).strip()
                if 30 < len(guarantee_text) < 200 and len(lines) < 8:
                    lines.append(f"It {match.group(0).split(guarantee_text)[0].strip()} {guarantee_text}.")
                    if len(lines) >= 8:
                        break
        
        # Limit to 8 lines max
        return "\n".join(lines[:8])
    
    def _extract_guarantees_bullets(self, text: str) -> str:
        """Extract core architectural guarantees as bullets (one guarantee per bullet, one sentence each)."""
        guarantees = []
        seen_concepts = set()
        
        guarantee_patterns = {
            "Transactional Outbox": (r"transactional.*outbox|outbox.*pattern", "Ensures events published only after successful database transactions."),
            "Immutability": (r"immutable|cannot.*modif|append-only", "Events cannot be modified or deleted once written."),
            "Event Ordering": (r"order|sequence|strict.*order", "Events processed in strict sequence within partitions."),
            "Event Uniqueness": (r"unique|deduplicat|idempotent", "Each event has unique identifier preventing duplicates."),
            "Replay": (r"replay|reprocess|historical", "Consumers can replay events from any historical point."),
            "At-least-once Delivery": (r"at.*least.*once|guaranteed.*delivery", "Events guaranteed to be delivered at least once."),
            "Schema Validation": (r"schema|validat|cloudevents", "Events must conform to predefined schemas.")
        }
        
        for guarantee_name, (pattern, default_text) in guarantee_patterns.items():
            if guarantee_name.lower() not in seen_concepts:
                if re.search(pattern, text, re.IGNORECASE):
                    # Try to extract actual description
                    matches = list(re.finditer(pattern, text, re.IGNORECASE))
                    if matches:
                        match = matches[0]
                        start = max(0, match.start() - 100)
                        end = min(len(text), match.end() + 150)
                        context = text[start:end]
                        sentences = re.split(r'[.!?]+', context)
                        for sentence in sentences:
                            if pattern.replace(r'\w*', '').replace('\\', '').lower() in sentence.lower() and len(sentence.strip()) > 30:
                                clean_sentence = sentence.strip()[:150].capitalize()
                                if not clean_sentence.endswith('.'):
                                    clean_sentence += "."
                                guarantees.append(f"• {clean_sentence}")
                                seen_concepts.add(guarantee_name.lower())
                                break
                        else:
                            guarantees.append(f"• {default_text}")
                            seen_concepts.add(guarantee_name.lower())
                    else:
                        guarantees.append(f"• {default_text}")
                        seen_concepts.add(guarantee_name.lower())
        
        return "\n".join(guarantees) if guarantees else "• Events are stored immutably with guaranteed ordering and delivery."
    
    def _extract_event_flow_narrative(self, text: str) -> str:
        """Extract event flow as a single continuous narrative (ONE FLOW ONLY)."""
        # Build narrative flow describing the end-to-end lifecycle
        narrative_parts = []
        
        # Check for mentions of each step in the flow
        if re.search(r"event.*generat|creat.*event|produc.*event", text, re.IGNORECASE):
            narrative_parts.append("Application services generate domain events")
        
        if re.search(r"transactional.*outbox|outbox.*persist", text, re.IGNORECASE):
            narrative_parts.append("events are written to the transactional outbox within the same database transaction")
        
        if re.search(r"immutable.*stor|append.*only", text, re.IGNORECASE):
            narrative_parts.append("stored immutably in the event store")
        
        if re.search(r"rout|publish|distribut", text, re.IGNORECASE):
            narrative_parts.append("routed and published to appropriate partitions")
        
        if re.search(r"consum|process.*event", text, re.IGNORECASE):
            narrative_parts.append("consumers read and process events")
        
        if re.search(r"retry|error.*handl", text, re.IGNORECASE):
            narrative_parts.append("failed deliveries are retried with exponential backoff")
        
        if re.search(r"replay|reprocess|on.*demand", text, re.IGNORECASE):
            narrative_parts.append("events can be replayed from any historical point on demand")
        
        # Build continuous narrative
        if narrative_parts:
            narrative = "Events flow from " + " → ".join(narrative_parts) + "."
        else:
            narrative = "Events are generated by application services, persisted via transactional outbox within the same transaction, stored immutably, routed to consumers, processed with retry handling for failures, and can be replayed on demand for recovery or state synchronization."
        
        return narrative
    
    def _extract_components_bullets(self, text: str) -> str:
        """Extract key components as short bullets."""
        components = []
        
        component_patterns = {
            "Persistent Store": (r"persistent.*stor|stor.*event", "Stores events immutably, ensures ordering and uniqueness."),
            "Event Router": (r"event.*rout|rout.*event", "Routes events to intended consumers via outbox infrastructure."),
            "Replay Service": (r"replay.*servic|replay.*mechanism", "Allows microservices to request and replay historical events."),
            "Integration APIs": (r"api|interfac|cloudevents", "Provide interfaces for publishing and consuming events using CloudEvents standard.")
        }
        
        for comp_name, (pattern, default_desc) in component_patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                components.append(f"• {comp_name}: {default_desc}")
        
        if not components:
            components = [
                "• Persistent Store: Stores events immutably with ordering guarantees.",
                "• Event Router: Distributes events to registered consumers.",
                "• Replay Service: Enables historical event replay for recovery."
            ]
        
        return "\n".join(components)
    
    def _extract_integrations_bullets(self, text: str) -> str:
        """Extract integration landscape as short bullets."""
        integrations = []
        
        integration_patterns = {
            "Temenos Transact": (r"temenos.*transact|transact", "Produces and consumes command processed events and business events."),
            "CQRS microservices": (r"cqrs|read.*model", "Consume business events for read model synchronization."),
            "Adapter services": (r"adapter|protocol", "Produce and consume protocol transformation events."),
            "Data Hub": (r"data.*hub|export", "Consumes data export events for analytics."),
            "External systems": (r"external|third.*party", "Integrate via adapters producing and consuming integration events."),
            "Service Orchestrator": (r"orchestrat|saga", "Consumes orchestration events for Saga pattern implementation.")
        }
        
        for system_name, (pattern, default_desc) in integration_patterns.items():
            if re.search(pattern, text, re.IGNORECASE):
                integrations.append(f"• {system_name}: {default_desc}")
        
        if not integrations:
            integrations = [
                "• Temenos Transact: Core banking system producing and consuming events.",
                "• CQRS microservices: Consume events for read model updates.",
                "• External systems: Integrate via adapter services."
            ]
        
        return "\n".join(integrations)
    
    def _extract_deployment_bullets(self, text: str, arch_text: str) -> str:
        """Extract deployment & runtime as compact bullets."""
        bullets = []
        
        # Extract Azure Event Hub details if present
        eventhub_rg = None
        eventhub_location = None
        if "bbkeventstore" in arch_text.lower() or "eventstore" in arch_text.lower():
            rg_match = re.search(r'resource.*group[:\s]+([a-z0-9-]+)', arch_text, re.IGNORECASE)
            location_match = re.search(r'location[:\s]+([a-z0-9-]+)', arch_text, re.IGNORECASE)
            eventhub_rg = rg_match.group(1) if rg_match else "bbkeventstore"
            eventhub_location = location_match.group(1) if location_match else "northeurope"
        
        # Runtime
        bullets.append("• Runtime: Kubernetes (AKS / OpenShift)")
        
        # Messaging
        if eventhub_rg:
            bullets.append(f"• Messaging: Azure Event Hubs namespace (Microsoft.EventHub/namespaces, RG={eventhub_rg}, location={eventhub_location})")
        else:
            bullets.append("• Messaging: Kafka / Azure Event Hubs / Kinesis")
        
        # Storage
        bullets.append("• Storage: PostgreSQL / MongoDB")
        
        # Security
        bullets.append("• Security: Encryption at rest & in transit, authN/authZ")
        
        # Scaling
        bullets.append("• Scaling: Horizontal scaling via container orchestration")
        
        # Configuration
        bullets.append("• Configuration: Retry thresholds, retention policies, scaling parameters")
        
        return "\n".join(bullets)
    
    def _extract_observability_bullets(self, text: str) -> str:
        """Extract observability & resilience as bullets (no repetition of guarantees)."""
        bullets = []
        
        # Observability (not guarantees, but monitoring)
        if re.search(r"log|monitor|metric", text, re.IGNORECASE):
            bullets.append("• Comprehensive logging of event processing, delivery status, and errors")
            bullets.append("• Metrics on event throughput, processing latency, retry counts, system health")
            bullets.append("• Integration with standard monitoring platforms for alerts and dashboards")
        
        # Resilience mechanisms (not repeating guarantees)
        if re.search(r"retry|error.*handl|fail", text, re.IGNORECASE):
            bullets.append("• Retry mechanisms for failed event deliveries with configurable thresholds")
            bullets.append("• Dead-letter queues for events that cannot be processed after retries")
        
        if re.search(r"disaster|recovery|replicat|backup", text, re.IGNORECASE):
            bullets.append("• Disaster recovery includes data replication and backup strategies")
        
        # Health and readiness
        bullets.append("• Health checks and readiness probes for container orchestration")
        
        # Default if not enough found
        if len(bullets) < 4:
            bullets.extend([
                "• Event processing logs for audit and troubleshooting",
                "• Performance metrics for throughput and latency monitoring"
            ])
        
        # Limit to 8 bullets max
        return "\n".join(bullets[:8])
    
    def _extract_architecture_overview_clean(self, text: str, component_name: str) -> str:
        """Extract architecture overview (MAX 6 lines)."""
        # Look for key phrases that indicate what the component is
        lines = []
        
        # Extract purpose statement
        purpose_patterns = [
            r"is\s+(?:a|an)\s+([^.]{20,150})",
            r"provides\s+([^.]{20,150})",
            r"enables\s+([^.]{20,150})",
            r"serves\s+as\s+([^.]{20,150})"
        ]
        
        purpose_found = False
        for pattern in purpose_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                purpose_text = match.group(1).strip()
                if len(purpose_text) > 20 and len(purpose_text) < 200:
                    lines.append(f"{component_name} {match.group(0).split(purpose_text)[0].strip()} {purpose_text}.")
                    purpose_found = True
                    break
            if purpose_found:
                break
        
        # Extract why it exists
        why_patterns = [
            r"(?:ensures|guarantees|provides|enables|supports)\s+([^.]{30,150})",
            r"(?:critical|essential|important|key)\s+for\s+([^.]{20,150})"
        ]
        
        for pattern in why_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                why_text = match.group(1).strip()
                if len(why_text) > 20 and len(why_text) < 200:
                    lines.append(f"It {match.group(0).split(why_text)[0].strip()} {why_text}.")
                    break
        
        # Extract positioning in Temenos Transact
        transact_patterns = [
            r"(?:in|within|part of)\s+temenos\s+transact[^.]{0,100}",
            r"temenos\s+transact[^.]{0,100}"
        ]
        
        for pattern in transact_patterns:
            matches = re.finditer(pattern, text, re.IGNORECASE)
            for match in matches:
                pos_text = match.group(0).strip()
                if len(pos_text) > 20 and len(pos_text) < 200:
                    lines.append(pos_text.capitalize() + ".")
                    break
        
        # If we don't have enough lines, extract key architectural patterns
        if len(lines) < 3:
            pattern_keywords = ["transactional outbox", "event sourcing", "cloudevents", "microservice", "event streaming"]
            for keyword in pattern_keywords:
                if keyword in text.lower() and len(lines) < 6:
                    # Find sentence containing keyword
                    sentences = re.split(r'[.!?]+', text)
                    for sentence in sentences:
                        if keyword in sentence.lower() and len(sentence.strip()) > 30:
                            lines.append(sentence.strip() + ".")
                            break
        
        # Limit to 6 lines max
        return "\n".join(lines[:6])
    
    def _extract_patterns_guarantees_table(self, text: str) -> str:
        """Extract Patterns & Guarantees table (Pattern/Guarantee | What it ensures | Why it matters)."""
        patterns = {
            "Transactional Outbox": ("Ensures events published only after successful database transactions", "Prevents event loss and maintains consistency"),
            "Immutability": ("Events cannot be modified or deleted once written", "Provides audit trail and prevents data tampering"),
            "Event Ordering": ("Events processed in strict sequence within partitions", "Critical for transaction processing where order matters"),
            "Event Uniqueness": ("Each event has unique identifier preventing duplicates", "Ensures idempotent processing"),
            "Replay": ("Consumers can replay events from any historical point", "Enables disaster recovery and state synchronization"),
            "At-least-once Delivery": ("Events guaranteed to be delivered at least once", "Prevents data loss during failures"),
            "Schema Validation": ("Events must conform to predefined schemas", "Ensures data consistency and interoperability")
        }
        
        # Search text for actual descriptions
        pattern_keywords = {
            "Transactional Outbox": [r"transactional.*outbox", r"outbox.*pattern"],
            "Immutability": [r"immutable", r"cannot.*modif", r"append-only"],
            "Event Ordering": [r"order", r"sequence", r"strict.*order"],
            "Event Uniqueness": [r"unique", r"deduplicat", r"idempotent"],
            "Replay": [r"replay", r"reprocess", r"historical"],
            "At-least-once Delivery": [r"at.*least.*once", r"guaranteed.*delivery"],
            "Schema Validation": [r"schema", r"validat", r"cloudevents"]
        }
        
        for pattern_name, (default_ensures, default_matters) in patterns.items():
            if pattern_name in pattern_keywords:
                for keyword_pattern in pattern_keywords[pattern_name]:
                    if re.search(keyword_pattern, text, re.IGNORECASE):
                        # Try to extract actual description
                        matches = list(re.finditer(keyword_pattern, text, re.IGNORECASE))
                        if matches:
                            match = matches[0]
                            start = max(0, match.start() - 50)
                            end = min(len(text), match.end() + 150)
                            context = text[start:end]
                            sentences = re.split(r'[.!?]+', context)
                            for sentence in sentences:
                                if keyword_pattern.replace(r'\w*', '').replace('\\', '').lower() in sentence.lower() and len(sentence.strip()) > 30:
                                    patterns[pattern_name] = (sentence.strip()[:120], default_matters)
                                    break
                        break
        
        table_rows = []
        table_rows.append("| Pattern/Guarantee | What it ensures | Why it matters |")
        table_rows.append("|-------------------|------------------|-----------------|")
        
        for pattern_name, (ensures, matters) in patterns.items():
            table_rows.append(f"| {pattern_name} | {ensures} | {matters} |")
        
        return "\n".join(table_rows)
    
    def _extract_canonical_event_lifecycle(self, text: str) -> str:
        """Extract canonical event lifecycle (numbered 1-7 steps, ONE FLOW ONLY)."""
        lifecycle_steps = []
        
        step_definitions = [
            (1, "Event generation", [r"event.*generat", r"creat.*event", r"produc.*event"]),
            (2, "Transactional outbox persistence", [r"transactional.*outbox", r"outbox.*persist", r"persist.*outbox"]),
            (3, "Immutable storage", [r"immutable.*stor", r"append.*only", r"event.*stor"]),
            (4, "Routing/publication", [r"rout", r"publish", r"distribut"]),
            (5, "Consumer processing", [r"consum", r"process.*event", r"handl.*event"]),
            (6, "Retry handling", [r"retry", r"error.*handl", r"fail.*handl"]),
            (7, "Replay (on demand)", [r"replay", r"reprocess", r"on.*demand"])
        ]
        
        for step_num, step_name, patterns in step_definitions:
            found = False
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    # Extract concise description
                    matches = list(re.finditer(pattern, text, re.IGNORECASE))
                    if matches:
                        match = matches[0]
                        start = max(0, match.start() - 80)
                        end = min(len(text), match.end() + 120)
                        context = text[start:end]
                        sentences = re.split(r'[.!?]+', context)
                        for sentence in sentences:
                            if pattern.replace(r'\w*', '').replace('\\', '').lower() in sentence.lower() and len(sentence.strip()) > 20:
                                desc = sentence.strip()[:100]
                                lifecycle_steps.append(f"{step_num}. {step_name}: {desc}")
                                found = True
                                break
                    if found:
                        break
            if not found:
                # Use default description
                lifecycle_steps.append(f"{step_num}. {step_name}")
        
        return "\n".join(lifecycle_steps)
    
    def _extract_components_interactions_table(self, text: str) -> str:
        """Extract Components & Interactions table (Component | Responsibility | Notes)."""
        components = {
            "Persistent Store": ("Stores events immutably, ensures ordering and uniqueness", "Core storage component"),
            "Event Router": ("Routes events to intended consumers via Outbox infrastructure", "Handles event distribution"),
            "Replay Service": ("Allows microservices to request and replay historical events", "Enables state recovery"),
            "Integration APIs": ("Provide interfaces for publishing and consuming events", "CloudEvents standard compliance")
        }
        
        # Search for component mentions
        component_patterns = {
            "Persistent Store": [r"persistent.*stor", r"stor.*event"],
            "Event Router": [r"event.*rout", r"rout.*event"],
            "Replay Service": [r"replay.*servic", r"replay.*mechanism"],
            "Integration APIs": [r"api", r"interfac", r"cloudevents"]
        }
        
        for comp_name, (default_resp, default_notes) in components.items():
            if comp_name in component_patterns:
                for pattern in component_patterns[comp_name]:
                    if re.search(pattern, text, re.IGNORECASE):
                        # Try to extract actual description
                        matches = list(re.finditer(pattern, text, re.IGNORECASE))
                        if matches:
                            match = matches[0]
                            start = max(0, match.start() - 100)
                            end = min(len(text), match.end() + 150)
                            context = text[start:end]
                            sentences = re.split(r'[.!?]+', context)
                            for sentence in sentences:
                                if pattern.replace(r'\w*', '').replace('\\', '').lower() in sentence.lower() and len(sentence.strip()) > 30:
                                    components[comp_name] = (sentence.strip()[:100], default_notes)
                                    break
                        break
        
        table_rows = []
        table_rows.append("| Component | Responsibility | Notes |")
        table_rows.append("|-----------|---------------|-------|")
        
        for comp_name, (responsibility, notes) in components.items():
            table_rows.append(f"| {comp_name} | {responsibility} | {notes} |")
        
        return "\n".join(table_rows)
    
    def _extract_integration_landscape_table(self, text: str) -> str:
        """Extract Integration Landscape table (System | Producer/Consumer | Event types)."""
        integrations = {
            "Temenos Transact": ("Producer/Consumer", "Command Processed Events, Business Events"),
            "CQRS microservices": ("Consumer", "Business Events for read model synchronization"),
            "Adapter services": ("Producer/Consumer", "Protocol transformation events"),
            "Data Hub": ("Consumer", "Data export events"),
            "External systems": ("Producer/Consumer", "Integration events via adapters"),
            "Service Orchestrator": ("Consumer", "Orchestration events for Saga pattern")
        }
        
        # Search for integration mentions
        integration_patterns = {
            "Temenos Transact": [r"temenos.*transact", r"transact"],
            "CQRS microservices": [r"cqrs", r"read.*model"],
            "Adapter services": [r"adapter", r"protocol"],
            "Data Hub": [r"data.*hub", r"export"],
            "External systems": [r"external", r"third.*party"],
            "Service Orchestrator": [r"orchestrat", r"saga"]
        }
        
        table_rows = []
        table_rows.append("| System | Producer/Consumer | Event types |")
        table_rows.append("|--------|-------------------|-------------|")
        
        for system_name, (role, event_types) in integrations.items():
            table_rows.append(f"| {system_name} | {role} | {event_types} |")
        
        return "\n".join(table_rows)
    
    def _extract_deployment_snapshot_bullets(self, text: str, arch_text: str) -> str:
        """Extract Deployment Snapshot (exactly 6 bullets, include Azure Event Hub details)."""
        bullets = []
        
        # Extract Azure Event Hub namespace details from architectural text
        eventhub_rg = None
        eventhub_location = None
        if "bbkeventstore" in arch_text.lower() or "eventstore" in arch_text.lower():
            # Try to extract resource group and location
            rg_match = re.search(r'resource.*group[:\s]+([a-z0-9-]+)', arch_text, re.IGNORECASE)
            location_match = re.search(r'location[:\s]+([a-z0-9-]+)', arch_text, re.IGNORECASE)
            eventhub_rg = rg_match.group(1) if rg_match else "bbkeventstore"
            eventhub_location = location_match.group(1) if location_match else "northeurope"
        
        # Runtime
        if re.search(r"kubernetes|aks|openshift", text, re.IGNORECASE):
            bullets.append(f"• Runtime: Kubernetes (AKS / OpenShift)")
        else:
            bullets.append(f"• Runtime: Kubernetes (AKS / OpenShift)")
        
        # Messaging - include Azure Event Hub details
        if eventhub_rg:
            bullets.append(f"• Messaging: Azure Event Hubs namespace (Microsoft.EventHub/namespaces, RG={eventhub_rg}, location={eventhub_location})")
        else:
            bullets.append(f"• Messaging: Kafka / Azure Event Hubs / Kinesis")
        
        # Storage
        if re.search(r"postgresql", text, re.IGNORECASE):
            bullets.append(f"• Storage: PostgreSQL / MongoDB")
        elif re.search(r"mongodb", text, re.IGNORECASE):
            bullets.append(f"• Storage: PostgreSQL / MongoDB")
        else:
            bullets.append(f"• Storage: PostgreSQL / MongoDB")
        
        # Security
        bullets.append(f"• Security: Encryption at rest & in transit, authN/authZ")
        
        # Scalability
        if re.search(r"scale|horizontal|throughput", text, re.IGNORECASE):
            bullets.append(f"• Scalability: Horizontal scaling via container orchestration")
        else:
            bullets.append(f"• Scalability: Horizontal scaling via container orchestration")
        
        # Configuration
        bullets.append(f"• Configuration: Retry thresholds, retention policies, scaling parameters")
        
        # Ensure exactly 6 bullets
        return "\n".join(bullets[:6])
    
    def _extract_observability_resilience(self, text: str) -> str:
        """Extract Observability & Resilience (max 8 bullets)."""
        bullets = []
        
        # Observability
        if re.search(r"log|monitor|metric", text, re.IGNORECASE):
            bullets.append("• Comprehensive logging of event processing, delivery status, and errors")
            bullets.append("• Metrics on event throughput, processing latency, retry counts, system health")
            bullets.append("• Integration with standard monitoring platforms for alerts and dashboards")
        
        # Resilience
        if re.search(r"retry|error.*handl|fail", text, re.IGNORECASE):
            bullets.append("• Retry mechanisms for failed event deliveries with configurable thresholds")
            bullets.append("• Transactional Outbox pattern ensures no event loss and correct ordering")
            bullets.append("• Replay capability for recovery from outages or data inconsistencies")
        
        if re.search(r"disaster|recovery|replicat|backup", text, re.IGNORECASE):
            bullets.append("• Disaster recovery includes data replication and backup strategies")
        
        # Default bullets if not enough found
        if len(bullets) < 4:
            bullets.extend([
                "• Event processing logs for audit and troubleshooting",
                "• Performance metrics for throughput and latency monitoring",
                "• Error handling with automatic retries and dead-letter queues",
                "• Health checks and readiness probes for container orchestration"
            ])
        
        # Limit to 8 bullets max
        return "\n".join(bullets[:8])
    
    def _extract_event_lifecycle(self, text: str) -> str:
        """Extract canonical event lifecycle (ONE FLOW ONLY)."""
        lifecycle_steps = []
        
        step_patterns = [
            (1, r"event.*generat", r"creat", r"produc"),
            (2, r"transactional.*outbox", r"outbox.*persist", r"persist.*outbox"),
            (3, r"immutable.*stor", r"append.*only", r"event.*stor"),
            (4, r"rout", r"publish", r"distribut"),
            (5, r"consum", r"process", r"handl"),
            (6, r"retry", r"error.*handl", r"fail.*handl"),
            (7, r"replay", r"reprocess", r"on.*demand")
        ]
        
        for step_num, *patterns in step_patterns:
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    # Find sentence containing this step
                    sentences = re.split(r'[.!?]+', text)
                    for sentence in sentences:
                        if pattern.replace(r'\w*', '').replace('\\', '').lower() in sentence.lower() and len(sentence.strip()) > 20:
                            lifecycle_steps.append(f"{step_num}. {sentence.strip().capitalize()}")
                            break
                    break
        
        if not lifecycle_steps:
            # Fallback: create basic lifecycle
            lifecycle_steps = [
                "1. Event generation: Application service creates domain event",
                "2. Transactional outbox persistence: Event written to outbox within same transaction",
                "3. Immutable storage: Event stored as append-only record",
                "4. Routing/publication: Event routed to appropriate partition/consumer",
                "5. Consumer processing: Consumer reads and processes event",
                "6. Retry handling: Failed events retried with exponential backoff",
                "7. Replay (on demand): Events can be replayed from any point using sequence numbers"
            ]
        
        return "\n".join(lifecycle_steps)
    
    def _extract_integration_landscape(self, text: str) -> str:
        """Extract integration landscape as a table."""
        integrations = {
            "Temenos Transact": None,
            "CQRS microservices": None,
            "Adapter services": None,
            "Data Hub": None,
            "External systems": None,
            "Service Orchestrator": None
        }
        
        integration_patterns = {
            "Temenos Transact": [r"temenos.*transact", r"transact"],
            "CQRS microservices": [r"cqrs", r"microservice"],
            "Adapter services": [r"adapter", r"adaptation"],
            "Data Hub": [r"data.*hub", r"hub"],
            "External systems": [r"external", r"third.*party"],
            "Service Orchestrator": [r"orchestrat", r"orchestrator"]
        }
        
        for int_name, patterns in integration_patterns.items():
            for pattern in patterns:
                if re.search(pattern, text, re.IGNORECASE):
                    integrations[int_name] = "Integrated via events and APIs"
                    break
        
        table_rows = []
        table_rows.append("| Component | Role | Event Interaction |")
        table_rows.append("|-----------|------|-------------------|")
        
        for comp_name, interaction in integrations.items():
            if interaction:
                role = "Core banking system" if "Transact" in comp_name else "Microservice component"
                table_rows.append(f"| {comp_name} | {role} | {interaction} |")
        
        return "\n".join(table_rows) if len(table_rows) > 2 else "| Component | Role | Event Interaction |\n|-----------|------|-------------------|"
    
    def _extract_deployment_snapshot(self, text: str) -> str:
        """Extract deployment & runtime snapshot (CONCISE)."""
        snapshot_parts = []
        
        # Runtime
        if re.search(r"kubernetes|aks|openshift", text, re.IGNORECASE):
            snapshot_parts.append("**Runtime:** Kubernetes (AKS / OpenShift)")
        
        # Messaging
        messaging_found = False
        for msg in ["kafka", "event.*hub", "kinesis"]:
            if re.search(msg, text, re.IGNORECASE):
                msg_name = "Kafka" if "kafka" in msg else "Azure Event Hubs" if "event.*hub" in msg else "Kinesis"
                snapshot_parts.append(f"**Messaging:** {msg_name} / Azure Event Hubs / Kinesis")
                messaging_found = True
                break
        if not messaging_found:
            snapshot_parts.append("**Messaging:** Kafka / Azure Event Hubs / Kinesis")
        
        # Storage
        storage_found = False
        for storage in ["postgresql", "mongodb", "database"]:
            if re.search(storage, text, re.IGNORECASE):
                storage_name = "PostgreSQL" if "postgresql" in storage else "MongoDB" if "mongodb" in storage else "PostgreSQL / MongoDB"
                snapshot_parts.append(f"**Storage:** {storage_name}")
                storage_found = True
                break
        if not storage_found:
            snapshot_parts.append("**Storage:** PostgreSQL / MongoDB")
        
        # Security
        if re.search(r"encrypt|auth|security", text, re.IGNORECASE):
            snapshot_parts.append("**Security:** Encryption at rest & in transit, authN/authZ")
        else:
            snapshot_parts.append("**Security:** Encryption at rest & in transit, authN/authZ")
        
        return "\n".join(snapshot_parts) if snapshot_parts else "**Runtime:** Kubernetes (AKS / OpenShift)\n**Messaging:** Kafka / Azure Event Hubs / Kinesis\n**Storage:** PostgreSQL / MongoDB\n**Security:** Encryption at rest & in transit, authN/authZ"
    
    def _format_rag_response(self, text: str) -> str:
        """Format RAG API responses for better readability - NO TRUNCATION."""
        if not text or text in ["Information not available - timeout", "Information not available"]:
            return text
        
        # Only normalize whitespace - DO NOT TRUNCATE
        formatted = re.sub(r"\n{3,}", "\n\n", text)  # Max 2 consecutive newlines
        formatted = re.sub(r"[ \t]{3,}", " ", formatted)  # Normalize multiple spaces/tabs
        formatted = formatted.strip()
        
        # NO TRUNCATION - return full response
        # We want ALL information from RAG, no matter how long
        logger.info(f"RAG response length: {len(formatted)} characters")
        
        return formatted

    def _extract_capabilities(self, text: str) -> List[str]:
        """Extract capabilities from functional overview text."""
        capabilities = []
        if not text or text in ["Information not available", "Information not available - timeout"]:
            return capabilities
        
        sentences = re.split(r"[.!?]+", text)
        
        # Look for capability indicators
        capability_patterns = [
            r"supports", r"provides", r"enables", r"allows", r"can", r"handles",
            r"manages", r"processes", r"facilitates", r"delivers", r"offers",
            r"includes", r"features", r"capabilities", r"functions"
        ]
        
        for sentence in sentences:
            sentence = sentence.strip()
            if len(sentence) < 20:
                continue
            
            # Check if sentence contains capability indicators
            if any(re.search(pattern, sentence, re.IGNORECASE) for pattern in capability_patterns):
                # Clean and format the capability
                clean = re.sub(r"^\W+", "", sentence)  # Remove leading punctuation
                clean = clean.strip()
                if len(clean) > 20 and len(clean) < 200:  # Reasonable length
                    capabilities.append(clean)
        
        # If we didn't find many capabilities, try extracting from bullet points or lists
        if len(capabilities) < 3:
            # Look for bullet points or numbered lists
            lines = text.split('\n')
            for line in lines:
                line = line.strip()
                # Check for bullet points (-, *, •) or numbered lists
                if re.match(r'^[-*•]\s+', line) or re.match(r'^\d+[.)]\s+', line):
                    clean = re.sub(r'^[-*•\d.)]\s+', '', line).strip()
                    if len(clean) > 20 and len(clean) < 200:
                        capabilities.append(clean)
        
        # Return ALL capabilities found - no limit
        # We want complete information
        logger.info(f"Extracted {len(capabilities)} capabilities for component")
        return capabilities

    def _determine_component_type(self, service: AzureResource) -> str:
        """Determine component type from service."""
        resource_type = service.type.lower()
        name = service.name.lower()
        
        if "microsoft.app/containerapps" in resource_type or "containerapp" in resource_type:
            if "api" in name or "apiapp" in name:
                return "Azure Container App (API Service)"
            elif "ingester" in name or "ingest" in name:
                return "Azure Container App (Ingester)"
            elif "initapp" in name or ("init" in name and "app" in name):
                return "Azure Container App (Initializer)"
            return "Azure Container App"
        
        # For AKS pods, return more specific type
        if "managedclusters/pods" in resource_type:
            namespace = service.properties.get("namespace", "")
            if namespace:
                return f"AKS Pod ({namespace} namespace)"
            return "AKS Pod"
        
        if "microsoft.containerservice" in resource_type or "kubernetes" in resource_type:
            return "Azure Kubernetes Service (AKS)"
        
        if "database" in resource_type or "sql" in resource_type:
            if "cosmos" in resource_type:
                return "Azure Cosmos DB"
            elif "postgresql" in resource_type:
                return "Azure Database for PostgreSQL"
            elif "mysql" in resource_type:
                return "Azure Database for MySQL"
            return "Azure Database Service"
        
        # Storage services should not be identified as Temenos components
        # This method is only called for identified components, so this shouldn't happen
        # But if it does, return a generic type
        if "storage" in resource_type:
            return "Azure Storage (Infrastructure)"
        
        if "eventhub" in resource_type:
            return "Azure Event Hub"
        
        # Try to extract from resource type
        parts = service.type.split("/")
        if len(parts) > 1:
            return f"Azure {parts[-1]}"
        
        return "Azure Resource"

    async def _get_cache_service(self):
        """Get cache service instance (lazy initialization)."""
        if self._cache_service is None:
            from app.services.cache_service import get_cache_service
            self._cache_service = await get_cache_service()
        return self._cache_service
    
    async def refactor_documentation_strict(
        self,
        component_name: str,
        force_refresh: bool = False
    ) -> str:
        """
        Query RAG API and refactor into strict client-facing architecture documentation.
        
        Args:
            component_name: Name of the Temenos component/microservice
            force_refresh: If True, bypass cache and force fresh RAG query
            
        Returns:
            Refactored documentation following strict 12-section structure
        """
        try:
            logger.info(f"🔄 Refactoring documentation for {component_name} (strict format, force_refresh={force_refresh})")
            
            # Query architectural overview
            arch_query = self._build_architectural_query(component_name, "microservice")
            arch_response = await self._query_rag(
                arch_query,
                region="global",
                rag_model_id="ModularBanking, TechnologyOverview",
                context="This is about Temenos microservice architecture for client-facing documentation."
            )
            
            architectural_text = ""
            # RAG adapter returns {"data": {"answer": "..."}}
            if arch_response and isinstance(arch_response, dict):
                raw_text = arch_response.get("data", {}).get("answer", "") or arch_response.get("answer", "")
                if raw_text and len(raw_text) > 50:
                    architectural_text = raw_text
                else:
                    architectural_text = "Information not available"
            else:
                architectural_text = "Information not available"
            
            # Query functional overview
            func_query = self._build_functional_query(component_name, "microservice")
            func_response = await self._query_rag(
                func_query,
                region="global",
                rag_model_id="ModularBanking, TechnologyOverview",
                context="This is about Temenos microservice functional capabilities for client-facing documentation."
            )
            
            functional_text = ""
            # RAG adapter returns {"data": {"answer": "..."}}
            if func_response and isinstance(func_response, dict):
                raw_text = func_response.get("data", {}).get("answer", "") or func_response.get("answer", "")
                if raw_text and len(raw_text) > 50:
                    functional_text = raw_text
                else:
                    functional_text = "Information not available"
            else:
                functional_text = "Information not available"
            
            # Refactor using strict structure
            refactored_doc = self._refactor_rag_content_strict(
                architectural_text,
                functional_text,
                component_name
            )
            
            logger.info(f"✓ Refactored strict documentation for {component_name}: {len(refactored_doc)} chars")
            return refactored_doc
            
        except Exception as e:
            logger.error(f"Failed to refactor documentation for {component_name}: {e}")
            return self._build_empty_strict_document(component_name)
    
    async def identify_component(
        self, service: AzureResource, all_services: Optional[List[AzureResource]] = None, use_cache: bool = True, force_refresh: bool = False
    ) -> Optional[TemenosComponentInfo]:
        """Identify Temenos component from Azure service.
        
        Args:
            service: Azure resource to identify
            all_services: Optional list of all services for context
            use_cache: Whether to use cached component info
            force_refresh: Force refresh even if cached (ignores cache)
        """
        try:
            # Quick filter
            if not self._is_potential_temenos_component(service):
                logger.debug(f"Skipping {service.name} - not a potential Temenos component")
                return None
            
            # Extract component name
            extracted_info = self._extract_component_name(service)
            if not extracted_info:
                logger.debug(f"Could not extract component name from {service.name}")
                return None
            
            component_name = extracted_info["normalizedName"]
            component_category = extracted_info["componentCategory"]
            
            logger.info(f"Identifying component for {service.name}: {component_name}")
            
            # Check persistent cache first (unless force_refresh is True)
            # If force_refresh, skip cache entirely and fetch fresh from RAG
            if force_refresh:
                logger.info(f"force_refresh=True for {component_name}, skipping ALL caches and fetching fresh from RAG")
            elif use_cache:
                try:
                    cache_service = await self._get_cache_service()
                    cached_data = await cache_service.get_component_info(component_name)
                    if cached_data:
                        # Check if cached data has old table format - if so, invalidate cache
                        arch_overview = cached_data.get("architectural_overview", "")
                        has_old_format = (
                            "## A)" in arch_overview or 
                            "## B)" in arch_overview or 
                            "| Pattern/Guarantee |" in arch_overview or
                            "| Component | Role |" in arch_overview or
                            "Core Architectural Guarantees" in arch_overview and "Component Identity" not in arch_overview
                        )

                        if has_old_format:
                            logger.info(f"🔄 Cached data has old table format for {component_name} - invalidating cache and fetching fresh")
                            await cache_service.delete_component_info(component_name)
                            cache_key = component_name.lower()
                            if cache_key in self._component_cache:
                                del self._component_cache[cache_key]
                        else:
                            logger.info(f"✓ Loaded cached component info (persistent) for {component_name}")
                            # Reconstruct TemenosComponentInfo from cached data
                            component_info = TemenosComponentInfo(
                                component_name=cached_data.get("component_name", component_name),
                                component_type=self._determine_component_type(service),
                                architectural_overview=cached_data.get("architectural_overview", ""),
                                functional_overview=cached_data.get("functional_overview", ""),
                                capabilities=cached_data.get("capabilities", []),
                                related_services=cached_data.get("related_services", []),
                                relationships=[],  # Relationships not cached for now
                                data_source="cache"
                            )
                            # Also update in-memory cache for faster access next time
                            cache_key = component_name.lower()
                            self._component_cache[cache_key] = component_info
                            logger.debug(f"Cached component info in memory for {component_name}")
                            return component_info
                except Exception as e:
                    logger.warning(f"Error reading from persistent cache for {component_name}: {e}, continuing...")
            elif force_refresh:
                logger.info(f"🔄 Force refresh enabled - skipping persistent component_info cache check for {component_name}")
            
            # If force_refresh is True, clear ALL caches to ensure fresh data
            if force_refresh:
                logger.info(f"🔄 FORCE REFRESH requested for {component_name} - clearing ALL caches and fetching fresh data from RAG API")
                cache_key = component_name.lower()
                
                # Clear in-memory cache
                if cache_key in self._component_cache:
                    del self._component_cache[cache_key]
                    logger.info(f"✓ Cleared in-memory cache for {component_name}")
                
                # Clear persistent cache - be aggressive (delete component info and RAG responses)
                try:
                    cache_service = await self._get_cache_service()
                    # Delete component info
                    deleted_comp = await cache_service.delete_component_info(component_name)
                    # Delete all RAG responses for this component
                    deleted_arch = await cache_service.delete_rag_response(component_name, "architectural", "ModularBanking, TechnologyOverview")
                    deleted_func = await cache_service.delete_rag_response(component_name, "functional", "ModularBanking, FuncTransactGeneric")
                    logger.info(f"✓ Cleared persistent cache for {component_name} (comp_info={deleted_comp}, arch={deleted_arch}, func={deleted_func})")
                except Exception as e:
                    logger.warning(f"⚠ Error clearing persistent cache for {component_name}: {e}, continuing...")
                
                logger.info(f"🔄 Cache cleared - will now fetch fresh data from RAG API for {component_name}")
            
            # Check in-memory cache (unless force_refresh is True)
            cache_key = component_name.lower()
            if use_cache and not force_refresh and cache_key in self._component_cache:
                cached_info = self._component_cache[cache_key]
                
                # Check if cached entry has old format - if so, invalidate cache
                # Old format indicators: table format, A/B sections, or missing strict format header
                has_old_format = (
                    "## A)" in cached_info.architectural_overview or 
                    "## B)" in cached_info.architectural_overview or 
                    "| Pattern/Guarantee |" in cached_info.architectural_overview or
                    "| Component | Role |" in cached_info.architectural_overview or
                    ("Core Architectural Guarantees" in cached_info.architectural_overview and "Component Identity" not in cached_info.architectural_overview) or
                    ("Component Identity" in cached_info.architectural_overview and "## 1. Purpose & Scope" not in cached_info.architectural_overview) or
                    ("ARCHITECTURE OVERVIEW" in cached_info.architectural_overview and "## 1. Purpose & Scope" not in cached_info.architectural_overview)
                )
                
                # Check if cached entry is minimal (from non-RAG fallback)
                is_minimal = cached_info.architectural_overview.startswith(f"{component_name} is a Temenos microservice component deployed") and len(cached_info.architectural_overview) < 500
                has_rag_now = self.rag_adapter is not None and hasattr(self.rag_adapter, 'jwt_token') and self.rag_adapter.jwt_token
                
                if has_old_format:
                    logger.info(f"🔄 In-memory cache has old table format for {component_name} - invalidating cache and fetching fresh data")
                    del self._component_cache[cache_key]
                    # Also clear persistent cache
                    try:
                        cache_service = await self._get_cache_service()
                        await cache_service.delete_component_info(component_name)
                    except Exception as e:
                        logger.warning(f"Error clearing persistent cache: {e}")
                elif is_minimal and has_rag_now:
                    logger.info(f"Cache entry for {component_name} is minimal but RAG is available - invalidating cache and fetching fresh data")
                    # Remove from cache and continue to fetch fresh data
                    del self._component_cache[cache_key]
                else:
                    logger.info(f"✓ Using in-memory cached component info for {component_name}")
                    # Return a copy with service-specific type
                    return TemenosComponentInfo(
                        component_name=cached_info.component_name,
                        component_type=self._determine_component_type(service),
                        architectural_overview=cached_info.architectural_overview,
                        functional_overview=cached_info.functional_overview,
                        capabilities=cached_info.capabilities,
                        related_services=cached_info.related_services,
                        relationships=cached_info.relationships,
                        data_source=cached_info.data_source or "cache"  # Preserve data source from cache
                    )
            elif force_refresh:
                logger.info(f"🔄 Force refresh enabled - skipping in-memory cache check for {component_name}")
            
            # Check if RAG adapter is available (has JWT token)
            # If force_refresh is True, try to refresh the JWT token from settings
            if force_refresh and self.rag_adapter:
                try:
                    from app.api.settings import get_rag_jwt_token_value
                    # Try to refresh JWT token from settings (async)
                    try:
                        new_token = await get_rag_jwt_token_value()
                        if new_token:
                            self.rag_adapter.jwt_token = new_token
                            logger.info(f"✓ Refreshed RAG JWT token for {component_name} (force_refresh=True)")
                        else:
                            logger.warning(f"Could not refresh JWT token - token is None")
                    except Exception as e:
                        logger.warning(f"Could not refresh JWT token: {e}, using existing token")
                except Exception as e:
                    logger.warning(f"Error refreshing JWT token: {e}")
            
            has_rag = self.rag_adapter is not None and hasattr(self.rag_adapter, 'jwt_token') and self.rag_adapter.jwt_token
            
            logger.info(f"RAG availability check for {component_name} (force_refresh={force_refresh}):")
            logger.info(f"  Component category: {component_category}")
            logger.info(f"  Service name: {service.name}")
            logger.info(f"  Service type: {service.type}")
            logger.info(f"  rag_adapter is None: {self.rag_adapter is None}")
            if self.rag_adapter:
                logger.info(f"  has jwt_token attr: {hasattr(self.rag_adapter, 'jwt_token')}")
                if hasattr(self.rag_adapter, 'jwt_token'):
                    logger.info(f"  jwt_token value: {'SET' if self.rag_adapter.jwt_token else 'NOT SET'}")
            logger.info(f"  Final has_rag: {has_rag}")
            
            # CRITICAL FIX: When force_refresh=True, ALWAYS try to query RAG even if has_rag is False
            # The token might be loaded during the query via _ensure_token() in the adapter
            if not has_rag and not force_refresh:
                # If RAG is not available and NOT forcing refresh, use cached data if available, otherwise use minimal fallback
                logger.warning(f"✗ RAG not available for {component_name}, using minimal fallback description")
                component_info = TemenosComponentInfo(
                    component_name=component_name,
                    component_type=self._determine_component_type(service),
                    architectural_overview=f"{component_name} is a Temenos microservice component deployed in Azure Kubernetes Service.",
                    functional_overview=f"{component_name} provides core banking functionality as part of the Temenos Transact platform.",
                    capabilities=[f"Core {component_name} functionality"],
                    related_services=[],
                    relationships=[],
                    data_source="fallback"
                )
                logger.info(f"Successfully identified component (without RAG): {component_name} for {service.name}")
                # Don't cache minimal fallback when force_refresh is True
                if use_cache and not force_refresh:
                    self._component_cache[cache_key] = component_info
                return component_info
            
            # Build queries
            architectural_query = self._build_architectural_query(component_name, component_category)
            functional_query = self._build_functional_query(component_name, component_category)
            
            # Query RAG API with timeout - use asyncio.wait_for for timeout
            # Check cache first to avoid unnecessary RAG API calls
            import asyncio
            cache_service = await self._get_cache_service()
            
            # Try to get cached architectural response (skip if force_refresh)
            architectural_response = None
            rag_fresh_arch = False
            if force_refresh:
                logger.info(f"force_refresh=True: Skipping ALL caches and fetching fresh architectural RAG data for {component_name}")
                rag_fresh_arch = True  # Mark as fresh from the start - we WILL query RAG
                # Don't check cache at all when force_refresh is True
            elif use_cache:
                cached_arch = await cache_service.get_rag_response(
                    component_name, "architectural", "ModularBanking, TechnologyOverview"
                )
                if cached_arch:
                    logger.info(f"Using cached architectural RAG response for {component_name}")
                    architectural_response = cached_arch
            elif force_refresh:
                logger.info(f"🔄 Force refresh enabled - clearing cache and fetching fresh architectural RAG response")
                # Clear cached RAG responses to ensure fresh data
                try:
                    await cache_service.delete_rag_response(component_name, "architectural", "ModularBanking, TechnologyOverview")
                    logger.info(f"✓ Cleared cached architectural RAG response for {component_name}")
                except Exception as e:
                    logger.warning(f"Failed to clear architectural cache (non-fatal): {e}")
            
            # CRITICAL: When force_refresh=True, ALWAYS try to query RAG, even if has_rag was False
            # The adapter's _ensure_token() will try to load the token during the query
            if not architectural_response or force_refresh:
                rag_fresh_arch = True  # Mark that we're fetching fresh RAG data
                logger.info(f"🔄 Querying RAG API for {component_name} - Architectural query (force_refresh={force_refresh}, has_cached={architectural_response is not None})...")
                logger.info(f"  Query: {architectural_query[:200]}...")
                logger.info(f"  RAG adapter available: {self.rag_adapter is not None}")
                if self.rag_adapter:
                    logger.info(f"  RAG adapter type: {type(self.rag_adapter).__name__}")
                    if hasattr(self.rag_adapter, 'jwt_token'):
                        has_token = bool(self.rag_adapter.jwt_token)
                        logger.info(f"  RAG JWT token configured: {has_token}")
                try:
                    # Check if adapter exists - if not, try to initialize it
                    if self.rag_adapter is None:
                        logger.warning(f"RAG adapter is None for {component_name}, attempting to initialize...")
                        # Try to get adapter - it might initialize now
                        if hasattr(self, '_get_rag_adapter'):
                            self.rag_adapter = await self._get_rag_adapter()
                    
                    if self.rag_adapter is None:
                        raise RuntimeError("RAG adapter is not initialized. Please set RAG JWT token via Settings API.")
                    
                    architectural_response = await asyncio.wait_for(
                        self._query_rag(
                            question=architectural_query,
                            region="global",
                            rag_model_id="ModularBanking, TechnologyOverview",
                            context="This is a Temenos microservice component in a core banking system deployment. Provide comprehensive, detailed, and thorough information."
                        ),
                        timeout=60.0  # Increased timeout to 60s for complete comprehensive responses
                    )
                    logger.info(f"✓ Architectural query completed for {component_name}")
                    logger.info(f"  Response type: {type(architectural_response)}")
                    logger.info(f"  Response keys: {list(architectural_response.keys()) if isinstance(architectural_response, dict) else 'N/A'}")
                    if isinstance(architectural_response, dict) and "data" in architectural_response:
                        answer_text = str(architectural_response.get("data", {}).get("answer", ""))
                        answer_preview = answer_text[:300]
                        logger.info(f"  Answer preview: {answer_preview}...")
                        logger.info(f"  Answer length: {len(answer_text)} chars")
                        # RAG API provides information for ALL microservices - be very lenient
                        # Only filter out if it's explicitly an error message AND very short (< 30 chars)
                        if answer_text and len(answer_text) > 30:
                            # Use any response > 30 chars - RAG API provides valid info for all microservices
                            logger.info(f"✓ RAG returned architectural response for {component_name} ({len(answer_text)} chars) - using it")
                        elif answer_text and len(answer_text) > 0:
                            # Even short responses might have useful info - only filter explicit error messages at start
                            lower_text = answer_text.lower().strip()
                            if (lower_text.startswith("i cannot provide") or 
                                lower_text.startswith("information not available") or
                                lower_text.startswith("not available in my knowledge") or
                                lower_text == "information not available - timeout" or
                                lower_text == "information not available - error"):
                                logger.warning(f"⚠ RAG returned explicit error message for {component_name} - treating as no data")
                                architectural_response = None
                                rag_fresh_arch = False
                            else:
                                # Use it - might be valid short response
                                logger.info(f"✓ RAG returned short but potentially valid response for {component_name} ({len(answer_text)} chars) - using it")
                        else:
                            logger.warning(f"⚠ RAG returned empty response for {component_name}")
                            architectural_response = None
                            rag_fresh_arch = False
                    
                    # Cache the response (even after force_refresh, cache the fresh data)
                    if use_cache:
                        logger.info(f"💾 Caching fresh architectural RAG response for {component_name}")
                        await cache_service.set_rag_response(
                            component_name, "architectural", architectural_response, "ModularBanking, TechnologyOverview"
                        )
                except asyncio.TimeoutError:
                    logger.warning(f"⚠ Architectural query timeout for {service.name} after 60s")
                    architectural_response = {"data": {"answer": "Information not available - timeout"}}
                except Exception as e:
                    logger.error(f"✗ Architectural query failed for {service.name}: {e}", exc_info=True)
                    architectural_response = {"data": {"answer": "Information not available - error"}}
            
            # Try to get cached functional response (skip if force_refresh)
            functional_response = None
            rag_fresh_func = False
            if force_refresh:
                logger.info(f"force_refresh=True: Skipping ALL caches and fetching fresh functional RAG data for {component_name}")
                rag_fresh_func = True  # Mark as fresh from the start - we WILL query RAG
                # Don't check cache at all when force_refresh is True
            elif use_cache:
                cached_func = await cache_service.get_rag_response(
                    component_name, "functional", "ModularBanking, FuncTransactGeneric"
                )
                if cached_func:
                    logger.info(f"Using cached functional RAG response for {component_name}")
                    functional_response = cached_func
            elif force_refresh:
                logger.info(f"🔄 Force refresh enabled - clearing cache and fetching fresh functional RAG response")
                # Clear cached RAG responses to ensure fresh data
                try:
                    await cache_service.delete_rag_response(component_name, "functional", "ModularBanking, FuncTransactGeneric")
                    logger.info(f"✓ Cleared cached functional RAG response for {component_name}")
                except Exception as e:
                    logger.warning(f"Failed to clear functional cache (non-fatal): {e}")
            
            # CRITICAL: When force_refresh=True, ALWAYS try to query RAG, even if has_rag was False
            # The adapter's _ensure_token() will try to load the token during the query
            if not functional_response or force_refresh:
                rag_fresh_func = True  # Mark that we're fetching fresh RAG data
                logger.info(f"🔄 Querying RAG API for {component_name} - Functional query (force_refresh={force_refresh})...")
                logger.info(f"  Query: {functional_query[:200]}...")
                try:
                    # Check if adapter exists - if not, try to initialize it
                    if self.rag_adapter is None:
                        logger.warning(f"RAG adapter is None for {component_name}, attempting to initialize...")
                        # Try to get adapter - it might initialize now
                        if hasattr(self, '_get_rag_adapter'):
                            self.rag_adapter = await self._get_rag_adapter()
                    
                    if self.rag_adapter is None:
                        raise RuntimeError("RAG adapter is not initialized. Please set RAG JWT token via Settings API.")
                    
                    functional_response = await asyncio.wait_for(
                        self._query_rag(
                            question=functional_query,
                            region="global",
                            rag_model_id="ModularBanking, FuncTransactGeneric",
                            context="This is a Temenos microservice component in a core banking system deployment. Provide comprehensive, detailed, and thorough information."
                        ),
                        timeout=60.0  # Increased timeout to 60s for complete comprehensive responses
                    )
                    logger.info(f"✓ Functional query completed for {component_name}")
                    logger.info(f"  Response type: {type(functional_response)}")
                    logger.info(f"  Response keys: {list(functional_response.keys()) if isinstance(functional_response, dict) else 'N/A'}")
                    if isinstance(functional_response, dict) and "data" in functional_response:
                        answer_text = str(functional_response.get("data", {}).get("answer", ""))
                        answer_preview = answer_text[:300]
                        logger.info(f"  Answer preview: {answer_preview}...")
                        
                        logger.info(f"  Answer length: {len(answer_text)} chars")
                        # RAG API provides information for ALL microservices - be very lenient
                        # Only filter out if it's explicitly an error message AND very short (< 30 chars)
                        if answer_text and len(answer_text) > 30:
                            # Use any response > 30 chars - RAG API provides valid info for all microservices
                            logger.info(f"✓ RAG returned functional response for {component_name} ({len(answer_text)} chars) - using it")
                        elif answer_text and len(answer_text) > 0:
                            # Even short responses might have useful info - only filter explicit error messages at start
                            lower_text = answer_text.lower().strip()
                            if (lower_text.startswith("i cannot provide") or 
                                lower_text.startswith("information not available") or
                                lower_text.startswith("not available in my knowledge") or
                                lower_text == "information not available - timeout" or
                                lower_text == "information not available - error"):
                                logger.warning(f"⚠ RAG returned explicit error message for {component_name} - treating as no data")
                                functional_response = None
                                rag_fresh_func = False
                            else:
                                # Use it - might be valid short response
                                logger.info(f"✓ RAG returned short but potentially valid response for {component_name} ({len(answer_text)} chars) - using it")
                        else:
                            logger.warning(f"⚠ RAG returned empty functional response for {component_name}")
                            functional_response = None
                            rag_fresh_func = False
                    
                    # Cache the response (even after force_refresh, cache the fresh data)
                    if functional_response and use_cache:
                        logger.info(f"💾 Caching fresh functional RAG response for {component_name}")
                        await cache_service.set_rag_response(
                            component_name, "functional", functional_response, "ModularBanking, FuncTransactGeneric"
                        )
                except asyncio.TimeoutError:
                    logger.warning(f"⚠ Functional query timeout for {service.name} after 60s")
                    functional_response = {"data": {"answer": "Information not available - timeout"}}
                except Exception as e:
                    logger.error(f"✗ Functional query failed for {service.name}: {e}", exc_info=True)
                    functional_response = {"data": {"answer": "Information not available - error"}}
            
            # Get text from responses, handling None cases
            # IMPORTANT: Only mark as "not available" if truly empty or explicitly says so
            # Be LESS aggressive - RAG API provides information for ALL microservices, so trust the response
            architectural_text = ""
            if architectural_response and isinstance(architectural_response, dict):
                raw_text = architectural_response.get("data", {}).get("answer", "")
                # Only filter out if it's explicitly an error message AND very short (< 30 chars)
                # RAG API provides information for ALL microservices, so be lenient
                if raw_text and len(raw_text) > 30:
                    # Use any response that's longer than 30 chars - RAG API provides valid info
                    architectural_text = raw_text
                elif raw_text and len(raw_text) > 0:
                    # Even short responses might have useful info - only filter explicit error messages
                    lower_text = raw_text.lower()
                    if not (lower_text.startswith("i cannot provide") or 
                           lower_text.startswith("information not available") or
                           lower_text.startswith("not available in my knowledge") or
                           lower_text == "information not available - timeout" or
                           lower_text == "information not available - error"):
                        architectural_text = raw_text
            
            functional_text = ""
            if functional_response and isinstance(functional_response, dict):
                raw_text = functional_response.get("data", {}).get("answer", "")
                # Only filter out if it's explicitly an error message AND very short (< 30 chars)
                # RAG API provides information for ALL microservices, so be lenient
                if raw_text and len(raw_text) > 30:
                    # Use any response that's longer than 30 chars - RAG API provides valid info
                    functional_text = raw_text
                elif raw_text and len(raw_text) > 0:
                    # Even short responses might have useful info - only filter explicit error messages
                    lower_text = raw_text.lower()
                    if not (lower_text.startswith("i cannot provide") or 
                           lower_text.startswith("information not available") or
                           lower_text.startswith("not available in my knowledge") or
                           lower_text == "information not available - timeout" or
                           lower_text == "information not available - error"):
                        functional_text = raw_text
            
            # Log actual RAG response lengths
            logger.info(f"RAG response for {component_name}:")
            logger.info(f"  Architectural: {len(architectural_text)} chars - {architectural_text[:100]}...")
            logger.info(f"  Functional: {len(functional_text)} chars - {functional_text[:100]}...")
            
            # Refactor RAG responses using STRICT 12-section format
            logger.info(f"🔄 Refactoring RAG content for {component_name} using STRICT format (force_refresh={force_refresh})...")
            arch_formatted = self._refactor_rag_content_strict(
                architectural_text, 
                functional_text, 
                component_name
            )
            func_formatted = ""  # Functional content is now part of the strict format
            
            logger.info(f"✓ Refactored strict documentation length: {len(arch_formatted)} chars")
            
            # Verify strict format is applied (check for strict template headers)
            if "## 1. Purpose & Scope" not in arch_formatted:
                logger.warning(f"⚠ WARNING: Refactored content doesn't have strict format header - format may be incorrect")
                logger.warning(f"  First 200 chars: {arch_formatted[:200]}")
            else:
                logger.info(f"✓ Strict 12-section format confirmed - '## 1. Purpose & Scope' header found")
            
            # Log formatted lengths
            logger.info(f"Formatted response lengths: arch={len(arch_formatted)}, func={len(func_formatted)}")
            
            # Determine data source - prioritize fresh RAG data, especially when force_refresh
            # IMPORTANT: Check if we actually got RAG data (not just empty strings or fallback)
            has_rag_data = (architectural_text and len(architectural_text) > 50) or (functional_text and len(functional_text) > 50)
            
            if force_refresh:
                # When force_refresh is True, we MUST have fresh data - check if we actually queried RAG AND got data
                if (rag_fresh_arch or rag_fresh_func) and has_rag_data:
                    data_source = "rag_fresh"
                    logger.info(f"✓ force_refresh=True: Successfully fetched fresh RAG data for {component_name} (arch: {rag_fresh_arch}, func: {rag_fresh_func}, has_data: {has_rag_data})")
                elif rag_fresh_arch or rag_fresh_func:
                    # We queried RAG but got no data - still mark as fresh attempt (so UI shows "refreshed")
                    data_source = "rag_fresh"
                    logger.info(f"✓ force_refresh=True: Queried RAG for {component_name} (arch: {rag_fresh_arch}, func: {rag_fresh_func}) - data may be minimal")
                elif architectural_response or functional_response:
                    # We have responses but they're from cache (shouldn't happen with force_refresh, but handle it)
                    data_source = "rag_cached"
                    logger.warning(f"⚠ force_refresh=True but got cached responses for {component_name} - this should not happen")
                else:
                    # No data at all
                    data_source = "fallback"
                    logger.warning(f"⚠ force_refresh=True but no RAG data available for {component_name} (data_source={data_source})")
            elif rag_fresh_arch or rag_fresh_func:
                data_source = "rag_fresh"
                logger.info(f"✓ Successfully fetched fresh RAG data for {component_name} (arch: {rag_fresh_arch}, func: {rag_fresh_func})")
            elif architectural_response or functional_response:
                data_source = "rag_cached"
            else:
                data_source = "fallback"
            
            logger.info(f"Final data_source for {component_name}: {data_source} (force_refresh={force_refresh}, rag_fresh_arch={rag_fresh_arch}, rag_fresh_func={rag_fresh_func})")
            
            # Check if refactored content has strict format - if not, use fallback
            has_strict_format = "## 1. Purpose & Scope" in arch_formatted
            has_old_format = (
                "## A)" in arch_formatted or 
                "## B)" in arch_formatted or 
                "## C)" in arch_formatted or
                "## D)" in arch_formatted or
                "## E)" in arch_formatted or
                "## F)" in arch_formatted or
                "## G)" in arch_formatted or
                "| Pattern/Guarantee |" in arch_formatted or
                "| Component | Role |" in arch_formatted or
                ("Core Architectural Guarantees" in arch_formatted and "Component Identity" not in arch_formatted) or
                ("ARCHITECTURE OVERVIEW" in arch_formatted and "## 1. Purpose & Scope" not in arch_formatted) or
                (arch_formatted.startswith("#") and "## 1. Purpose & Scope" not in arch_formatted and len(arch_formatted) > 500)
            )
            
            if arch_formatted in ["Information not available", "Information not available - timeout"]:
                logger.warning(f"RAG returned no information for {component_name} - using strict format fallback")
                arch_formatted = self._build_empty_strict_document(component_name)
            elif not has_strict_format or has_old_format:
                logger.warning(f"⚠ Refactored content for {component_name} doesn't have strict format (has_strict={has_strict_format}, has_old={has_old_format})")
                logger.warning(f"  First 500 chars: {arch_formatted[:500]}")
                
                # If we have substantial RAG content but wrong format, try one more time with better extraction
                if len(architectural_text) > 500 and architectural_text not in ["Information not available", "Information not available - timeout"]:
                    logger.info(f"  Attempting improved refactoring with better extraction...")
                    try:
                        # Force re-extraction with improved patterns
                        arch_formatted_retry = self._refactor_rag_content_strict(
                            architectural_text,
                            functional_text,
                            component_name
                        )
                        
                        # Validate retry result
                        has_strict_retry = "## 1. Purpose & Scope" in arch_formatted_retry
                        has_old_retry = any(marker in arch_formatted_retry for marker in ["## A)", "## B)", "| Pattern/Guarantee |"])
                        
                        if has_strict_retry and not has_old_retry:
                            logger.info(f"✓ Retry refactoring succeeded - strict format confirmed")
                            arch_formatted = arch_formatted_retry
                        else:
                            logger.warning(f"⚠ Retry refactoring still failed (has_strict={has_strict_retry}, has_old={has_old_retry}) - using empty strict format fallback")
                            arch_formatted = self._build_empty_strict_document(component_name)
                    except Exception as e:
                        logger.error(f"✗ Error during retry refactoring: {e}", exc_info=True)
                        logger.warning(f"  Using empty strict format fallback")
                        arch_formatted = self._build_empty_strict_document(component_name)
                else:
                    # Not enough content to retry - use empty strict format
                    logger.warning(f"  Insufficient RAG content for retry - using empty strict format fallback")
                    arch_formatted = self._build_empty_strict_document(component_name)
            
            # Final validation: ensure we NEVER cache or return non-strict format
            if "## 1. Purpose & Scope" not in arch_formatted:
                logger.error(f"✗ CRITICAL: Refactoring failed completely for {component_name} - using empty strict format")
                arch_formatted = self._build_empty_strict_document(component_name)
            
            # Verify no old format markers remain
            if any(marker in arch_formatted for marker in ["## A)", "## B)", "| Pattern/Guarantee |", "| Component | Role |"]):
                logger.error(f"✗ CRITICAL: Old format markers detected in refactored content for {component_name} - using empty strict format")
                arch_formatted = self._build_empty_strict_document(component_name)
            
            # func_formatted is always empty now (functional content is in strict format)
            func_formatted = ""
            
            # ABSOLUTE FINAL CHECK: Ensure strict format before creating component_info
            # This is the last line of defense - if we get here without strict format, something is very wrong
            if "## 1. Purpose & Scope" not in arch_formatted:
                logger.error(f"✗ CRITICAL: About to create component_info without strict format for {component_name}!")
                logger.error(f"  Content preview: {arch_formatted[:500]}")
                arch_formatted = self._build_empty_strict_document(component_name)
            
            # Check for any old format markers one more time
            old_markers = [m for m in ["## A)", "## B)", "## C)", "## D)", "## E)", "## F)", "## G)", "| Pattern/Guarantee |", "| Component | Role |"] if m in arch_formatted]
            if old_markers:
                logger.error(f"✗ CRITICAL: Old format markers found in final content for {component_name}: {old_markers}")
                arch_formatted = self._build_empty_strict_document(component_name)
            
            logger.info(f"✓ Final architectural overview for {component_name}: {len(arch_formatted)} chars, strict format: {'## 1. Purpose & Scope' in arch_formatted}")
            
            # Create component_info - at this point arch_formatted MUST be in strict format
            component_info = TemenosComponentInfo(
                component_name=component_name,
                component_type=self._determine_component_type(service),
                architectural_overview=arch_formatted,
                functional_overview=func_formatted,
                capabilities=self._extract_capabilities(functional_text) if functional_text != "Information not available" else [f"Core {component_name} functionality"],
                related_services=[],
                relationships=[],
                data_source=data_source
            )
            
            # Cache the component info (but NOT when force_refresh - we want fresh data next time too)
            if use_cache and not force_refresh:
                self._component_cache[cache_key] = component_info
                logger.info(f"Cached component info for {component_name}")
            elif force_refresh:
                logger.info(f"force_refresh=True: NOT caching component info for {component_name} (fresh data should not be cached)")
            # One final validation on the created object
            if "## 1. Purpose & Scope" not in component_info.architectural_overview:
                logger.error(f"✗ CRITICAL: component_info created without strict format for {component_name} - this should never happen!")
                # Rebuild with empty strict format
                component_info = TemenosComponentInfo(
                    component_name=component_name,
                    component_type=self._determine_component_type(service),
                    architectural_overview=self._build_empty_strict_document(component_name),
                    functional_overview="",
                    capabilities=[f"Core {component_name} functionality"],
                    related_services=[],
                    relationships=[]
                )
            
            # Cache the component info in both memory and persistent storage
            # IMPORTANT: Only cache if content is in strict format
            if use_cache:
                # Final check before caching - ensure strict format
                if "## 1. Purpose & Scope" not in component_info.architectural_overview:
                    logger.error(f"✗ CRITICAL: Attempted to cache non-strict format for {component_name} - skipping cache")
                else:
                    # Update in-memory cache for fast access
                    self._component_cache[cache_key] = component_info
                    logger.info(f"✓ Cached component info in memory for {component_name} (strict format verified)")
                    
                    # Also save to persistent cache so it's available on next application startup
                    try:
                        cache_service = await self._get_cache_service()
                        await cache_service.set_component_info(component_name, {
                            "component_name": component_info.component_name,
                            "component_type": component_info.component_type,
                            "architectural_overview": component_info.architectural_overview,
                            "functional_overview": component_info.functional_overview,
                            "capabilities": component_info.capabilities,
                            "related_services": component_info.related_services
                        })
                        logger.debug(f"Saved component info to persistent cache for {component_name}")
                    except Exception as e:
                        logger.warning(f"Failed to save component info to persistent cache for {component_name}: {e}")
                        # Don't fail - in-memory cache is still available
            
            # ABSOLUTE FINAL VALIDATION: Log and verify before returning
            final_overview = component_info.architectural_overview
            has_strict_final = "## 1. Purpose & Scope" in final_overview
            has_old_final = any(marker in final_overview for marker in ["## A)", "## B)", "| Pattern/Guarantee |"])
            
            if not has_strict_final or has_old_final:
                logger.error(f"✗ CRITICAL: About to return component_info without strict format for {component_name}!")
                logger.error(f"  Has strict format: {has_strict_final}")
                logger.error(f"  Has old format: {has_old_final}")
                logger.error(f"  Content preview (first 500 chars): {final_overview[:500]}")
                # Rebuild with empty strict format - this should NEVER happen but be safe
                component_info = TemenosComponentInfo(
                    component_name=component_name,
                    component_type=self._determine_component_type(service),
                    architectural_overview=self._build_empty_strict_document(component_name),
                    functional_overview="",
                    capabilities=[f"Core {component_name} functionality"],
                    related_services=[],
                    relationships=[]
                )
                logger.warning(f"  Rebuilt component_info with empty strict format for {component_name}")
            else:
                logger.info(f"✓ Final validation passed for {component_name} - strict format confirmed before return")
            
            logger.info(f"Successfully identified component: {component_name} for {service.name}")
            return component_info
        except Exception as e:
            logger.error(f"Error identifying component for {service.name}: {e}")
            return None

    async def analyze_services(
        self,
        services: List[AzureResource],
        progress_callback: Optional[Callable[[int, int, str], None]] = None,
        component_callback: Optional[Callable[[TemenosAnalysisResult], None]] = None,
        use_cache: bool = True,
        force_refresh: bool = False
    ) -> List[TemenosAnalysisResult]:
        """Analyze multiple services with progress and component callbacks."""
        results = []
        total = len(services)
        
        logger.info(f"Starting analysis of {total} services...")
        
        # Log pod count for debugging
        pod_services = [s for s in services if "managedclusters/pods" in s.type.lower()]
        logger.info(f"Found {len(pod_services)} AKS pod services out of {total} total services")
        if pod_services:
            pod_namespaces = list(set([s.properties.get("namespace", "unknown") for s in pod_services]))
            logger.info(f"Pod namespaces in analysis: {pod_namespaces}")
        
        # Filter services first - only process potential Temenos components
        potential_services = [s for s in services if self._is_potential_temenos_component(s)]
        skipped_count = total - len(potential_services)
        
        # Log which pods passed the filter
        potential_pods = [s for s in potential_services if "managedclusters/pods" in s.type.lower()]
        logger.info(f"After filtering: {len(potential_pods)} pods identified as potential Temenos components")
        if potential_pods:
            potential_namespaces = list(set([s.properties.get("namespace", "unknown") for s in potential_pods]))
            logger.info(f"Potential component namespaces: {potential_namespaces}")
        
        if skipped_count > 0:
            logger.info(f"Skipping {skipped_count} non-Temenos infrastructure services")
        
        if not potential_services:
            logger.info("No potential Temenos components found in services")
            return []
        
        logger.info(f"Processing {len(potential_services)} potential Temenos components out of {total} total services")
        
        # Process in batches - optimize batch size for better throughput when cache is used
        batch_size = 5  # Increased from 3 for better throughput when cache is used
        
        for i in range(0, len(potential_services), batch_size):
            batch = potential_services[i:i + batch_size]
            batch_number = (i // batch_size) + 1
            total_batches = (len(potential_services) + batch_size - 1) // batch_size
            
            logger.info(f"Processing batch {batch_number}/{total_batches} ({len(batch)} services)...")
            
            # Process batch sequentially (RAG API may not handle parallel well)
            for idx, service in enumerate(batch):
                # Map back to original index for progress
                original_index = services.index(service) + 1
                if progress_callback:
                    progress_callback(original_index, total, service.name)
                
                try:
                    component_info = await self.identify_component(service, services, use_cache=use_cache, force_refresh=force_refresh)
                    result = TemenosAnalysisResult(
                        service=service,
                        component_info=component_info,
                        error=None if component_info else "Could not identify Temenos component"
                    )
                    
                    if component_info and component_callback:
                        component_callback(result)
                    
                    results.append(result)
                except Exception as e:
                    logger.error(f"Error analyzing {service.name}: {e}")
                    results.append(TemenosAnalysisResult(
                        service=service,
                        error=str(e)
                    ))
            
            # Small delay between batches (reduced since cache reduces load)
            if i + batch_size < len(potential_services):
                import asyncio
                await asyncio.sleep(0.1)  # Reduced delay
        
        # Add all skipped services to results as unclassified
        skipped_services = [s for s in services if s not in potential_services]
        for skipped in skipped_services:
            results.append(TemenosAnalysisResult(service=skipped))
        
        logger.info(f"Analysis complete. {len(results)} results, {sum(1 for r in results if r.component_info)} components identified, {skipped_count} infrastructure services skipped.")
        return results
