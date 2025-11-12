"""
Content Models

Database models for component content.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, String, DateTime, Text, JSON
from sqlalchemy.orm import relationship

from app.core.database import Base
from app.utils.datetime_utils import utc_now


class Content(Base):
    """Content model for component content."""

    __tablename__ = "content"

    # Primary key
    id = Column(Integer, primary_key=True, index=True)

    # Content identification
    content_id = Column(String(255), unique=True, index=True, nullable=False)
    component_id = Column(String(50), index=True, nullable=False)
    
    # Content fields
    title = Column(String(255), nullable=False)
    type = Column(String(50), nullable=False)  # 'slide', 'document', 'tutorial', 'html'
    order = Column(Integer, default=0, nullable=False)
    
    # Content body - can store HTML, JSON, or text
    body_html = Column(Text, nullable=True)  # For HTML content
    body_json = Column(JSON, nullable=True)  # For structured content
    
    # Metadata (renamed to avoid SQLAlchemy reserved keyword)
    content_metadata = Column(JSON, nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), default=utc_now, nullable=False)
    updated_at = Column(DateTime(timezone=True), default=utc_now, onupdate=utc_now, nullable=False)

    def __repr__(self):
        return f"<Content(id={self.id}, content_id='{self.content_id}', component_id='{self.component_id}', title='{self.title}')>"

    def to_dict(self):
        """Convert content to dictionary."""
        body = {}
        if self.body_html:
            body["html"] = self.body_html
        if self.body_json:
            body.update(self.body_json)
        
        return {
            "content_id": self.content_id,
            "title": self.title,
            "type": self.type,
            "order": self.order,
            "body": body if body else None,
            "metadata": self.content_metadata,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
        }
