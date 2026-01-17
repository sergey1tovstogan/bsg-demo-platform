"""
Temenos RAG Adapter Implementation

Temenos-specific implementation of RAGAdapter.
"""

from typing import Optional, Dict, Any
import httpx
import asyncio

from app.adapters.rag.base import RAGAdapter
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class TemenosRAGAdapter(RAGAdapter):
    """Temenos RAG API implementation of RAGAdapter."""
    
    def __init__(self):
        """Initialize Temenos RAG adapter."""
        # Try to get token from settings API first, fallback to config
        self.jwt_token = None
        self.base_url = settings.RAG_API_URL.rstrip('/')
        self.api_base = f"{self.base_url}/api/v1.0"
        
        # Try to load token from database/memory (set via settings API)
        try:
            from app.api.settings import get_rag_jwt_token_value
            import asyncio
            # Try to get token synchronously if possible, otherwise use config fallback
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    # If loop is running, we'll get token on first query
                    self.jwt_token = None
                else:
                    self.jwt_token = loop.run_until_complete(get_rag_jwt_token_value())
            except RuntimeError:
                # No event loop, will get token on first query
                self.jwt_token = None
        except Exception as e:
            logger.warning(f"Could not load RAG JWT token from settings: {e}")
        
        # Fallback to config if not set via settings API
        if not self.jwt_token:
            self.jwt_token = settings.RAG_JWT_TOKEN
        
        # Don't fail initialization if token is not set - it can be set later via settings API
        if not self.jwt_token:
            logger.warning("RAG JWT token not configured. Set it via Settings API or RAG_JWT_TOKEN environment variable.")
        else:
            logger.info(f"Temenos RAG adapter initialized with base URL: {self.api_base}")
    
    async def _ensure_token(self):
        """Ensure JWT token is loaded (loads from settings if needed)."""
        if not self.jwt_token:
            try:
                from app.api.settings import get_rag_jwt_token_value
                token = await get_rag_jwt_token_value()
                if token:
                    self.jwt_token = token
                    logger.info("RAG JWT token loaded from settings")
                elif settings.RAG_JWT_TOKEN:
                    self.jwt_token = settings.RAG_JWT_TOKEN
                    logger.info("RAG JWT token loaded from config")
            except Exception as e:
                logger.warning(f"Could not load RAG JWT token: {e}")
        
        if not self.jwt_token:
            raise ValueError("RAG JWT token is not configured. Please set it via Settings API.")
    
    async def query(
        self,
        question: str,
        region: str = "global",
        rag_model_id: Optional[str] = None,
        context: Optional[str] = None,
        jwt_token: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Query the Temenos RAG API.

        Args:
            question: The question to ask
            region: Region context (default: "global")
            rag_model_id: Model ID to use (optional)
            context: Additional context (optional)
            jwt_token: Custom JWT token to use for this request (optional, uses default if not provided)

        Returns:
            Response dictionary with answer and sources
        """
        # Ensure token is loaded
        await self._ensure_token()
        
        try:
            # Use custom token if provided, otherwise use default
            token = jwt_token if jwt_token else self.jwt_token

            url = f"{self.api_base}/query"
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # RAGmodelId is REQUIRED according to Swagger spec
            # Use default if not provided
            model_id = rag_model_id if rag_model_id else "ModularBanking, TechnologyOverview"
            
            payload = {
                "question": question,
                "region": region,
                "RAGmodelId": model_id  # Required field
            }
            
            if context:
                payload["context"] = context
            
            logger.debug(f"RAG API request payload: question={question[:100]}..., region={region}, RAGmodelId={model_id}")
            
            # Increase timeout significantly for comprehensive RAG queries
            # Use 70 seconds to allow for 60s asyncio.wait_for timeout plus overhead
            async with httpx.AsyncClient(timeout=70.0) as client:
                logger.info(f"Sending RAG query to {url} with timeout 70s")
                logger.debug(f"Query payload: {payload.get('question', '')[:200]}...")
                response = await client.post(url, json=payload, headers=headers)
                response.raise_for_status()
                result = response.json()
                logger.info(f"RAG API response received: status={result.get('status', 'unknown')}, response_length={len(str(result))} chars")
                
                # According to Swagger spec, response structure is:
                # {"status": "success", "data": {"answer": "...", "question": "...", "region": "...", ...}}
                if isinstance(result, dict):
                    # Check if response has error status
                    if result.get("status") == "error":
                        error_msg = result.get("error", "Unknown error from RAG API")
                        logger.error(f"RAG API returned error status: {error_msg}")
                        raise RuntimeError(f"RAG API error: {error_msg}")
                    
                    # If it has 'data' field, return as-is (matches Swagger spec)
                    if "data" in result:
                        logger.debug(f"RAG API response has 'data' field: answer_length={len(result.get('data', {}).get('answer', ''))}")
                        return result
                    # If response structure is different, try to extract answer
                    if "answer" in result:
                        logger.debug("RAG API response has 'answer' at root level, wrapping in 'data'")
                        return {"data": result}
                    # Otherwise wrap entire response in 'data' field for consistency
                    logger.warning(f"RAG API response structure unexpected, wrapping: {list(result.keys())}")
                    return {"data": result}
                # If it's not a dict, wrap it
                logger.warning(f"RAG API returned non-dict response: {type(result)}")
                return {"data": {"answer": str(result)}}
                
        except httpx.TimeoutException:
            logger.error(f"Temenos RAG API timeout for question: {question[:50]}...")
            logger.error(f"  URL: {url}")
            logger.error(f"  Payload: {payload.get('question', '')[:100]}...")
            raise RuntimeError(f"Temenos RAG API timeout: Request took too long")
        except httpx.HTTPStatusError as e:
            error_text = e.response.text[:500] if e.response.text else "No error text"
            logger.error(f"Temenos RAG API HTTP error: {e.response.status_code}")
            logger.error(f"  URL: {url}")
            logger.error(f"  Error response: {error_text}")
            logger.error(f"  Request payload: question={question[:100]}..., RAGmodelId={payload.get('RAGmodelId')}")
            
            # Check for token expiration specifically
            if e.response.status_code == 401:
                try:
                    error_json = e.response.json()
                    error_msg = error_json.get("error", "")
                    if "expired" in error_msg.lower() or "token" in error_msg.lower():
                        logger.error("🔑 RAG JWT token has expired. Please update it via Settings API.")
                        raise RuntimeError(
                            "RAG JWT token has expired. Please update the token via Settings API. "
                            f"Error: {error_msg}"
                        )
                except:
                    pass
            
            # Try to parse error response
            try:
                error_json = e.response.json()
                error_msg = error_json.get("error", f"HTTP {e.response.status_code}")
                raise RuntimeError(f"Temenos RAG API error ({e.response.status_code}): {error_msg}")
            except:
                raise RuntimeError(f"Temenos RAG API error: HTTP {e.response.status_code} - {error_text}")
        except Exception as e:
            logger.error(f"Temenos RAG API error: {e}", exc_info=True)
            logger.error(f"  URL: {url}")
            logger.error(f"  Question: {question[:100]}...")
            raise RuntimeError(f"Temenos RAG API error: {str(e)}")
    
    async def health_check(self) -> Dict[str, Any]:
        """Check Temenos RAG API health status."""
        try:
            # Ensure token is loaded
            await self._ensure_token()
            
            # Try a simple query to check if API is accessible
            url = f"{self.api_base}/query"
            headers = {
                "Authorization": f"Bearer {self.jwt_token}",
                "Content-Type": "application/json"
            }
            payload = {
                "question": "test",
                "region": "global",
                "RAGmodelId": "ModularBanking, TechnologyOverview"
            }
            
            async with httpx.AsyncClient(timeout=5.0) as client:
                response = await client.post(url, json=payload, headers=headers)
                
                if response.status_code == 200:
                    return {
                        "status": "healthy",
                        "api_url": self.api_base,
                        "connected": True
                    }
                else:
                    return {
                        "status": "unhealthy",
                        "api_url": self.api_base,
                        "error": f"HTTP {response.status_code}",
                        "connected": False
                    }
        except Exception as e:
            logger.error(f"Temenos RAG API health check failed: {e}")
            return {
                "status": "unhealthy",
                "api_url": self.api_base,
                "error": str(e),
                "connected": False
            }

