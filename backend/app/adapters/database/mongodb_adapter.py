"""
MongoDB Adapter Implementation

MongoDB-specific implementation of DatabaseAdapter.
"""

import asyncio
from typing import Optional, Dict, Any, List
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase, AsyncIOMotorCollection
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect, NetworkTimeout
from bson import ObjectId

from app.adapters.database.base import DatabaseAdapter
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)


class MongoDBAdapter(DatabaseAdapter):
    """MongoDB implementation of DatabaseAdapter."""
    
    def __init__(self):
        """Initialize MongoDB adapter."""
        self._client: Optional[AsyncIOMotorClient] = None
        self._database: Optional[AsyncIOMotorDatabase] = None
        self._connection_string = settings.DATABASE_URL
        self._database_name = settings.DATABASE_NAME
        self._max_retries = 3
        self._retry_delay = 1  # seconds
    
    async def _ensure_connection(self) -> None:
        """Ensure MongoDB connection is active, reconnect if needed."""
        if self._client is None or self._database is None:
            await self.connect()
            return
        
        # Validate connection by pinging
        try:
            await self._client.admin.command('ping')
        except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect, NetworkTimeout) as e:
            logger.warning(f"MongoDB connection lost, reconnecting: {e}")
            # Close stale connection
            if self._client:
                try:
                    self._client.close()
                except Exception:
                    pass
            self._client = None
            self._database = None
            await self.connect()
    
    async def connect(self) -> None:
        """Initialize MongoDB connection with retry logic."""
        if self._database is not None and self._client is not None:
            # Validate existing connection
            try:
                await self._client.admin.command('ping')
                return
            except Exception:
                # Connection is stale, reset and reconnect
                logger.warning("Existing MongoDB connection is stale, reconnecting...")
                self._client = None
                self._database = None
        
        connection_host = self._connection_string.split('@')[-1].split('/')[0] if '@' in self._connection_string else 'localhost'
        
        for attempt in range(self._max_retries):
            try:
                logger.info(f"Connecting to MongoDB (attempt {attempt + 1}/{self._max_retries}): {connection_host}")
                
                # Ensure connection string has proper timeout settings
                conn_str = self._connection_string
                if 'maxIdleTimeMS' not in conn_str:
                    separator = '&' if '?' in conn_str else '?'
                    conn_str = f"{conn_str}{separator}maxIdleTimeMS=120000"
                
                self._client = AsyncIOMotorClient(
                    conn_str,
                    maxPoolSize=settings.DB_MAX_POOL_SIZE,
                    minPoolSize=settings.DB_MIN_POOL_SIZE,
                    serverSelectionTimeoutMS=settings.DB_CONNECT_TIMEOUT * 1000,
                    connectTimeoutMS=settings.DB_CONNECT_TIMEOUT * 1000,
                    socketTimeoutMS=settings.DB_CONNECT_TIMEOUT * 1000,
                    retryWrites=False,  # Already in connection string
                    retryReads=True,  # Enable automatic retry for read operations
                    heartbeatFrequencyMS=10000,  # Check connection health every 10 seconds
                )
                
                # Test connection with timeout
                await asyncio.wait_for(
                    self._client.admin.command('ping'),
                    timeout=settings.DB_CONNECT_TIMEOUT
                )
                
                # Get database
                self._database = self._client[self._database_name]
                
                logger.info(f"Connected to MongoDB database: {self._database_name}")
                return
                
            except asyncio.CancelledError:
                # Handle graceful shutdown - connection was cancelled
                logger.info("MongoDB connection cancelled during startup (likely server shutdown)")
                raise
            except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect, NetworkTimeout) as e:
                logger.warning(f"MongoDB connection attempt {attempt + 1} failed: {e}")
                if attempt < self._max_retries - 1:
                    wait_time = self._retry_delay * (2 ** attempt)  # Exponential backoff
                    logger.info(f"Retrying in {wait_time} seconds...")
                    await asyncio.sleep(wait_time)
                else:
                    logger.error(f"Failed to connect to MongoDB after {self._max_retries} attempts: {e}")
                    # Clean up failed connection
                    if self._client:
                        try:
                            self._client.close()
                        except Exception:
                            pass
                        self._client = None
                    self._database = None
                    raise
            except Exception as e:
                logger.error(f"Unexpected error connecting to MongoDB: {e}")
                # Clean up failed connection
                if self._client:
                    try:
                        self._client.close()
                    except Exception:
                        pass
                    self._client = None
                self._database = None
                raise
    
    async def disconnect(self) -> None:
        """Close MongoDB connection."""
        if self._client:
            try:
                self._client.close()
            except Exception as e:
                logger.warning(f"Error closing MongoDB connection: {e}")
            finally:
                self._client = None
                self._database = None
                logger.info("MongoDB connection closed")
    
    async def health_check(self) -> Dict[str, Any]:
        """Check MongoDB health status."""
        try:
            await self._ensure_connection()
            
            # Ping the database with timeout
            await asyncio.wait_for(
                self._client.admin.command('ping'),
                timeout=5
            )
            
            # Get server status
            server_info = await self._client.server_info()
            
            return {
                "status": "healthy",
                "database": self._database_name,
                "server_version": server_info.get("version", "unknown"),
                "connected": True
            }
        except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect, NetworkTimeout) as e:
            logger.warning(f"Database health check failed (connection error): {e}")
            return {
                "status": "unhealthy",
                "database": self._database_name,
                "error": f"Connection error: {str(e)}",
                "connected": False
            }
        except asyncio.TimeoutError:
            logger.warning("Database health check timed out")
            return {
                "status": "unhealthy",
                "database": self._database_name,
                "error": "Health check timeout",
                "connected": False
            }
        except Exception as e:
            logger.error(f"Database health check failed: {e}")
            return {
                "status": "unhealthy",
                "database": self._database_name,
                "error": str(e),
                "connected": False
            }
    
    async def get_database(self) -> AsyncIOMotorDatabase:
        """Get MongoDB database instance."""
        await self._ensure_connection()
        return self._database
    
    async def get_collection(self, collection_name: str) -> AsyncIOMotorCollection:
        """Get MongoDB collection instance."""
        db = await self.get_database()
        return db[collection_name]
    
    async def _execute_with_retry(self, operation, *args, **kwargs):
        """Execute database operation with retry logic for connection errors."""
        for attempt in range(self._max_retries):
            try:
                return await operation(*args, **kwargs)
            except (ConnectionFailure, ServerSelectionTimeoutError, AutoReconnect, NetworkTimeout) as e:
                if attempt < self._max_retries - 1:
                    logger.warning(f"Database operation failed (attempt {attempt + 1}/{self._max_retries}): {e}")
                    await self._ensure_connection()
                    await asyncio.sleep(self._retry_delay * (2 ** attempt))
                else:
                    logger.error(f"Database operation failed after {self._max_retries} attempts: {e}")
                    raise
    
    async def find_one(self, collection_name: str, filter: Dict[str, Any]) -> Optional[Dict[str, Any]]:
        """Find one document."""
        async def _find():
            await self._ensure_connection()
            collection = await self.get_collection(collection_name)
            result = await collection.find_one(filter)
            if result and "_id" in result:
                result["_id"] = str(result["_id"])
            return result
        return await self._execute_with_retry(_find)
    
    async def find_many(self, collection_name: str, filter: Optional[Dict[str, Any]] = None, limit: Optional[int] = None) -> List[Dict[str, Any]]:
        """Find multiple documents."""
        async def _find():
            await self._ensure_connection()
            collection = await self.get_collection(collection_name)
            cursor = collection.find(filter or {})
            if limit:
                cursor = cursor.limit(limit)
            results = await cursor.to_list(length=limit)
            # Convert ObjectId to string
            for result in results:
                if "_id" in result:
                    result["_id"] = str(result["_id"])
            return results
        return await self._execute_with_retry(_find)
    
    async def insert_one(self, collection_name: str, document: Dict[str, Any]) -> str:
        """Insert one document."""
        async def _insert():
            await self._ensure_connection()
            collection = await self.get_collection(collection_name)
            result = await collection.insert_one(document)
            return str(result.inserted_id)
        return await self._execute_with_retry(_insert)
    
    async def insert_many(self, collection_name: str, documents: List[Dict[str, Any]]) -> List[str]:
        """Insert multiple documents."""
        async def _insert():
            await self._ensure_connection()
            collection = await self.get_collection(collection_name)
            result = await collection.insert_many(documents)
            return [str(id) for id in result.inserted_ids]
        return await self._execute_with_retry(_insert)
    
    async def update_one(self, collection_name: str, filter: Dict[str, Any], update: Dict[str, Any]) -> bool:
        """Update one document."""
        async def _update():
            await self._ensure_connection()
            collection = await self.get_collection(collection_name)
            result = await collection.update_one(filter, {"$set": update})
            return result.modified_count > 0
        return await self._execute_with_retry(_update)
    
    async def delete_one(self, collection_name: str, filter: Dict[str, Any]) -> bool:
        """Delete one document."""
        async def _delete():
            await self._ensure_connection()
            collection = await self.get_collection(collection_name)
            result = await collection.delete_one(filter)
            return result.deleted_count > 0
        return await self._execute_with_retry(_delete)
    
    async def create_index(self, collection_name: str, index_fields: List[tuple], unique: bool = False) -> None:
        """Create index on collection."""
        async def _create():
            await self._ensure_connection()
            collection = await self.get_collection(collection_name)
            await collection.create_index(index_fields, unique=unique)
        return await self._execute_with_retry(_create)

