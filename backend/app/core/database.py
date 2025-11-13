"""
Database Service

Provides MongoDB connection pooling, session management,
and common database utilities using Motor (async MongoDB driver).
"""

from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import logging

from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Global MongoDB client
_client: Optional[AsyncIOMotorClient] = None
_database: Optional[AsyncIOMotorDatabase] = None


def get_client() -> AsyncIOMotorClient:
    """Get MongoDB client instance."""
    global _client
    if _client is None:
        raise RuntimeError("Database client not initialized. Call init_db() first.")
    return _client


def _get_database_sync() -> AsyncIOMotorDatabase:
    """Get MongoDB database instance (synchronous helper)."""
    global _database
    if _database is None:
        raise RuntimeError("Database not initialized. Call init_db() first.")
    return _database


async def init_db() -> AsyncIOMotorDatabase:
    """
    Initialize MongoDB connection and return database instance.
    
    Returns:
        AsyncIOMotorDatabase instance
    """
    global _client, _database
    
    if _database is not None:
        return _database
    
    try:
        logger.info(f"Connecting to MongoDB: {settings.DATABASE_URL.split('@')[-1] if '@' in settings.DATABASE_URL else 'localhost'}")
        
        # Create MongoDB client
        _client = AsyncIOMotorClient(
            settings.DATABASE_URL,
            maxPoolSize=settings.DB_MAX_POOL_SIZE,
            minPoolSize=settings.DB_MIN_POOL_SIZE,
            serverSelectionTimeoutMS=settings.DB_CONNECT_TIMEOUT * 1000,
            connectTimeoutMS=settings.DB_CONNECT_TIMEOUT * 1000,
            socketTimeoutMS=settings.DB_CONNECT_TIMEOUT * 1000,
        )
        
        # Test connection
        await _client.admin.command('ping')
        
        # Get database
        _database = _client[settings.DATABASE_NAME]
        
        logger.info(f"Connected to MongoDB database: {settings.DATABASE_NAME}")
        return _database
        
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        logger.error(f"Failed to connect to MongoDB: {e}")
        raise
    except Exception as e:
        logger.error(f"Unexpected error connecting to MongoDB: {e}")
        raise


async def close_db():
    """Close MongoDB connection."""
    global _client, _database
    
    if _client:
        _client.close()
        _client = None
        _database = None
        logger.info("MongoDB connection closed")


async def get_db_health() -> dict:
    """
    Get database health status.
    
    Returns:
        Dictionary with health status information
    """
    try:
        global _database, _client
        if _database is None or _client is None:
            return {
                "status": "unhealthy",
                "database": settings.DATABASE_NAME,
                "error": "Database not initialized",
                "connected": False
            }
        
        # Ping the database
        await _client.admin.command('ping')
        
        # Get server status
        server_info = await _client.server_info()
        
        return {
            "status": "healthy",
            "database": settings.DATABASE_NAME,
            "server_version": server_info.get("version", "unknown"),
            "connected": True
        }
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        return {
            "status": "unhealthy",
            "database": settings.DATABASE_NAME,
            "error": str(e),
            "connected": False
        }


# Dependency for FastAPI
async def get_database() -> AsyncIOMotorDatabase:
    """
    FastAPI dependency to get database instance.
    
    Returns:
        AsyncIOMotorDatabase instance
    """
    global _database
    if _database is None:
        _database = await init_db()
    return _database
