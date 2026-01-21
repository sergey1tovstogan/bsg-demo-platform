"""
Data Architecture Component API

Provides event streaming and demo endpoints for the data-architecture component.
Follows BSG Platform API conventions with component-specific routing.

API Pattern: /api/v1/components/data-architecture/*
"""

from typing import Optional, List
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from app.core.logging import get_logger
from app.services.data_architecture_service import get_data_architecture_service

logger = get_logger(__name__)

router = APIRouter(
    prefix="/components/data-architecture",
    tags=["Data Architecture"]
)


# =============================================================================
# Response Models
# =============================================================================

class EventsResponse(BaseModel):
    """Response model for events endpoints."""
    success: bool
    events: List[dict] = Field(default_factory=list)
    total: int = 0
    error: Optional[str] = None
    source: str = "eventhub"


class TopicsResponse(BaseModel):
    """Response model for topics endpoint."""
    success: bool
    topics: List[str] = Field(default_factory=list)
    error: Optional[str] = None


class HealthResponse(BaseModel):
    """Response model for health check endpoint."""
    status: str
    connected: bool
    running: Optional[bool] = None  # Frontend expects this field
    events_buffered: Optional[int] = None
    message: Optional[str] = None
    error: Optional[str] = None


# =============================================================================
# Event Streaming Endpoints
# =============================================================================

