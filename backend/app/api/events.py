"""
Events API - Proxy endpoints for Event Store API

Provides access to Azure Event Hub events via the Event Store API.
Transforms CloudEvents to KafkaEvent format for frontend consumption.
"""

from typing import Optional, List
from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel

from app.core.logging import get_logger
from app.services.event_store_service import (
    EventStoreService,
    EventStoreResponse,
    KafkaEvent,
    get_event_store_service
)

logger = get_logger(__name__)

router = APIRouter(prefix="/events", tags=["Events"])


# =============================================================================
# Response Models
# =============================================================================

class EventsResponse(BaseModel):
    """Response model for events endpoint."""
    success: bool
    events: List[KafkaEvent] = []
    total: int = 0
    error: Optional[str] = None
    source: str = "event_store"


class TopicsResponse(BaseModel):
    """Response model for topics endpoint."""
    success: bool
    topics: List[str] = []
    error: Optional[str] = None


class ExploreResponse(BaseModel):
    """Response model for API exploration."""
    status: str
    endpoints: List[dict] = []
    base_response: Optional[dict] = None
    api_response: Optional[dict] = None
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Response model for Event Store health check."""
    status: str
    endpoint: Optional[str] = None
    response_time_ms: Optional[float] = None
    error: Optional[str] = None


# =============================================================================
# Event Store API Endpoints
# =============================================================================

@router.get("", response_model=EventsResponse)
async def get_events(
    topic: Optional[str] = Query(None, description="Filter by topic name"),
    since: Optional[str] = Query(None, description="ISO datetime to fetch events since"),
    limit: int = Query(100, ge=1, le=500, description="Maximum number of events"),
    offset: Optional[int] = Query(None, ge=0, description="Starting offset"),
    event_store: EventStoreService = Depends(get_event_store_service)
) -> EventsResponse:
    """
    Fetch events from Azure Event Hub via Event Store API.
    
    Events are transformed from CloudEvents format to internal KafkaEvent format
    for display in the Kafka Event Stream component.
    
    Args:
        topic: Optional topic filter (e.g., "temenos.party.customers.created")
        since: ISO datetime string to fetch events since (default: last 24 hours)
        limit: Maximum number of events to return (1-500, default: 100)
        offset: Starting offset for pagination
    
    Returns:
        EventsResponse with list of KafkaEvents
    """
    logger.info(f"Fetching events: topic={topic}, since={since}, limit={limit}")
    
    # Parse since datetime
    since_dt = None
    if since:
        try:
            since_dt = datetime.fromisoformat(since.replace("Z", "+00:00"))
        except ValueError:
            raise HTTPException(
                status_code=400,
                detail=f"Invalid datetime format for 'since': {since}. Use ISO format."
            )
    
    try:
        result = await event_store.fetch_events(
            topic=topic,
            since=since_dt,
            limit=limit,
            offset=offset
        )
        
        return EventsResponse(
            success=result.success,
            events=result.events,
            total=result.total,
            error=result.error,
            source="event_store"
        )
        
    except Exception as e:
        logger.error(f"Error fetching events: {e}")
        return EventsResponse(
            success=False,
            error=f"Failed to fetch events: {str(e)}",
            source="event_store"
        )


@router.get("/recent", response_model=EventsResponse)
async def get_recent_events(
    minutes: int = Query(30, ge=1, le=1440, description="Fetch events from last N minutes"),
    limit: int = Query(50, ge=1, le=200, description="Maximum number of events"),
    event_store: EventStoreService = Depends(get_event_store_service)
) -> EventsResponse:
    """
    Fetch recent events from the last N minutes.
    
    Convenience endpoint for polling recent events for live updates.
    
    Args:
        minutes: Number of minutes to look back (1-1440, default: 30)
        limit: Maximum events to return (1-200, default: 50)
    
    Returns:
        EventsResponse with recent KafkaEvents
    """
    logger.debug(f"Fetching recent events: last {minutes} minutes, limit={limit}")
    
    since_dt = datetime.utcnow() - timedelta(minutes=minutes)
    
    try:
        result = await event_store.fetch_events(
            since=since_dt,
            limit=limit
        )
        
        return EventsResponse(
            success=result.success,
            events=result.events,
            total=result.total,
            error=result.error,
            source="event_store"
        )
        
    except Exception as e:
        logger.error(f"Error fetching recent events: {e}")
        return EventsResponse(
            success=False,
            error=f"Failed to fetch recent events: {str(e)}",
            source="event_store"
        )


@router.get("/topics", response_model=TopicsResponse)
async def get_topics(
    event_store: EventStoreService = Depends(get_event_store_service)
) -> TopicsResponse:
    """
    Get list of available topics from Event Store.
    
    Returns:
        TopicsResponse with available topic names
    """
    logger.info("Fetching available topics")
    
    try:
        result = await event_store.get_topics()
        
        topics = []
        if result.get("success"):
            raw_topics = result.get("topics", [])
            if isinstance(raw_topics, list):
                topics = [str(t) for t in raw_topics]
            elif isinstance(raw_topics, dict):
                topics = list(raw_topics.keys())
        
        return TopicsResponse(
            success=result.get("success", False),
            topics=topics,
            error=result.get("error")
        )
        
    except Exception as e:
        logger.error(f"Error fetching topics: {e}")
        return TopicsResponse(
            success=False,
            error=f"Failed to fetch topics: {str(e)}"
        )


@router.get("/explore", response_model=ExploreResponse)
async def explore_api(
    event_store: EventStoreService = Depends(get_event_store_service)
) -> ExploreResponse:
    """
    Explore the Event Store API to discover available endpoints.
    
    Use this endpoint during development to understand the Event Store API
    structure, available endpoints, and authentication requirements.
    
    Returns:
        ExploreResponse with API exploration results
    """
    logger.info("Exploring Event Store API")
    
    try:
        result = await event_store.explore_api()
        
        return ExploreResponse(
            status=result.get("status", "unknown"),
            endpoints=result.get("endpoints", []),
            base_response=result.get("base_response"),
            api_response=result.get("api_response"),
            error=result.get("error")
        )
        
    except Exception as e:
        logger.error(f"Error exploring API: {e}")
        return ExploreResponse(
            status="error",
            error=f"Exploration failed: {str(e)}"
        )


@router.get("/health", response_model=HealthResponse)
async def event_store_health(
    event_store: EventStoreService = Depends(get_event_store_service)
) -> HealthResponse:
    """
    Check Event Store API health status.
    
    Returns:
        HealthResponse with connection status
    """
    try:
        result = await event_store.health_check()
        
        return HealthResponse(
            status=result.get("status", "unknown"),
            endpoint=result.get("endpoint"),
            response_time_ms=result.get("response_time_ms"),
            error=result.get("error")
        )
        
    except Exception as e:
        logger.error(f"Event store health check failed: {e}")
        return HealthResponse(
            status="error",
            error=str(e)
        )


# =============================================================================
# Mock Events Endpoint (for development/testing)
# =============================================================================

@router.get("/mock", response_model=EventsResponse)
async def get_mock_events(
    count: int = Query(10, ge=1, le=50, description="Number of mock events to generate")
) -> EventsResponse:
    """
    Generate mock events for testing the frontend.
    
    Useful when Event Store API is not available or during development.
    
    Args:
        count: Number of mock events to generate (1-50)
    
    Returns:
        EventsResponse with mock KafkaEvents
    """
    import random
    
    topics = [
        "temenos.party.customers.created",
        "temenos.holdings.accounts.opened",
        "temenos.order.payments.initiated",
        "temenos.order.payments.completed",
        "temenos.data.accounts.sync",
        "temenos.data.payments.sync"
    ]
    
    event_types = ["business", "data"]
    transaction_types = ["CREATE_CUSTOMER", "OPEN_ACCOUNT", "SEND_PAYMENT", None]
    
    events = []
    base_time = datetime.utcnow()
    
    for i in range(count):
        topic = random.choice(topics)
        event_type = "data" if "data." in topic else "business"
        
        # Determine transaction type based on topic
        if "customer" in topic:
            tx_type = "CREATE_CUSTOMER"
        elif "account" in topic:
            tx_type = "OPEN_ACCOUNT"
        elif "payment" in topic:
            tx_type = "SEND_PAYMENT"
        else:
            tx_type = None
        
        event = KafkaEvent(
            id=f"mock_{i}_{int(base_time.timestamp() * 1000)}",
            timestamp=int((base_time - timedelta(seconds=i * 10)).timestamp() * 1000),
            type=event_type,
            topic=topic,
            partition=random.randint(0, 3),
            offset=1000 + i,
            payload={
                "eventType": topic.split(".")[-1],
                "entityId": f"ENT{random.randint(10000, 99999)}",
                "timestamp": base_time.isoformat(),
                "data": {
                    "field1": f"value_{i}",
                    "amount": random.randint(100, 10000) if "payment" in topic else None
                }
            },
            transactionType=tx_type
        )
        events.append(event)
    
    return EventsResponse(
        success=True,
        events=events,
        total=count,
        source="mock"
    )

