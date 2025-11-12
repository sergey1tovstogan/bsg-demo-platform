"""
Component Content API Endpoints

Provides endpoints for retrieving component content.
"""

from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_

from app.core.database import get_db, paginate_query, create_pagination_metadata
from app.models.content import Content
from app.core.logging import get_logger

logger = get_logger(__name__)

router = APIRouter(tags=["Components"])


@router.get("/components/{component_id}/content", status_code=status.HTTP_200_OK)
async def get_component_content(
    component_id: str,
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    type: Optional[str] = Query(None, description="Filter by content type"),
    db: Session = Depends(get_db)
):
    """
    Get content for a specific component.

    Args:
        component_id: Component identifier
        page: Page number (1-indexed)
        page_size: Items per page
        type: Optional content type filter
        db: Database session

    Returns:
        Paginated list of content items
    """
    try:
        # Build query
        query = db.query(Content).filter(Content.component_id == component_id)
        
        # Apply type filter if provided
        if type:
            query = query.filter(Content.type == type)
        
        # Order by order field
        query = query.order_by(Content.order.asc())
        
        # Paginate
        items, total_count, total_pages = paginate_query(query, page, page_size)
        
        # Convert to dict
        content_list = [item.to_dict() for item in items]
        
        # Create response
        return {
            "success": True,
            "data": content_list,
            "pagination": create_pagination_metadata(page, page_size, total_count, total_pages)
        }
    except Exception as e:
        logger.error(f"Error fetching content for component {component_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch content: {str(e)}"
        )


@router.get("/components/{component_id}/content/{content_id}", status_code=status.HTTP_200_OK)
async def get_content_item(
    component_id: str,
    content_id: str,
    db: Session = Depends(get_db)
):
    """
    Get a specific content item.

    Args:
        component_id: Component identifier
        content_id: Content identifier
        db: Database session

    Returns:
        Content item
    """
    try:
        content = db.query(Content).filter(
            and_(
                Content.component_id == component_id,
                Content.content_id == content_id
            )
        ).first()
        
        if not content:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Content not found: {content_id}"
            )
        
        return {
            "success": True,
            "data": content.to_dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching content item {content_id}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch content item: {str(e)}"
        )

