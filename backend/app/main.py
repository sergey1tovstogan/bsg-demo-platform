"""
BSG Demo Platform - Backend Application

Main FastAPI application with middleware, routing, and configuration.
"""

from fastapi import FastAPI, Request, Header, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os
import json

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.core.database import init_db, close_db, get_database
from app.middleware.error_handler import register_error_handlers
from app.middleware.request_middleware import RequestLoggingMiddleware, SecurityHeadersMiddleware
from app.middleware.rate_limiter import RateLimitMiddleware
from app.middleware.basic_auth_middleware import BasicAuthMiddleware
from app.api import health, auth, auth_v2, users, auth_cards, database, grafana_proxy, grafana_auth, components, security, integration, deployment, chatbot, cache, events, data_architecture, payments
from app.api import settings as settings_api
from app.adapters.eventhub import get_eventhub_adapter
from motor.motor_asyncio import AsyncIOMotorDatabase

# Setup logging
setup_logging()
logger = get_logger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """
    Application lifespan events.

    Handles startup and shutdown logic.
    """
    # Startup
    logger.info(f"Starting {settings.APP_NAME} v{settings.APP_VERSION}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")
    logger.info(f"Debug mode: {settings.DEBUG}")

    # Initialize MongoDB connection
    # Don't fail startup if DB is temporarily unavailable - health check will report it
    try:
        await init_db()
        logger.info(f"Database: {settings.DATABASE_NAME}")
        
        # Warm up cache: Check for cached component info entries
        try:
            from datetime import datetime, timezone
            db = await get_database()
            
            # Count cached component info entries (non-expired)
            now = datetime.now(timezone.utc)
            component_info_count = await db.cache.count_documents({
                "cache_key": {"$regex": "^component_info:"},
                "$or": [
                    {"expires_at": {"$exists": False}},
                    {"expires_at": {"$gt": now}}
                ]
            })
            
            if component_info_count > 0:
                logger.info(f"✓ Found {component_info_count} cached component info entries in persistent storage")
                logger.info("  Component info will be loaded from cache on-demand (no RAG API calls needed)")
            else:
                logger.info("  No cached component info found - will query RAG API when needed")
        except Exception as e:
            logger.warning(f"Failed to check cache status: {e}")
            # Don't fail startup if cache check fails
        
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        logger.warning("Application will start but database-dependent features may not work")
        # Don't raise - allow app to start for health checks

    # Log configuration
    logger.info(f"CORS origins: {settings.CORS_ORIGINS}")
    logger.info(f"Rate limiting: {'enabled' if settings.RATE_LIMIT_ENABLED else 'disabled'}")

    # Start Event Hub adapter
    try:
        eventhub_adapter = get_eventhub_adapter()
        await eventhub_adapter.start()
        logger.info("Event Hub adapter started successfully")
    except Exception as e:
        logger.error(f"Failed to start Event Hub adapter: {e}")
        logger.warning("Application will start but Event Hub features may not work")

    yield

    # Shutdown

    # Shutdown
    logger.info("Shutting down application")

    # Stop Event Hub adapter
    try:
        eventhub_adapter = get_eventhub_adapter()
        await eventhub_adapter.stop()
        logger.info("Event Hub adapter stopped successfully")
    except Exception as e:
        logger.error(f"Error stopping Event Hub adapter: {e}")

    # Close database connections
    await close_db()
    logger.info("Database connections closed")


# Create FastAPI application
app = FastAPI(
    title=settings.APP_NAME,
    version=settings.APP_VERSION,
    description="Backend API for BSG Demo Platform - showcasing Temenos products and capabilities",
    docs_url="/docs" if not settings.is_production else None,  # Disable in production
    redoc_url="/redoc" if not settings.is_production else None,
    lifespan=lifespan,
    openapi_url=f"{settings.API_V1_PREFIX}/openapi.json"
)

# Add Basic Auth middleware FIRST (outermost) to protect all routes
# This must be before CORS to protect the entire application
app.add_middleware(BasicAuthMiddleware)

