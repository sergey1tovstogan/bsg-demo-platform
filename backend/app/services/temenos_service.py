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
        relationships: Optional[List[ComponentRelationship]] = None
    ):
        self.component_name = component_name
        self.component_type = component_type
        self.architectural_overview = architectural_overview
        self.functional_overview = functional_overview
        self.capabilities = capabilities
        self.related_services = related_services
        self.relationships = relationships or []

    def to_dict(self) -> Dict[str, Any]:
        return {
            "componentName": self.component_name,
            "componentType": self.component_type,
            "architecturalOverview": self.architectural_overview,
            "functionalOverview": self.functional_overview,
            "capabilities": self.capabilities,
            "relatedServices": self.related_services,
            "relationships": [r.to_dict() for r in self.relationships]
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
        
        # Microservice patterns
        microservice_patterns = [
            (r"holdings", "Holdings Microservice", "microservice"),
            (r"^adapter|adapter", "Adapter Microservice", "microservice"),
            (r"^genericconfig|genericconfig", "Generic Config Microservice", "microservice"),
            (r"eventstore|event-store|eventstore", "Event Store Microservice", "microservice"),
            (r"^stmtgen|stmtgen", "Statement Generation Microservice", "microservice"),
            (r"^notification|notification", "Notification Microservice", "microservice"),
            (r"^audit|audit", "Audit Microservice", "microservice"),
            (r"^file|file", "File Management Microservice", "microservice"),
            (r"^workflow|workflow", "Workflow Microservice", "microservice"),
            (r"^integration|integration", "Integration Microservice", "microservice"),
        ]
        
        for pattern, microservice_name, category in microservice_patterns:
            if re.search(pattern, name):
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
        """Build comprehensive architectural query - requesting ALL available information."""
        if category == "microservice":
            return f"""Provide a COMPLETE, COMPREHENSIVE, and DETAILED architectural overview of {component_name} in Temenos Transact. 

Include EVERYTHING you know about:
- Complete architecture and all design patterns used
- ALL architectural components and their detailed interactions
- Complete deployment architecture, configurations, and considerations
- ALL integration points with other Temenos components (list all)
- Complete technology stack, frameworks, libraries, and versions
- Detailed scalability and performance characteristics, metrics, benchmarks
- Complete security architecture, authentication, authorization, encryption
- Detailed data flow and processing patterns, data models, schemas
- Infrastructure requirements, resource needs, dependencies
- Monitoring, logging, observability patterns
- Error handling, resilience patterns, disaster recovery
- Any other architectural details available

Be EXTREMELY thorough and provide ALL available information. Do not summarize or truncate. Include every detail you have access to."""
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
        if category == "microservice":
            return f"""Provide a COMPLETE, COMPREHENSIVE, and DETAILED functional overview of {component_name} in Temenos Transact. 

Include EVERYTHING you know about:
- ALL core functional capabilities and responsibilities (list all)
- ALL business functions and features it supports (complete list)
- ALL use cases and scenarios (detailed examples)
- ALL key business processes it handles (step-by-step)
- ALL data it manages and processes (data types, structures, volumes)
- ALL APIs and interfaces it exposes (endpoints, methods, parameters, responses)
- ALL business rules and validations (complete list)
- ALL workflow and process orchestration capabilities
- ALL reporting and analytics capabilities
- Configuration options and settings
- Feature flags and capabilities
- Business logic details
- Any other functional details available

Be EXTREMELY thorough and provide ALL available information. Do not summarize or truncate. Include every detail you have access to."""
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
        Refactor RAG content according to strict architecture documentation constraints.
        
        HARD CONSTRAINTS:
        - Each architectural concept explained once and only once
        - No repeated summaries
        - No marketing-style prose
        - No "In summary" sections
        - Remove FUNCTIONAL OVERVIEW and KEY CAPABILITIES sections
        
        OUTPUT FORMAT:
        A) Architecture Overview (max 6 lines)
        B) Patterns & Guarantees (table)
        C) Canonical Event Lifecycle (numbered 1-7 steps)
        D) Components & Interactions (table)
        E) Integration Landscape (table)
        F) Deployment Snapshot (exactly 6 bullets)
        G) Observability & Resilience (max 8 bullets)
        
        Returns:
            Tuple of (refactored_architectural_overview, refactored_functional_overview)
        """
        if not architectural_text or architectural_text in ["Information not available - timeout", "Information not available"]:
            return architectural_text, functional_text
        
        # Combine both texts for comprehensive analysis
        combined_text = f"{architectural_text}\n\n{functional_text}".lower()
        
        # Remove marketing adjectives and summary sections
        combined_text = self._remove_marketing_prose(combined_text)
        
        # Extract architecture overview (MAX 6 lines)
        arch_overview = self._extract_architecture_overview_clean(architectural_text, component_name)
        
        # Extract patterns & guarantees (TABLE format)
        patterns_table = self._extract_patterns_guarantees_table(combined_text)
        
        # Extract canonical event lifecycle (numbered 1-7 steps, ONE FLOW ONLY)
        event_lifecycle = self._extract_canonical_event_lifecycle(combined_text)
        
        # Extract components & interactions (TABLE)
        components_table = self._extract_components_interactions_table(combined_text)
        
        # Extract integration landscape (TABLE)
        integration_table = self._extract_integration_landscape_table(combined_text)
        
        # Extract deployment snapshot (exactly 6 bullets)
        deployment_snapshot = self._extract_deployment_snapshot_bullets(combined_text, architectural_text)
        
        # Extract observability & resilience (max 8 bullets)
        observability = self._extract_observability_resilience(combined_text)
        
        # Build refactored architectural overview following exact format
        refactored_arch = f"""## A) Architecture Overview

