"""
Authentication API Endpoints

Handles user registration, login, logout, and token refresh.
"""

from fastapi import APIRouter, Depends, Request, Header
from sqlalchemy.orm import Session
from pydantic import BaseModel, EmailStr, Field
from typing import Optional

from app.core.database import get_db
from app.core.logging import get_logger, audit_logger
from app.models.user import User, UserRole
from app.services.auth_service import AuthService, AuthenticationError
from app.utils.security import hash_password
from app.utils.validators import validate_password_strength, validate_username
from app.utils.datetime_utils import utc_now, format_iso8601
from app.middleware.error_handler import ValidationError, ConflictError

router = APIRouter(prefix="/auth", tags=["Authentication"])
logger = get_logger(__name__)


# Pydantic models
class RegisterRequest(BaseModel):
    """User registration request."""
    username: str = Field(..., min_length=3, max_length=50)
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None


class LoginRequest(BaseModel):
    """User login request."""
    username: str
    password: str
    remember_me: bool = False


class TokenResponse(BaseModel):
    """Token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int
    user: dict


class RefreshRequest(BaseModel):
    """Token refresh request."""
    refresh_token: str


@router.post("/register", status_code=201)
async def register(
    request_data: RegisterRequest,
    db: Session = Depends(get_db),
    request: Request = None
):
    """
    Register a new user.

    Args:
        request_data: Registration data
        db: Database session
        request: FastAPI request

    Returns:
        Created user information

    Raises:
        ValidationError: If validation fails
        ConflictError: If username or email already exists
    """
    # Validate username
    is_valid, error_msg = validate_username(request_data.username)
    if not is_valid:
        raise ValidationError(error_msg)

    # Validate password strength
    is_valid, error_msg = validate_password_strength(request_data.password)
    if not is_valid:
        raise ValidationError(error_msg)

    # Check if username already exists
    existing_user = db.query(User).filter(User.username == request_data.username).first()
    if existing_user:
        raise ConflictError("Username already registered")

    # Check if email already exists
    existing_email = db.query(User).filter(User.email == request_data.email).first()
    if existing_email:
        raise ConflictError("Email already registered")

    # Create new user
    new_user = User(
        username=request_data.username,
        email=request_data.email,
        hashed_password=hash_password(request_data.password),
        full_name=request_data.full_name,
        role=UserRole.USER,
        is_active=True,
        is_verified=False
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log registration
    ip_address = request.client.host if request and request.client else None
    audit_logger.log_auth_event(
        "user_registered",
        user_id=new_user.id,
        username=new_user.username,
        ip_address=ip_address,
        success=True
    )

    logger.info(f"New user registered: {new_user.username} (ID: {new_user.id})")

    return {
        "success": True,
        "data": {
            "user": new_user.to_dict(),
            "message": "User registered successfully"
        },
        "metadata": {
            "timestamp": format_iso8601(utc_now())
        }
    }


@router.post("/login")
async def login(
    request_data: LoginRequest,
    db: Session = Depends(get_db),
    request: Request = None,
    user_agent: Optional[str] = Header(None)
):
    """
    Authenticate user and return access tokens.

    Args:
        request_data: Login credentials
        db: Database session
        request: FastAPI request
        user_agent: User agent header

    Returns:
        Access and refresh tokens with user info

    Raises:
        AuthenticationError: If credentials are invalid
    """
    ip_address = request.client.host if request and request.client else None

    # Authenticate user
    user = AuthService.authenticate_user(
        db,
        request_data.username,
        request_data.password,
        ip_address
    )

    if not user:
        raise AuthenticationError("Invalid username or password")

    # Create tokens
    access_token = AuthService.create_access_token(
        user.id,
        user.username,
        user.role.value
    )

    refresh_token = AuthService.create_refresh_token(
        user.id,
        user.username
    )

    # Create session
    AuthService.create_session(
        db,
        user,
        refresh_token,
        user_agent,
        ip_address,
        request_data.remember_me
    )

    from app.core.config import settings

    return {
        "success": True,
        "data": {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": user.to_dict()
        },
        "metadata": {
            "timestamp": format_iso8601(utc_now())
        }
    }


@router.post("/refresh")
async def refresh_token(
    request_data: RefreshRequest,
    db: Session = Depends(get_db)
):
    """
    Refresh access token using refresh token.

    Args:
        request_data: Refresh token
        db: Database session

    Returns:
        New access and refresh tokens

    Raises:
        AuthenticationError: If refresh token is invalid
    """
    new_access_token, new_refresh_token = AuthService.refresh_access_token(
        db,
        request_data.refresh_token
    )

    from app.core.config import settings

    return {
        "success": True,
        "data": {
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
        },
        "metadata": {
            "timestamp": format_iso8601(utc_now())
        }
    }


@router.post("/logout")
async def logout(
    request_data: RefreshRequest,
    db: Session = Depends(get_db)
):
    """
    Logout user by invalidating refresh token.

    Args:
        request_data: Refresh token
        db: Database session

    Returns:
        Logout confirmation
    """
    success = AuthService.invalidate_session(db, request_data.refresh_token)

    logger.info(f"User logged out (token invalidated: {success})")

    return {
        "success": True,
        "data": {
            "message": "Logged out successfully"
        },
        "metadata": {
            "timestamp": format_iso8601(utc_now())
        }
    }
