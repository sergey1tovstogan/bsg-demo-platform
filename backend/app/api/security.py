"""
Security component API endpoints.
Handles slide search and retrieval from MongoDB collections.
"""

from fastapi import APIRouter, HTTPException, Query, Depends
from pydantic import BaseModel
from typing import List, Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
import base64

from app.core.database import get_database
from app.core.logging import get_logger

router = APIRouter(prefix="/components/security", tags=["security"])
logger = get_logger(__name__)


class SlideResponse(BaseModel):
    """Response model for a single slide."""
    slide_number: int
    slide_content: str  # Base64 encoded JPEG image
    content_type: str = "image/jpeg"


class SlideSearchResponse(BaseModel):
    """Response model for slide search results."""
    slides: List[SlideResponse]
    total_results: int
    query: str


class ParagraphResponse(BaseModel):
    """Response model for a single paragraph."""
    paragraph_number: int
    paragraph_content: str


class ParagraphSearchResponse(BaseModel):
    """Response model for paragraph search results."""
    paragraphs: List[ParagraphResponse]
    total_results: int
    query: str


@router.get("/slides/search")
async def search_slides(
    q: str = Query(..., description="Search query: 'p10' for first 10 slides, 'prg 10-20' for range"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Search slides from security slides collection.
    
    Query formats:
    - 'p10' or 'p15': Returns first 10 or 15 slides
    - 'prg 10-20': Returns slides from 10 to 20 (inclusive)
    
    Returns slides as base64-encoded JPEG images.
    """
    try:
        query_trimmed = q.strip().lower()
        slides = []
        
        # Parse query
        if query_trimmed.startswith('prg '):
            # Range query: prg 10-20
            try:
                range_part = query_trimmed[4:].strip()
                start, end = map(int, range_part.split('-'))
                if start < 1 or end < start:
                    raise ValueError("Invalid range")
                
                cursor = db.security_slides.find({
                    "slide_number": {"$gte": start, "$lte": end}
                }).sort("slide_number", 1)
                
                rows = await cursor.to_list(length=1000)
                
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid range format. Use 'prg 10-20'")
        
        elif query_trimmed.startswith('p'):
            # Numeric query: p10, p15, etc.
            try:
                count = int(query_trimmed[1:])
                if count < 1:
                    raise ValueError("Count must be positive")
                
                cursor = db.security_slides.find().sort("slide_number", 1).limit(count)
                rows = await cursor.to_list(length=count)
                
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid query format. Use 'p10' for first 10 slides or 'prg 10-20' for range")
        
        else:
            raise HTTPException(status_code=400, detail="Invalid query format. Use 'p10' for first 10 slides or 'prg 10-20' for range")
        
        # Convert slide_content (Binary) to base64
        for row in rows:
            slide_content_bytes = row.get('slide_content')
            if slide_content_bytes:
                if isinstance(slide_content_bytes, bytes):
                    slide_content_b64 = base64.b64encode(slide_content_bytes).decode('utf-8')
                else:
                    # If already a string, assume it's base64
                    slide_content_b64 = str(slide_content_bytes)
            else:
                slide_content_b64 = ""
            
            slides.append(SlideResponse(
                slide_number=row['slide_number'],
                slide_content=slide_content_b64,
                content_type="image/jpeg"
            ))
        
        return {
            "success": True,
            "data": {
                "slides": [slide.dict() for slide in slides],
                "total_results": len(slides),
                "query": q
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching slides: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error searching slides: {str(e)}")


@router.get("/slides/{slide_number}")
async def get_slide(
    slide_number: int,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific slide by slide number."""
    try:
        row = await db.security_slides.find_one({"slide_number": slide_number})
        
        if not row:
            raise HTTPException(status_code=404, detail=f"Slide {slide_number} not found")
        
        # Convert slide_content (Binary) to base64
        slide_content_bytes = row.get('slide_content')
        if slide_content_bytes:
            if isinstance(slide_content_bytes, bytes):
                slide_content_b64 = base64.b64encode(slide_content_bytes).decode('utf-8')
            else:
                slide_content_b64 = str(slide_content_bytes)
        else:
            slide_content_b64 = ""
        
        return {
            "success": True,
            "data": {
                "slide_number": row['slide_number'],
                "slide_content": slide_content_b64,
                "content_type": "image/jpeg"
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving slide: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error retrieving slide: {str(e)}")


@router.get("/paragraphs/search")
async def search_paragraphs(
    q: str = Query(..., description="Search query: '10' for first 10 paragraphs, 'rg 10-20' for range"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Search paragraphs from security paragraphs collection.
    
    Query formats:
    - '10' or '15': Returns first 10 or 15 paragraphs
    - 'rg 10-20': Returns paragraphs from 10 to 20 (inclusive)
    
    Returns paragraphs as text content.
    """
    try:
        query_trimmed = q.strip().lower()
        paragraphs = []
        
        # Parse query
        if query_trimmed.startswith('rg '):
            # Range query: rg 10-20
            try:
                range_part = query_trimmed[3:].strip()
                start, end = map(int, range_part.split('-'))
                if start < 1 or end < start:
                    raise ValueError("Invalid range")
                
                cursor = db.security_paragraphs.find({
                    "paragraph_number": {"$gte": start, "$lte": end}
                }).sort("paragraph_number", 1)
                
                rows = await cursor.to_list(length=1000)
                
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid range format. Use 'rg 10-20'")
        
        elif query_trimmed.isdigit():
            # Numeric query: 10, 15, etc.
            try:
                count = int(query_trimmed)
                if count < 1:
                    raise ValueError("Count must be positive")
                
                cursor = db.security_paragraphs.find().sort("paragraph_number", 1).limit(count)
                rows = await cursor.to_list(length=count)
                
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid query format. Use '10' for first 10 paragraphs or 'rg 10-20' for range")
        
        else:
            raise HTTPException(status_code=400, detail="Invalid query format. Use '10' for first 10 paragraphs or 'rg 10-20' for range")
        
        # Convert to response format
        for row in rows:
            paragraphs.append(ParagraphResponse(
                paragraph_number=row['paragraph_number'],
                paragraph_content=row.get('paragraph_content', '')
            ))
        
        return {
            "success": True,
            "data": {
                "paragraphs": [para.dict() for para in paragraphs],
                "total_results": len(paragraphs),
                "query": q
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching paragraphs: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error searching paragraphs: {str(e)}")


@router.get("/paragraphs/{paragraph_number}")
async def get_paragraph(
    paragraph_number: int,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """Get a specific paragraph by paragraph number."""
    try:
        row = await db.security_paragraphs.find_one({"paragraph_number": paragraph_number})
        
        if not row:
            raise HTTPException(status_code=404, detail=f"Paragraph {paragraph_number} not found")
        
        return {
            "success": True,
            "data": {
                "paragraph_number": row['paragraph_number'],
                "paragraph_content": row.get('paragraph_content', '')
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving paragraph: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error retrieving paragraph: {str(e)}")


class DocumentResponse(BaseModel):
    """Response model for a document."""
    document_number: int
    document_name: str


class ParagraphMatchResponse(BaseModel):
    """Response model for a matched paragraph."""
    paragraph_number: int
    text: str
    style: Optional[str] = None


class DocumentSearchResponse(BaseModel):
    """Response model for document search results."""
    paragraphs: List[ParagraphMatchResponse]
    total_results: int
    query: str


@router.get("/documents/{document_number}")
async def get_document(
    document_number: int,
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Get a document by document number from security_items collection.
    
    Returns the document name for the given document number.
    """
    try:
        doc = await db.security_items.find_one({"document_number": document_number})
        
        if not doc:
            raise HTTPException(status_code=404, detail=f"Document {document_number} not found")
        
        return {
            "success": True,
            "data": {
                "document_number": doc.get('document_number'),
                "document_name": doc.get('document_name', '')
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error retrieving document: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error retrieving document: {str(e)}")


@router.get("/documents/{document_number}/search")
async def search_document_content(
    document_number: int,
    q: str = Query(..., description="Search query to find matching paragraphs"),
    db: AsyncIOMotorDatabase = Depends(get_database)
):
    """
    Search within a document's content for paragraphs matching the search query.
    
    Searches in the 'document' field of security_items collection, specifically
    within the 'paragraphs' array for text matching the query.
    
    Returns all paragraphs that contain the search query (case-insensitive).
    """
    try:
        # Get the document
        doc = await db.security_items.find_one({"document_number": document_number})
        
        if not doc:
            raise HTTPException(status_code=404, detail=f"Document {document_number} not found")
        
        document = doc.get('document', {})
        if not document:
            raise HTTPException(status_code=404, detail=f"Document {document_number} has no content")
        
        paragraphs = document.get('paragraphs', [])
        if not paragraphs:
            return {
                "success": True,
                "data": {
                    "paragraphs": [],
                    "total_results": 0,
                    "query": q
                }
            }
        
        # Search for matching paragraphs (case-insensitive)
        search_query = q.strip().lower()
        matched_paragraphs = []
        
        for para in paragraphs:
            para_text = para.get('text', '').lower()
            if search_query in para_text:
                matched_paragraphs.append(ParagraphMatchResponse(
                    paragraph_number=len(matched_paragraphs) + 1,
                    text=para.get('text', ''),
                    style=para.get('style')
                ))
        
        return {
            "success": True,
            "data": {
                "paragraphs": [para.dict() for para in matched_paragraphs],
                "total_results": len(matched_paragraphs),
                "query": q
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error searching document content: {e}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Error searching document content: {str(e)}")