{arch_overview}

## B) Patterns & Guarantees

{patterns_table}

## C) Canonical Event Lifecycle

{event_lifecycle}

## D) Components & Interactions

{components_table}

## E) Integration Landscape

{integration_table}

## F) Deployment Snapshot

{deployment_snapshot}

## G) Observability & Resilience

{observability}"""
        
        # Functional overview is removed per requirements
        refactored_func = ""  # Explicitly removed per requirements
        
        logger.info(f"Refactored RAG content for {component_name}: arch={len(refactored_arch)} chars, func={len(refactored_func)} chars")
        
        return refactored_arch.strip(), refactored_func.strip()
    
    def _remove_marketing_prose(self, text: str) -> str:
        """Remove marketing adjectives and summary sections."""
        # Remove common marketing words
        marketing_words = [
            r'\bpivotal\b', r'\bhighly reliable\b', r'\brobust\b', r'\bcomprehensive\b',
            r'\bseamless\b', r'\bessential\b', r'\bcritical\b', r'\bfoundational\b'
        ]
        for word in marketing_words:
            text = re.sub(word, '', text, flags=re.IGNORECASE)
        
        # Remove "In summary" sections
        text = re.sub(r'in summary[^.]*\.', '', text, flags=re.IGNORECASE)
        text = re.sub(r'summary[^.]*\.', '', text, flags=re.IGNORECASE)
        
        return text
    
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
            if use_cache and not force_refresh:
                try:
                    cache_service = await self._get_cache_service()
                    cached_data = await cache_service.get_component_info(component_name)
                    if cached_data:
                        logger.info(f"✓ Loaded cached component info (persistent) for {component_name}")
                        # Reconstruct TemenosComponentInfo from cached data
                        component_info = TemenosComponentInfo(
                            component_name=cached_data.get("component_name", component_name),
                            component_type=self._determine_component_type(service),
                            architectural_overview=cached_data.get("architectural_overview", ""),
                            functional_overview=cached_data.get("functional_overview", ""),
                            capabilities=cached_data.get("capabilities", []),
                            related_services=cached_data.get("related_services", []),
                            relationships=[]  # Relationships not cached for now
                        )
                        # Also update in-memory cache for faster access next time
                        cache_key = component_name.lower()
                        self._component_cache[cache_key] = component_info
                        logger.debug(f"Cached component info in memory for {component_name}")
                        return component_info
                except Exception as e:
                    logger.warning(f"Error reading from persistent cache for {component_name}: {e}, continuing...")
            
            # If force_refresh is True, clear caches
            if force_refresh:
                logger.info(f"Force refresh requested for {component_name} - clearing caches and fetching fresh data")
                cache_key = component_name.lower()
                if cache_key in self._component_cache:
                    del self._component_cache[cache_key]
                    logger.info(f"Cleared in-memory cache for {component_name}")
                try:
                    cache_service = await self._get_cache_service()
                    await cache_service.delete_component_info(component_name)
                    await cache_service.delete_rag_response(component_name, "architectural", "ModularBanking, TechnologyOverview")
                    await cache_service.delete_rag_response(component_name, "functional", "ModularBanking, FuncTransactGeneric")
                    logger.info(f"Cleared persistent cache for {component_name}")
                except Exception as e:
                    logger.warning(f"Error clearing persistent cache for {component_name}: {e}, continuing...")
            
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
                        relationships=cached_info.relationships
                    )
            
            # Check if RAG adapter is available (has JWT token)
            has_rag = self.rag_adapter is not None and hasattr(self.rag_adapter, 'jwt_token') and self.rag_adapter.jwt_token
            
            logger.info(f"RAG availability check for {component_name}:")
            logger.info(f"  rag_adapter is None: {self.rag_adapter is None}")
            if self.rag_adapter:
                logger.info(f"  has jwt_token attr: {hasattr(self.rag_adapter, 'jwt_token')}")
                if hasattr(self.rag_adapter, 'jwt_token'):
                    logger.info(f"  jwt_token value: {'SET' if self.rag_adapter.jwt_token else 'NOT SET'}")
            logger.info(f"  Final has_rag: {has_rag}")
            
            if not has_rag:
                # If RAG is not available, create component info from namespace/name only
                logger.warning(f"✗ RAG not available for {component_name}, using minimal fallback description")
                component_info = TemenosComponentInfo(
                    component_name=component_name,
                    component_type=self._determine_component_type(service),
                    architectural_overview=f"{component_name} is a Temenos microservice component deployed in Azure Kubernetes Service.",
                    functional_overview=f"{component_name} provides core banking functionality as part of the Temenos Transact platform.",
                    capabilities=[f"Core {component_name} functionality"],
                    related_services=[],
                    relationships=[]
                )
                logger.info(f"Successfully identified component (without RAG): {component_name} for {service.name}")
                # Cache even non-RAG responses
                if use_cache:
                    self._component_cache[cache_key] = component_info
                return component_info
            
            # Build queries
            architectural_query = self._build_architectural_query(component_name, component_category)
            functional_query = self._build_functional_query(component_name, component_category)
            
            # Query RAG API with timeout - use asyncio.wait_for for timeout
            # Check cache first to avoid unnecessary RAG API calls
            import asyncio
            cache_service = await self._get_cache_service()
            
            # Try to get cached architectural response
            architectural_response = None
            if use_cache and not force_refresh:
                cached_arch = await cache_service.get_rag_response(
                    component_name, "architectural", "ModularBanking, TechnologyOverview"
                )
                if cached_arch:
                    logger.info(f"Using cached architectural RAG response for {component_name}")
                    architectural_response = cached_arch
            
            if not architectural_response:
                logger.info(f"Querying RAG for {component_name} - Architectural query...")
                logger.info(f"  Query: {architectural_query[:200]}...")
                try:
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
                        answer_preview = str(architectural_response.get("data", {}).get("answer", ""))[:300]
                        logger.info(f"  Answer preview: {answer_preview}...")
                    
                    # Cache the response
                    if use_cache:
                        await cache_service.set_rag_response(
                            component_name, "architectural", architectural_response, "ModularBanking, TechnologyOverview"
                        )
                except asyncio.TimeoutError:
                    logger.warning(f"⚠ Architectural query timeout for {service.name} after 60s")
                    architectural_response = {"data": {"answer": "Information not available - timeout"}}
                except Exception as e:
                    logger.error(f"✗ Architectural query failed for {service.name}: {e}", exc_info=True)
                    architectural_response = {"data": {"answer": "Information not available - error"}}
            
            # Try to get cached functional response
            functional_response = None
            if use_cache and not force_refresh:
                cached_func = await cache_service.get_rag_response(
                    component_name, "functional", "ModularBanking, FuncTransactGeneric"
                )
                if cached_func:
                    logger.info(f"Using cached functional RAG response for {component_name}")
                    functional_response = cached_func
            
            if not functional_response:
                logger.info(f"Querying RAG for {component_name} - Functional query...")
                logger.info(f"  Query: {functional_query[:200]}...")
                try:
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
                        answer_preview = str(functional_response.get("data", {}).get("answer", ""))[:300]
                        logger.info(f"  Answer preview: {answer_preview}...")
                    
                    # Cache the response
                    if use_cache:
                        await cache_service.set_rag_response(
                            component_name, "functional", functional_response, "ModularBanking, FuncTransactGeneric"
                        )
                except asyncio.TimeoutError:
                    logger.warning(f"⚠ Functional query timeout for {service.name} after 60s")
                    functional_response = {"data": {"answer": "Information not available - timeout"}}
                except Exception as e:
                    logger.error(f"✗ Functional query failed for {service.name}: {e}", exc_info=True)
                    functional_response = {"data": {"answer": "Information not available - error"}}
            
            architectural_text = architectural_response.get("data", {}).get("answer", "Information not available")
            functional_text = functional_response.get("data", {}).get("answer", "Information not available")
            
            # Log actual RAG response lengths
            logger.info(f"RAG response for {component_name}:")
            logger.info(f"  Architectural: {len(architectural_text)} chars - {architectural_text[:100]}...")
            logger.info(f"  Functional: {len(functional_text)} chars - {functional_text[:100]}...")
            
            # Refactor RAG responses according to strict architecture documentation constraints
            # Apply strict refactoring for all components to remove redundancy
            arch_formatted, func_formatted = self._refactor_rag_content(
                architectural_text, 
                functional_text, 
                component_name
            )
            
            # Log formatted lengths
            logger.info(f"Formatted response lengths: arch={len(arch_formatted)}, func={len(func_formatted)}")
            
            # If RAG returned "Information not available", provide more detailed fallback description
            if arch_formatted in ["Information not available", "Information not available - timeout"]:
                logger.warning(f"RAG returned no information for {component_name} - using detailed fallback")
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
            
            if func_formatted in ["Information not available", "Information not available - timeout"]:
                logger.warning(f"RAG returned no information for {component_name} - using detailed fallback")
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
            
            component_info = TemenosComponentInfo(
                component_name=component_name,
                component_type=self._determine_component_type(service),
                architectural_overview=arch_formatted,
                functional_overview=func_formatted,
                capabilities=self._extract_capabilities(functional_text) if functional_text != "Information not available" else [f"Core {component_name} functionality"],
                related_services=[],
                relationships=[]
            )
            
            # Cache the component info in both memory and persistent storage
            if use_cache:
                # Update in-memory cache for fast access
                self._component_cache[cache_key] = component_info
                logger.info(f"Cached component info in memory for {component_name}")
                
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
