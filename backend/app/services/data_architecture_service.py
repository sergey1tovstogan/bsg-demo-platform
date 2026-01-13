"""
Data Architecture Service

Business logic layer for the data-architecture component.
Provides event streaming and simulation support using the EventHub adapter.
"""

from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta

from app.adapters.eventhub import get_eventhub_adapter
from app.core.logging import get_logger

logger = get_logger(__name__)


class DataArchitectureService:
    """
    Service for data-architecture component business logic.

    Provides methods for:
    - Retrieving simulation events with filtering
    - Getting recent events within a time window
    - Listing available event topics
    - Health checking the event stream
    """

    def __init__(self):
        """Initialize service with EventHub adapter."""
        self.eventhub_adapter = get_eventhub_adapter()

    async def get_simulation_events(
        self,
        customer_id: Optional[str] = None,
        topic: Optional[str] = None,
        limit: int = 100
    ) -> Dict[str, Any]:
        """
        Get events for simulation display.

        Args:
            customer_id: Filter events by customer ID (entityid)
            topic: Filter events by topic name
            limit: Maximum number of events to return

        Returns:
            Dictionary with success status, events list, total count, and metadata

        Example:
            {
                "success": True,
                "events": [...],
                "total": 42,
                "source": "eventhub"
            }
        """
        try:
            events = await self.eventhub_adapter.get_events(
                customer_id=customer_id,
                topic=topic,
                limit=limit
            )

            return {
                "success": True,
                "events": events,
                "total": len(events),
                "source": "eventhub"
            }

        except Exception as e:
            logger.error(f"Error getting simulation events: {e}")
            return {
                "success": False,
                "events": [],
                "total": 0,
                "error": str(e)
            }

    async def get_recent_events(
        self,
        minutes: int = 5,
        limit: int = 100,
        customer_id: Optional[str] = None,
        topic: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Get events from the last N minutes.

        Args:
            minutes: Time window in minutes (default: 5)
            limit: Maximum number of events to return
            customer_id: Optional customer ID filter
            topic: Optional topic filter

        Returns:
            Dictionary with success status, events list, and metadata
        """
        try:
            start_time = datetime.now() - timedelta(minutes=minutes)

            events = await self.eventhub_adapter.get_events(
                customer_id=customer_id,
                topic=topic,
                start_time=start_time,
                limit=limit
            )

            return {
                "success": True,
                "events": events,
                "total": len(events),
                "time_window_minutes": minutes
            }

        except Exception as e:
            logger.error(f"Error getting recent events: {e}")
            return {
                "success": False,
                "events": [],
                "total": 0,
                "error": str(e)
            }

    async def get_event_topics(self) -> List[str]:
        """
        Get list of available event topics.

        Returns:
            List of topic names currently available in the event buffer

        Raises:
            Exception: If topic retrieval fails
        """
        try:
            topics = await self.eventhub_adapter.get_topics()
            return topics

        except Exception as e:
            logger.error(f"Error getting event topics: {e}")
            raise

    async def check_event_stream_health(self) -> Dict[str, Any]:
        """
        Check EventHub connection health and status.

        Returns:
            Dictionary with health status information including:
            - status: 'healthy' | 'unhealthy' | 'error'
            - connected: Boolean connection status
            - events_buffered: Number of events in buffer
            - Additional adapter-specific metrics

        Example:
            {
                "status": "healthy",
                "connected": True,
                "events_buffered": 42,
                "last_event_time": "2024-01-01T12:00:00Z"
            }
        """
        try:
            health = await self.eventhub_adapter.health_check()
            return health

        except Exception as e:
            logger.error(f"Error checking event stream health: {e}")
            return {
                "status": "error",
                "connected": False,
                "error": str(e),
                "message": f"Health check failed: {str(e)}"
            }


# =============================================================================
# Global Instance (Singleton)
# =============================================================================

_service_instance: Optional[DataArchitectureService] = None


def get_data_architecture_service() -> DataArchitectureService:
    """
    Get DataArchitectureService singleton instance.

    Returns:
        DataArchitectureService instance
    """
    global _service_instance

    if _service_instance is None:
        _service_instance = DataArchitectureService()
        logger.debug("DataArchitectureService instance created")

    return _service_instance
