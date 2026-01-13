"""
User Model for Authentication & Authorization

Database model for user accounts with role-based access control.
"""

from datetime import datetime
from typing import Optional, Literal
from pydantic import BaseModel, Field, EmailStr, validator
from bson import ObjectId

from app.models.user import PyObjectId
from app.utils.datetime_utils import utc_now


# Role types
UserRole = Literal['guest', 'viewer', 'admin']


class UserProfile(BaseModel):
    """User profile information."""
    first_name: str = Field(default="", max_length=100)
    last_name: str = Field(default="", max_length=100)
    avatar_url: Optional[str] = None
    timezone: str = Field(default="UTC", max_length=50)


class AuthUser(BaseModel):
    """
    Authentication User Model.

    This model represents a user account with authentication
    and authorization capabilities.
    """

    id: Optional[PyObjectId] = Field(default_factory=PyObjectId, alias="_id")
    user_id: str = Field(..., min_length=3, max_length=50)
    email: EmailStr = Field(...)
    username: str = Field(..., min_length=3, max_length=100)
    password_hash: str = Field(..., min_length=60, max_length=60)  # Bcrypt hash is exactly 60 chars
    role: UserRole = Field(default='viewer')

    # Profile
    profile: UserProfile = Field(default_factory=UserProfile)

    # Security
    is_active: bool = Field(default=True)
    email_verified: bool = Field(default=False)
    must_change_password: bool = Field(default=False)
    password_changed_at: Optional[datetime] = None
    failed_login_attempts: int = Field(default=0, ge=0)
    locked_until: Optional[datetime] = None

    # Timestamps
    created_at: datetime = Field(default_factory=utc_now)
    updated_at: datetime = Field(default_factory=utc_now)
    last_login_at: Optional[datetime] = None

    # Metadata
    created_by: str = Field(default="system")
    updated_by: str = Field(default="system")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
        use_enum_values = True

    @validator('password_hash')
    def validate_password_hash(cls, v):
        """Validate that password_hash is in bcrypt format."""
        if not v.startswith('$2b$'):
            raise ValueError('password_hash must be a bcrypt hash (starts with $2b$)')
        if len(v) != 60:
            raise ValueError('password_hash must be exactly 60 characters (bcrypt standard)')
        return v

    @validator('user_id')
    def validate_user_id(cls, v):
        """Validate user_id format."""
        if not v.replace('_', '').replace('-', '').isalnum():
            raise ValueError('user_id must contain only alphanumeric characters, hyphens, and underscores')
        return v

    def __repr__(self):
        return f"<AuthUser(user_id='{self.user_id}', email='{self.email}', role='{self.role}')>"

    def to_dict(self, include_sensitive: bool = False):
        """
        Convert user to dictionary.

        Args:
            include_sensitive: If True, includes password_hash and other sensitive data

        Returns:
            Dictionary representation of user
        """
        data = {
            "user_id": self.user_id,
            "email": self.email,
            "username": self.username,
            "role": self.role,
            "profile": {
                "first_name": self.profile.first_name,
                "last_name": self.profile.last_name,
                "avatar_url": self.profile.avatar_url,
                "timezone": self.profile.timezone,
            },
            "is_active": self.is_active,
            "email_verified": self.email_verified,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "updated_at": self.updated_at.isoformat() if self.updated_at else None,
            "last_login_at": self.last_login_at.isoformat() if self.last_login_at else None,
        }

        if include_sensitive:
            data.update({
                "password_hash": self.password_hash,
                "must_change_password": self.must_change_password,
                "failed_login_attempts": self.failed_login_attempts,
                "locked_until": self.locked_until.isoformat() if self.locked_until else None,
            })

        return data

    def is_locked(self) -> bool:
        """Check if account is currently locked."""
        if self.locked_until is None:
            return False
        return datetime.utcnow() < self.locked_until

    def increment_failed_login(self) -> None:
        """Increment failed login attempts and lock if threshold reached."""
        self.failed_login_attempts += 1

        # Lock account after 5 failed attempts
        if self.failed_login_attempts >= 5:
            from datetime import timedelta
            self.locked_until = datetime.utcnow() + timedelta(minutes=30)

    def reset_failed_login(self) -> None:
        """Reset failed login attempts after successful login."""
        self.failed_login_attempts = 0
        self.locked_until = None


class UserCreateRequest(BaseModel):
    """Request model for creating a new user."""
    email: EmailStr
    username: str = Field(..., min_length=3, max_length=100)
    password: str = Field(..., min_length=8, max_length=128)
    role: UserRole = Field(default='viewer')
    profile: Optional[UserProfile] = None


class UserUpdateRequest(BaseModel):
    """Request model for updating a user."""
    username: Optional[str] = Field(None, min_length=3, max_length=100)
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    profile: Optional[UserProfile] = None


class LoginRequest(BaseModel):
    """Request model for user login."""
    email: EmailStr
    password: str = Field(..., min_length=1)


class LoginResponse(BaseModel):
    """Response model for successful login."""
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int = 900  # 15 minutes in seconds
    user: dict
