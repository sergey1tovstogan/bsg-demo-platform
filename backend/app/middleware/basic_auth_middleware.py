"""
Basic HTTP Authentication Middleware

Provides simple HTTP Basic Authentication for the platform.
"""
import base64
from fastapi import Request, HTTPException, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.responses import Response

from app.core.logging import get_logger

logger = get_logger(__name__)

# Hardcoded credentials as per requirement
BASIC_AUTH_USERNAME = "bsg"
BASIC_AUTH_PASSWORD = "bsg-platform-123"


class BasicAuthMiddleware(BaseHTTPMiddleware):
    """
    Basic HTTP Authentication middleware.
    
    Protects all routes with HTTP Basic Authentication.
    Excludes health check endpoints to allow monitoring.
    """
    
    # Excluded paths that don't require authentication
    EXCLUDED_PATHS = [
        # Allow API access (frontend uses JWT-based auth; basic auth is for direct/manual access)
        "/api/v1",
        "/api/v1/health",
        "/api/v1/ready",
        "/api/v1/live",
        "/docs",
        "/redoc",
        "/openapi.json",
        "/api/v1/openapi.json",
        "/favicon.ico",
    ]
    
    async def dispatch(self, request: Request, call_next):
        # Check if path is excluded
        if any(request.url.path.startswith(path) for path in self.EXCLUDED_PATHS):
            return await call_next(request)
        
        # Extract Authorization header
        authorization = request.headers.get("Authorization", "")
        
        if not authorization.startswith("Basic "):
            return self._unauthorized_response()
        
        # Decode Basic Auth credentials
        try:
            encoded = authorization.replace("Basic ", "")
            decoded = base64.b64decode(encoded).decode("utf-8")
            username, password = decoded.split(":", 1)
        except Exception as e:
            logger.warning(f"Failed to decode Basic Auth credentials: {e}")
            return self._unauthorized_response()
        
        # Validate credentials
        if username == BASIC_AUTH_USERNAME and password == BASIC_AUTH_PASSWORD:
            logger.debug(f"Basic Auth successful for user: {username}")
            return await call_next(request)
        else:
            logger.warning(f"Basic Auth failed for user: {username}")
            return self._unauthorized_response()
    
    def _unauthorized_response(self) -> Response:
        """Return 401 Unauthorized with WWW-Authenticate header."""
        return Response(
            content="Unauthorized",
            status_code=status.HTTP_401_UNAUTHORIZED,
            headers={"WWW-Authenticate": "Basic realm=\"BSG Demo Platform\""}
        )
