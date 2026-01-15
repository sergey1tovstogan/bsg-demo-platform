"""
Tests for AuthUser Model

Following TDD approach - these tests define expected behavior.
"""

import pytest
from datetime import datetime, timedelta
from pydantic import ValidationError

from app.models.auth_user import (
    AuthUser,
    UserProfile,
    UserCreateRequest,
    UserUpdateRequest,
    LoginRequest,
)


class TestUserProfile:
    """Tests for UserProfile model."""

    def test_user_profile_defaults(self, fixed_password_hash):
        """Test UserProfile has correct defaults."""
        profile = UserProfile()

        assert profile.first_name == ""
        assert profile.last_name == ""
        assert profile.avatar_url is None
        assert profile.timezone == "UTC"

    def test_user_profile_with_data(self, fixed_password_hash):
        """Test UserProfile with provided data."""
        profile = UserProfile(
            first_name="John",
            last_name="Doe",
            avatar_url="https://example.com/avatar.jpg",
            timezone="America/New_York"
        )

        assert profile.first_name == "John"
        assert profile.last_name == "Doe"
        assert profile.avatar_url == "https://example.com/avatar.jpg"
        assert profile.timezone == "America/New_York"


class TestAuthUser:
    """Tests for AuthUser model."""

    def test_create_user_with_valid_data(self, fixed_password_hash):
        """Test creating user with all valid fields."""
        user = AuthUser(
            user_id="usr_test123",
            email="test@example.com",
            username="Test User",
            password_hash=fixed_password_hash,
            role="viewer"
        )

        assert user.user_id == "usr_test123"
        assert user.email == "test@example.com"
        assert user.username == "Test User"
        assert user.role == "viewer"
        assert user.is_active is True
        assert user.failed_login_attempts == 0

    def test_user_defaults_to_active(self, fixed_password_hash):
        """Test that new users are active by default."""
        user = AuthUser(
            user_id="usr_test",
            email="test@example.com",
            username="Test",
            password_hash=fixed_password_hash,
        )

        assert user.is_active is True

    def test_user_defaults_to_viewer_role(self, fixed_password_hash):
        """Test that new users default to viewer role."""
        user = AuthUser(
            user_id="usr_test",
            email="test@example.com",
            username="Test",
            password_hash=fixed_password_hash,
        )

        assert user.role == "viewer"

    def test_invalid_email_raises_error(self, fixed_password_hash):
        """Test that invalid email format raises ValidationError."""
        with pytest.raises(ValidationError) as exc_info:
            AuthUser(
                user_id="usr_test",
                email="invalid-email",  # Missing @
                username="Test",
                password_hash=fixed_password_hash,
            )

        assert "email" in str(exc_info.value).lower()

    def test_password_hash_must_be_bcrypt_format(self, fixed_password_hash):
        """Test that password_hash must be in bcrypt format."""
        with pytest.raises(ValidationError) as exc_info:
            AuthUser(
                user_id="usr_test",
                email="test@example.com",
                username="Test",
                # Exactly 60 chars but wrong format ($2a instead of $2b)
                password_hash="$2a$12$12345678901234567890123456789012345678901234567890123",
            )

        assert "bcrypt" in str(exc_info.value).lower()

    def test_password_hash_must_be_60_chars(self, fixed_password_hash):
        """Test that password_hash must be exactly 60 characters."""
        with pytest.raises(ValidationError) as exc_info:
            AuthUser(
                user_id="usr_test",
                email="test@example.com",
                username="Test",
                password_hash="$2b$12$short",  # Too short
            )

        assert "60 characters" in str(exc_info.value)

    def test_user_id_alphanumeric_validation(self, fixed_password_hash):
        """Test that user_id allows only alphanumeric, hyphens, underscores."""
        # Valid user_ids
        valid_ids = ["usr_123", "user-456", "USR789", "user_test-123"]
        for user_id in valid_ids:
            user = AuthUser(
                user_id=user_id,
                email="test@example.com",
                username="Test",
                password_hash=fixed_password_hash,
            )
            assert user.user_id == user_id

    def test_user_id_invalid_characters_raise_error(self, fixed_password_hash):
        """Test that user_id with invalid characters raises error."""
        with pytest.raises(ValidationError):
            AuthUser(
                user_id="usr@123!",  # Contains @ and !
                email="test@example.com",
                username="Test",
                password_hash=fixed_password_hash,
            )

    def test_username_minimum_length(self, fixed_password_hash):
        """Test username must be at least 3 characters."""
        with pytest.raises(ValidationError):
            AuthUser(
                user_id="usr_test",
                email="test@example.com",
                username="AB",  # Too short
                password_hash=fixed_password_hash,
            )

    def test_role_must_be_valid_value(self, fixed_password_hash):
        """Test that role must be one of: guest, viewer, admin."""
        # Valid roles
        for role in ['guest', 'viewer', 'admin']:
            user = AuthUser(
                user_id="usr_test",
                email="test@example.com",
                username="Test",
                password_hash=fixed_password_hash,
                role=role
            )
            assert user.role == role

    def test_invalid_role_raises_error(self, fixed_password_hash):
        """Test that invalid role raises ValidationError."""
        with pytest.raises(ValidationError):
            AuthUser(
                user_id="usr_test",
                email="test@example.com",
                username="Test",
                password_hash=fixed_password_hash,
                role="superadmin"  # Invalid role
            )

    def test_to_dict_excludes_sensitive_data_by_default(self, fixed_password_hash):
        """Test that to_dict() excludes sensitive data by default."""
        user = AuthUser(
            user_id="usr_test",
            email="test@example.com",
            username="Test User",
            password_hash=fixed_password_hash,
            role="admin"
        )

        data = user.to_dict()

        assert "password_hash" not in data
        assert "must_change_password" not in data
        assert "failed_login_attempts" not in data
        assert data["email"] == "test@example.com"
        assert data["username"] == "Test User"
        assert data["role"] == "admin"

    def test_to_dict_includes_sensitive_when_requested(self, fixed_password_hash):
        """Test that to_dict() includes sensitive data when requested."""
        user = AuthUser(
            user_id="usr_test",
            email="test@example.com",
            username="Test User",
            password_hash=fixed_password_hash,
        )

        data = user.to_dict(include_sensitive=True)

        assert "password_hash" in data
        assert "must_change_password" in data
        assert "failed_login_attempts" in data
        assert data["password_hash"].startswith("$2b$")

    def test_is_locked_returns_false_when_not_locked(self, fixed_password_hash):
        """Test is_locked() returns False when account is not locked."""
        user = AuthUser(
            user_id="usr_test",
            email="test@example.com",
            username="Test",
            password_hash=fixed_password_hash,
        )

        assert user.is_locked() is False

    def test_is_locked_returns_true_when_locked(self, fixed_password_hash):
        """Test is_locked() returns True when account is locked."""
        user = AuthUser(
            user_id="usr_test",
            email="test@example.com",
            username="Test",
            password_hash=fixed_password_hash,
            locked_until=datetime.utcnow() + timedelta(minutes=30)
        )

        assert user.is_locked() is True

    def test_is_locked_returns_false_after_lockout_expires(self, fixed_password_hash):
        """Test is_locked() returns False after lockout period expires."""
        user = AuthUser(
            user_id="usr_test",
            email="test@example.com",
            username="Test",
            password_hash=fixed_password_hash,
            locked_until=datetime.utcnow() - timedelta(seconds=1)  # Expired
        )

        assert user.is_locked() is False

    def test_increment_failed_login_increments_counter(self, fixed_password_hash):
        """Test increment_failed_login() increments the counter."""
        user = AuthUser(
            user_id="usr_test",
            email="test@example.com",
            username="Test",
            password_hash=fixed_password_hash,
        )

        assert user.failed_login_attempts == 0

        user.increment_failed_login()
        assert user.failed_login_attempts == 1

        user.increment_failed_login()
        assert user.failed_login_attempts == 2

    def test_increment_failed_login_locks_after_5_attempts(self, fixed_password_hash):
        """Test account locks after 5 failed login attempts."""
        user = AuthUser(
            user_id="usr_test",
            email="test@example.com",
            username="Test",
            password_hash=fixed_password_hash,
        )

        # Attempt 1-4: No lock
        for i in range(4):
            user.increment_failed_login()
            assert user.locked_until is None

        # Attempt 5: Should lock
        user.increment_failed_login()
        assert user.locked_until is not None
        assert user.is_locked() is True

    def test_reset_failed_login_clears_counter_and_lock(self, fixed_password_hash):
        """Test reset_failed_login() clears counter and removes lock."""
        user = AuthUser(
            user_id="usr_test",
            email="test@example.com",
            username="Test",
            password_hash=fixed_password_hash,
            failed_login_attempts=5,
            locked_until=datetime.utcnow() + timedelta(minutes=30)
        )

        assert user.failed_login_attempts == 5
        assert user.is_locked() is True

        user.reset_failed_login()

        assert user.failed_login_attempts == 0
        assert user.locked_until is None
        assert user.is_locked() is False


