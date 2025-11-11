"""
Database Service

Provides database connection pooling, session management,
and common database utilities using SQLAlchemy.
"""

from typing import Generator
from contextlib import contextmanager
import time

from sqlalchemy import create_engine, event, text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import Pool

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Create database engine with connection pooling
engine = create_engine(
    settings.DATABASE_URL,
    pool_size=settings.DB_POOL_SIZE,
    max_overflow=settings.DB_MAX_OVERFLOW,
    pool_timeout=settings.DB_POOL_TIMEOUT,
    pool_pre_ping=True,  # Enable connection health checks
    echo=settings.DB_ECHO,
    future=True,  # Use SQLAlchemy 2.0 style
)

# Create session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    future=True,
)

# Base class for models
Base = declarative_base()


# Event listeners for connection pooling metrics and logging
@event.listens_for(Pool, "connect")
def receive_connect(dbapi_conn, connection_record):
    """Log database connections."""
    logger.debug("Database connection established")


@event.listens_for(Pool, "checkout")
def receive_checkout(dbapi_conn, connection_record, connection_proxy):
    """Log connection checkout from pool."""
    logger.debug("Database connection checked out from pool")


@event.listens_for(Pool, "checkin")
def receive_checkin(dbapi_conn, connection_record):
    """Log connection checkin to pool."""
    logger.debug("Database connection returned to pool")


# Slow query logging
@event.listens_for(engine, "before_cursor_execute")
def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Store query start time."""
    conn.info.setdefault("query_start_time", []).append(time.time())


@event.listens_for(engine, "after_cursor_execute")
def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
    """Log slow queries."""
    total_time = time.time() - conn.info["query_start_time"].pop(-1)
    if total_time > 1.0:  # Log queries taking more than 1 second
        logger.warning(
            f"Slow query detected: {total_time:.2f}s",
            extra={
                "query": statement,
                "duration": total_time,
            }
        )


def get_db() -> Generator[Session, None, None]:
    """
    Dependency for FastAPI to get database session.

    Yields:
        Database session

    Example:
        @app.get("/items")
        def get_items(db: Session = Depends(get_db)):
            return db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@contextmanager
def get_db_context():
    """
    Context manager for database session.

    Yields:
        Database session

    Example:
        with get_db_context() as db:
            items = db.query(Item).all()
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """
    Initialize database (create tables).
    This should only be used for development/testing.
    In production, use Alembic migrations.
    """
    logger.info("Initializing database tables")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")


def check_db_connection() -> bool:
    """
    Check database connectivity.

    Returns:
        True if connection successful, False otherwise
    """
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
        logger.info("Database connection check passed")
        return True
    except Exception as e:
        logger.error(f"Database connection check failed: {e}")
        return False


def get_db_health() -> dict:
    """
    Get database health information.

    Returns:
        Dictionary with health status and metrics
    """
    try:
        start_time = time.time()
        with engine.connect() as conn:
            result = conn.execute(text("SELECT version()"))
            db_version = result.scalar()
        response_time = time.time() - start_time

        # Get pool statistics
        pool = engine.pool
        pool_status = {
            "size": pool.size(),
            "checked_in": pool.checkedin(),
            "checked_out": pool.checkedout(),
            "overflow": pool.overflow(),
            "total": pool.size() + pool.overflow(),
        }

        return {
            "status": "healthy",
            "response_time": f"{response_time:.3f}s",
            "version": db_version,
            "pool": pool_status,
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "error": str(e),
        }


class DatabaseHealthCheck:
    """Database health check for monitoring."""

    @staticmethod
    def is_healthy() -> bool:
        """Check if database is healthy."""
        return check_db_connection()

    @staticmethod
    def get_details() -> dict:
        """Get detailed health information."""
        return get_db_health()


# Transaction utilities
@contextmanager
def db_transaction(db: Session):
    """
    Context manager for database transactions with automatic rollback.

    Args:
        db: Database session

    Yields:
        Database session

    Example:
        with db_transaction(db) as session:
            session.add(new_item)
            # Automatically commits on success, rolls back on exception
    """
    try:
        yield db
        db.commit()
        logger.debug("Transaction committed successfully")
    except Exception as e:
        db.rollback()
        logger.error(f"Transaction rolled back due to error: {e}")
        raise


# Query helpers
def paginate_query(query, page: int = 1, page_size: int = 20):
    """
    Paginate a SQLAlchemy query.

    Args:
        query: SQLAlchemy query object
        page: Page number (1-indexed)
        page_size: Items per page

    Returns:
        Tuple of (items, total_count, total_pages)
    """
    if page < 1:
        page = 1

    total_count = query.count()
    total_pages = (total_count + page_size - 1) // page_size

    items = query.offset((page - 1) * page_size).limit(page_size).all()

    return items, total_count, total_pages


def create_pagination_metadata(
    page: int,
    page_size: int,
    total_items: int,
    total_pages: int
) -> dict:
    """
    Create pagination metadata for API responses.

    Args:
        page: Current page number
        page_size: Items per page
        total_items: Total number of items
        total_pages: Total number of pages

    Returns:
        Pagination metadata dictionary
    """
    return {
        "page": page,
        "page_size": page_size,
        "total_items": total_items,
        "total_pages": total_pages,
        "has_next": page < total_pages,
        "has_previous": page > 1,
    }
