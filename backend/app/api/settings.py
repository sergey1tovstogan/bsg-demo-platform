"""
Settings API endpoints for application configuration.
"""

from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import Optional
from app.core.database import get_database
from app.core.logging import get_logger
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.adapters.rag.factory import get_rag_adapter
import asyncio

logger = get_logger(__name__)
router = APIRouter(prefix="/settings", tags=["settings"])


class RagJwtTokenRequest(BaseModel):
    token: str


class RagJwtTokenResponse(BaseModel):
    token: Optional[str] = None


# In-memory storage for RAG JWT token (fallback if DB not available)
_rag_jwt_token_memory: Optional[str] = None


@router.post("/rag/jwt-token", response_model=dict)
async def update_rag_jwt_token(
    request: RagJwtTokenRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update RAG JWT token.
    
    Stores the token in MongoDB and updates the RAG adapter instance.
    """
    try:
        token = request.token.strip()
        if not token:
            raise HTTPException(status_code=400, detail="Token cannot be empty")
        
        # Store in MongoDB
        try:
            await db.settings.update_one(
                {"key": "rag_jwt_token"},
                {"$set": {"value": token, "updated_at": "now"}},
                upsert=True
            )
            logger.info("RAG JWT token stored in MongoDB")
        except Exception as e:
            logger.warning(f"Failed to store RAG JWT token in MongoDB: {e}, using in-memory storage")
            # Fallback to in-memory storage
            global _rag_jwt_token_memory
            _rag_jwt_token_memory = token
        
        # Update RAG adapter instance
        try:
            rag_adapter = get_rag_adapter()
            if hasattr(rag_adapter, 'jwt_token'):
                rag_adapter.jwt_token = token
                logger.info("RAG adapter JWT token updated")
        except Exception as e:
            logger.warning(f"Failed to update RAG adapter token: {e}")
        
        return {
            "status": "success",
            "message": "RAG JWT token updated successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating RAG JWT token: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to update RAG JWT token: {str(e)}")


@router.get("/rag/jwt-token", response_model=dict)
async def get_rag_jwt_token(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get RAG JWT token status (masked for security).
    
    Returns whether token is configured, but not the actual token value.
    """
    try:
        # Try MongoDB first
        try:
            setting = await db.settings.find_one({"key": "rag_jwt_token"})
            if setting and setting.get("value"):
                return {
                    "status": "success",
                    "configured": True,
                    "token": None  # Never return the actual token
                }
        except Exception as e:
            logger.warning(f"Failed to read RAG JWT token from MongoDB: {e}")
        
        # Check in-memory storage
        global _rag_jwt_token_memory
        if _rag_jwt_token_memory:
            return {
                "status": "success",
                "configured": True,
                "token": None
            }
        
        return {
            "status": "success",
            "configured": False,
            "token": None
        }
    except Exception as e:
        logger.error(f"Error getting RAG JWT token status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get RAG JWT token status: {str(e)}")


async def get_rag_jwt_token_value() -> Optional[str]:
    """
    Internal function to get RAG JWT token value.
    Used by RAG adapter to retrieve token dynamically.
    """
    try:
        # Try MongoDB first
        try:
            # Get database connection
            db_gen = get_database()
            db = await db_gen.__anext__()
            setting = await db.settings.find_one({"key": "rag_jwt_token"})
            if setting and setting.get("value"):
                return setting["value"]
        except (StopAsyncIteration, Exception) as e:
            logger.debug(f"Could not get token from MongoDB: {e}")

        # Fallback to in-memory storage
        global _rag_jwt_token_memory
        if _rag_jwt_token_memory:
            return _rag_jwt_token_memory

        # Final fallback to config
        from app.core.config import settings
        if settings.RAG_JWT_TOKEN:
            return settings.RAG_JWT_TOKEN

        return None
    except Exception as e:
        logger.warning(f"Error retrieving RAG JWT token: {e}")
        return None


# =============================================================================
# EventHub Configuration Management
# =============================================================================

class EventHubConfigRequest(BaseModel):
    connection_string: str
    name: str
    consumer_group: str = "$Default"
    buffer_size: int = 1000


class EventHubConfigResponse(BaseModel):
    status: str
    configured: bool
    source: Optional[str] = None  # 'mongodb', 'env', or None
    message: Optional[str] = None


@router.post("/eventhub/config", response_model=dict)
async def update_eventhub_config(
    request: EventHubConfigRequest,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Update EventHub configuration.

    Stores configuration in MongoDB for production use.
    Note: Requires backend restart to apply changes to running adapter.
    """
    try:
        connection_string = request.connection_string.strip()
        if not connection_string:
            raise HTTPException(status_code=400, detail="Connection string cannot be empty")

        name = request.name.strip()
        if not name:
            raise HTTPException(status_code=400, detail="EventHub name cannot be empty")

        # Store configuration in MongoDB
        config = {
            "connection_string": connection_string,
            "name": name,
            "consumer_group": request.consumer_group,
            "buffer_size": request.buffer_size
        }

        try:
            await db.settings.update_one(
                {"key": "eventhub_config"},
                {"$set": {"value": config, "updated_at": "now"}},
                upsert=True
            )
            logger.info("EventHub configuration stored in MongoDB")
        except Exception as e:
            logger.error(f"Failed to store EventHub configuration in MongoDB: {e}")
            raise HTTPException(status_code=500, detail=f"Failed to save configuration: {str(e)}")

        return {
            "status": "success",
            "message": "EventHub configuration updated successfully. Restart backend to apply changes.",
            "restart_required": True
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating EventHub configuration: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to update EventHub configuration: {str(e)}")


@router.get("/eventhub/config", response_model=EventHubConfigResponse)
async def get_eventhub_config(
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get EventHub configuration status.

    Returns whether configuration exists and its source (MongoDB or .env),
    but not the actual sensitive values.
    """
    try:
        # Try MongoDB first
        try:
            setting = await db.settings.find_one({"key": "eventhub_config"})
            if setting and setting.get("value"):
                return EventHubConfigResponse(
                    status="success",
                    configured=True,
                    source="mongodb",
                    message="EventHub configured in MongoDB"
                )
        except Exception as e:
            logger.warning(f"Failed to read EventHub config from MongoDB: {e}")

        # Check .env fallback
        from app.core.config import settings
        if settings.EVENTHUB_CONNECTION_STRING:
            return EventHubConfigResponse(
                status="success",
                configured=True,
                source="env",
                message="EventHub configured in .env file"
            )

        return EventHubConfigResponse(
            status="success",
            configured=False,
            source=None,
            message="EventHub not configured"
        )
    except Exception as e:
        logger.error(f"Error getting EventHub configuration status: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get EventHub configuration status: {str(e)}")


async def get_eventhub_config_from_db() -> Optional[dict]:
    """
    Internal function to get EventHub configuration.
    Used by EventHub adapter to retrieve config dynamically.

    Returns:
        Dictionary with EventHub config or None if not found.
        Keys: connection_string, name, consumer_group, buffer_size
    """
    try:
        # Try MongoDB first
        try:
            db_gen = get_database()
            db = await db_gen.__anext__()
            setting = await db.settings.find_one({"key": "eventhub_config"})
            if setting and setting.get("value"):
                logger.info("Using EventHub configuration from MongoDB")
                return setting["value"]
        except (StopAsyncIteration, Exception) as e:
            logger.debug(f"Could not get EventHub config from MongoDB: {e}")

        # Fallback to .env
        from app.core.config import settings
        if settings.EVENTHUB_CONNECTION_STRING:
            logger.info("Using EventHub configuration from .env file")
            return {
                "connection_string": settings.EVENTHUB_CONNECTION_STRING,
                "name": settings.EVENTHUB_NAME,
                "consumer_group": settings.EVENTHUB_CONSUMER_GROUP,
                "buffer_size": settings.EVENTHUB_BUFFER_SIZE
            }

        logger.warning("EventHub configuration not found in MongoDB or .env")
        return None
    except Exception as e:
        logger.warning(f"Error retrieving EventHub configuration: {e}")
        return None

