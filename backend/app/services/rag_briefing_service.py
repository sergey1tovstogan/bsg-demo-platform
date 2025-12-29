"""
Perfect RAG Briefing Service

Implements a two-pass approach to generate structured, cited briefings from RAG chunks.
"""

from typing import List, Dict, Any, Optional
import json
import re
from datetime import datetime
from app.adapters.rag import get_rag_adapter
from app.core.logging import get_logger
from pydantic import BaseModel, Field, ValidationError
from enum import Enum

logger = get_logger(__name__)


class FactType(str, Enum):
    """Types of facts that can be extracted."""
    DEFINITION = "definition"
    RESPONSIBILITY = "responsibility"
    PATTERN = "pattern"
    GUARANTEE = "guarantee"
    INTERFACE = "interface"
    EVENT = "event"
    DEPENDENCY = "dependency"
    DEPLOYMENT = "deployment"
    OPS = "ops"
    SECURITY = "security"
    LIMITATION = "limitation"


class Confidence(str, Enum):
    """Confidence levels."""
    HIGH = "high"
    MEDIUM = "medium"
    LOW = "low"


# Pydantic Models for Briefing Schema
class PatternModel(BaseModel):
    pattern: str
    what_it_ensures: str
    why_it_matters: str
    citations: List[str] = Field(default_factory=list)


class KeyComponentModel(BaseModel):
    name: str
    responsibility: str
    notes: str = ""
    citations: List[str] = Field(default_factory=list)


class InteractionModel(BaseModel):
    with_component: str = Field(alias="with")
    type: str  # sync|async|storage|config
    description: str
    citations: List[str] = Field(default_factory=list)
    
    class Config:
        populate_by_name = True


class CapabilityModel(BaseModel):
    capability: str
    details: List[str] = Field(default_factory=list)
    citations: List[str] = Field(default_factory=list)


class UseCaseModel(BaseModel):
    use_case: str
    steps: List[str] = Field(default_factory=list)
    citations: List[str] = Field(default_factory=list)


class APIModel(BaseModel):
    name: str
    type: str  # REST|gRPC|internal|unknown
    purpose: str
    inputs: str = ""
    outputs: str = ""
    citations: List[str] = Field(default_factory=list)


class EventModel(BaseModel):
    name: str
    direction: str  # produces|consumes|both
    schema: str  # CloudEvents|JSON|Avro|unknown
    topics: str = "unknown"
    citations: List[str] = Field(default_factory=list)


class DependencyModel(BaseModel):
    dependency: str
    category: str  # messaging|storage|platform|identity|other
    notes: str = ""
    citations: List[str] = Field(default_factory=list)


class ScalingModel(BaseModel):
    dimension: str
    how: str
    limits_or_notes: str = ""
    citations: List[str] = Field(default_factory=list)


class ResilienceModel(BaseModel):
    mechanism: str
    why: str
    citations: List[str] = Field(default_factory=list)


class ObservabilityModel(BaseModel):
    signal: str  # logs|metrics|traces|health
    what_to_monitor: List[str] = Field(default_factory=list)
    citations: List[str] = Field(default_factory=list)


class ControlModel(BaseModel):
    control: str
    details: str
    citations: List[str] = Field(default_factory=list)


class DataProtectionModel(BaseModel):
    area: str  # in_transit|at_rest|secrets|access
    approach: str
    citations: List[str] = Field(default_factory=list)


class GapModel(BaseModel):
    gap: str
    impact: str
    reason: str = "Not found in provided context"
    recommended_follow_up_questions: List[str] = Field(default_factory=list)


class SourceModel(BaseModel):
    chunk_id: str
    title: Optional[str] = None
    snippet: str
    relevance: str = ""


class ExecutiveSummaryModel(BaseModel):
    one_liner: str
    what_it_does: List[str] = Field(default_factory=list)
    why_it_matters: List[str] = Field(default_factory=list)
    where_it_fits: List[str] = Field(default_factory=list)
    confidence: Confidence = Confidence.MEDIUM


class ArchitectureModel(BaseModel):
    responsibilities: List[str] = Field(default_factory=list)
    core_patterns: List[PatternModel] = Field(default_factory=list)
    event_lifecycle: List[str] = Field(default_factory=list)
    key_components: List[KeyComponentModel] = Field(default_factory=list)
    interactions: List[InteractionModel] = Field(default_factory=list)


