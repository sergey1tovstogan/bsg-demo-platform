"""
Card Template Authentication API

Authentication endpoints for the card template system using AuthUser model.
This provides login/logout/token management for the visual editor and card management.
"""

from fastapi import APIRouter, HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.models.auth_user import LoginRequest, LoginResponse
from app.services.user_service import (
    UserService,
    UserNotFoundError,
    InvalidCredentialsError,
    AccountLockedError
)
from app.services.auth_services import (
    create_access_token,
    create_refresh_token,
    verify_token
)
from app.core.logging import get_logger
import jwt

logger = get_logger(__name__)

router = APIRouter(prefix="/auth-cards", tags=["Card Authentication"])
security = HTTPBearer()


@router.post("/login", response_model=LoginResponse)
async def login_cards(login_data: LoginRequest):
    """
    Authenticate user for card template system.

    **For:** Visual Editor, Card Management, Demo Configuration

    **Request Body:**
    - email: User's email address (admin@example.com or viewer@example.com)
    - password: User's password

    **Response:**
    - access_token: JWT access token (15 minutes)
    - refresh_token: JWT refresh token (30 days)
    - token_type: "Bearer"
    - expires_in: Token expiration in seconds
    - user: User information (email, role, username)

    **Test Credentials:**
    - Admin: admin@example.com / Admin
    - Viewer: viewer@example.com / Viewer

    **Errors:**
    - 401: Invalid credentials
    - 423: Account locked (too many failed attempts)
    """
    user_service = UserService()

    try:
        # Authenticate user
        user = await user_service.authenticate_user(
            login_data.email,
            login_data.password
        )

        # Create tokens
        token_data = {
            "user_id": user.user_id,
            "email": user.email,
            "role": user.role
        }

        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)

        logger.info(f"Card system login: {user.email} ({user.role})")

        # Return response
        return LoginResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="Bearer",
            expires_in=900,  # 15 minutes
            user=user.to_dict(include_sensitive=False)
        )

    except UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
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
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during login"
        )


@router.post("/logout")
async def logout_cards(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Logout user from card template system.

    **Note:** Stateless JWT - logout handled client-side by discarding tokens.

    **Headers:**
    - Authorization: Bearer {access_token}

    **Response:**
    - message: Success message
    """
    logger.info("Card system logout requested")

    return {
        "message": "Successfully logged out. Please discard your tokens.",
        "action": "clear_tokens"
    }


@router.post("/refresh")
async def refresh_token_cards(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Refresh access token for card template system.

    **Headers:**
    - Authorization: Bearer {refresh_token}

    **Response:**
    - access_token: New JWT access token
    - token_type: "Bearer"
    - expires_in: Token expiration in seconds

    **Errors:**
    - 401: Invalid or expired refresh token
    """
    try:
        # Verify refresh token
        token = credentials.credentials
        payload = verify_token(token)

        # Check token type
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type. Expected refresh token."
            )

        # Create new access token
        token_data = {
            "user_id": payload.get("user_id"),
            "email": payload.get("email"),
            "role": payload.get("role")
        }

        access_token = create_access_token(token_data)

        logger.info(f"Token refreshed for: {payload.get('email')}")

        return {
            "access_token": access_token,
            "token_type": "Bearer",
            "expires_in": 900  # 15 minutes
        }

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Refresh token has expired. Please login again."
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid refresh token"
        )
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred during token refresh"
        )


@router.get("/me")
async def get_current_user_cards(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get current authenticated user's information.

    **Headers:**
    - Authorization: Bearer {access_token}

    **Response:**
    - User information (email, role, username, profile)

    **Errors:**
    - 401: Invalid or expired token
    - 404: User not found
    """
    try:
        # Verify access token
        token = credentials.credentials
        payload = verify_token(token)

        # Get user from database
        user_service = UserService()
        user = await user_service.get_user_by_id(payload.get("user_id"))

        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="User not found"
            )

        return user.to_dict(include_sensitive=False)

    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Access token has expired"
        )
    except jwt.InvalidTokenError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid access token"
        )
    except Exception as e:
        logger.error(f"Get current user error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="An error occurred while retrieving user information"
        )