# Configure CORS - MUST be after Basic Auth but before other middleware
# Use allow_origin_regex to allow all Azure Static Web Apps and App Service domains
# This is more flexible than hardcoding specific origins
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.azurestaticapps\.net|https://.*\.azurewebsites\.net|http://localhost:\d+|http://127\.0\.0\.1:\d+",
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=["*"],
    expose_headers=["*"],
    max_age=3600,  # Cache preflight requests for 1 hour
)

# Add custom middleware (order matters - first added is outermost)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, enabled=settings.RATE_LIMIT_ENABLED)
app.add_middleware(RequestLoggingMiddleware)

# Register error handlers
register_error_handlers(app)

# Include routers (settings.API_V1_PREFIX already has leading slash)
app.include_router(health.router, prefix=settings.API_V1_PREFIX)
# app.include_router(auth.router, prefix=settings.API_V1_PREFIX)  # Old auth - disabled for new RBAC system
app.include_router(auth_v2.router)  # New RBAC authentication (prefix already in router)
app.include_router(users.router)  # User management (admin only, prefix already in router)
app.include_router(auth_cards.router, prefix=settings.API_V1_PREFIX)  # Card template authentication
app.include_router(database.router, prefix=settings.API_V1_PREFIX)
app.include_router(components.router, prefix=settings.API_V1_PREFIX)

# Import for proxy workaround
import httpx
from typing import Dict, Any, Optional
from fastapi import HTTPException, APIRouter

# Create a dedicated router for proxy endpoint
proxy_router = APIRouter()

async def _handle_proxy(request: Request, url: str, user_id: Optional[str], db: AsyncIOMotorDatabase, body: Optional[bytes] = None) -> Dict[str, Any]:
    """Handle proxy requests for all HTTP methods."""
    try:
        # If body wasn't provided, read it from request (for GET/DELETE, body will be None)
        if body is None and request.method in ["POST", "PUT", "PATCH"]:
            body = await request.body()

        headers = {"Accept": "application/json", "Content-Type": "application/json"}

        if not user_id:
            user_id = "demo_user"
        api_key_doc = await db.integration.find_one({"user_id": user_id})
        if api_key_doc and api_key_doc.get("api_key"):
            headers["apikey"] = api_key_doc.get("api_key")
        elif settings.TEMENOS_DEV_PORTAL_APIKEY:
            headers["apikey"] = settings.TEMENOS_DEV_PORTAL_APIKEY

        logger.info(f"Proxying {request.method} request to {url}")

        async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
            response = await client.request(method=request.method, url=url, headers=headers, content=body)

        try:
            data = response.json()
        except:
            data = {"text": response.text}

        return {"success": response.is_success, "status": response.status_code, "data": data, "headers": dict(response.headers)}
    except Exception as e:
        logger.error(f"Proxy error: {str(e)}")
        raise HTTPException(status_code=502, detail=f"Bad gateway: {str(e)}")

# Register proxy endpoint with all HTTP methods on dedicated router
@proxy_router.api_route("/proxy", methods=["GET", "POST", "PUT", "DELETE", "PATCH"])
async def proxy_all_methods(
    request: Request,
    url: Optional[str] = None,
    user_id: Optional[str] = Header(None, alias="X-User-Id"),
    db: AsyncIOMotorDatabase = Depends(get_database)
) -> Dict[str, Any]:
    """
    Proxy requests to external APIs with all HTTP methods.
    
    The target URL can be provided either:
    - As a query parameter: ?url=https://example.com/api
    - In the request body (for POST/PUT/PATCH): {"url": "https://example.com/api", "body": {...}}
    
    This dual approach works around Azure Static Web Apps limitations with POST requests and query parameters.
    """
    body_content = None
    
    # Try to get URL from query parameter first
    if not url:
        # For POST/PUT/PATCH, also try to get URL from request body
        if request.method in ["POST", "PUT", "PATCH"]:
            try:
                body_data = await request.json()
                if isinstance(body_data, dict) and "url" in body_data:
                    url = body_data.get("url")
                    # Remove url from body_data so it doesn't get sent to the target API
                    body_data.pop("url", None)
                    # Convert back to bytes for forwarding
                    body_content = json.dumps(body_data).encode('utf-8')
            except:
                # If body is not JSON or doesn't have url, continue with None
                # In this case, we'll read the body again in _handle_proxy
                pass
    
    if not url:
        raise HTTPException(
            status_code=400,
            detail="URL parameter is required. Provide it as query parameter (?url=...) or in request body ({\"url\": \"...\"})"
        )
    
    return await _handle_proxy(request, url, user_id, db, body_content)