class FunctionalOverviewModel(BaseModel):
    capabilities: List[CapabilityModel] = Field(default_factory=list)
    primary_use_cases: List[UseCaseModel] = Field(default_factory=list)


class InterfacesModel(BaseModel):
    apis: List[APIModel] = Field(default_factory=list)
    events: List[EventModel] = Field(default_factory=list)


class DeploymentAndOpsModel(BaseModel):
    runtime: List[str] = Field(default_factory=list)
    dependencies: List[DependencyModel] = Field(default_factory=list)
    scaling: List[ScalingModel] = Field(default_factory=list)
    resilience: List[ResilienceModel] = Field(default_factory=list)
    observability: List[ObservabilityModel] = Field(default_factory=list)


class SecurityAndComplianceModel(BaseModel):
    controls: List[ControlModel] = Field(default_factory=list)
    data_protection: List[DataProtectionModel] = Field(default_factory=list)


class MetaModel(BaseModel):
    product_family: str
    component_name: str
    version_scope: Optional[str] = None
    generated_at: str


class BriefingModel(BaseModel):
    """Complete briefing schema."""
    meta: MetaModel
    executive_summary: ExecutiveSummaryModel
    architecture: ArchitectureModel
    functional_overview: FunctionalOverviewModel
    interfaces: InterfacesModel
    deployment_and_ops: DeploymentAndOpsModel
    security_and_compliance: SecurityAndComplianceModel
    limitations_and_gaps: List[GapModel] = Field(default_factory=list)
    sources: List[SourceModel] = Field(default_factory=list)


