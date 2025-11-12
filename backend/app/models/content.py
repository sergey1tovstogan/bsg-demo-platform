"""
Content Model

Represents content items for each component.
"""

from sqlalchemy import Column, String, Integer, Text, JSON, DateTime, ForeignKey, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.core.database import Base
import enum


class ContentType(str, enum.Enum):
    """Content type enumeration."""
    SLIDE = "slide"
    DOCUMENT = "document"
    TUTORIAL = "tutorial"


class DifficultyLevel(str, enum.Enum):
    """Difficulty level enumeration."""
    BEGINNER = "beginner"
    INTERMEDIATE = "intermediate"
    ADVANCED = "advanced"


class Content(Base):
    """Content model for storing component content."""

    __tablename__ = "contents"

    content_id = Column(String(50), primary_key=True, index=True)
    component_id = Column(
        String(50),
        ForeignKey("components.component_id", ondelete="CASCADE"),
        nullable=False,
        index=True
    )
    title = Column(String(300), nullable=False)
    type = Column(
        SQLEnum(ContentType),
        default=ContentType.SLIDE,
        nullable=False
    )
    order = Column(Integer, default=0, nullable=False)

    # JSON fields for flexible content structure
    body = Column(JSON, nullable=True)  # {heading, bullets, code_examples, description}
    content_metadata = Column(JSON, nullable=True)  # {duration_minutes, difficulty}

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    component = relationship("Component", back_populates="contents")

    def __repr__(self):
        return f"<Content {self.content_id}: {self.title}>"
