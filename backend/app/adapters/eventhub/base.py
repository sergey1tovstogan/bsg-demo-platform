"""
EventHub Adapter Base Interface

Abstract base class for Event Hub adapters following BSG Platform adapter pattern.
Implementations must provide event streaming, filtering, and health check capabilities.
"""

from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from datetime import datetime


class EventHubAdapter(ABC):
    """
    Abstract base class for Event Hub adapters.

    All EventHub implementations must inherit from this class and implement
    all abstract methods. This ensures consistent interface across different
    EventHub providers (Azure, Kafka, etc.).
    """

    @abstractmethod
    async def start(self) -> None:
        """
        Initialize and start Event Hub consumer.

        This method should:
        - Initialize the Event Hub client/consumer
        - Start background tasks for event streaming
        - Set up connection and authentication

        Raises:
            Exception: If initialization or connection fails
        """
        pass

    @abstractmethod
    async def stop(self) -> None:
        """
        Stop and cleanup Event Hub consumer.

        This method should:
        - Stop background tasks gracefully
        - Close Event Hub connections
        - Clean up resources
        """
        pass

    @abstractmethod
    async def get_events(
        self,
        customer_id: Optional[str] = None,
        topic: Optional[str] = None,
        limit: int = 100,
        start_time: Optional[datetime] = None,
        end_time: Optional[datetime] = None
    ) -> List[Dict[str, Any]]:
        """
        Retrieve filtered events from Event Hub.

        Args:
            customer_id: Optional customer ID to filter events
            topic: Optional topic name to filter events
            limit: Maximum number of events to return (default: 100)
            start_time: Optional start time for time-range filtering
            end_time: Optional end time for time-range filtering

        Returns:
            List of event dictionaries matching the filter criteria.
            Each event should have at minimum:
            - id: Unique event identifier
            - timestamp: Event timestamp (milliseconds since epoch)
            - type: Event type ('business' or 'data')
            - topic: Event topic/stream name
            - payload: Event payload data

        Raises:
            Exception: If event retrieval fails
        """
        pass

    @abstractmethod
    async def get_topics(self) -> List[str]:
        """
        Get list of available event topics.

        Returns:
            List of topic names available in the Event Hub

        Raises:
            Exception: If topic retrieval fails
        """
        pass

    @abstractmethod
    async def health_check(self) -> Dict[str, Any]:
        """
        Check Event Hub adapter health and connection status.

        Returns:
            Dictionary with health status information:
            - status: 'healthy' | 'unhealthy' | 'degraded'
            - connected: Boolean connection status
            - message: Optional status message
            - Additional implementation-specific health metrics

        Example:
            {
                "status": "healthy",
                "connected": True,
                "events_buffered": 42,
                "last_event_time": "2024-01-01T12:00:00Z"
            }
        """
        pass
