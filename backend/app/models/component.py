"""
Component Model

Represents different components of the BSG Demo Platform.
"""

from sqlalchemy import Column, String, Enum as SQLEnum
from sqlalchemy.orm import relationship
from app.core.database import Base
import enum


class ComponentStatus(str, enum.Enum):
    """Component status enumeration."""
    ACTIVE = "active"
    INACTIVE = "inactive"


class Component(Base):
    """Component model for storing component information."""

    __tablename__ = "components"

    component_id = Column(String(50), primary_key=True, index=True)
    name = Column(String(200), nullable=False)
    description = Column(String(500))
    status = Column(
        SQLEnum(ComponentStatus),
        default=ComponentStatus.ACTIVE,
        nullable=False
    )

    # Relationships
    contents = relationship("Content", back_populates="component", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Component {self.component_id}: {self.name}>"
