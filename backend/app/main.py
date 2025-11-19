"""
BSG Demo Platform - Backend Application

Main FastAPI application with middleware, routing, and configuration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os

from app.core.config import settings
from app.core.logging import setup_logging, get_logger
from app.core.database import init_db, close_db
from app.middleware.error_handler import register_error_handlers
from app.middleware.request_middleware import RequestLoggingMiddleware, SecurityHeadersMiddleware
from app.middleware.rate_limiter import RateLimitMiddleware
from app.api import health, auth, database, grafana_proxy, grafana_auth, components, security, integration, deployment, chatbot, cache

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
    try:
        await init_db()
        logger.info(f"Database: {settings.DATABASE_NAME}")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        raise

    # Log configuration
    logger.info(f"CORS origins: {settings.CORS_ORIGINS}")
    logger.info(f"Rate limiting: {'enabled' if settings.RATE_LIMIT_ENABLED else 'disabled'}")

    yield

    # Shutdown
    logger.info("Shutting down application")
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

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=settings.CORS_CREDENTIALS,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
)

# Add custom middleware (order matters - first added is outermost)
app.add_middleware(SecurityHeadersMiddleware)
app.add_middleware(RateLimitMiddleware, enabled=settings.RATE_LIMIT_ENABLED)
app.add_middleware(RequestLoggingMiddleware)

# Register error handlers
register_error_handlers(app)

# Include routers
app.include_router(health.router, prefix=settings.API_V1_PREFIX)
app.include_router(auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(database.router, prefix=settings.API_V1_PREFIX)
app.include_router(components.router, prefix=settings.API_V1_PREFIX)
app.include_router(integration.router, prefix=settings.API_V1_PREFIX)
app.include_router(grafana_proxy.router, prefix=settings.API_V1_PREFIX)
app.include_router(grafana_auth.router, prefix=settings.API_V1_PREFIX)
app.include_router(security.router, prefix=settings.API_V1_PREFIX)
app.include_router(deployment.router, prefix=settings.API_V1_PREFIX)
app.include_router(chatbot.router, prefix=settings.API_V1_PREFIX)
app.include_router(cache.router, prefix=settings.API_V1_PREFIX)

# Serve static files (frontend) if directory exists
static_dir = os.path.join(os.path.dirname(__file__), "static")
if os.path.exists(static_dir) and os.path.isdir(static_dir):
    app.mount("/static", StaticFiles(directory=static_dir), name="static")
    
    # Serve index.html for all non-API routes (SPA routing)
    @app.get("/{full_path:path}")
    async def serve_spa(full_path: str):
        """Serve frontend SPA or API routes."""
        # Don't interfere with API routes
        if full_path.startswith("api/") or full_path.startswith("docs") or full_path.startswith("redoc") or full_path.startswith("openapi.json"):
            return {"detail": "Not Found"}
        
        # Serve index.html for frontend routes
        index_path = os.path.join(static_dir, "index.html")
        if os.path.exists(index_path):
            return FileResponse(index_path)
        return {"detail": "Frontend not found"}

# Root endpoint (only if static files not mounted)
if not os.path.exists(static_dir):
    @app.get("/")
    async def root():
        """Root endpoint with API information."""
        return {
            "name": settings.APP_NAME,
            "version": settings.APP_VERSION,
            "environment": settings.ENVIRONMENT,
            "api_version": "v1",
            "docs": f"{settings.API_V1_PREFIX}/docs" if not settings.is_production else None,
            "health": f"{settings.API_V1_PREFIX}/health"
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
