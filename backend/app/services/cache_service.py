"""
Cache Service

Provides persistent caching for RAG responses, Azure resources, and AKS namespaces
to reduce unnecessary API calls and improve performance.
"""

from typing import Optional, Dict, Any, List
from datetime import datetime, timedelta
import json
import hashlib
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.core.database import get_database
from app.core.logging import get_logger
from app.utils.datetime_utils import utc_now, to_utc

logger = get_logger(__name__)


class CacheService:
    """Service for managing persistent cache entries."""
    
    # Cache TTLs (in hours)
    RAG_CACHE_TTL = 24 * 7  # 7 days for RAG responses (component info rarely changes)
    AZURE_RESOURCES_TTL = 1  # 1 hour for Azure resources (may change more frequently)
    AKS_NAMESPACES_TTL = 2  # 2 hours for AKS namespaces
    COMPONENT_INFO_TTL = 24 * 7  # 7 days for component identification
    AZURE_RESOURCE_GROUPS_TTL = 1  # 1 hour for Azure resource groups (may change)
    
    def __init__(self, db: Optional[AsyncIOMotorDatabase] = None):
        """Initialize cache service."""
        self._db = db
        self._in_memory_cache: Dict[str, Any] = {}  # Short-term in-memory cache
    
    async def _get_db(self) -> AsyncIOMotorDatabase:
        """Get database instance."""
        if self._db is None:
            from app.core.database import get_database
            self._db = await get_database()
        return self._db
    
    def _generate_cache_key(self, prefix: str, *args, **kwargs) -> str:
        """Generate a unique cache key from arguments."""
        # Create a deterministic key from arguments
        key_parts = [prefix]
        key_parts.extend(str(arg) for arg in args)
        if kwargs:
            # Sort kwargs for deterministic key generation
            sorted_kwargs = sorted(kwargs.items())
            key_parts.extend(f"{k}={v}" for k, v in sorted_kwargs)
        
        key_string = "|".join(key_parts)
        # Hash for shorter keys and to handle special characters
        key_hash = hashlib.md5(key_string.encode()).hexdigest()
        return f"{prefix}:{key_hash}"
    
    async def get(self, cache_key: str, use_memory_cache: bool = True) -> Optional[Dict[str, Any]]:
        """
        Get cached entry.
        
        Args:
            cache_key: Cache key
            use_memory_cache: Whether to check in-memory cache first
            
        Returns:
            Cached data or None if not found/expired
        """
        # Check in-memory cache first (fastest)
        if use_memory_cache and cache_key in self._in_memory_cache:
            entry = self._in_memory_cache[cache_key]
            if entry.get("expires_at"):
                try:
                    expires_at = entry["expires_at"]
                    # Handle different types: string, datetime (naive or aware)
                    if isinstance(expires_at, str):
                        expires_at = datetime.fromisoformat(expires_at)
                    elif not isinstance(expires_at, datetime):
                        # Unexpected type, skip expiration check
                        logger.warning(f"Unexpected expires_at type in memory cache for {cache_key}: {type(expires_at)}")
                        expires_at = None
                    
                    if expires_at:
                        expires_at = to_utc(expires_at)  # Ensure timezone-aware
                        if expires_at > utc_now():
                            logger.debug(f"Cache hit (memory): {cache_key}")
                            return entry.get("data")
                except (ValueError, TypeError, AttributeError) as e:
                    logger.warning(f"Error processing expires_at in memory cache for {cache_key}: {e}")
            # Expired or invalid, remove from memory
            del self._in_memory_cache[cache_key]
        
        # Check persistent cache
        try:
            db = await self._get_db()
            result = await db.cache.find_one({"cache_key": cache_key})
            
            if not result:
                logger.debug(f"Cache miss: {cache_key}")
                return None
            
            # Check expiration
            expires_at = result.get("expires_at")
            if expires_at:
                try:
                    # Handle different types: string, datetime (naive or aware)
                    if isinstance(expires_at, str):
                        expires_at = datetime.fromisoformat(expires_at)
                    elif not isinstance(expires_at, datetime):
                        # Unexpected type, log and skip expiration check
                        logger.warning(f"Unexpected expires_at type for {cache_key}: {type(expires_at)}")
                        expires_at = None
                    
                    if expires_at:
                        # Ensure timezone-aware for comparison (handles both naive and aware datetimes)
                        expires_at = to_utc(expires_at)
                        if expires_at < utc_now():
                            logger.debug(f"Cache expired: {cache_key}")
                            # Delete expired entry
                            await db.cache.delete_one({"cache_key": cache_key})
                            return None
                except (ValueError, TypeError, AttributeError) as e:
                    logger.error(f"Error processing expires_at for {cache_key}: {e}. Type: {type(expires_at)}, Value: {expires_at}", exc_info=True)
                    # If we can't process expiration, assume expired for safety
                    await db.cache.delete_one({"cache_key": cache_key})
                    return None
            
            # Parse content
            content = result.get("content", "{}")
            if isinstance(content, str):
                try:
                    data = json.loads(content)
                except json.JSONDecodeError:
                    data = {"raw": content}
            else:
                data = content
            
            # Store in memory cache for faster access
            if use_memory_cache:
                self._in_memory_cache[cache_key] = {
                    "data": data,
                    "expires_at": result.get("expires_at")
                }
            
            logger.debug(f"Cache hit (persistent): {cache_key}")
            return data
        except Exception as e:
            logger.error(f"Error getting cache entry {cache_key}: {e}", exc_info=True)
            return None
    
    async def set(
        self,
        cache_key: str,
        data: Any,
        ttl_hours: Optional[float] = None,
        metadata: Optional[Dict[str, Any]] = None
    ) -> bool:
        """
        Set cache entry.
        
        Args:
            cache_key: Cache key
            data: Data to cache (will be JSON serialized)
            ttl_hours: Time to live in hours (None = no expiration)
            metadata: Optional metadata
            
        Returns:
            True if successful
        """
        try:
            db = await self._get_db()
            
            # Serialize data
            if isinstance(data, (dict, list)):
                content = json.dumps(data)
                content_type = "json"
            else:
                content = str(data)
                content_type = "text"
            
            # Calculate expiration
            expires_at = None
            if ttl_hours:
                expires_at = utc_now() + timedelta(hours=ttl_hours)
            
            # Prepare cache entry
            cache_entry = {
                "cache_key": cache_key,
                "content": content,
                "content_type": content_type,
                "metadata": metadata or {},
                "updated_at": utc_now(),
                "expires_at": expires_at
            }
            
            # Check if entry exists
            existing = await db.cache.find_one({"cache_key": cache_key})
            
            if existing:
                # Update existing
                await db.cache.update_one(
                    {"cache_key": cache_key},
                    {"$set": cache_entry}
                )
                logger.debug(f"Updated cache entry: {cache_key}")
            else:
                # Create new
                cache_entry["created_at"] = utc_now()
                await db.cache.insert_one(cache_entry)
                logger.debug(f"Created cache entry: {cache_key}")
            
            # Update in-memory cache
            self._in_memory_cache[cache_key] = {
                "data": data,
                "expires_at": expires_at.isoformat() if expires_at else None
            }
            
            return True
        except Exception as e:
            logger.error(f"Error setting cache entry {cache_key}: {e}", exc_info=True)
            return False
    
    async def delete(self, cache_key: str) -> bool:
        """Delete cache entry."""
        try:
            db = await self._get_db()
            result = await db.cache.delete_one({"cache_key": cache_key})
            
            # Remove from memory cache
            if cache_key in self._in_memory_cache:
                del self._in_memory_cache[cache_key]
            
            logger.debug(f"Deleted cache entry: {cache_key}")
            return result.deleted_count > 0
        except Exception as e:
            logger.error(f"Error deleting cache entry {cache_key}: {e}", exc_info=True)
            return False
    
    async def clear_expired(self) -> int:
        """Clear all expired cache entries."""
        try:
            db = await self._get_db()
            now = utc_now()
            result = await db.cache.delete_many({
                "expires_at": {"$lt": now}
            })
            
            # Clear expired from memory cache
            expired_keys = []
            for key, entry in self._in_memory_cache.items():
                if entry.get("expires_at"):
                    try:
                        expires_at = entry["expires_at"]
                        # Handle different types: string, datetime (naive or aware)
                        if isinstance(expires_at, str):
                            expires_at = datetime.fromisoformat(expires_at)
                        elif not isinstance(expires_at, datetime):
                            # Unexpected type, skip
                            continue
                        expires_at = to_utc(expires_at)  # Ensure timezone-aware
                        if expires_at < now:
                            expired_keys.append(key)
                    except (ValueError, TypeError, AttributeError) as e:
                        logger.warning(f"Error processing expires_at in clear_expired for {key}: {e}")
                        # If we can't parse it, consider it expired
                        expired_keys.append(key)
            for key in expired_keys:
                del self._in_memory_cache[key]
            
            logger.info(f"Cleared {result.deleted_count} expired cache entries")
            return result.deleted_count
        except Exception as e:
            logger.error(f"Error clearing expired cache: {e}", exc_info=True)
            return 0
    
    # Convenience methods for specific cache types
    
    async def get_rag_response(
        self,
        component_name: str,
        query_type: str,
        rag_model_id: str = "ModularBanking, TechnologyOverview"
    ) -> Optional[Dict[str, Any]]:
        """Get cached RAG response."""
        cache_key = self._generate_cache_key(
            "rag",
            component_name=component_name,
            query_type=query_type,
            rag_model_id=rag_model_id
        )
        return await self.get(cache_key)
    
    async def set_rag_response(
        self,
        component_name: str,
        query_type: str,
        response: Dict[str, Any],
        rag_model_id: str = "ModularBanking, TechnologyOverview"
    ) -> bool:
        """Cache RAG response."""
        cache_key = self._generate_cache_key(
            "rag",
            component_name=component_name,
            query_type=query_type,
            rag_model_id=rag_model_id
        )
        return await self.set(cache_key, response, ttl_hours=self.RAG_CACHE_TTL)
    
    async def get_component_info(self, component_name: str) -> Optional[Dict[str, Any]]:
        """Get cached component info."""
        cache_key = self._generate_cache_key("component_info", component_name=component_name)
        return await self.get(cache_key)
    
    async def set_component_info(self, component_name: str, component_info: Dict[str, Any]) -> bool:
        """Cache component info."""
        cache_key = self._generate_cache_key("component_info", component_name=component_name)
        return await self.set(cache_key, component_info, ttl_hours=self.COMPONENT_INFO_TTL)
    
    async def get_azure_resources(
        self,
        subscription_id: str,
        resource_group_names: List[str]
    ) -> Optional[List[Dict[str, Any]]]:
        """Get cached Azure resources."""
        cache_key = self._generate_cache_key(
            "azure_resources",
            subscription_id=subscription_id,
            resource_groups=",".join(sorted(resource_group_names))
        )
        return await self.get(cache_key)
    
    async def set_azure_resources(
        self,
        subscription_id: str,
        resource_group_names: List[str],
        resources: List[Dict[str, Any]]
    ) -> bool:
        """Cache Azure resources."""
        cache_key = self._generate_cache_key(
            "azure_resources",
            subscription_id=subscription_id,
            resource_groups=",".join(sorted(resource_group_names))
        )
        return await self.set(cache_key, resources, ttl_hours=self.AZURE_RESOURCES_TTL)
    
    async def get_aks_namespaces(
        self,
        subscription_id: str,
        resource_group_names: List[str]
    ) -> Optional[List[Dict[str, Any]]]:
        """Get cached AKS namespaces."""
        cache_key = self._generate_cache_key(
            "aks_namespaces",
            subscription_id=subscription_id,
            resource_groups=",".join(sorted(resource_group_names))
        )
        return await self.get(cache_key)
    
    async def set_aks_namespaces(
        self,
        subscription_id: str,
        resource_group_names: List[str],
        namespaces: List[Dict[str, Any]]
    ) -> bool:
        """Cache AKS namespaces."""
        cache_key = self._generate_cache_key(
            "aks_namespaces",
            subscription_id=subscription_id,
            resource_groups=",".join(sorted(resource_group_names))
        )
        return await self.set(cache_key, namespaces, ttl_hours=self.AKS_NAMESPACES_TTL)
    
    async def get_azure_resource_groups(
        self,
        subscription_id: str
    ) -> Optional[List[Dict[str, Any]]]:
        """Get cached Azure resource groups."""
        cache_key = self._generate_cache_key(
            "azure_resource_groups",
            subscription_id=subscription_id
        )
        return await self.get(cache_key)
    
    async def set_azure_resource_groups(
        self,
        subscription_id: str,
        resource_groups: List[Dict[str, Any]]
    ) -> bool:
        """Cache Azure resource groups."""
        cache_key = self._generate_cache_key(
            "azure_resource_groups",
            subscription_id=subscription_id
        )
        return await self.set(cache_key, resource_groups, ttl_hours=self.AZURE_RESOURCE_GROUPS_TTL)
    
    def clear_memory_cache(self):
        """Clear in-memory cache (useful for testing or memory management)."""
        self._in_memory_cache.clear()
        logger.debug("Cleared in-memory cache")
    
    async def delete_component_info(self, component_name: str) -> bool:
        """Delete cached component info."""
        cache_key = self._generate_cache_key("component_info", component_name=component_name)
        return await self.delete(cache_key)
    
    async def delete_rag_response(
        self,
        component_name: str,
        query_type: str,
        rag_model_id: str = "ModularBanking, TechnologyOverview"
    ) -> bool:
        """Delete cached RAG response."""
        cache_key = self._generate_cache_key(
            "rag",
            component_name=component_name,
            query_type=query_type,
            rag_model_id=rag_model_id
        )
        return await self.delete(cache_key)


# Global cache service instance
_cache_service: Optional[CacheService] = None


async def get_cache_service() -> CacheService:
    """Get global cache service instance."""
    global _cache_service
    if _cache_service is None:
        db = await get_database()
        _cache_service = CacheService(db=db)
    return _cache_service