class TestUserCreateRequest:
    """Tests for UserCreateRequest model."""

    def test_valid_user_create_request(self, fixed_password_hash):
        """Test valid user creation request."""
        request = UserCreateRequest(
            email="newuser@example.com",
            username="New User",
            password="SecureP@ssw0rd123",
            role="viewer"
        )

        assert request.email == "newuser@example.com"
        assert request.username == "New User"
        assert request.password == "SecureP@ssw0rd123"
        assert request.role == "viewer"

    def test_password_minimum_length(self, fixed_password_hash):
        """Test password must be at least 8 characters."""
        with pytest.raises(ValidationError):
            UserCreateRequest(
                email="test@example.com",
                username="Test",
                password="Short1!",  # Only 7 characters
            )

    def test_defaults_to_viewer_role(self, fixed_password_hash):
        """Test user creation defaults to viewer role."""
        request = UserCreateRequest(
            email="test@example.com",
            username="Test",
            password="SecureP@ss123"
        )

        assert request.role == "viewer"


class TestLoginRequest:
    """Tests for LoginRequest model."""

    def test_valid_login_request(self, fixed_password_hash):
        """Test valid login request."""
        request = LoginRequest(
            email="test@example.com",
            password="password123"
        )

        assert request.email == "test@example.com"
        assert request.password == "password123"

    def test_invalid_email_raises_error(self, fixed_password_hash):
        """Test invalid email in login request raises error."""
        with pytest.raises(ValidationError):
            LoginRequest(
                email="not-an-email",
                password="password123"
            )

    def test_empty_password_raises_error(self, fixed_password_hash):
        """Test empty password raises error."""
        with pytest.raises(ValidationError):
            LoginRequest(
                email="test@example.com",
                password=""
            )
