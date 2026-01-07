"""
RAG Response Deduplication and Structuring Service

Removes redundancy from RAG responses and structures them into clear, non-repetitive sections.
Each concept is explained ONCE in ONE place, referenced elsewhere by implication.
"""

import re
from typing import Dict, List, Set, Tuple, Any
from collections import defaultdict
from app.core.logging import get_logger

logger = get_logger(__name__)


class RAGDeduplicationService:
    """Service for deduplicating and structuring RAG responses."""
    
    # Core concepts that should appear only once
    CORE_CONCEPTS = {
        'replay': ['replay', 'replay mechanism', 'replay capability', 'replay service', 'event replay'],
        'immutability': ['immutable', 'immutability', 'immutable storage', 'tamper-proof', 'audit trail'],
        'ordering': ['ordering', 'event ordering', 'sequence', 'order', 'ordered'],
        'uniqueness': ['uniqueness', 'unique', 'idempotent', 'idempotency'],
        'outbox': ['outbox', 'transactional outbox', 'outbox pattern'],
        'at-least-once': ['at-least-once', 'at least once', 'guaranteed delivery', 'delivery guarantee'],
        'schema': ['schema', 'schema validation', 'event schema', 'event types'],
    }
    
    def __init__(self):
        """Initialize the deduplication service."""
        self.seen_concepts: Set[str] = set()
        self.concept_ownership: Dict[str, str] = {}  # concept -> section where it's explained
    
    def normalize_text(self, text: str) -> str:
        """Normalize text for comparison."""
        # Lowercase, remove extra whitespace, remove punctuation
        text = text.lower().strip()
        text = re.sub(r'[^\w\s]', '', text)
        text = re.sub(r'\s+', ' ', text)
        return text
    
    def extract_concept_keywords(self, text: str) -> Set[str]:
        """Extract concept keywords from text."""
        normalized = self.normalize_text(text)
        found_concepts = set()
        
        for concept, keywords in self.CORE_CONCEPTS.items():
            for keyword in keywords:
                if keyword in normalized:
                    found_concepts.add(concept)
                    break
        
        return found_concepts
    
    def is_similar(self, text1: str, text2: str, threshold: float = 0.7) -> bool:
        """Check if two texts are similar (concept overlap)."""
        norm1 = self.normalize_text(text1)
        norm2 = self.normalize_text(text2)
        
        # Exact match
        if norm1 == norm2:
            return True
        
        # Concept overlap
        concepts1 = self.extract_concept_keywords(text1)
        concepts2 = self.extract_concept_keywords(text2)
        
        if concepts1 and concepts2:
            overlap = len(concepts1.intersection(concepts2))
            union = len(concepts1.union(concepts2))
            if union > 0:
                similarity = overlap / union
                if similarity >= threshold:
                    return True
        
        # Word overlap (for non-concept text)
        words1 = set(norm1.split())
        words2 = set(norm2.split())
        
        if not words1 or not words2:
            return False
        
        intersection = words1.intersection(words2)
        union = words1.union(words2)
        
        similarity = len(intersection) / len(union) if union else 0
        return similarity >= threshold
    
    def deduplicate_sentences(self, sentences: List[str]) -> List[str]:
        """Remove duplicate or highly similar sentences."""
        deduplicated = []
        seen_normalized = set()
        
        for sentence in sentences:
            normalized = self.normalize_text(sentence)
            
            # Skip if we've seen something very similar
            is_duplicate = False
            for seen in seen_normalized:
                if self.is_similar(normalized, seen):
                    is_duplicate = True
                    break
            
            if not is_duplicate and len(sentence.strip()) > 20:
                deduplicated.append(sentence)
                seen_normalized.add(normalized)
        
        return deduplicated
    
    def structure_architectural_overview(self, text: str) -> Dict[str, Any]:
        """
        Structure architectural overview into clear sections with no redundancy.
        
        Returns:
            Structured dict with: executive_summary, patterns_table, components, deployment
        """
        if not text or text in ["Information not available", "Information not available - timeout", "Information not available - error"]:
            return {
                "executive_summary": "",
                "patterns_table": [],
                "components": [],
                "deployment": []
            }
        
        # Split into paragraphs and sentences
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip() and len(p.strip()) > 20]
        
        # If no paragraphs, try splitting by sentences
        if not paragraphs:
            sentences = re.split(r'[.!?]+', text)
            paragraphs = [s.strip() for s in sentences if len(s.strip()) > 30]
        
        # Extract patterns (guarantees, mechanisms)
        patterns = []
        components = []
        deployment_info = []
        executive_summary_parts = []
        
        # Track which concepts we've already explained
        explained_concepts: Set[str] = set()
        seen_texts: Set[str] = set()
        
        for para in paragraphs:
            # Skip if we've seen very similar text
            para_normalized = self.normalize_text(para)
            if any(self.is_similar(para_normalized, seen, threshold=0.8) for seen in seen_texts):
                continue
            seen_texts.add(para_normalized)
            
            para_lower = para.lower()
            concepts_in_para = self.extract_concept_keywords(para)
            
            # Check if this paragraph explains a core concept
            is_core_concept = bool(concepts_in_para)
            is_already_explained = any(concept in explained_concepts for concept in concepts_in_para)
            
            # Skip if we've already explained this concept (unless it's a different aspect)
            if is_core_concept and is_already_explained:
                # Check if it's adding new information
                if not any(word in para_lower for word in ['also', 'additionally', 'furthermore', 'moreover', 'in addition']):
                    continue
            
            # Mark concepts as explained
            explained_concepts.update(concepts_in_para)
            
            # Categorize paragraph
            if any(word in para_lower for word in ['pattern', 'guarantee', 'ensures', 'mechanism', 'design pattern', 'architectural pattern']):
                # Extract pattern information
                pattern_match = re.search(r'(\w+(?:\s+\w+){0,3})\s+(?:pattern|guarantee|mechanism)', para_lower)
                if pattern_match:
                    pattern_name = pattern_match.group(1).title()
                else:
                    # Try to extract from common patterns
                    if 'outbox' in para_lower:
                        pattern_name = "Transactional Outbox"
                    elif 'replay' in para_lower:
                        pattern_name = "Replay Mechanism"
                    elif 'immutable' in para_lower or 'immutability' in para_lower:
                        pattern_name = "Immutability"
                    elif 'ordering' in para_lower or 'order' in para_lower:
                        pattern_name = "Event Ordering"
                    elif 'uniqueness' in para_lower or 'unique' in para_lower:
                        pattern_name = "Event Uniqueness"
                    else:
                        pattern_name = para[:50].title()
                
                # Extract "what it ensures" and "why it matters"
                what_match = re.search(r'(?:ensures|provides|guarantees|enables)\s+([^.]{10,150})', para_lower)
                why_match = re.search(r'(?:because|for|critical|important|vital|essential|matters|necessary).{0,50}([^.]{10,150})', para_lower)
                
                patterns.append({
                    "pattern": pattern_name,
                    "what_it_ensures": what_match.group(1).strip() if what_match else para[:150],
                    "why_it_matters": why_match.group(1).strip() if why_match else "See pattern description"
                })
            elif any(word in para_lower for word in ['component', 'service', 'module', 'subsystem', 'system']):
                # Extract component information
                component_match = re.search(r'(\w+(?:\s+\w+){0,2})\s+(?:component|service|module|system)', para_lower)
                if component_match:
                    components.append({
                        "name": component_match.group(1).title(),
                        "description": para[:200]
                    })
            elif any(word in para_lower for word in ['deploy', 'runtime', 'kubernetes', 'container', 'scaling', 'aks', 'openshift']):
                deployment_info.append(para[:200])
            else:
                # Executive summary material (first few paragraphs)
                if len(executive_summary_parts) < 3:
                    executive_summary_parts.append(para[:250])
        
        # Build executive summary (one-liner + key points)
        executive_summary = ""
        if executive_summary_parts:
            executive_summary = executive_summary_parts[0]
        
        # Deduplicate patterns
        unique_patterns = []
        seen_pattern_names = set()
        for pattern in patterns:
            pattern_name_lower = pattern["pattern"].lower()
            if pattern_name_lower not in seen_pattern_names:
                unique_patterns.append(pattern)
                seen_pattern_names.add(pattern_name_lower)
        
        return {
            "executive_summary": executive_summary,
            "patterns_table": unique_patterns[:10],  # Limit to top 10
            "components": components[:8],  # Limit to top 8
            "deployment": deployment_info[:5]  # Limit to top 5
        }
    
    def structure_functional_overview(self, text: str, architectural_concepts: Set[str]) -> Dict[str, Any]:
        """
        Structure functional overview, avoiding repetition of architectural concepts.
        
        Args:
            text: Functional overview text
            architectural_concepts: Set of concepts already explained in architecture
        
        Returns:
            Structured dict with: capabilities, use_cases, interfaces
        """
        if not text or text in ["Information not available", "Information not available - timeout"]:
            return {
                "capabilities": [],
                "use_cases": [],
                "interfaces": []
            }
        
        # Split into sentences/paragraphs
        sentences = re.split(r'[.!?]+', text)
        paragraphs = [p.strip() for p in text.split('\n\n') if p.strip()]
        
        capabilities = []
        use_cases = []
        interfaces = []
        
        for para in paragraphs:
            para_lower = para.lower()
            concepts_in_para = self.extract_concept_keywords(para)
            
            # Skip if this paragraph repeats architectural concepts
            if concepts_in_para.intersection(architectural_concepts):
                continue
            
            # Categorize
            if any(word in para_lower for word in ['capability', 'provides', 'enables', 'supports', 'allows']):
                capabilities.append(para[:200])
            elif any(word in para_lower for word in ['use case', 'scenario', 'example', 'workflow', 'process']):
                use_cases.append(para[:200])
            elif any(word in para_lower for word in ['api', 'interface', 'endpoint', 'service', 'exposes']):
                interfaces.append(para[:200])
            else:
                # Default to capabilities
                capabilities.append(para[:200])
        
        # Deduplicate
        capabilities = self.deduplicate_sentences(capabilities)
        use_cases = self.deduplicate_sentences(use_cases)
        interfaces = self.deduplicate_sentences(interfaces)
        
        return {
            "capabilities": capabilities[:10],
            "use_cases": use_cases[:8],
            "interfaces": interfaces[:8]
        }
    
    def process_rag_responses(
        self,
        architectural_text: str,
        functional_text: str
    ) -> Dict[str, Any]:
        """
        Process and structure RAG responses with deduplication.
        
        Args:
            architectural_text: Raw architectural overview from RAG
            functional_text: Raw functional overview from RAG
        
        Returns:
            Structured, deduplicated response
        """
        # Structure architectural overview
        arch_structured = self.structure_architectural_overview(architectural_text)
        
        # Extract concepts from architectural section
        architectural_concepts = set()
        if architectural_text:
            architectural_concepts = self.extract_concept_keywords(architectural_text)
        
        # Structure functional overview (avoiding architectural concepts)
        func_structured = self.structure_functional_overview(functional_text, architectural_concepts)
        
        return {
            "executive_summary": arch_structured["executive_summary"],
            "patterns": arch_structured["patterns_table"],
            "components": arch_structured["components"],
            "deployment": arch_structured["deployment"],
            "capabilities": func_structured["capabilities"],
            "use_cases": func_structured["use_cases"],
            "interfaces": func_structured["interfaces"]
        }

