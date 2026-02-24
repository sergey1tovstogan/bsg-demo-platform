"""
RAG Adapter Factory

Factory for creating RAG adapter instances based on configuration.
"""

from typing import Optional
from app.adapters.rag.base import RAGAdapter
from app.adapters.rag.temenos_adapter import TemenosRAGAdapter
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Global adapter instance
_rag_adapter: Optional[RAGAdapter] = None


def get_rag_adapter() -> RAGAdapter:
    """
    Get RAG adapter instance (singleton).
    
    Returns:
        RAGAdapter instance based on configuration
    """
    global _rag_adapter
    
    if _rag_adapter is None:
        # Determine adapter type from configuration
        rag_type = getattr(settings, 'RAG_TYPE', 'temenos').lower()
        
        if rag_type == 'temenos':
            _rag_adapter = TemenosRAGAdapter()
            logger.info("Using Temenos RAG adapter")
        else:
            raise ValueError(f"Unsupported RAG type: {rag_type}")
    
    return _rag_adapter


def update_rag_token(new_token: str) -> bool:
    """
    Update the JWT token in the RAG adapter instance.
    
    Args:
        new_token: New JWT token to use
        
    Returns:
        True if successful, False otherwise
    """
    global _rag_adapter
    
    try:
        if _rag_adapter is None:
            # Initialize adapter if it doesn't exist
            _rag_adapter = get_rag_adapter()
        
        # Update token in adapter if it has jwt_token attribute
        if hasattr(_rag_adapter, 'jwt_token'):
            _rag_adapter.jwt_token = new_token
            logger.info("RAG JWT token updated successfully")
            return True
        else:
            logger.warning("RAG adapter does not have jwt_token attribute")
            return False
    except Exception as e:
        logger.error(f"Failed to update RAG token: {e}", exc_info=True)
        return False


def reset_rag_adapter():
    """
    Reset the RAG adapter instance (force re-initialization on next get_rag_adapter call).
    """
    global _rag_adapter
    _rag_adapter = None
    logger.info("RAG adapter reset - will be re-initialized on next use")
