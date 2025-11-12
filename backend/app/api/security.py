"""
Security component API endpoints.
Handles slide search and retrieval from component-security_pres.slides table.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
import psycopg2
from psycopg2.extras import RealDictCursor
import base64
import os

router = APIRouter(prefix="/components/security", tags=["security"])

# Database connection parameters
DB_CONFIG = {
    'host': os.getenv('DB_HOST', 'localhost'),
    'port': int(os.getenv('DB_PORT', '5432')),
    'database': os.getenv('DB_NAME', 'bsg_demo'),
    'user': os.getenv('DB_USER', 'postgres'),
    'password': os.getenv('DB_PASSWORD', 'postgres')
}


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


def get_db_connection():
    """Get database connection."""
    try:
        return psycopg2.connect(**DB_CONFIG)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Database connection failed: {str(e)}")


@router.get("/slides/search")
async def search_slides(q: str = Query(..., description="Search query: 'p10' for first 10 slides, 'prg 10-20' for range")):
    """
    Search slides from component-security_pres.slides table.
    
    Query formats:
    - 'p10' or 'p15': Returns first 10 or 15 slides
    - 'prg 10-20': Returns slides from 10 to 20 (inclusive)
    
    Returns slides as base64-encoded JPEG images.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
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
                
                cur.execute('''
                    SELECT slide_number, slide_content
                    FROM "component-security_pres".slides
                    WHERE slide_number >= %s AND slide_number <= %s
                    ORDER BY slide_number
                ''', (start, end))
                
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid range format. Use 'prg 10-20'")
        
        elif query_trimmed.startswith('p'):
            # Numeric query: p10, p15, etc.
            try:
                count = int(query_trimmed[1:])
                if count < 1:
                    raise ValueError("Count must be positive")
                
                cur.execute('''
                    SELECT slide_number, slide_content
                    FROM "component-security_pres".slides
                    ORDER BY slide_number
                    LIMIT %s
                ''', (count,))
                
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid query format. Use 'p10' for first 10 slides or 'prg 10-20' for range")
        
        else:
            raise HTTPException(status_code=400, detail="Invalid query format. Use 'p10' for first 10 slides or 'prg 10-20' for range")
        
        # Fetch results
        rows = cur.fetchall()
        
        if not rows:
            return {
                "success": True,
                "data": {
                    "slides": [],
                    "total_results": 0,
                    "query": q
                }
            }
        
        # Convert slide_content (BYTEA) to base64
        for row in rows:
            slide_content_bytes = bytes(row['slide_content'])
            slide_content_b64 = base64.b64encode(slide_content_bytes).decode('utf-8')
            
            slides.append(SlideResponse(
                slide_number=row['slide_number'],
                slide_content=slide_content_b64,
                content_type="image/jpeg"
            ))
        
        cur.close()
        conn.close()
        
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
        raise HTTPException(status_code=500, detail=f"Error searching slides: {str(e)}")


@router.get("/slides/{slide_number}")
async def get_slide(slide_number: int):
    """Get a specific slide by slide number."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT slide_number, slide_content
            FROM "component-security_pres".slides
            WHERE slide_number = %s
        ''', (slide_number,))
        
        row = cur.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail=f"Slide {slide_number} not found")
        
        # Convert slide_content (BYTEA) to base64
        slide_content_bytes = bytes(row['slide_content'])
        slide_content_b64 = base64.b64encode(slide_content_bytes).decode('utf-8')
        
        cur.close()
        conn.close()
        
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
        raise HTTPException(status_code=500, detail=f"Error retrieving slide: {str(e)}")


class ParagraphResponse(BaseModel):
    """Response model for a single paragraph."""
    paragraph_number: int
    paragraph_content: str


class ParagraphSearchResponse(BaseModel):
    """Response model for paragraph search results."""
    paragraphs: List[ParagraphResponse]
    total_results: int
    query: str


@router.get("/paragraphs/search")
async def search_paragraphs(q: str = Query(..., description="Search query: '10' for first 10 paragraphs, 'rg 10-20' for range")):
    """
    Search paragraphs from component-security.paragraphs table.
    
    Query formats:
    - '10' or '15': Returns first 10 or 15 paragraphs
    - 'rg 10-20': Returns paragraphs from 10 to 20 (inclusive)
    
    Returns paragraphs as text content.
    """
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
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
                
                cur.execute('''
                    SELECT paragraph_number, paragraph_content
                    FROM "component-security".paragraphs
                    WHERE paragraph_number >= %s AND paragraph_number <= %s
                    ORDER BY paragraph_number
                ''', (start, end))
                
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid range format. Use 'rg 10-20'")
        
        elif query_trimmed.isdigit():
            # Numeric query: 10, 15, etc.
            try:
                count = int(query_trimmed)
                if count < 1:
                    raise ValueError("Count must be positive")
                
                cur.execute('''
                    SELECT paragraph_number, paragraph_content
                    FROM "component-security".paragraphs
                    ORDER BY paragraph_number
                    LIMIT %s
                ''', (count,))
                
            except ValueError:
                raise HTTPException(status_code=400, detail="Invalid query format. Use '10' for first 10 paragraphs or 'rg 10-20' for range")
        
        else:
            raise HTTPException(status_code=400, detail="Invalid query format. Use '10' for first 10 paragraphs or 'rg 10-20' for range")
        
        # Fetch results
        rows = cur.fetchall()
        
        if not rows:
            return {
                "success": True,
                "data": {
                    "paragraphs": [],
                    "total_results": 0,
                    "query": q
                }
            }
        
        # Convert to response format
        for row in rows:
            paragraphs.append(ParagraphResponse(
                paragraph_number=row['paragraph_number'],
                paragraph_content=row['paragraph_content']
            ))
        
        cur.close()
        conn.close()
        
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
        raise HTTPException(status_code=500, detail=f"Error searching paragraphs: {str(e)}")


@router.get("/paragraphs/{paragraph_number}")
async def get_paragraph(paragraph_number: int):
    """Get a specific paragraph by paragraph number."""
    try:
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        cur.execute('''
            SELECT paragraph_number, paragraph_content
            FROM "component-security".paragraphs
            WHERE paragraph_number = %s
        ''', (paragraph_number,))
        
        row = cur.fetchone()
        
        if not row:
            raise HTTPException(status_code=404, detail=f"Paragraph {paragraph_number} not found")
        
        cur.close()
        conn.close()
        
        return {
            "success": True,
            "data": {
                "paragraph_number": row['paragraph_number'],
                "paragraph_content": row['paragraph_content']
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error retrieving paragraph: {str(e)}")

