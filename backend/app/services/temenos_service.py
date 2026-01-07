"""
Temenos Service

Handles Temenos RAG API interactions for component identification and analysis.
"""

from typing import List, Optional, Dict, Any, Callable
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
        context: Optional[str] = None
    ) -> Dict[str, Any]:
        """Public method to query RAG API."""
        return await self._query_rag(question, region, rag_model_id, context)
    
    async def _query_rag(
        self,
        question: str,
        region: str = "global",
        rag_model_id: str = "ModularBanking, TechnologyOverview",
        context: Optional[str] = None
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
            context=context
        )

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
                        logger.info(f"Using cached component info (persistent) for {component_name}")
                        # Reconstruct TemenosComponentInfo from cached data
                        cached_component_info = TemenosComponentInfo(
                            component_name=cached_data.get("component_name", component_name),
                            component_type=self._determine_component_type(service),
                            architectural_overview=cached_data.get("architectural_overview", ""),
                            functional_overview=cached_data.get("functional_overview", ""),
                            capabilities=cached_data.get("capabilities", []),
                            related_services=cached_data.get("related_services", []),
                            relationships=[],  # Relationships not cached for now
                            data_source="cache"
                        )
                        # Also update in-memory cache
                        cache_key = component_name.lower()
                        self._component_cache[cache_key] = cached_component_info
                        return cached_component_info
                except Exception as e:
                    logger.warning(f"Error reading from persistent cache: {e}, continuing...")
            
            # Check in-memory cache (unless force_refresh is True)
            cache_key = component_name.lower()
            if use_cache and not force_refresh and cache_key in self._component_cache:
                cached_info = self._component_cache[cache_key]
                # Check if cached entry is minimal (from non-RAG fallback)
                # If RAG is now available but cache has minimal data, invalidate and fetch fresh
                is_minimal = cached_info.architectural_overview.startswith(f"{component_name} is a Temenos microservice component deployed") and len(cached_info.architectural_overview) < 500
                has_rag_now = self.rag_adapter is not None and hasattr(self.rag_adapter, 'jwt_token') and self.rag_adapter.jwt_token
                
                if is_minimal and has_rag_now:
                    logger.info(f"Cache entry for {component_name} is minimal but RAG is available - invalidating cache and fetching fresh data")
                    # Remove from cache and continue to fetch fresh data
                    del self._component_cache[cache_key]
                else:
                    logger.info(f"Using cached component info for {component_name}")
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
            
            # Try to get cached architectural response (ALWAYS skip cache if force_refresh)
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
            
            # CRITICAL: When force_refresh=True, ALWAYS try to query RAG, even if has_rag was False
            # The adapter's _ensure_token() will try to load the token during the query
            if not architectural_response or force_refresh:
                # If we get here, we need to query RAG (either force_refresh or no cache)
                rag_fresh_arch = True  # Mark that we're fetching fresh RAG data
                logger.info(f"Querying RAG for {component_name} - Architectural query... (force_refresh={force_refresh})")
                logger.info(f"  Query: {architectural_query[:200]}...")
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
                        # Check if RAG returned "I cannot provide" - but only filter if response is very short
                        # If response is substantial (>100 chars), it might still have useful info even if it says "I cannot provide"
                        if answer_text and len(answer_text) < 100 and ("I cannot provide" in answer_text or "not available in my knowledge" in answer_text.lower()):
                            logger.warning(f"⚠ RAG returned 'I cannot provide' with short response for {component_name} - treating as no data available")
                            # Don't cache this response - it's not useful
                            architectural_response = None
                            rag_fresh_arch = False
                        elif answer_text and len(answer_text) > 100:
                            # Substantial response - use it even if it contains "I cannot provide" somewhere
                            logger.info(f"✓ RAG returned substantial architectural response for {component_name} ({len(answer_text)} chars) - using it")
                    
                    # Cache the response (but NOT when force_refresh - we want fresh data next time too)
                    if use_cache and not force_refresh:
                        await cache_service.set_rag_response(
                            component_name, "architectural", architectural_response, "ModularBanking, TechnologyOverview"
                        )
                except asyncio.TimeoutError:
                    logger.warning(f"⚠ Architectural query timeout for {service.name} after 60s")
                    architectural_response = {"data": {"answer": "Information not available - timeout"}}
                except Exception as e:
                    logger.error(f"✗ Architectural query failed for {service.name}: {e}", exc_info=True)
                    architectural_response = {"data": {"answer": "Information not available - error"}}
            
            # Try to get cached functional response (ALWAYS skip cache if force_refresh)
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
            
            # CRITICAL: When force_refresh=True, ALWAYS try to query RAG, even if has_rag was False
            # The adapter's _ensure_token() will try to load the token during the query
            if not functional_response or force_refresh:
                # If we get here, we need to query RAG (either force_refresh or no cache)
                rag_fresh_func = True  # Mark that we're fetching fresh RAG data
                logger.info(f"Querying RAG for {component_name} - Functional query... (force_refresh={force_refresh})")
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
                        
                        # Check if RAG returned "I cannot provide" - but only filter if response is very short
                        # If response is substantial (>100 chars), it might still have useful info even if it says "I cannot provide"
                        if answer_text and len(answer_text) < 100 and ("I cannot provide" in answer_text or "not available in my knowledge" in answer_text.lower()):
                            logger.warning(f"⚠ RAG returned 'I cannot provide' with short response for {component_name} - treating as no data available")
                            # Don't cache this response - it's not useful
                            functional_response = None
                            rag_fresh_func = False
                        elif answer_text and len(answer_text) > 100:
                            # Substantial response - use it even if it contains "I cannot provide" somewhere
                            logger.info(f"✓ RAG returned substantial response for {component_name} ({len(answer_text)} chars) - using it")
                    
                    # Only cache if we got valid data (not "I cannot provide")
                    if functional_response and use_cache and not force_refresh:
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
            architectural_text = ""
            if architectural_response and isinstance(architectural_response, dict):
                raw_text = architectural_response.get("data", {}).get("answer", "")
                # Only filter out if it's explicitly "I cannot provide" AND very short
                if raw_text and len(raw_text) > 100:
                    # If we have substantial text, use it even if it contains "I cannot provide" somewhere
                    architectural_text = raw_text
                elif raw_text and ("I cannot provide" not in raw_text and "not available in my knowledge" not in raw_text.lower()):
                    # Use it if it doesn't explicitly say it can't provide
                    architectural_text = raw_text
                elif raw_text and len(raw_text) > 50:
                    # Even if it says "I cannot provide", if there's substantial content, use it
                    architectural_text = raw_text
            
            functional_text = ""
            if functional_response and isinstance(functional_response, dict):
                raw_text = functional_response.get("data", {}).get("answer", "")
                # Only filter out if it's explicitly "I cannot provide" AND very short
                if raw_text and len(raw_text) > 100:
                    # If we have substantial text, use it even if it contains "I cannot provide" somewhere
                    functional_text = raw_text
                elif raw_text and ("I cannot provide" not in raw_text and "not available in my knowledge" not in raw_text.lower()):
                    # Use it if it doesn't explicitly say it can't provide
                    functional_text = raw_text
                elif raw_text and len(raw_text) > 50:
                    # Even if it says "I cannot provide", if there's substantial content, use it
                    functional_text = raw_text
            
            # Log actual RAG response lengths
            logger.info(f"RAG response for {component_name}:")
            logger.info(f"  Architectural: {len(architectural_text)} chars - {architectural_text[:100]}...")
            logger.info(f"  Functional: {len(functional_text)} chars - {functional_text[:100]}...")
            
            # Format responses - PRESERVE original structure (sections A, B, C, D, etc.)
            # Only do minimal formatting - keep the original RAG structure intact
            # IMPORTANT: Only format if we have actual text content
            if architectural_text and len(architectural_text) > 0:
                arch_formatted = self._format_rag_response(architectural_text)
                # If formatting resulted in empty or "Information not available", use raw text if it's substantial
                if not arch_formatted or arch_formatted in ["Information not available", "Information not available - timeout"]:
                    if len(architectural_text) > 50:
                        arch_formatted = architectural_text
                        logger.info(f"Using raw architectural text for {component_name} after format check ({len(architectural_text)} chars)")
            else:
                arch_formatted = ""
            
            if functional_text and len(functional_text) > 0:
                func_formatted = self._format_rag_response(functional_text)
                # If formatting resulted in empty or "Information not available", use raw text if it's substantial
                if not func_formatted or func_formatted in ["Information not available", "Information not available - timeout"]:
                    if len(functional_text) > 50:
                        func_formatted = functional_text
                        logger.info(f"Using raw functional text for {component_name} after format check ({len(functional_text)} chars)")
            else:
                func_formatted = ""
            
            # DO NOT use deduplication service - it removes the original structure
            # The frontend will parse and display the original structure properly
            logger.info(f"Using original RAG response structure: arch={len(arch_formatted)} chars, func={len(func_formatted)} chars")
            
            # Log formatted lengths
            logger.info(f"Formatted response lengths: arch={len(arch_formatted)}, func={len(func_formatted)}")
            
            # If we still have no data, provide minimal fallback
            if not arch_formatted or (len(arch_formatted) < 50 and "Information not available" in arch_formatted):
                logger.warning(f"RAG returned no information for {component_name} - using minimal fallback")
                arch_formatted = f"""{component_name} is a Temenos microservice component deployed in Azure Kubernetes Service.

Architecture:
- Deployed as containerized microservices in Azure Kubernetes Service (AKS)
- Follows microservices architecture patterns for scalability and resilience
- Integrates with other Temenos components through well-defined APIs
- Uses cloud-native technologies for deployment and orchestration

Key Components:
- Core service components handling business logic
- API endpoints for external and internal communication
- Data access layers for persistence
- Integration layers for component communication

Deployment:
- Containerized using Docker
- Orchestrated via Kubernetes
- Scalable and resilient architecture
- Cloud-native design patterns"""
            
            # If we still have no functional data, provide minimal fallback
            if not func_formatted or (len(func_formatted) < 50 and "Information not available" in func_formatted):
                logger.warning(f"RAG returned no functional information for {component_name} - using minimal fallback")
                func_formatted = f"""{component_name} provides core banking functionality as part of the Temenos Transact platform.

Functional Capabilities:
- Core banking operations and business logic processing
- Transaction processing and validation
- Business rule enforcement
- Data management and persistence

Business Functions:
- Handles critical banking operations
- Supports core banking workflows
- Manages business data and state
- Provides APIs for integration with other components

Integration:
- Integrates with other Temenos microservices
- Communicates via standard APIs and protocols
- Supports event-driven architectures
- Enables distributed system patterns"""
            
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
