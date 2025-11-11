"""
Health Check API Endpoints

Provides health, readiness, and liveness endpoints for monitoring.
"""

from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.core.database import get_db, get_db_health
from app.core.config import settings
from app.utils.datetime_utils import utc_now, format_iso8601

router = APIRouter(tags=["Health"])


@router.get("/health", status_code=status.HTTP_200_OK)
async def health_check(db: Session = Depends(get_db)):
    """
    Comprehensive health check endpoint.

    Checks:
    - API availability
    - Database connectivity
    - Storage availability

    Returns:
        Health status with detailed component checks
    """
    health_status = {
        "status": "healthy",
        "timestamp": format_iso8601(utc_now()),
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "checks": {}
    }

    # Check database
    db_health = get_db_health()
    health_status["checks"]["database"] = db_health

    # Check video storage
    from app.services.video_service import video_service
    try:
        storage_exists = video_service.storage_path.exists()
        storage_writable = video_service.storage_path.is_dir()
        storage_status = {
            "status": "healthy" if storage_exists and storage_writable else "unhealthy",
            "path": str(video_service.storage_path),
            "exists": storage_exists,
            "writable": storage_writable
        }
    except Exception as e:
        storage_status = {
            "status": "unhealthy",
            "error": str(e)
        }

    health_status["checks"]["storage"] = storage_status

    # Determine overall status
    all_healthy = all(
        check.get("status") == "healthy"
        for check in health_status["checks"].values()
    )

    if not all_healthy:
        health_status["status"] = "degraded"

    return health_status


@router.get("/ready", status_code=status.HTTP_200_OK)
async def readiness_check(db: Session = Depends(get_db)):
    """
    Kubernetes readiness probe endpoint.

    Checks if the application is ready to receive traffic.

    Returns:
        Ready status
    """
    # Check database connection
    from app.core.database import check_db_connection

    if not check_db_connection():
        return {
            "ready": False,
            "reason": "Database connection failed"
        }

    return {
        "ready": True,
        "timestamp": format_iso8601(utc_now())
    }


@router.get("/live", status_code=status.HTTP_200_OK)
async def liveness_check():
    """
    Kubernetes liveness probe endpoint.

    Simple check to verify the application is running.

    Returns:
        Live status
    """
    return {
        "alive": True,
        "timestamp": format_iso8601(utc_now())
    }


@router.get("/metrics", status_code=status.HTTP_200_OK)
async def metrics():
    """
    Basic metrics endpoint.

    In production, this could expose Prometheus metrics.

    Returns:
        Application metrics
    """
    from app.core.database import engine

    # Get database pool metrics
    pool = engine.pool
    pool_metrics = {
        "size": pool.size(),
        "checked_in": pool.checkedin(),
        "checked_out": pool.checkedout(),
        "overflow": pool.overflow(),
        "total_connections": pool.size() + pool.overflow()
    }

    return {
        "timestamp": format_iso8601(utc_now()),
        "version": settings.APP_VERSION,
        "environment": settings.ENVIRONMENT,
        "metrics": {
            "database_pool": pool_metrics
        }
    }