# DIAGNOSTIC: Simple test POST endpoint
@app.post("/test-post")
async def test_post_endpoint():
    return {"message": "POST works!", "test": True}

# Include integration router (includes api-key endpoints)
app.include_router(integration.router, prefix=settings.API_V1_PREFIX)

# Include proxy router with full path
app.include_router(proxy_router, prefix=f"{settings.API_V1_PREFIX}/integration", tags=["integration"])

# Now include remaining routers
app.include_router(grafana_proxy.router, prefix=settings.API_V1_PREFIX)
app.include_router(grafana_auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(security.router, prefix=settings.API_V1_PREFIX)
app.include_router(deployment.router, prefix=settings.API_V1_PREFIX)
app.include_router(chatbot.router, prefix=settings.API_V1_PREFIX)
app.include_router(cache.router, prefix=settings.API_V1_PREFIX)
app.include_router(settings_api.router, prefix=settings.API_V1_PREFIX)
app.include_router(payments.router, prefix=settings.API_V1_PREFIX)

# Component-specific API routers
app.include_router(data_architecture.router, prefix=settings.API_V1_PREFIX)

# DEPRECATED: Legacy events router - kept for backward compatibility
# Use /api/v1/components/data-architecture/events instead
app.include_router(events.router, prefix=settings.API_V1_PREFIX)

# Serve static files (frontend) if directory exists
static_dir = os.path.join(os.path.dirname(__file__), "static")
index_path = os.path.join(static_dir, "index.html") if static_dir else None

if os.path.exists(static_dir) and os.path.isdir(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    logger.info(f"Static files mounted at /static from {static_dir}")
    
    # Root endpoint - must be defined BEFORE catch-all route
    @app.get("/")
    async def root():
        """Root endpoint - serves frontend index.html."""
        if index_path and os.path.exists(index_path):
            logger.info(f"Serving frontend index.html from {index_path}")
            return FileResponse(index_path)
        logger.warning(f"index.html not found at {index_path}")
        return {"detail": "Frontend not found", "static_dir": str(static_dir), "exists": os.path.exists(static_dir)}
    
    # Serve index.html for all non-API routes (SPA routing)
    # NOTE: This catch-all should NOT interfere with API routes
    # API routes are registered with routers and should be matched first
    # We only reach here for paths that don't match any registered routes
    # For now, commenting out to avoid interfering with API routes
    # The frontend development server (Vite) will handle SPA routing in dev mode

    # @app.get("/{full_path:path}")
    # async def serve_spa(full_path: str):
    #     """Serve frontend SPA for non-API routes."""
    #     # Serve index.html for frontend routes (SPA routing)
    #     if index_path and os.path.exists(index_path):
    #         return FileResponse(index_path)
    #     logger.warning(f"index.html not found at {index_path}, static_dir exists: {os.path.exists(static_dir)}")
    #     return {"detail": "Frontend not found", "static_dir": str(static_dir), "exists": os.path.exists(static_dir)}
else:
    # Root endpoint (only if static files not mounted)
    @app.get("/")
    async def root():
        """Root endpoint with API information."""
        logger.info(f"Root endpoint accessed - static directory exists: {os.path.exists(static_dir) if static_dir else False}")
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "api_version": "v1",
            "docs": f"/{settings.API_V1_PREFIX}/docs" if not settings.is_production else None,
            "health": f"/{settings.API_V1_PREFIX}/health",
            "live": f"/{settings.API_V1_PREFIX}/live",
            "frontend_available": os.path.exists(static_dir) if static_dir else False,
            "static_dir": str(static_dir) if static_dir else None,
            "message": "BSG Demo Platform API is running. Use /api/v1/health for health check."
        }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host=settings.HOST,
        port=settings.PORT,
        reload=settings.DEBUG,
        log_level=settings.LOG_LEVEL.lower()
    )
