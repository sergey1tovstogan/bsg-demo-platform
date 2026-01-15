"""
User Management API endpoints.

Admin-only endpoints for managing user accounts.
Implements CRUD operations with role-based access control.
"""

from fastapi import APIRouter, Depends, HTTPException, status, Query
from typing import List, Optional

from app.api.auth_v2 import get_current_user
from app.services.user_service import (
    UserService,
    UserNotFoundError,
    DuplicateEmailError
)
from app.services.auth_services import validate_password_strength
from app.models.auth_user import (
    UserCreateRequest,
    UserUpdateRequest,
    AuthUser
)
from pydantic import BaseModel


# Create router
router = APIRouter(prefix="/api/v1/users", tags=["User Management"])


# Response Models
class UserResponse(BaseModel):
    """Response model for user data."""
    user_id: str
    email: str
    username: str
    role: str
    profile: dict
    is_active: bool
    created_at: str
    updated_at: str
    last_login_at: Optional[str]


class PasswordResetResponse(BaseModel):
    """Response model for password reset."""
    message: str
    temporary_password: str
    must_change_password: bool


# Authorization dependency
def require_admin(current_user: dict = Depends(get_current_user)) -> dict:
    """
    Dependency to enforce admin-only access.

    Args:
        current_user: Current authenticated user

    Returns:
        Current user if admin

    Raises:
        HTTPException: 403 if user is not admin
    """
    if current_user.get("role") != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions. Admin access required."
        )
    return current_user


@router.get("", response_model=List[UserResponse])
async def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    role: Optional[str] = Query(None),
    is_active: Optional[bool] = Query(None),
    current_user: dict = Depends(require_admin)
):
    """
    List all users with pagination and filtering.

    **Admin only endpoint.**

    Args:
        skip: Number of users to skip (pagination)
        limit: Maximum number of users to return
        role: Filter by role (admin, viewer, guest)
        is_active: Filter by active status
        current_user: Current authenticated admin user

    Returns:
        List of users

    Raises:
        HTTPException: 403 if not admin
    """
    service = UserService()

    try:
        users = await service.list_users(
            skip=skip,
            limit=limit,
            role=role,
            is_active=is_active
        )

        return users

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to list users: {str(e)}"
        )


@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    """
    Get user details by ID.

    **Admin only endpoint.**

    Args:
        user_id: User ID to retrieve
        current_user: Current authenticated admin user

    Returns:
        User details

    Raises:
        HTTPException: 403 if not admin
        HTTPException: 404 if user not found
    """
    service = UserService()

    try:
        user = await service.get_user_by_id(user_id)

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User '{user_id}' not found"
            )

        # Return safe user data
        user_dict = user.to_dict(include_sensitive=False)
        return UserResponse(**user_dict)

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to retrieve user: {str(e)}"
        )


@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreateRequest,
    current_user: dict = Depends(require_admin)
):
    """
    Create a new user.

    **Admin only endpoint.**

    Args:
        user_data: User creation data
        current_user: Current authenticated admin user

    Returns:
        Created user details

    Raises:
        HTTPException: 403 if not admin
        HTTPException: 400 if email already exists or password is weak
    """
    service = UserService()

    try:
        # Validate password strength
        is_valid, error_msg = validate_password_strength(user_data.password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Password validation failed: {error_msg}"
            )

        # Create user
        user_id = await service.create_user(
            user_data,
            created_by=current_user["user_id"]
        )

        # Get created user
        user = await service.get_user_by_id(user_id)
        user_dict = user.to_dict(include_sensitive=False)

        return UserResponse(**user_dict)

    except DuplicateEmailError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to create user: {str(e)}"
        )


@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: str,
    update_data: UserUpdateRequest,
    current_user: dict = Depends(require_admin)
):
    """
    Update user details.

    **Admin only endpoint.**

    Args:
        user_id: User ID to update
        update_data: Fields to update
        current_user: Current authenticated admin user

    Returns:
        Updated user details

    Raises:
        HTTPException: 403 if not admin
        HTTPException: 404 if user not found
    """
    service = UserService()

    try:
        # Convert Pydantic model to dict, excluding None values
        updates = update_data.dict(exclude_none=True)

        if not updates:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="No fields to update"
            )

        # Update user
        success = await service.update_user(
            user_id,
            updates,
            updated_by=current_user["user_id"]
        )

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update user"
            )

        # Get updated user
        user = await service.get_user_by_id(user_id)
        user_dict = user.to_dict(include_sensitive=False)

        return UserResponse(**user_dict)

    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to update user: {str(e)}"
        )


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    """
    Delete a user.

    **Admin only endpoint.**

    Args:
        user_id: User ID to delete
        current_user: Current authenticated admin user

    Returns:
        No content (204)

    Raises:
        HTTPException: 403 if not admin
        HTTPException: 400 if trying to delete self
        HTTPException: 404 if user not found
    """
    service = UserService()

    try:
        # Prevent self-deletion
        if user_id == current_user["user_id"]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot delete yourself. Please contact another administrator."
            )

        # Delete user
        success = await service.delete_user(user_id)

        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete user"
            )

        return None  # 204 No Content

    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

    except HTTPException:
        raise

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to delete user: {str(e)}"
        )


@router.post("/{user_id}/reset-password", response_model=PasswordResetResponse)
async def reset_user_password(
    user_id: str,
    current_user: dict = Depends(require_admin)
):
    """
    Reset user password to a temporary value.

    **Admin only endpoint.**

    The user will be required to change their password on next login.

    Args:
        user_id: User ID to reset password for
        current_user: Current authenticated admin user

    Returns:
        Temporary password

    Raises:
        HTTPException: 403 if not admin
        HTTPException: 404 if user not found
    """
    service = UserService()

    try:
        # Reset password
        temp_password = await service.reset_user_password(user_id)

        return PasswordResetResponse(
            message=f"Password reset successfully for user {user_id}",
            temporary_password=temp_password,
            must_change_password=True
        )

    except UserNotFoundError as e:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=str(e)
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to reset password: {str(e)}"
        )
