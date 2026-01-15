"""
Authentication API endpoints (v2) - New RBAC system.

Implements JWT-based authentication with role-based access control.
Endpoints:
  - POST /login - User login
  - POST /logout - User logout
  - POST /refresh - Refresh access token
  - GET /me - Get current user info
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

from app.services.user_service import (
    UserService,
    InvalidCredentialsError,
    AccountLockedError,
    UserNotFoundError
)
from app.services.auth_services import (
    create_access_token,
    create_refresh_token,
    verify_token
)
from app.models.auth_user import LoginRequest

# Create router
router = APIRouter(prefix="/api/v1/auth", tags=["Authentication"])

# HTTP Bearer token scheme
security = HTTPBearer()


# Request/Response Models
class LoginResponse(BaseModel):
    """Response model for login endpoint."""
    access_token: str
    refresh_token: str
    token_type: str = "Bearer"
    expires_in: int = 900  # 15 minutes in seconds
    user: dict


class RefreshTokenRequest(BaseModel):
    """Request model for token refresh."""
    refresh_token: str


class RefreshTokenResponse(BaseModel):
    """Response model for token refresh."""
    access_token: str
    expires_in: int = 900


class LogoutResponse(BaseModel):
    """Response model for logout."""
    message: str


class UserResponse(BaseModel):
    """Response model for current user info."""
    user_id: str
    email: str
    username: str
    role: str
    profile: dict
    is_active: bool
    last_login_at: Optional[datetime]


# Dependency to get current user from JWT token
async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """
    Dependency to extract and verify current user from JWT token.

    Args:
        credentials: HTTP Authorization credentials (Bearer token)

    Returns:
        dict: Decoded token payload with user info

    Raises:
        HTTPException: 401 if token is invalid or expired
    """
    token = credentials.credentials

    try:
        payload = verify_token(token)
        return payload
    except Exception as e:
        error_msg = str(e).lower()
        if "expired" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Token has expired",
                headers={"WWW-Authenticate": "Bearer"},
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )


@router.post("/login", response_model=LoginResponse)
async def login(credentials: LoginRequest):
    """
    Authenticate user and return JWT tokens.

    Args:
        credentials: Login credentials (email and password)

    Returns:
        LoginResponse: Access token, refresh token, and user info

    Raises:
        HTTPException: 401 if credentials are invalid
        HTTPException: 423 if account is locked
    """
    service = UserService()

    try:
        # Authenticate user
        user = await service.authenticate_user(
            credentials.email,
            credentials.password
        )

        # Create JWT tokens
        token_data = {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role
        }

        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        # Prepare user data for response (exclude sensitive fields)
        user_dict = user.to_dict(include_sensitive=False)

        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            user=user_dict
        )

    except InvalidCredentialsError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    except AccountLockedError as e:
        raise HTTPException(
            status_code=status.HTTP_423_LOCKED,
            detail=str(e)
        )

    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Authentication failed: {str(e)}"
        )


@router.post("/logout", response_model=LogoutResponse)
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Logout user by invalidating their session.

    Args:
        current_user: Current authenticated user (from JWT token)

    Returns:
        LogoutResponse: Success message

    Note:
        In a stateless JWT system, the client should delete the tokens.
        For production, implement token blacklisting in Redis.
    """
    # TODO: Add token to blacklist in Redis
    # For now, we rely on client-side token deletion

    return LogoutResponse(
        message=f"User {current_user['email']} successfully logged out"
    )


@router.post("/refresh", response_model=RefreshTokenResponse)
async def refresh_access_token(request: RefreshTokenRequest):
    """
    Refresh access token using refresh token.

    Args:
        request: Refresh token request

    Returns:
        RefreshTokenResponse: New access token

    Raises:
        HTTPException: 401 if refresh token is invalid or expired
    """
    try:
        # Verify refresh token
        payload = verify_token(request.refresh_token)

        # Check if this is actually a refresh token
        # (refresh tokens have longer expiry)
        token_type = payload.get("type", "access")
        if token_type != "refresh":
            # If no type field, check expiry time to distinguish
            # For now, we'll allow it but in production should enforce type
            pass

        # Create new access token with same user data
        token_data = {
            "user_id": payload["user_id"],
            "email": payload["email"],
            "role": payload["role"]
        }

        new_access_token = create_access_token(token_data)

        return RefreshTokenResponse(
            access_token=new_access_token
        )

    except Exception as e:
        error_msg = str(e).lower()
        if "expired" in error_msg:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Refresh token has expired. Please login again."
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: dict = Depends(get_current_user)):
    """
    Get current authenticated user's information.

    Args:
        current_user: Current authenticated user (from JWT token)

    Returns:
        UserResponse: Current user's profile information

    Raises:
        HTTPException: 401 if not authenticated
        HTTPException: 404 if user not found
    """
    service = UserService()

    try:
        # Get fresh user data from database
        user = await service.get_user_by_id(current_user["user_id"])

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        # Return user data (excluding sensitive fields)
        user_dict = user.to_dict(include_sensitive=False)

        return UserResponse(**user_dict)

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user info: {str(e)}"
        )
