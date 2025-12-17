"""
Azure Event Hub Service - Direct Event Hub Consumer

This service connects directly to Azure Event Hub to stream events from
the modelbank-event-topic. Events are buffered in-memory and can be filtered
by customerId for display in the Kafka Event Stream component.
"""

import asyncio
import json
from typing import List, Optional, Dict, Any, Deque
from datetime import datetime
from collections import deque
from pydantic import BaseModel

from azure.eventhub import EventData
from azure.eventhub.aio import EventHubConsumerClient
from azure.eventhub.exceptions import EventHubError

from app.core.logging import get_logger
from app.core.config import settings

logger = get_logger(__name__)


# =============================================================================
# Data Models
# =============================================================================

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


class EventHubResponse(BaseModel):
    """Response wrapper for Event Hub events."""
    success: bool
    events: List[KafkaEvent] = []
    total: int = 0
    error: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None


# =============================================================================
# Event Hub Service
# =============================================================================

class EventHubService:
    """
    Service for consuming events from Azure Event Hub.
    
    Features:
    - Background async consumer that continuously receives events
    - In-memory circular buffer for recent events
    - Transform CloudEvents to KafkaEvent format
    - Filter events by customerId (entityid field)
    """
    
    def __init__(self):
        self._client: Optional[EventHubConsumerClient] = None
        self._consumer_task: Optional[asyncio.Task] = None
        self._buffer: Deque[KafkaEvent] = deque(maxlen=settings.EVENTHUB_BUFFER_SIZE)
        self._running: bool = False
        self._lock = asyncio.Lock()
    
    async def start(self) -> None:
        """Start the Event Hub consumer."""
        if self._running:
            logger.warning("Event Hub consumer is already running")
            return
        
        if not settings.EVENTHUB_CONNECTION_STRING:
            logger.error("EVENTHUB_CONNECTION_STRING not configured - Event Hub consumer will not start")
            return
        
        try:
            self._client = EventHubConsumerClient.from_connection_string(
                conn_str=settings.EVENTHUB_CONNECTION_STRING,
                consumer_group=settings.EVENTHUB_CONSUMER_GROUP,
                eventhub_name=settings.EVENTHUB_NAME
            )
            
            self._running = True
            self._consumer_task = asyncio.create_task(self._consume_events())
            logger.info(f"Event Hub consumer started for topic: {settings.EVENTHUB_NAME}")
            
        except Exception as e:
            logger.error(f"Failed to start Event Hub consumer: {e}")
            self._running = False
            raise
    
    async def stop(self) -> None:
        """Stop the Event Hub consumer."""
        if not self._running:
            return
        
        logger.info("Stopping Event Hub consumer...")
        self._running = False
        
        if self._consumer_task:
            self._consumer_task.cancel()
            try:
                await self._consumer_task
            except asyncio.CancelledError:
                pass
        
        if self._client:
            await self._client.close()
            self._client = None
        
        logger.info("Event Hub consumer stopped")
    
    async def _consume_events(self) -> None:
        """Background task that continuously consumes events from Event Hub."""
        if not self._client:
            logger.error("Event Hub client not initialized")
            return
        
        async def on_event(partition_context, event: EventData):
            """Callback for processing each event."""
            if not self._running:
                return
            
            try:
                kafka_event = self._transform_event(event, partition_context)
                if kafka_event:
                    async with self._lock:
                        self._buffer.append(kafka_event)
                    logger.debug(f"Buffered event: {kafka_event.id} (customerId: {kafka_event.payload.get('entityid', 'N/A')})")
                
                # Update checkpoint after processing
                await partition_context.update_checkpoint(event)
            except Exception as e:
                logger.error(f"Error processing event: {e}")
        
        async def on_error(partition_context, error):
            """Callback for handling errors."""
            logger.error(f"Event Hub partition error: {error}")
            if not self._running:
                return
        
        try:
            # Start receiving events with callbacks
            # The receive() method runs until cancelled or error
            async with self._client:
                await self._client.receive(
                    on_event=on_event,
                    on_error=on_error,
                    starting_position="-1"  # Start from latest events
                )
        
        except asyncio.CancelledError:
            logger.info("Event Hub consumer task cancelled")
        except Exception as e:
            logger.error(f"Event Hub consumer error: {e}")
            self._running = False
    
    def _transform_event(self, event_data: EventData, partition_context=None) -> Optional[KafkaEvent]:
        """
        Transform Azure Event Hub event to KafkaEvent format.
        
        Event structure from Event Hub:
        {
            "specversion": "1.0",
            "type": "CUSTOMER_DATA_EVENT",
            "entityid": "190579",  // customerId
            "businesskey": "ModelBank|GB0010001|190579",
            "entityname": "FBNK_CUSTOMER",
            "data": { ... }
        }
        """
        try:
            # Parse event body (JSON)
            if isinstance(event_data.body_as_str(), str):
                event_json = json.loads(event_data.body_as_str())
            elif isinstance(event_data.body_as_json(), dict):
                event_json = event_data.body_as_json()
            else:
                event_json = json.loads(event_data.body_as_bytes().decode('utf-8'))
            
            # Extract fields
            event_id = event_json.get("id") or event_json.get("correlationid") or f"evt_{int(datetime.now().timestamp() * 1000)}"
            entity_id = event_json.get("entityid", "")
            entity_name = event_json.get("entityname", "")
            event_type = event_json.get("type", "")
            
            # Parse timestamp
            time_str = event_json.get("time", "")
            try:
                if time_str:
                    dt = datetime.fromisoformat(time_str.replace("Z", "+00:00"))
                    timestamp = int(dt.timestamp() * 1000)
                else:
                    timestamp = int(datetime.now().timestamp() * 1000)
            except (ValueError, TypeError):
                timestamp = int(datetime.now().timestamp() * 1000)
            
            # Map entityname to topic
            topic = self._map_entity_to_topic(entity_name, event_type)
            
            # Determine event category
            event_category = self._categorize_event(event_type, event_json.get("data", {}))
            
            # Extract partition and offset
            partition = partition_context.partition_id if partition_context and hasattr(partition_context, 'partition_id') else 0
            offset = int(event_data.offset) if hasattr(event_data, 'offset') and event_data.offset else 0
            
            # Extract transaction type
            transaction_type = self._extract_transaction_type(event_type, event_json.get("data", {}))
            
            # Create KafkaEvent with full payload
            return KafkaEvent(
                id=event_id,
                timestamp=timestamp,
                type=event_category,
                topic=topic,
                partition=partition,
                offset=offset,
                payload=event_json,  # Include full event for filtering
                transactionType=transaction_type
            )
        
        except Exception as e:
            logger.error(f"Error transforming event: {e}")
            return None
    
    def _map_entity_to_topic(self, entity_name: str, event_type: str) -> str:
        """Map entity name to Temenos-style topic name."""
        entity_lower = entity_name.lower()
        event_type_lower = event_type.lower()
        
        # Map FBNK_CUSTOMER to customer topics
        if "customer" in entity_lower or "customer" in event_type_lower:
            if "created" in event_type_lower or "write" in event_type_lower:
                return "temenos.party.customers.created"
            return "temenos.party.customers.updated"
        
        # Map account entities
        if "account" in entity_lower:
            if "opened" in event_type_lower or "created" in event_type_lower:
                return "temenos.holdings.accounts.opened"
            return "temenos.holdings.accounts.updated"
        
        # Map payment entities
        if "payment" in entity_lower or "payment" in event_type_lower:
            if "initiated" in event_type_lower:
                return "temenos.order.payments.initiated"
            if "completed" in event_type_lower:
                return "temenos.order.payments.completed"
            return "temenos.order.payments.updated"
        
        # Default: use entity name with temenos prefix
        return f"temenos.data.{entity_name.lower()}"
    
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
        data_keywords = ["sync", "replicated", "data.", "cdc", "change", "data_event"]
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
        
        # Check eventContext in data
        if isinstance(data, dict):
            event_context = data.get("eventContext", [])
            if isinstance(event_context, list) and len(event_context) > 0:
                tx_type = event_context[0].get("transactionType")
                if tx_type:
                    return tx_type
        
        return None
    
    async def get_events(
        self,
        customer_id: Optional[str] = None,
        topic: Optional[str] = None,
        since: Optional[datetime] = None,
        limit: Optional[int] = None
    ) -> EventHubResponse:
        """
        Get events from the buffer, optionally filtered by customerId.
        
        Args:
            customer_id: Filter events by entityid (customerId)
            topic: Filter by topic name
            since: Only return events after this time
            limit: Maximum number of events to return
        
        Returns:
            EventHubResponse with filtered KafkaEvents
        """
        try:
            async with self._lock:
                # Convert deque to list (newest first)
                events = list(self._buffer)
            
            # Apply filters
            filtered_events = []
            for event in events:
                # Filter by customer_id (entityid in payload)
                if customer_id:
                    event_entity_id = event.payload.get("entityid", "")
                    if str(event_entity_id) != str(customer_id):
                        continue
                
                # Filter by topic
                if topic and event.topic != topic:
                    continue
                
                # Filter by timestamp
                if since:
                    event_dt = datetime.fromtimestamp(event.timestamp / 1000)
                    if event_dt < since:
                        continue
                
                filtered_events.append(event)
            
            # Sort by timestamp (newest first)
            filtered_events.sort(key=lambda e: e.timestamp, reverse=True)
            
            # Apply limit
            if limit:
                filtered_events = filtered_events[:limit]
            
            return EventHubResponse(
                success=True,
                events=filtered_events,
                total=len(filtered_events),
                metadata={
                    "buffer_size": len(self._buffer),
                    "filters": {
                        "customer_id": customer_id,
                        "topic": topic,
                        "since": since.isoformat() if since else None
                    }
                }
            )
        
        except Exception as e:
            logger.error(f"Error getting events: {e}")
            return EventHubResponse(
                success=False,
                error=str(e)
            )
    
    async def get_topics(self) -> Dict[str, Any]:
        """Get available topics from buffered events."""
        try:
            async with self._lock:
                topics = set(event.topic for event in self._buffer)
            
            return {
                "success": True,
                "topics": sorted(list(topics))
            }
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    async def health_check(self) -> Dict[str, Any]:
        """Check Event Hub consumer health."""
        try:
            is_healthy = self._running and self._client is not None
            buffer_size = len(self._buffer) if self._buffer else 0
            
            return {
                "status": "healthy" if is_healthy else "unhealthy",
                "running": self._running,
                "buffer_size": buffer_size,
                "topic": settings.EVENTHUB_NAME,
                "consumer_group": settings.EVENTHUB_CONSUMER_GROUP
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
eventhub_service = EventHubService()


def get_eventhub_service() -> EventHubService:
    """Dependency injection for FastAPI."""
    return eventhub_service

