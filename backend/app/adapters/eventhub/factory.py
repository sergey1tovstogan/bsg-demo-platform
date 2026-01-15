"""
EventHub Adapter Factory

Factory for creating EventHub adapter instances based on configuration.
Follows singleton pattern for adapter lifecycle management.
"""

from typing import Optional
from app.adapters.eventhub.base import EventHubAdapter
from app.adapters.eventhub.eventhub_adapter import AzureEventHubAdapter
from app.core.config import settings
from app.core.logging import get_logger

logger = get_logger(__name__)

# Global adapter instance (singleton)
_eventhub_adapter: Optional[EventHubAdapter] = None


def get_eventhub_adapter() -> EventHubAdapter:
    """
    Get EventHub adapter instance (singleton).

    Returns the global EventHub adapter instance, creating it if it doesn't exist.
    Currently supports Azure Event Hub, but can be extended to support other
    providers (Kafka, AWS EventBridge, etc.) based on configuration.

    Returns:
        EventHubAdapter instance based on configuration

    Raises:
        ValueError: If configured adapter type is not supported
    """
    global _eventhub_adapter

    if _eventhub_adapter is None:
        # Determine adapter type from configuration
        # For now, only Azure Event Hub is supported
        # Future: Could add EVENTHUB_TYPE setting for other providers
        adapter_type = getattr(settings, 'EVENTHUB_TYPE', 'azure').lower()

        if adapter_type == 'azure':
            _eventhub_adapter = AzureEventHubAdapter()
            logger.info("Using Azure EventHub adapter")
        else:
            raise ValueError(f"Unsupported EventHub adapter type: {adapter_type}")

    return _eventhub_adapter
