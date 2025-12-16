"""
Event Store Service - Adapter for Azure Event Hub via Event Store API

This service connects to the Event Store API which provides access to 
CloudEvents from Azure Event Hub for the Kafka Event Stream visualization.
"""

import asyncio
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import httpx
from pydantic import BaseModel

from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)


# =============================================================================
# Data Models
# =============================================================================

class CloudEvent(BaseModel):
    """CloudEvents specification format from Event Store API."""
    id: str
    source: str
    type: str
    specversion: str = "1.0"
    time: str
    data: Any
    datacontenttype: Optional[str] = "application/json"
    # Extensions
    subject: Optional[str] = None
    partition: Optional[int] = None
    offset: Optional[int] = None


class KafkaEvent(BaseModel):
    """Internal Kafka event format for frontend consumption."""
    id: str
    timestamp: int  # milliseconds since epoch
    type: str  # 'business' or 'data'
    topic: str
    partition: int
    offset: int
    payload: Any
    transactionType: Optional[str] = None


class EventStoreResponse(BaseModel):
    """Response wrapper for Event Store API."""
    success: bool
    events: List[KafkaEvent] = []
    total: int = 0
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


# =============================================================================
# Event Store Service Configuration
# =============================================================================

class EventStoreConfig:
    """Configuration for Event Store API connection."""
    
    def __init__(
        self,
        base_url: str = "https://eventstoreapiapp.nicesky-10daa0ab.northeurope.azurecontainerapps.io",
        api_path: str = "/ms-eventstore-api/api/v1.0.0",
        timeout: int = 30,
        max_events: int = 100,
        default_time_range_hours: int = 24
    ):
        self.base_url = base_url
        self.api_path = api_path
        self.timeout = timeout
        self.max_events = max_events
        self.default_time_range_hours = default_time_range_hours
    
    @property
    def full_base_url(self) -> str:
        return f"{self.base_url}{self.api_path}"


# =============================================================================
# Event Store Service
# =============================================================================