class RAGBriefingService:
    """Service for generating perfect RAG briefings."""
    
    def __init__(self):
        """Initialize the briefing service."""
        self.rag_adapter = get_rag_adapter()
        logger.info("✓ RAG Briefing Service initialized")
    
    def build_query(
        self,
        product_family: str,
        component_name: str,
        aliases: List[str]
    ) -> str:
        """
        Build comprehensive query with aliases and key terms.
        
        Args:
            product_family: Product family (e.g., "Temenos Transact")
            component_name: Component name (e.g., "Event Store Microservice")
            aliases: List of alternate names
            
        Returns:
            Comprehensive query string
        """
        base_terms = [
            "architecture", "responsibilities", "patterns", "guarantees",
            "interfaces", "APIs", "events", "deployment", "observability",
            "security", "scaling", "resilience", "dependencies"
        ]
        
        query_parts = [product_family, component_name]
        query_parts.extend(base_terms)
        
        # Add aliases
        if aliases:
            query_parts.extend(aliases)
        
        query = " ".join(query_parts)
        logger.debug(f"Built query: {query[:200]}...")
        return query
    
    async def retrieve_chunks(
        self,
        query: str,
        product_family: str,
        component_name: str,
        top_k: int = 30,
        rerank: bool = True,
        rerank_top_k: int = 15
    ) -> List[Dict[str, Any]]:
        """
        Retrieve RAG chunks with enhanced retrieval strategy.
        
        Args:
            query: Search query
            product_family: Product family filter
            component_name: Component name filter
            top_k: Initial retrieval count
            rerank: Whether to rerank results
            rerank_top_k: Top K after reranking
            
        Returns:
            List of chunks with chunk_id, title, text, source metadata
        """
        try:
            # Build comprehensive question for RAG API (same format as temenos_service)
            question = f"{query}\n\nFocus on: {component_name} in {product_family}"
            
            # Add context with filters
            context = f"Product Family: {product_family}\nComponent: {component_name}\nThis is a Temenos microservice component in a core banking system deployment. Provide comprehensive, detailed, and thorough information."
            
            # Use the same model IDs as temenos_service for architectural and functional info
            # Default to architectural model (TechnologyOverview)
            # Note: This will be overridden if we need functional model
            rag_model_id = getattr(self, '_current_model_id', "ModularBanking, TechnologyOverview")
            
            logger.info(f"Retrieving chunks for {component_name} using model: {rag_model_id}")
            
            # Call RAG adapter with model ID (same as temenos_service)
            response = await self.rag_adapter.query(
                question=question,
                context=context,
                region="global",
                rag_model_id=rag_model_id
            )
            
            logger.info(f"RAG response type: {type(response)}, keys: {list(response.keys()) if isinstance(response, dict) else 'N/A'}")
            
            # Extract chunks from response
            chunks = []
            
            # RAG API returns format: {"data": {"answer": "...", "sources": [...]}}
            if isinstance(response, dict):
                data = response.get("data", {})
                
                # Extract sources if available
                sources = data.get("sources", [])
                answer_text = data.get("answer", "")
                
                if sources:
                    # Convert sources to chunks format
                    logger.info(f"Found {len(sources)} sources in RAG response")
                    for i, src in enumerate(sources):
                        chunk_text = src.get("content", src.get("text", ""))
                        if not chunk_text and answer_text:
                            # Fallback to answer if source has no content
                            chunk_text = answer_text
                        
                        if chunk_text:  # Only add if we have text
                            chunks.append({
                                "chunk_id": src.get("chunk_id", f"chunk_{i}"),
                                "text": chunk_text,
                                "title": src.get("title", component_name),
                                "source": src.get("source", src.get("document", "RAG API")),
                                "section": src.get("section", ""),
                                "url": src.get("url", "")
                            })
                
                # If no sources but we have an answer, create chunks from answer
                if not chunks and answer_text and answer_text not in ["Information not available", "Information not available - timeout", "Information not available - error"]:
                    logger.info("No sources found, creating chunk from answer text")
                    # Split answer into paragraphs/sentences to create multiple chunks
                    paragraphs = [p.strip() for p in answer_text.split("\n\n") if p.strip()]
                    if not paragraphs:
                        # Fallback to sentences
                        import re
                        sentences = re.split(r'[.!?]+', answer_text)
                        paragraphs = [s.strip() for s in sentences if len(s.strip()) > 50]
                    
                    for i, para in enumerate(paragraphs[:top_k]):
                        chunks.append({
                            "chunk_id": f"chunk_{i}",
                            "text": para,
                            "title": component_name,
                            "source": "RAG API",
                            "section": "",
                            "url": ""
                        })
            
            # Ensure chunk_id exists
            for i, chunk in enumerate(chunks):
                if "chunk_id" not in chunk or not chunk["chunk_id"]:
                    chunk["chunk_id"] = f"chunk_{i}"
            
            # Limit to top_k
            if len(chunks) > top_k:
                chunks = chunks[:top_k]
            
            logger.info(f"Retrieved {len(chunks)} chunks for {component_name}")
            if chunks:
                logger.info(f"First chunk preview: {chunks[0].get('text', '')[:200]}...")
            else:
                logger.warning(f"No chunks extracted from RAG response for {component_name}")
            
            return chunks
            
        except Exception as e:
            logger.error(f"Error retrieving chunks: {e}", exc_info=True)
            return []
    
    def normalize_text(self, text: str) -> str:
        """Normalize text for deduplication."""
        # Lowercase, remove extra whitespace, remove punctuation
        text = text.lower().strip()
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text
    
    def are_similar(self, text1: str, text2: str, threshold: float = 0.85) -> bool:
        """
        Check if two texts are similar (simple word overlap).
        
        Args:
            text1: First text
            text2: Second text
            threshold: Similarity threshold (0-1)
            
        Returns:
            True if similar
        """
        norm1 = self.normalize_text(text1)
        norm2 = self.normalize_text(text2)
        
        # Exact match
        if norm1 == norm2:
            return True
        
        # Word overlap
        words1 = set(norm1.split())
        words2 = set(norm2.split())
        
        if not words1 or not words2:
            return False
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        similarity = len(intersection) / len(union) if union else 0
        return similarity >= threshold
    
    def deduplicate_facts(self, facts: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Remove duplicate facts.
        
        Args:
            facts: List of fact dictionaries
            
        Returns:
            Deduplicated facts
        """
        deduplicated = []
        seen_statements = []
        
        for fact in facts:
            statement = fact.get("statement", "")
            
            # Check if we've seen a similar statement
            is_duplicate = False
            for seen in seen_statements:
                if self.are_similar(statement, seen):
                    is_duplicate = True
                    # Merge citations if duplicate
                    existing_fact = next(
                        (f for f in deduplicated if self.are_similar(f.get("statement", ""), statement)),
                        None
                    )
                    if existing_fact:
                        # Merge citations
                        existing_citations = set(existing_fact.get("citations", []))
                        new_citations = set(fact.get("citations", []))
                        existing_fact["citations"] = list(existing_citations.union(new_citations))
                    break
            
            if not is_duplicate:
                deduplicated.append(fact)
                seen_statements.append(statement)
        
        logger.info(f"Deduplicated {len(facts)} facts to {len(deduplicated)}")
        return deduplicated
    
    async def extract_facts(
        self,
        chunks: List[Dict[str, Any]],
        component_name: str
    ) -> List[Dict[str, Any]]:
        """
        PASS 1: Extract atomic facts with citations from chunks.
        
        Args:
            chunks: RAG chunks
            component_name: Component name for context
            
        Returns:
            List of facts with citations
        """
        # For now, implement a simple extraction
        # In production, this would call an LLM with the PASS 1 prompt
        
        facts = []
        
        for chunk in chunks:
            chunk_id = chunk.get("chunk_id", "")
            text = chunk.get("text", chunk.get("snippet", ""))
            
            if not text:
                continue
            
            # Simple fact extraction: split by sentences and create facts
            sentences = re.split(r'[.!?]+', text)
            
            for sentence in sentences:
                sentence = sentence.strip()
                if len(sentence) < 20:  # Skip very short sentences
                    continue
                
                # Determine fact type based on keywords
                fact_type = FactType.DEFINITION
                sentence_lower = sentence.lower()
                
                if any(word in sentence_lower for word in ["responsibility", "responsible", "handles", "manages"]):
                    fact_type = FactType.RESPONSIBILITY
                elif any(word in sentence_lower for word in ["pattern", "design pattern", "architectural pattern"]):
                    fact_type = FactType.PATTERN
                elif any(word in sentence_lower for word in ["guarantee", "ensures", "guarantees", "provides"]):
                    fact_type = FactType.GUARANTEE
                elif any(word in sentence_lower for word in ["api", "interface", "endpoint", "service"]):
                    fact_type = FactType.INTERFACE
                elif any(word in sentence_lower for word in ["event", "message", "publish", "subscribe"]):
                    fact_type = FactType.EVENT
                elif any(word in sentence_lower for word in ["depends", "requires", "uses", "needs"]):
                    fact_type = FactType.DEPENDENCY
                elif any(word in sentence_lower for word in ["deploy", "runtime", "container", "kubernetes"]):
                    fact_type = FactType.DEPLOYMENT
                elif any(word in sentence_lower for word in ["monitor", "log", "metric", "observability"]):
                    fact_type = FactType.OPS
                elif any(word in sentence_lower for word in ["security", "encrypt", "auth", "access"]):
                    fact_type = FactType.SECURITY
                elif any(word in sentence_lower for word in ["limit", "cannot", "does not", "missing"]):
                    fact_type = FactType.LIMITATION
                
                facts.append({
                    "type": fact_type.value,
                    "statement": sentence,
                    "citations": [chunk_id]
                })
        
        # Deduplicate facts
        facts = self.deduplicate_facts(facts)
        
        logger.info(f"Extracted {len(facts)} facts from {len(chunks)} chunks")
        return facts
    
    async def synthesize_briefing(
        self,
        facts: List[Dict[str, Any]],
        chunks: List[Dict[str, Any]],
        product_family: str,
        component_name: str
    ) -> Dict[str, Any]:
        """
        PASS 2: Synthesize facts into structured briefing JSON.
        
        Args:
            facts: Extracted facts
            chunks: Original RAG chunks
            product_family: Product family
            component_name: Component name
            
        Returns:
            Structured briefing JSON
        """
        # Group facts by type
        facts_by_type = {}
        for fact in facts:
            fact_type = fact.get("type", "definition")
            if fact_type not in facts_by_type:
                facts_by_type[fact_type] = []
            facts_by_type[fact_type].append(fact)
        
        # Build briefing structure
        briefing = {
            "meta": {
                "product_family": product_family,
                "component_name": component_name,
                "version_scope": None,
                "generated_at": datetime.utcnow().isoformat() + "Z"
            },
            "executive_summary": self._build_executive_summary(facts_by_type, chunks),
            "architecture": self._build_architecture(facts_by_type, chunks),
            "functional_overview": self._build_functional_overview(facts_by_type, chunks),
            "interfaces": self._build_interfaces(facts_by_type, chunks),
            "deployment_and_ops": self._build_deployment_and_ops(facts_by_type, chunks),
            "security_and_compliance": self._build_security_and_compliance(facts_by_type, chunks),
            "limitations_and_gaps": self._build_limitations_and_gaps(facts_by_type, chunks),
            "sources": self._build_sources(chunks)
        }
        
        return briefing
    
    def _build_executive_summary(
        self,
        facts_by_type: Dict[str, List[Dict[str, Any]]],
        chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Build executive summary section."""
        definitions = facts_by_type.get("definition", [])
        responsibilities = facts_by_type.get("responsibility", [])
        
        # Build one-liner from first definition or responsibility
        one_liner = ""
        if definitions:
            one_liner = definitions[0].get("statement", "")
        elif responsibilities:
            one_liner = responsibilities[0].get("statement", "")
        else:
            one_liner = "Component information extracted from documentation"
        
        # What it does
        what_it_does = [
            fact.get("statement", "")
            for fact in responsibilities[:3]
        ]
        
        # Why it matters
        guarantees = facts_by_type.get("guarantee", [])
        why_it_matters = [
            fact.get("statement", "")
            for fact in guarantees[:3]
        ]
        
        # Where it fits
        dependencies = facts_by_type.get("dependency", [])
        where_it_fits = [
            fact.get("statement", "")
            for fact in dependencies[:3]
        ]
        
        # Determine confidence
        total_facts = sum(len(facts) for facts in facts_by_type.values())
        if total_facts > 20:
            confidence = Confidence.HIGH
        elif total_facts > 10:
            confidence = Confidence.MEDIUM
        else:
            confidence = Confidence.LOW
        
        return {
            "one_liner": one_liner[:200],  # Limit length
            "what_it_does": what_it_does[:5],
            "why_it_matters": why_it_matters[:5],
            "where_it_fits": where_it_fits[:5],
            "confidence": confidence.value
        }
    
    def _build_architecture(
        self,
        facts_by_type: Dict[str, List[Dict[str, Any]]],
        chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Build architecture section."""
        responsibilities = [
            fact.get("statement", "")
            for fact in facts_by_type.get("responsibility", [])
        ]
        
        # Build patterns
        patterns = []
        pattern_facts = facts_by_type.get("pattern", [])
        for fact in pattern_facts[:10]:
            statement = fact.get("statement", "")
            patterns.append({
                "pattern": statement[:100],
                "what_it_ensures": statement,
                "why_it_matters": "See pattern description",
                "citations": fact.get("citations", [])
            })
        
        # Event lifecycle
        event_facts = facts_by_type.get("event", [])
        event_lifecycle = [
            fact.get("statement", "")
            for fact in event_facts[:7]
        ]
        
        # Key components (extract from definitions/responsibilities)
        key_components = []
        component_facts = facts_by_type.get("definition", [])[:5]
        for fact in component_facts:
            statement = fact.get("statement", "")
            # Extract component name (first few words)
            name = " ".join(statement.split()[:3])
            key_components.append({
                "name": name,
                "responsibility": statement,
                "notes": "",
                "citations": fact.get("citations", [])
            })
        
        # Interactions (from dependencies)
        interactions = []
        dependency_facts = facts_by_type.get("dependency", [])
        for fact in dependency_facts[:10]:
            statement = fact.get("statement", "")
            # Try to extract component name
            with_component = "Other Component"
            if "with" in statement.lower():
                parts = statement.lower().split("with")
                if len(parts) > 1:
                    with_component = parts[1].strip().split()[0].title()
            
            interactions.append({
                "with": with_component,
                "type": "async",  # Default
                "description": statement,
                "citations": fact.get("citations", [])
            })
        
        return {
            "responsibilities": responsibilities[:10],
            "core_patterns": patterns,
            "event_lifecycle": event_lifecycle,
            "key_components": key_components,
            "interactions": interactions
        }
    
    def _build_functional_overview(
        self,
        facts_by_type: Dict[str, List[Dict[str, Any]]],
        chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Build functional overview section."""
        capabilities = []
        capability_facts = facts_by_type.get("responsibility", [])[:10]
        for fact in capability_facts:
            capabilities.append({
                "capability": fact.get("statement", ""),
                "details": [fact.get("statement", "")],
                "citations": fact.get("citations", [])
            })
        
        use_cases = []
        # Create use cases from event facts
        event_facts = facts_by_type.get("event", [])[:5]
        for fact in event_facts:
            use_cases.append({
                "use_case": fact.get("statement", ""),
                "steps": [fact.get("statement", "")],
                "citations": fact.get("citations", [])
            })
        
        return {
            "capabilities": capabilities,
            "primary_use_cases": use_cases
        }
    
    def _build_interfaces(
        self,
        facts_by_type: Dict[str, List[Dict[str, Any]]],
        chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Build interfaces section."""
        apis = []
        interface_facts = facts_by_type.get("interface", [])
        for fact in interface_facts[:10]:
            statement = fact.get("statement", "")
            apis.append({
                "name": statement[:50],
                "type": "REST",  # Default
                "purpose": statement,
                "inputs": "",
                "outputs": "",
                "citations": fact.get("citations", [])
            })
        
        events = []
        event_facts = facts_by_type.get("event", [])
        for fact in event_facts[:10]:
            statement = fact.get("statement", "")
            events.append({
                "name": statement[:50],
                "direction": "both",
                "schema": "CloudEvents",
                "topics": "unknown",
                "citations": fact.get("citations", [])
            })
        
        return {
            "apis": apis,
            "events": events
        }
    
    def _build_deployment_and_ops(
        self,
        facts_by_type: Dict[str, List[Dict[str, Any]]],
        chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Build deployment and ops section."""
        runtime = []
        deployment_facts = facts_by_type.get("deployment", [])
        for fact in deployment_facts[:5]:
            runtime.append(fact.get("statement", ""))
        
        dependencies = []
        dependency_facts = facts_by_type.get("dependency", [])
        for fact in dependency_facts[:10]:
            statement = fact.get("statement", "")
            dependencies.append({
                "dependency": statement[:50],
                "category": "other",
                "notes": statement,
                "citations": fact.get("citations", [])
            })
        
        scaling = []
        resilience = []
        guarantees = facts_by_type.get("guarantee", [])
        for fact in guarantees[:5]:
            resilience.append({
                "mechanism": fact.get("statement", ""),
                "why": "See mechanism description",
                "citations": fact.get("citations", [])
            })
        
        observability = []
        ops_facts = facts_by_type.get("ops", [])
        for fact in ops_facts[:5]:
            observability.append({
                "signal": "logs",
                "what_to_monitor": [fact.get("statement", "")],
                "citations": fact.get("citations", [])
            })
        
        return {
            "runtime": runtime[:5],
            "dependencies": dependencies,
            "scaling": scaling,
            "resilience": resilience,
            "observability": observability
        }
    
    def _build_security_and_compliance(
        self,
        facts_by_type: Dict[str, List[Dict[str, Any]]],
        chunks: List[Dict[str, Any]]
    ) -> Dict[str, Any]:
        """Build security and compliance section."""
        controls = []
        security_facts = facts_by_type.get("security", [])
        for fact in security_facts[:10]:
            controls.append({
                "control": fact.get("statement", ""),
                "details": fact.get("statement", ""),
                "citations": fact.get("citations", [])
            })
        
        data_protection = []
        for fact in security_facts[:5]:
            data_protection.append({
                "area": "in_transit",
                "approach": fact.get("statement", ""),
                "citations": fact.get("citations", [])
            })
        
        return {
            "controls": controls,
            "data_protection": data_protection
        }
    
    def _build_limitations_and_gaps(
        self,
        facts_by_type: Dict[str, List[Dict[str, Any]]],
        chunks: List[Dict[str, Any]]
    ) -> List[Dict[str, Any]]:
        """Build limitations and gaps section."""
        gaps = []
        limitation_facts = facts_by_type.get("limitation", [])
        
        for fact in limitation_facts[:5]:
            gaps.append({
                "gap": fact.get("statement", ""),
                "impact": "Documentation gap",
                "reason": "Not found in provided context",
                "recommended_follow_up_questions": [
                    f"What are the limitations of {fact.get('statement', '')[:50]}?",
                    "Are there any known issues or constraints?"
                ]
            })
        
        return gaps
    
    def _build_sources(self, chunks: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Build sources section."""
        sources = []
        for chunk in chunks:
            sources.append({
                "chunk_id": chunk.get("chunk_id", ""),
                "title": chunk.get("title"),
                "snippet": chunk.get("text", chunk.get("snippet", ""))[:200],
                "relevance": "Cited in briefing"
            })
        return sources
    
    async def generate_briefing(
        self,
        product_family: str,
        component_name: str,
        aliases: List[str] = None
    ) -> Dict[str, Any]:
        """
        Generate perfect RAG briefing for a component.
        
        Args:
            product_family: Product family (e.g., "Temenos Transact")
            component_name: Component name (e.g., "Event Store Microservice")
            aliases: List of alternate names
            
        Returns:
            Structured briefing JSON
        """
        aliases = aliases or []
        
        # Step 1: Build query
        query = self.build_query(product_family, component_name, aliases)
        
        # Step 2: Retrieve chunks (try both architectural and functional models)
        chunks = []
        
        # Try architectural model first
        self._current_model_id = "ModularBanking, TechnologyOverview"
        architectural_chunks = await self.retrieve_chunks(
            query=query,
            product_family=product_family,
            component_name=component_name,
            top_k=30,
            rerank=True,
            rerank_top_k=15
        )
        chunks.extend(architectural_chunks)
        
        # Also try functional model for additional context
        try:
            functional_query = f"{product_family} {component_name} functional capabilities responsibilities business processes use cases workflows"
            self._current_model_id = "ModularBanking, FuncTransactGeneric"
            functional_chunks = await self.retrieve_chunks(
                query=functional_query,
                product_family=product_family,
                component_name=component_name,
                top_k=15,
                rerank=True,
                rerank_top_k=10
            )
            # Merge functional chunks (avoid duplicates)
            existing_texts = {c.get("text", "")[:100] for c in chunks}
            for chunk in functional_chunks:
                chunk_text_preview = chunk.get("text", "")[:100]
                if chunk_text_preview not in existing_texts:
                    chunks.append(chunk)
                    existing_texts.add(chunk_text_preview)
        except Exception as e:
            logger.warning(f"Could not retrieve functional chunks: {e}")
        
        # Reset model ID
        self._current_model_id = "ModularBanking, TechnologyOverview"
        
        if not chunks:
            logger.warning(f"No chunks retrieved for {component_name}")
            # Return minimal briefing with gaps
            return {
                "meta": {
                    "product_family": product_family,
                    "component_name": component_name,
                    "version_scope": None,
                    "generated_at": datetime.utcnow().isoformat() + "Z"
                },
                "executive_summary": {
                    "one_liner": f"{component_name} - Information not available",
                    "what_it_does": [],
                    "why_it_matters": [],
                    "where_it_fits": [],
                    "confidence": "low"
                },
                "architecture": {
                    "responsibilities": [],
                    "core_patterns": [],
                    "event_lifecycle": [],
                    "key_components": [],
                    "interactions": []
                },
                "functional_overview": {
                    "capabilities": [],
                    "primary_use_cases": []
                },
                "interfaces": {
                    "apis": [],
                    "events": []
                },
                "deployment_and_ops": {
                    "runtime": [],
                    "dependencies": [],
                    "scaling": [],
                    "resilience": [],
                    "observability": []
                },
                "security_and_compliance": {
                    "controls": [],
                    "data_protection": []
                },
                "limitations_and_gaps": [{
                    "gap": "No documentation found",
                    "impact": "Cannot provide briefing",
                    "reason": "Not found in provided context",
                    "recommended_follow_up_questions": [
                        f"Where can I find documentation for {component_name}?",
                        f"What is the architecture of {component_name}?"
                    ]
                }],
                "sources": []
            }
        
        # Step 3: PASS 1 - Extract facts
        facts = await self.extract_facts(chunks, component_name)
        
        # Step 4: PASS 2 - Synthesize briefing
        briefing = await self.synthesize_briefing(facts, chunks, product_family, component_name)
        
        # Step 5: Validate with Pydantic
        try:
            validated_briefing = BriefingModel(**briefing)
            return validated_briefing.model_dump(by_alias=True, exclude_none=True)
        except ValidationError as e:
            logger.error(f"Briefing validation failed: {e}")
            # Return briefing with validation errors noted
            briefing["validation_errors"] = str(e)
            return briefing

