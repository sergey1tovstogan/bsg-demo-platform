"""
Azure Event Hub Adapter Implementation

Implements EventHub adapter for Azure Event Hub following BSG Platform patterns.
All Azure SDK imports and Event Hub-specific logic are encapsulated here.
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

from app.adapters.eventhub.base import EventHubAdapter
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


# =============================================================================
# Azure Event Hub Adapter
# =============================================================================

class AzureEventHubAdapter(EventHubAdapter):
    """
    Azure Event Hub adapter implementation.

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

    async def start(self, force_reload_config: bool = False) -> None:
        """
        Start the Event Hub consumer with hybrid config (MongoDB + .env fallback).
        
        Args:
            force_reload_config: If True, reload config from MongoDB even if already loaded
        """
        if self._running:
            logger.warning("Event Hub consumer is already running")
            return

        # Ensure we're not running before starting
        self._running = False

        # Try to get config from MongoDB first, then fallback to .env
        # Always reload from MongoDB to get latest config (useful when config is added via API)
        config = None
        try:
            from app.api.settings import get_eventhub_config_from_db
            config = await get_eventhub_config_from_db()
            if config:
                logger.info("EventHub config loaded from MongoDB")
            else:
                logger.debug("No EventHub config found in MongoDB")
        except Exception as e:
            logger.warning(f"Failed to get config from MongoDB: {e}, trying .env fallback")
            config = None

        # Fallback to direct .env reading if hybrid config failed
        if not config:
            if not settings.EVENTHUB_CONNECTION_STRING:
                error_msg = "EVENTHUB_CONNECTION_STRING not configured in MongoDB or .env - Event Hub consumer cannot start. Please configure it via /api/v1/settings/eventhub/config endpoint or set EVENTHUB_CONNECTION_STRING environment variable."
                logger.error(error_msg)
                raise ValueError(error_msg)
            config = {
                "connection_string": settings.EVENTHUB_CONNECTION_STRING,
                "name": settings.EVENTHUB_NAME,
                "consumer_group": settings.EVENTHUB_CONSUMER_GROUP,
                "buffer_size": settings.EVENTHUB_BUFFER_SIZE
            }
            logger.info("EventHub config loaded from .env")

        # Validate required config
        if not config.get("connection_string"):
            error_msg = "EventHub connection_string not configured - Event Hub consumer cannot start. Please configure it via /api/v1/settings/eventhub/config endpoint or set EVENTHUB_CONNECTION_STRING environment variable."
            logger.error(error_msg)
            raise ValueError(error_msg)

        # Validate eventhub name
        if not config.get("name"):
            error_msg = "EventHub name not configured - Event Hub consumer cannot start"
            logger.error(error_msg)
            raise ValueError(error_msg)

        try:
            logger.info(f"Initializing EventHub client for: {config['name']}")
            self._client = EventHubConsumerClient.from_connection_string(
                conn_str=config["connection_string"],
                consumer_group=config.get("consumer_group", "$Default"),
                eventhub_name=config["name"]
            )

            self._running = True
            self._consumer_task = asyncio.create_task(self._consume_events())
            logger.info(f"Event Hub consumer started successfully for topic: {config['name']}")

        except Exception as e:
            logger.error(f"Failed to start Event Hub consumer: {e}", exc_info=True)
            self._running = False
            self._client = None
            # Re-raise to let caller know startup failed
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

    async def get_events(
        self,
        customer_id: Optional[str] = None,
        topic: Optional[str] = None,
        limit: int = 100,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve filtered events from Event Hub buffer.

        Args:
            customer_id: Filter events by entityid (customerId)
            topic: Filter by topic name
            limit: Maximum number of events to return (default: 100)
            start_time: Only return events after this time
            end_time: Only return events before this time

        Returns:
            List of event dictionaries matching the filter criteria
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

                # Filter by start_time
                if start_time:
                    event_dt = datetime.fromtimestamp(event.timestamp / 1000)
                    if event_dt < start_time:
                        continue

                # Filter by end_time
                if end_time:
                    event_dt = datetime.fromtimestamp(event.timestamp / 1000)
                    if event_dt > end_time:
                        continue

                filtered_events.append(event)

            # Sort by timestamp (newest first)
            filtered_events.sort(key=lambda e: e.timestamp, reverse=True)

            # Apply limit
            if limit:
                filtered_events = filtered_events[:limit]

            # Convert to dict format
            return [event.model_dump() for event in filtered_events]

        except Exception as e:
            logger.error(f"Error getting events: {e}")
            raise

    async def get_topics(self) -> List[str]:
        """Get list of available event topics from buffered events."""
        try:
            async with self._lock:
                topics = set(event.topic for event in self._buffer)

            return sorted(list(topics))

        except Exception as e:
            logger.error(f"Error getting topics: {e}")
            raise

    async def health_check(self) -> Dict[str, Any]:
        """Check Event Hub adapter health and connection status."""
        try:
            is_healthy = self._running and self._client is not None
            buffer_size = len(self._buffer) if self._buffer else 0

            # Get last event timestamp if available
            last_event_time = None
            if self._buffer:
                async with self._lock:
                    if len(self._buffer) > 0:
                        last_event = max(self._buffer, key=lambda e: e.timestamp)
                        last_event_time = datetime.fromtimestamp(last_event.timestamp / 1000).isoformat()

            return {
                "status": "healthy" if is_healthy else "unhealthy",
                "connected": self._running,
                "running": self._running,  # Frontend expects this field
                "events_buffered": buffer_size,
                "topic": settings.EVENTHUB_NAME,
                "consumer_group": settings.EVENTHUB_CONSUMER_GROUP,
                "last_event_time": last_event_time,
                "message": "Event Hub consumer is running" if is_healthy else "Event Hub consumer is not running"
            }

        except Exception as e:
            return {
                "status": "error",
                "connected": False,
                "running": False,  # Frontend expects this field
                "error": str(e),
                "message": f"Health check failed: {str(e)}"
            }

    # =========================================================================
    # Private Methods
    # =========================================================================

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
                    logger.info(f"Buffered event: {kafka_event.id} | entityid={kafka_event.payload.get('entityid', 'N/A')} | entityname={kafka_event.payload.get('entityname', 'N/A')} | topic={kafka_event.topic} | type={kafka_event.type}")
                else:
                    # Log why event was skipped (for debugging)
                    logger.debug(f"Event skipped during transformation (binary/non-JSON)")

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
            # Parse event body (JSON) - handle various formats
            event_json = None
            
            # Get raw bytes from body (body is an iterator/generator)
            try:
                body_bytes = b"".join(event_data.body)
            except Exception as e:
                logger.warning(f"Failed to read event body: {e}")
                body_bytes = None
            
            if not body_bytes:
                logger.debug("Event has no body data - skipping")
                return None
            
            # Log raw event info for debugging
            first_bytes = body_bytes[:50] if len(body_bytes) > 50 else body_bytes
            logger.info(f"Raw event received: length={len(body_bytes)}, first_bytes={first_bytes!r}")
            
            # Check for binary/Avro data (common prefixes: 0x00, 0xac, 0xc3, 0xc4)
            if body_bytes[0] in (0x00, 0xac, 0xc3, 0xc4):
                logger.info(f"Skipping binary event (likely Avro serialized): first byte 0x{body_bytes[0]:02x}, length={len(body_bytes)}")
                return None
            
            # Try to decode as UTF-8 and parse as JSON
            try:
                body_str = body_bytes.decode('utf-8')
                event_json = json.loads(body_str)
            except (UnicodeDecodeError, json.JSONDecodeError) as e:
                logger.warning(f"Event body could not be parsed as JSON: {e}, raw={body_bytes[:200]!r}")
                return None
            
            if not isinstance(event_json, dict):
                logger.warning(f"Event body is not a JSON object - skipping: {type(event_json)}")
                return None

            # Extract fields
            event_id = event_json.get("id") or event_json.get("correlationid") or f"evt_{int(datetime.now().timestamp() * 1000)}"
            entity_id = event_json.get("entityid", "")
            entity_name = event_json.get("entityname", "")
            event_type = event_json.get("type", "")
            subject = event_json.get("subject", "")
            
            # Debug logging to trace events
            logger.info(f"Processing event: entityid={entity_id}, entityname={entity_name}, type={event_type}, subject={subject}")

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

            # Determine event category - use subject field for classification
            subject = event_json.get("subject", "")
            event_category = self._categorize_event(event_type, event_json.get("data", {}), subject)

            # Extract partition and offset
            partition = partition_context.partition_id if partition_context and hasattr(partition_context, 'partition_id') else 0
            offset = int(event_data.offset) if hasattr(event_data, 'offset') and event_data.offset else 0

            # Extract transaction type (pass entity_name for better matching)
            transaction_type = self._extract_transaction_type(event_type, event_json.get("data", {}), entity_name)

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

        # Map account entities (AA_ARRANGEMENT, FBNK_AA_ARR, etc.)
        # Temenos uses "AA" prefix for Arrangement Architecture (accounts)
        if "account" in entity_lower or "aa_" in entity_lower or "_aa_" in entity_lower or entity_lower.startswith("aa"):
            if "opened" in event_type_lower or "created" in event_type_lower or "write" in event_type_lower:
                return "temenos.holdings.accounts.opened"
            return "temenos.holdings.accounts.updated"

        # Map payment entities (FUNDS.TRANSFER, etc.)
        if "payment" in entity_lower or "payment" in event_type_lower or "funds" in entity_lower or "transfer" in entity_lower:
            if "initiated" in event_type_lower:
                return "temenos.order.payments.initiated"
            if "completed" in event_type_lower:
                return "temenos.order.payments.completed"
            return "temenos.order.payments.updated"

        # Default: use entity name with temenos prefix
        return f"temenos.data.{entity_name.lower()}"

    def _categorize_event(self, event_type: str, data: Any, subject: str = "") -> str:
        """
        Categorize event as 'business' or 'data' based on subject field.
        
        Classification rules (based on subject field):
        - subject == "dataevent" -> data event
        - subject == "businessevent" -> business event
        - Fallback: check event_type keywords
        """
        # Primary classification: use subject field
        subject_lower = subject.lower() if subject else ""
        
        if subject_lower == "dataevent":
            return "data"
        
        if subject_lower == "businessevent":
            return "business"
        
        # Fallback: check event_type keywords if subject not recognized
        # Check data_keywords FIRST to avoid misclassifying data events as business (#49)
        event_type_lower = event_type.lower()

        # Data events - sync/replication (check first to avoid false business match)
        data_keywords = ["sync", "replicated", "data.", "cdc", "change", "data_event", "dataevent"]
        for keyword in data_keywords:
            if keyword in event_type_lower:
                return "data"

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

        # Default to data for unknown types (most Temenos events are data events)
        return "data"

    def _extract_transaction_type(self, event_type: str, data: Any, entity_name: str = "") -> Optional[str]:
        """Extract transaction type from event for UI display."""
        event_type_lower = event_type.lower()
        entity_lower = entity_name.lower() if entity_name else ""

        if "customer" in event_type_lower or "customer" in entity_lower:
            return "CREATE_CUSTOMER"
        # Check for AA (Arrangement Architecture) entities - these are accounts
        if "account" in event_type_lower or "account" in entity_lower or "aa_" in entity_lower or "_aa_" in entity_lower or entity_lower.startswith("aa"):
            return "OPEN_ACCOUNT"
        if "payment" in event_type_lower or "funds" in entity_lower or "transfer" in entity_lower:
            return "SEND_PAYMENT"

        # Check eventContext in data
        if isinstance(data, dict):
            event_context = data.get("eventContext", [])
            if isinstance(event_context, list) and len(event_context) > 0:
                tx_type = event_context[0].get("transactionType")
                if tx_type:
                    return tx_type

        return None