class EventStoreService:
    """
    Service adapter for fetching events from Event Store API.
    
    The Event Store API provides access to CloudEvents from Azure Event Hub.
    This service handles:
    - API connection and authentication
    - CloudEvents to KafkaEvent transformation
    - Error handling and retries
    - Event filtering and pagination
    """
    
    def __init__(self, config: Optional[EventStoreConfig] = None):
        self.config = config or EventStoreConfig()
        self._client: Optional[httpx.AsyncClient] = None
        self._last_offset: Dict[str, int] = {}  # Track last offset per topic
    
    async def _get_client(self) -> httpx.AsyncClient:
        """Get or create HTTP client."""
        if self._client is None or self._client.is_closed:
            self._client = httpx.AsyncClient(
                timeout=httpx.Timeout(self.config.timeout),
                verify=True,  # SSL verification
                follow_redirects=True
            )
        return self._client
    
    async def close(self) -> None:
        """Close HTTP client."""
        if self._client and not self._client.is_closed:
            await self._client.aclose()
            self._client = None
    
    def _transform_cloud_event(self, cloud_event: Dict[str, Any]) -> KafkaEvent:
        """
        Transform CloudEvent to internal KafkaEvent format.
        
        CloudEvents fields mapping:
        - id → event.id
        - time → event.timestamp (convert to milliseconds)
        - type → determine 'business' or 'data' based on event type
        - source → event.topic (extract topic from source)
        - data → event.payload
        """
        # Parse timestamp to milliseconds
        time_str = cloud_event.get("time", "")
        try:
            if time_str:
                # ISO format: 2024-01-15T10:30:00Z
                dt = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
                timestamp = int(dt.timestamp() * 1000)
            else:
                timestamp = int(datetime.now().timestamp() * 1000)
        except (ValueError, TypeError):
            timestamp = int(datetime.now().timestamp() * 1000)
        
        # Extract topic from source or type
        source = cloud_event.get("source", "")
        event_type = cloud_event.get("type", "")
        
        # Try to extract topic from source (e.g., "/azure/eventhub/topic-name")
        if "/" in source:
            topic = source.split("/")[-1]
        else:
            topic = source or event_type.replace(".", "-")
        
        # Map topic to Temenos-style topic names if possible
        topic = self._map_to_temenos_topic(topic, event_type)
        
        # Determine event category (business vs data)
        event_category = self._categorize_event(event_type, cloud_event.get("data", {}))
        
        # Extract partition and offset from extensions or generate defaults
        partition = cloud_event.get("partition", 0)
        offset = cloud_event.get("offset", 0)
        
        # If extensions contain kafka metadata
        if "kafkapartition" in cloud_event:
            partition = int(cloud_event.get("kafkapartition", 0))
        if "kafkaoffset" in cloud_event:
            offset = int(cloud_event.get("kafkaoffset", 0))
        
        # Extract transaction type if available
        transaction_type = self._extract_transaction_type(event_type, cloud_event.get("data", {}))
        
        return KafkaEvent(
            id=cloud_event.get("id", f"evt_{timestamp}"),
            timestamp=timestamp,
            type=event_category,
            topic=topic,
            partition=partition,
            offset=offset,
            payload=cloud_event.get("data", {}),
            transactionType=transaction_type
        )
    
    def _map_to_temenos_topic(self, topic: str, event_type: str) -> str:
        """Map source topic to Temenos-style topic names."""
        topic_lower = topic.lower()
        event_type_lower = event_type.lower()
        
        # Mapping based on event type or topic name
        if "customer" in topic_lower or "customer" in event_type_lower:
            if "created" in event_type_lower:
                return "temenos.party.customers.created"
            return "temenos.party.customers.updated"
        
        if "account" in topic_lower or "account" in event_type_lower:
            if "opened" in event_type_lower or "created" in event_type_lower:
                return "temenos.holdings.accounts.opened"
            return "temenos.holdings.accounts.updated"
        
        if "payment" in topic_lower or "payment" in event_type_lower:
            if "initiated" in event_type_lower or "created" in event_type_lower:
                return "temenos.order.payments.initiated"
            if "completed" in event_type_lower:
                return "temenos.order.payments.completed"
            return "temenos.order.payments.updated"
        
        if "transaction" in topic_lower:
            return "temenos.data.transactions.sync"
        
        # Default: use original topic with temenos prefix
        return f"temenos.data.{topic}"
    
    def _categorize_event(self, event_type: str, data: Any) -> str:
        """Categorize event as 'business' or 'data' based on type and content."""
        event_type_lower = event_type.lower()
        
        # Business events - domain/business logic events
        business_keywords = [
            "customer.created", "customer.updated", "customer.deleted",
            "account.opened", "account.closed", "account.updated",
            "payment.initiated", "payment.completed", "payment.failed",
            "transaction.completed", "order", "kyc", "compliance"
        ]
        
        for keyword in business_keywords:
            if keyword in event_type_lower:
                return "business"
        
        # Data events - sync/replication events
        data_keywords = ["sync", "replicated", "data.", "cdc", "change"]
        for keyword in data_keywords:
            if keyword in event_type_lower:
                return "data"
        
        # Default to business for unknown types
        return "business"
    
    def _extract_transaction_type(self, event_type: str, data: Any) -> Optional[str]:
        """Extract transaction type from event for UI display."""
        event_type_lower = event_type.lower()
        
        if "customer" in event_type_lower:
            return "CREATE_CUSTOMER"
        if "account" in event_type_lower:
            return "OPEN_ACCOUNT"
        if "payment" in event_type_lower:
            return "SEND_PAYMENT"
        
        return None
    
    async def explore_api(self) -> Dict[str, Any]:
        """
        Explore the Event Store API to discover available endpoints.
        
        Returns information about:
        - Available routes
        - API version
        - Authentication requirements
        """
        client = await self._get_client()
        result = {
            "status": "unknown",
            "endpoints": [],
            "authentication": "unknown",
            "error": None
        }
        
        try:
            # Try root endpoint
            logger.info(f"Exploring Event Store API: {self.config.base_url}")
            
            # Try the base URL first
            response = await client.get(self.config.base_url)
            result["base_status"] = response.status_code
            
            if response.status_code == 200:
                try:
                    result["base_response"] = response.json()
                except Exception:
                    result["base_response"] = response.text[:500]
            
            # Try the full API path
            response = await client.get(self.config.full_base_url)
            result["api_status"] = response.status_code
            
            if response.status_code == 200:
                try:
                    result["api_response"] = response.json()
                except Exception:
                    result["api_response"] = response.text[:500]
            
            # Try common event endpoints
            common_endpoints = [
                "/events",
                "/api/events", 
                "/api/v1/events",
                "/cloudevents",
                "/topics",
                "/streams"
            ]
            
            for endpoint in common_endpoints:
                try:
                    test_url = f"{self.config.full_base_url}{endpoint}"
                    test_response = await client.get(test_url)
                    result["endpoints"].append({
                        "path": endpoint,
                        "status": test_response.status_code,
                        "content_type": test_response.headers.get("content-type", "unknown")
                    })
                except Exception as e:
                    result["endpoints"].append({
                        "path": endpoint,
                        "status": "error",
                        "error": str(e)
                    })
            
            result["status"] = "explored"
            logger.info(f"Event Store API exploration complete: {result}")
            
        except httpx.RequestError as e:
            result["status"] = "error"
            result["error"] = f"Connection error: {str(e)}"
            logger.error(f"Event Store API exploration failed: {e}")
        except Exception as e:
            result["status"] = "error"
            result["error"] = f"Unexpected error: {str(e)}"
            logger.error(f"Event Store API exploration error: {e}")
        
        return result
    
    async def fetch_events(
        self,
        topic: Optional[str] = None,
        since: Optional[datetime] = None,
        limit: Optional[int] = None,
        offset: Optional[int] = None
    ) -> EventStoreResponse:
        """
        Fetch events from Event Store API.
        
        Args:
            topic: Optional topic filter
            since: Only return events after this time
            limit: Maximum number of events to return
            offset: Starting offset for pagination
        
        Returns:
            EventStoreResponse with transformed KafkaEvents
        """
        client = await self._get_client()
        
        # Build query parameters
        params: Dict[str, Any] = {}
        
        if topic:
            params["topic"] = topic
        
        if since:
            params["since"] = since.isoformat()
        else:
            # Default to last 24 hours
            default_since = datetime.utcnow() - timedelta(hours=self.config.default_time_range_hours)
            params["since"] = default_since.isoformat()
        
        if limit:
            params["limit"] = min(limit, self.config.max_events)
        else:
            params["limit"] = self.config.max_events
        
        if offset:
            params["offset"] = offset
        
        try:
            # Try multiple potential endpoints
            endpoints_to_try = [
                "/events",
                "/api/events",
                "/api/v1/events",
                "/cloudevents"
            ]
            
            response = None
            successful_endpoint = None
            
            for endpoint in endpoints_to_try:
                try:
                    url = f"{self.config.full_base_url}{endpoint}"
                    logger.debug(f"Trying endpoint: {url}")
                    response = await client.get(url, params=params)
                    
                    if response.status_code == 200:
                        successful_endpoint = endpoint
                        break
                except Exception as e:
                    logger.debug(f"Endpoint {endpoint} failed: {e}")
                    continue
            
            if response is None or response.status_code != 200:
                return EventStoreResponse(
                    success=False,
                    error=f"No accessible endpoint found. Tried: {endpoints_to_try}",
                    metadata={"attempted_endpoints": endpoints_to_try}
                )
            
            # Parse response
            data = response.json()
            
            # Handle different response structures
            cloud_events = []
            
            if isinstance(data, list):
                # Direct array of events
                cloud_events = data
            elif isinstance(data, dict):
                # Wrapped response
                cloud_events = data.get("events", data.get("data", data.get("items", [])))
            
            # Transform CloudEvents to KafkaEvents
            kafka_events = []
            for ce in cloud_events:
                try:
                    kafka_event = self._transform_cloud_event(ce)
                    kafka_events.append(kafka_event)
                except Exception as e:
                    logger.warning(f"Failed to transform CloudEvent: {e}")
                    continue
            
            # Sort by timestamp (newest first)
            kafka_events.sort(key=lambda e: e.timestamp, reverse=True)
            
            logger.info(f"Fetched {len(kafka_events)} events from {successful_endpoint}")
            
            return EventStoreResponse(
                success=True,
                events=kafka_events,
                total=len(kafka_events),
                metadata={
                    "endpoint": successful_endpoint,
                    "params": params
                }
            )
            
        except httpx.RequestError as e:
            logger.error(f"Event Store API request error: {e}")
            return EventStoreResponse(
                success=False,
                error=f"Connection error: {str(e)}"
            )
        except Exception as e:
            logger.error(f"Event Store fetch error: {e}")
            return EventStoreResponse(
                success=False,
                error=f"Unexpected error: {str(e)}"
            )
    
    async def get_topics(self) -> Dict[str, Any]:
        """Get available topics from Event Store."""
        client = await self._get_client()
        
        try:
            # Try common topic endpoints
            endpoints = ["/topics", "/api/topics", "/streams"]
            
            for endpoint in endpoints:
                try:
                    url = f"{self.config.full_base_url}{endpoint}"
                    response = await client.get(url)
                    
                    if response.status_code == 200:
                        return {
                            "success": True,
                            "topics": response.json()
                        }
                except Exception:
                    continue
            
            return {
                "success": False,
                "error": "No topics endpoint found"
            }
            
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """Check Event Store API health."""
        client = await self._get_client()
        
        try:
            # Try health endpoint
            endpoints = ["/health", "/api/health", "/status", ""]
            
            for endpoint in endpoints:
                try:
                    url = f"{self.config.full_base_url}{endpoint}" if endpoint else self.config.base_url
                    response = await client.get(url, timeout=5.0)
                    
                    if response.status_code in [200, 204]:
                        return {
                            "status": "healthy",
                            "endpoint": url,
                            "response_time_ms": response.elapsed.total_seconds() * 1000
                        }
                except Exception:
                    continue
            
            return {
                "status": "unhealthy",
                "error": "No health endpoint responded"
            }
            
        except Exception as e:
            return {
                "status": "error",
                "error": str(e)
            }


# =============================================================================
# Global Instance
# =============================================================================

# Create global service instance
event_store_service = EventStoreService()


def get_event_store_service() -> EventStoreService:
    """Dependency injection for FastAPI."""
    return event_store_service

