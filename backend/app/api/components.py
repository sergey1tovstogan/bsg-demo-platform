"""
Components API Endpoints

Provides endpoints for retrieving component and content data.
"""

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Dict, Any
from app.core.database import get_db
from app.core.logging import get_logger
from app.models.component import Component
from app.models.content import Content

router = APIRouter(prefix="/components", tags=["components"])
logger = get_logger(__name__)


@router.get("/{component_id}/content")
async def get_component_content(
    component_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    type: str = Query(None, description="Filter by content type"),
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get content for a specific component with pagination.

    Args:
        component_id: Component identifier
        page: Page number (starting from 1)
        page_size: Number of items per page
        type: Optional filter by content type
        db: Database session

    Returns:
        Paginated content response with metadata
    """
    logger.info(f"Fetching content for component: {component_id}")

    # Check if component exists
    component = db.query(Component).filter(Component.component_id == component_id).first()
    if not component:
        raise HTTPException(status_code=404, detail=f"Component '{component_id}' not found")

    # Build query
    query = db.query(Content).filter(Content.component_id == component_id)

    # Apply type filter if provided
    if type:
        query = query.filter(Content.type == type)

    # Order by order field
    query = query.order_by(Content.order)

    # Get total count
    total_items = query.count()

    # Apply pagination
    offset = (page - 1) * page_size
    contents = query.offset(offset).limit(page_size).all()

    # Calculate pagination metadata
    total_pages = (total_items + page_size - 1) // page_size
    has_next = page < total_pages
    has_previous = page > 1

    # Convert to dict
    content_list = []
    for content in contents:
        content_dict = {
            "content_id": content.content_id,
            "title": content.title,
            "type": content.type.value,
            "order": content.order,
            "body": content.body,
            "metadata": content.content_metadata,
            "created_at": content.created_at.isoformat() if content.created_at else None,
            "updated_at": content.updated_at.isoformat() if content.updated_at else None,
        }
        content_list.append(content_dict)

    return {
        "success": True,
        "data": content_list,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total_items": total_items,
            "total_pages": total_pages,
            "has_next": has_next,
            "has_previous": has_previous
        },
        "metadata": {
            "timestamp": "2025-11-12T00:00:00Z",
            "request_id": "auto-generated"
        }
    }


@router.get("")
async def get_components(
    db: Session = Depends(get_db)
) -> Dict[str, Any]:
    """
    Get all components.

    Args:
        db: Database session

    Returns:
        List of all components
    """
    logger.info("Fetching all components")

    components = db.query(Component).all()

    component_list = []
    for component in components:
        component_dict = {
            "component_id": component.component_id,
            "name": component.name,
            "description": component.description,
            "status": component.status.value
        }
        component_list.append(component_dict)

    return {
        "success": True,
        "data": component_list,
        "metadata": {
            "timestamp": "2025-11-12T00:00:00Z",
            "request_id": "auto-generated"
        }
    }
