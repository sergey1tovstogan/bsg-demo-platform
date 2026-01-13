"""
EventHub Adapter Package

Provides EventHub connectivity following BSG Platform adapter pattern.
All Event Hub access must go through this adapter layer.
"""

from app.adapters.eventhub.base import EventHubAdapter
from app.adapters.eventhub.factory import get_eventhub_adapter

__all__ = ["EventHubAdapter", "get_eventhub_adapter"]