@router.get("/events", response_model=EventsResponse)
async def get_events(
    customerId: Optional[str] = Query(None, description="Filter events by customer ID (entityid)"),
    topic: Optional[str] = Query(None, description="Filter events by topic name"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of events to return")
):
    """
    Get filtered events from Event Hub.

    Retrieves events from the EventHub buffer with optional filtering by customer ID
    and topic. Events are returned in reverse chronological order (newest first).

    **Query Parameters:**
    - customerId: Customer ID to filter events (matches entityid field)
    - topic: Topic name to filter events
    - limit: Maximum number of events (1-1000, default: 100)

    **Example:**
    ```
    GET /api/v1/components/data-architecture/events?customerId=190579&limit=50
    ```
    """
    try:
        service = get_data_architecture_service()
        result = await service.get_simulation_events(
            customer_id=customerId,
            topic=topic,
            limit=limit
        )

        return EventsResponse(**result)

    except Exception as e:
        logger.error(f"Error getting events: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/events/recent", response_model=EventsResponse)
async def get_recent_events(
    minutes: int = Query(5, ge=1, le=60, description="Time window in minutes"),
    limit: int = Query(100, ge=1, le=1000, description="Maximum number of events to return"),
    customerId: Optional[str] = Query(None, description="Filter events by customer ID"),
    topic: Optional[str] = Query(None, description="Filter events by topic name")
):
    """
    Get events from the last N minutes.

    Retrieves recent events within a specified time window. Useful for displaying
    real-time event activity in simulations and demos.

    **Query Parameters:**
    - minutes: Time window in minutes (1-60, default: 5)
    - limit: Maximum number of events (1-1000, default: 100)
    - customerId: Optional customer ID filter
    - topic: Optional topic filter

    **Example:**
    ```
    GET /api/v1/components/data-architecture/events/recent?minutes=10&limit=20
    ```
    """
    try:
        service = get_data_architecture_service()
        result = await service.get_recent_events(
            minutes=minutes,
            limit=limit,
            customer_id=customerId,
            topic=topic
        )

        return EventsResponse(**result)

    except Exception as e:
        logger.error(f"Error getting recent events: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/events/topics", response_model=TopicsResponse)
async def get_event_topics():
    """
    Get list of available event topics.

    Returns a list of topic names currently available in the EventHub buffer.
    Useful for dynamic topic selection in the UI.

    **Example Response:**
    ```json
    {
        "success": true,
        "topics": [
            "temenos.party.customers.created",
            "temenos.holdings.accounts.opened",
            "temenos.order.payments.initiated"
        ]
    }
    ```
    """
    try:
        service = get_data_architecture_service()
        topics = await service.get_event_topics()

        return TopicsResponse(
            success=True,
            topics=topics
        )

    except Exception as e:
        logger.error(f"Error getting event topics: {e}")
        return TopicsResponse(
            success=False,
            error=str(e)
        )


@router.get("/events/health", response_model=HealthResponse)
async def check_event_health():
    """
    Health check for event streaming.

    Checks the health and connection status of the EventHub adapter.
    Returns buffer size, connection status, and last event timestamp.

    **Example Response:**
    ```json
    {
        "status": "healthy",
        "connected": true,
        "events_buffered": 42,
        "last_event_time": "2024-01-01T12:00:00Z",
        "message": "Event Hub consumer is running"
    }
    ```
    """
    try:
        service = get_data_architecture_service()
        health = await service.check_event_stream_health()

        return HealthResponse(**health)

    except Exception as e:
        logger.error(f"Error checking event health: {e}")
        return HealthResponse(
            status="error",
            connected=False,
            error=str(e),
            message=f"Health check failed: {str(e)}"
        )


@router.post("/events/start")
async def start_eventhub():
    """
    Start or restart the EventHub adapter.
    
    This endpoint can be used to manually start the EventHub adapter if it failed
    to start during application startup or if it was stopped.
    
    **Note:** If EventHub configuration is missing, configure it first via:
    POST /api/v1/settings/eventhub/config
    
    **Example Response:**
    ```json
    {
        "success": true,
        "message": "Event Hub adapter started successfully",
        "status": "healthy"
    }
    ```
    """
    try:
        service = get_data_architecture_service()
        result = await service.start_eventhub_adapter()
        
        if result.get("success"):
            return result
        else:
            error_msg = result.get("error", "Failed to start Event Hub adapter")
            # Provide helpful guidance if config is missing
            if "not configured" in error_msg.lower() or "connection_string" in error_msg.lower():
                error_msg += ". Please configure EventHub via POST /api/v1/settings/eventhub/config first."
            raise HTTPException(
                status_code=500,
                detail=error_msg
            )

    except HTTPException:
        raise
    except ValueError as e:
        # Handle configuration errors with helpful message
        error_msg = str(e)
        if "not configured" in error_msg.lower():
            error_msg += " Use POST /api/v1/settings/eventhub/config to configure it."
        logger.error(f"Error starting EventHub adapter: {e}")
        raise HTTPException(
            status_code=400,
            detail=error_msg
        )
    except Exception as e:
        logger.error(f"Error starting EventHub adapter: {e}")
        raise HTTPException(
            status_code=500,
            detail=f"Failed to start Event Hub adapter: {str(e)}"
        )


# =============================================================================
# Demo Endpoints
# =============================================================================

class DemoConfig(BaseModel):
    """Demo configuration response."""
    component_id: str = "data-architecture"
    demo_enabled: bool = True
    demo_type: str = "transaction-simulator"
    features: List[str] = Field(default_factory=lambda: [
        "event-streaming",
        "transaction-simulation", 
        "kafka-visualization"
    ])


@router.get("/demo", response_model=DemoConfig)
async def get_demo_configuration():
    """
    Get demo configuration for data-architecture component.
    
    Returns configuration used by the Transaction Simulator demo.
    """
    return DemoConfig()


# =============================================================================
# Debug Endpoints
# =============================================================================

@router.get("/events/debug")
async def debug_events():
    """
    Debug endpoint to see all buffered events with their raw structure.
    
    This helps troubleshoot why certain events may not be appearing in the UI.
    """
    try:
        service = get_data_architecture_service()
        events = await service.eventhub_adapter.get_events(limit=100)
        
        # Create detailed debug info for each event
        debug_info = []
        for event in events:
            debug_info.append({
                "id": event.get("id"),
                "entityid": event.get("payload", {}).get("entityid"),
                "entityname": event.get("payload", {}).get("entityname"),
                "type": event.get("type"),
                "topic": event.get("topic"),
                "transactionType": event.get("transactionType"),
                "subject": event.get("payload", {}).get("subject"),
                "payload_keys": list(event.get("payload", {}).keys()) if event.get("payload") else []
            })
        
        return {
            "success": True,
            "total_buffered": len(events),
            "events": debug_info
        }
        
    except Exception as e:
        logger.error(f"Error in debug endpoint: {e}")
        return {
            "success": False,
            "error": str(e)
        }


# @router.get("/content")
# async def get_component_content():
#     """Get component content from database."""
#     pass
