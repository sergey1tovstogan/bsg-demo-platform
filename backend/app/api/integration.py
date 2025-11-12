"""
Integration API Endpoints

Provides integration-related endpoints including API key management and proxy.
"""

from fastapi import APIRouter, Depends, HTTPException, Request
from app.core.config import Settings, get_settings
from app.core.logging import get_logger
from typing import Dict, Any
import httpx

router = APIRouter(prefix="/integration", tags=["integration"])
logger = get_logger(__name__)


@router.get("/config")
async def get_integration_config(
    settings: Settings = Depends(get_settings)
) -> Dict[str, str]:
    """
    Get integration configuration including API keys.

    Returns:
        Integration configuration with API keys
    """
    return {
        "temenos_api_key": settings.TEMENOS_DEV_PORTAL_APIKEY or ""
    }


@router.api_route("/proxy", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_api_request(
    request: Request,
    url: str,
    settings: Settings = Depends(get_settings)
) -> Dict[str, Any]:
    """
    Proxy requests to external APIs to bypass CORS restrictions.

    Args:
        request: FastAPI request object
        url: Target URL to proxy to
        settings: Application settings

    Returns:
        Response from the external API
    """
    try:
        # Get request body if present
        body = None
        if request.method in ["POST", "PUT", "PATCH"]:
            body = await request.body()

        # Prepare headers
        headers = {
            "Accept": "application/json",
            "Content-Type": "application/json",
        }

        # Add API key if available
        if settings.TEMENOS_DEV_PORTAL_APIKEY:
            headers["apikey"] = settings.TEMENOS_DEV_PORTAL_APIKEY

        logger.info(f"Proxying {request.method} request to {url}")

        # Make the external request with SSL verification disabled for development
        # Note: In production, you should use proper SSL certificates
        async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
            response = await client.request(
                method=request.method,
                url=url,
                headers=headers,
                content=body
            )

        # Try to parse as JSON, fallback to text
        try:
            data = response.json()
        except:
            data = {"text": response.text}

        return {
            "success": response.is_success,
            "status": response.status_code,
            "data": data,
            "headers": dict(response.headers)
        }

    except httpx.TimeoutException:
        logger.error(f"Timeout when proxying to {url}")
        raise HTTPException(status_code=504, detail="Gateway timeout")
    except Exception as e:
        logger.error(f"Error proxying request to {url}: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Bad gateway: {str(e)}")
