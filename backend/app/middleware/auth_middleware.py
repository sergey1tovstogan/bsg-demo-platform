"""
Authentication Middleware

Provides FastAPI dependencies for authentication and authorization.
"""

from fastapi import Depends, Header
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from app.core.database import get_db
from app.core.logging import get_logger
from app.models.user import User, UserRole
from app.services.auth_service import AuthService, AuthenticationError, AuthorizationError

logger = get_logger(__name__)

# HTTP Bearer token scheme
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated user from JWT token.

    Args:
        credentials: Bearer token credentials
        db: Database session

    Returns:
        Current user

    Raises:
        AuthenticationError: If token is invalid or user not found
    """
    token = credentials.credentials

    # Verify token
    payload = AuthService.verify_token(token, token_type="access")

    # Get user ID from token
    user_id = int(payload.get("sub"))

    # Get user from database
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        logger.warning(f"User not found for token with user_id: {user_id}")
        raise AuthenticationError("User not found")

    if not user.is_active:
        logger.warning(f"Inactive user attempted access: {user.username} (ID: {user.id})")
        raise AuthenticationError("User account is inactive")

    logger.debug(f"Authenticated user: {user.username} (ID: {user.id})")
    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current active user.

    Args:
        current_user: Current user from token

    Returns:
        Current active user

    Raises:
        AuthenticationError: If user is not active
    """
    if not current_user.is_active:
        raise AuthenticationError("User account is inactive")

    return current_user


async def get_current_verified_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current verified user.

    Args:
        current_user: Current user from token

    Returns:
        Current verified user

    Raises:
        AuthenticationError: If user is not verified
    """
    if not current_user.is_verified:
        raise AuthenticationError("Email verification required")

    return current_user


def require_role(required_role: UserRole):
    """
    Dependency factory to require specific role.

    Args:
        required_role: Required user role

    Returns:
        Dependency function

    Example:
        @app.get("/admin", dependencies=[Depends(require_role(UserRole.ADMIN))])
    """
    async def role_checker(current_user: User = Depends(get_current_user)) -> User:
        AuthService.require_permission(current_user, required_role)
        return current_user

    return role_checker


async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    Get current admin user.

    Args:
        current_user: Current user from token

    Returns:
        Current admin user

    Raises:
        AuthorizationError: If user is not admin
    """
    if not current_user.is_admin():
        logger.warning(
            f"Non-admin user attempted admin access: {current_user.username} (ID: {current_user.id})"
        )
        raise AuthorizationError("Admin access required")

    return current_user


async def get_optional_user(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Get current user if authenticated, None otherwise.
    Useful for endpoints that work for both authenticated and anonymous users.

    Args:
        authorization: Authorization header
        db: Database session

    Returns:
        Current user or None
    """
    if not authorization or not authorization.startswith("Bearer "):
        return None

    try:
        token = authorization.replace("Bearer ", "")
        payload = AuthService.verify_token(token, token_type="access")
        user_id = int(payload.get("sub"))
        user = db.query(User).filter(User.id == user_id, User.is_active == True).first()
        return user
    except Exception:
        return None
