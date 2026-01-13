"""
User Service Layer

Handles user management operations (CRUD, authentication).
"""

from typing import Optional, List, Dict, Any
from datetime import datetime

from app.adapters.database import get_database_adapter
from app.models.auth_user import AuthUser, UserCreateRequest
from app.services.auth_services import hash_password, verify_password
from app.utils.datetime_utils import utc_now
from app.core.logging import get_logger

logger = get_logger(__name__)


class UserNotFoundError(Exception):
    """User not found exception."""
    pass


class DuplicateEmailError(Exception):
    """Duplicate email exception."""
    pass


class InvalidCredentialsError(Exception):
    """Invalid credentials exception."""
    pass


class AccountLockedError(Exception):
    """Account locked exception."""
    pass


class UserService:
    """Service for user management operations."""

    def __init__(self):
        """Initialize user service."""
        self.db_adapter = get_database_adapter()
        self.collection_name = "auth_users"

    async def _ensure_connection(self):
        """Ensure database connection."""
        await self.db_adapter.connect()

    async def get_user_by_email(self, email: str) -> Optional[AuthUser]:
        """
        Get user by email address.

        Args:
            email: User's email address

        Returns:
            AuthUser if found, None otherwise
        """
        await self._ensure_connection()

        user_doc = await self.db_adapter.find_one(
            self.collection_name,
            {"email": email}
        )

        if not user_doc:
            return None

        return AuthUser(**user_doc)

    async def get_user_by_id(self, user_id: str) -> Optional[AuthUser]:
        """
        Get user by user_id.

        Args:
            user_id: User's unique identifier

        Returns:
            AuthUser if found, None otherwise
        """
        await self._ensure_connection()

        user_doc = await self.db_adapter.find_one(
            self.collection_name,
            {"user_id": user_id}
        )

        if not user_doc:
            return None

        return AuthUser(**user_doc)

    async def create_user(self, user_data: UserCreateRequest, created_by: str = "system") -> str:
        """
        Create a new user.

        Args:
            user_data: User creation request data
            created_by: User ID of creator

        Returns:
            Created user's user_id

        Raises:
            DuplicateEmailError: If email already exists
        """
        await self._ensure_connection()

        # Check if email already exists
        existing = await self.get_user_by_email(user_data.email)
        if existing:
            raise DuplicateEmailError(f"Email '{user_data.email}' already exists")

        # Hash password
        password_hash = hash_password(user_data.password)

        # Generate user_id
        import uuid
        user_id = f"usr_{uuid.uuid4().hex[:12]}"

        # Create user object
        user = AuthUser(
            user_id=user_id,
            email=user_data.email,
            username=user_data.username,
            password_hash=password_hash,
            role=user_data.role,
            profile=user_data.profile or {},
            created_by=created_by,
            updated_by=created_by
        )

        # Insert into database
        await self.db_adapter.insert_one(
            self.collection_name,
            user.dict(by_alias=True, exclude_none=True)
        )

        logger.info(f"User created: {user.email} ({user.user_id})")
        return user.user_id

    async def authenticate_user(self, email: str, password: str) -> AuthUser:
        """
        Authenticate user with email and password.

        Args:
            email: User's email
            password: User's password

        Returns:
            Authenticated user

        Raises:
            UserNotFoundError: If user not found
            InvalidCredentialsError: If password is incorrect
            AccountLockedError: If account is locked
        """
        await self._ensure_connection()

        # Get user
        user = await self.get_user_by_email(email)
        if not user:
            raise UserNotFoundError(f"User with email '{email}' not found")

        # Check if account is locked
        if user.is_locked():
            raise AccountLockedError(
                f"Account is locked until {user.locked_until.isoformat() if user.locked_until else 'unknown'}"
            )

        # Verify password
        if not verify_password(password, user.password_hash):
            # Increment failed login attempts
            user.increment_failed_login()

            # Update user in database
            await self.db_adapter.update_one(
                self.collection_name,
                {"user_id": user.user_id},
                {
                    "failed_login_attempts": user.failed_login_attempts,
                    "locked_until": user.locked_until
                }
            )

            # Check if account is now locked
            if user.is_locked():
                raise AccountLockedError("Account locked due to too many failed login attempts")

            raise InvalidCredentialsError("Invalid email or password")

        # Reset failed login attempts on successful login
        user.reset_failed_login()
        user.last_login_at = utc_now()

        # Update user in database
        await self.db_adapter.update_one(
            self.collection_name,
            {"user_id": user.user_id},
            {
                "failed_login_attempts": 0,
                "locked_until": None,
                "last_login_at": user.last_login_at
            }
        )

        logger.info(f"User authenticated: {user.email}")
        return user

    async def list_users(
        self,
        skip: int = 0,
        limit: int = 100,
        role: Optional[str] = None,
        is_active: Optional[bool] = None
    ) -> List[Dict[str, Any]]:
        """
        List users with pagination and filtering.

        Args:
            skip: Number of users to skip
            limit: Maximum number of users to return
            role: Filter by role
            is_active: Filter by active status

        Returns:
            List of users (as dictionaries)
        """
        await self._ensure_connection()

        # Build filter
        filter_query = {}
        if role:
            filter_query["role"] = role
        if is_active is not None:
            filter_query["is_active"] = is_active

        # Query database
        user_docs = await self.db_adapter.find_many(
            self.collection_name,
            filter=filter_query,
            limit=limit
        )

        # Convert to AuthUser objects and return safe dictionaries
        users = []
        for doc in user_docs:
            user = AuthUser(**doc)
            users.append(user.to_dict(include_sensitive=False))

        return users[skip:skip+limit] if skip > 0 else users

    async def update_user_password(self, user_id: str, new_password: str) -> bool:
        """
        Update user password.

        Args:
            user_id: User ID
            new_password: New password (plain text)

        Returns:
            True if updated successfully

        Raises:
            UserNotFoundError: If user not found
        """
        await self._ensure_connection()

        user = await self.get_user_by_id(user_id)
        if not user:
            raise UserNotFoundError(f"User '{user_id}' not found")

        # Hash new password
        new_hash = hash_password(new_password)

        # Update in database
        result = await self.db_adapter.update_one(
            self.collection_name,
            {"user_id": user_id},
            {
                "password_hash": new_hash,
                "password_changed_at": utc_now(),
                "must_change_password": False,
                "updated_at": utc_now()
            }
        )

        logger.info(f"Password updated for user: {user_id}")
        return result

    async def update_user(
        self,
        user_id: str,
        updates: Dict[str, Any],
        updated_by: str = "system"
    ) -> bool:
        """
        Update user fields.

        Args:
            user_id: User ID
            updates: Dictionary of fields to update
            updated_by: User ID of updater

        Returns:
            True if updated successfully

        Raises:
            UserNotFoundError: If user not found
        """
        await self._ensure_connection()

        user = await self.get_user_by_id(user_id)
        if not user:
            raise UserNotFoundError(f"User '{user_id}' not found")

        # Add metadata
        updates['updated_by'] = updated_by
        updates['updated_at'] = utc_now()

        # Update in database
        result = await self.db_adapter.update_one(
            self.collection_name,
            {"user_id": user_id},
            updates
        )

        logger.info(f"User updated: {user_id}")
        return result

    async def delete_user(self, user_id: str) -> bool:
        """
        Delete a user.

        Args:
            user_id: User ID

        Returns:
            True if deleted successfully

        Raises:
            UserNotFoundError: If user not found
        """
        await self._ensure_connection()

        user = await self.get_user_by_id(user_id)
        if not user:
            raise UserNotFoundError(f"User '{user_id}' not found")

        # Delete from database
        result = await self.db_adapter.delete_one(
            self.collection_name,
            {"user_id": user_id}
        )

        logger.info(f"User deleted: {user_id}")
        return result

    async def reset_user_password(self, user_id: str) -> str:
        """
        Reset user password to a temporary value.

        Args:
            user_id: User ID

        Returns:
            Temporary password (plain text)

        Raises:
            UserNotFoundError: If user not found
        """
        await self._ensure_connection()

        user = await self.get_user_by_id(user_id)
        if not user:
            raise UserNotFoundError(f"User '{user_id}' not found")

        # Generate temporary password
        import secrets
        import string
        alphabet = string.ascii_letters + string.digits + "!@#$%^&*"
        temp_password = ''.join(secrets.choice(alphabet) for i in range(12))

        # Hash temporary password
        temp_hash = hash_password(temp_password)

        # Update in database
        await self.db_adapter.update_one(
            self.collection_name,
            {"user_id": user_id},
            {
                "password_hash": temp_hash,
                "must_change_password": True,
                "password_changed_at": utc_now(),
                "updated_at": utc_now()
            }
        )

        logger.info(f"Password reset for user: {user_id}")
        return temp_password
