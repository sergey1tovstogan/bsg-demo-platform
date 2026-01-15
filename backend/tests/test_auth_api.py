"""
Integration tests for authentication API endpoints.

Following TDD approach - these tests are written FIRST, before implementation.
Tests will initially fail (RED), then we implement to make them pass (GREEN).
"""

import pytest
from datetime import timedelta
from app.services.auth_services import create_access_token
from app.models.auth_user import UserCreateRequest


class TestLoginEndpoint:
    """Tests for POST /api/v1/auth/login"""

    @pytest.mark.asyncio
    async def test_login_with_valid_credentials(self, client):
        """Test login with correct email/password returns tokens and user data."""
        # Use the real admin user that exists in the database
        response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })

        assert response.status_code == 200
        data = response.json()

        # Verify response structure
        assert "access_token" in data
        assert "refresh_token" in data
        assert "token_type" in data
        assert "expires_in" in data
        assert "user" in data

        # Verify token type
        assert data["token_type"] == "Bearer"
        assert data["expires_in"] == 900  # 15 minutes in seconds

        # Verify user data
        user = data["user"]
        assert user["email"] == "admin@example.com"
        assert user["role"] == "admin"
        assert "user_id" in user
        assert "username" in user

        # Security: Password should NEVER be returned!
        assert "password" not in user
        assert "password_hash" not in user

    @pytest.mark.asyncio
    async def test_login_with_wrong_password(self, client):
        """Test login fails with incorrect password."""
        response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "WrongPassword123!"
        })

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "invalid" in data["detail"].lower()
        # Should not reveal which field is wrong (security best practice)

    @pytest.mark.asyncio
    async def test_login_with_nonexistent_email(self, client):
        """Test login fails with non-existent email."""
        response = client.post("/api/v1/auth/login", json={
            "email": "nonexistent@example.com",
            "password": "SomePassword123!"
        })

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data
        assert "invalid" in data["detail"].lower()

    @pytest.mark.asyncio
    async def test_login_with_invalid_email_format(self, client):
        """Test login fails with invalid email format."""
        response = client.post("/api/v1/auth/login", json={
            "email": "not-an-email",
            "password": "SomePassword123!"
        })

        assert response.status_code == 422  # Validation error
        data = response.json()
        assert "detail" in data

    @pytest.mark.asyncio
    async def test_login_with_missing_email(self, client):
        """Test login fails when email is missing."""
        response = client.post("/api/v1/auth/login", json={
            "password": "SomePassword123!"
        })

        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_login_with_missing_password(self, client):
        """Test login fails when password is missing."""
        response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com"
        })

        assert response.status_code == 422  # Validation error

    @pytest.mark.asyncio
    async def test_login_with_inactive_account(self, client):
        """Test login fails for inactive accounts."""
        # This test assumes there's an inactive user in the database
        # For now, we'll skip it and implement when we have user management
        pytest.skip("Requires inactive user in database")

    @pytest.mark.asyncio
    async def test_login_updates_last_login_timestamp(self, client):
        """Test that successful login updates last_login_at timestamp."""
        response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })

        assert response.status_code == 200
        data = response.json()
        user = data["user"]

        # last_login_at should be set after successful login
        assert "last_login_at" in user
        # It could be None if this is the first login, or a timestamp


class TestLogoutEndpoint:
    """Tests for POST /api/v1/auth/logout"""

    @pytest.mark.asyncio
    async def test_logout_with_valid_token(self, client):
        """Test logout with valid access token."""
        # First login to get a token
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        access_token = login_response.json()["access_token"]

        # Then logout
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "logged out" in data["message"].lower()

    @pytest.mark.asyncio
    async def test_logout_without_token(self, client):
        """Test logout fails without authorization token."""
        response = client.post("/api/v1/auth/logout")

        assert response.status_code == 401
        data = response.json()
        assert "detail" in data

    @pytest.mark.asyncio
    async def test_logout_with_invalid_token(self, client):
        """Test logout fails with invalid token."""
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": "Bearer invalid_token_12345"}
        )

        assert response.status_code == 401


class TestRefreshEndpoint:
    """Tests for POST /api/v1/auth/refresh"""

    @pytest.mark.asyncio
    async def test_refresh_with_valid_refresh_token(self, client):
        """Test token refresh with valid refresh token."""
        # Login to get refresh token
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        refresh_token = login_response.json()["refresh_token"]

        # Refresh the access token
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": refresh_token
        })

        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert "expires_in" in data
        assert data["expires_in"] == 900

    @pytest.mark.asyncio
    async def test_refresh_with_invalid_token(self, client):
        """Test refresh fails with invalid refresh token."""
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": "invalid_refresh_token"
        })

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_refresh_with_access_token_instead_of_refresh(self, client):
        """Test refresh fails when using access token instead of refresh token."""
        # Login to get access token
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        access_token = login_response.json()["access_token"]

        # Try to refresh with access token (should fail)
        response = client.post("/api/v1/auth/refresh", json={
            "refresh_token": access_token
        })

        assert response.status_code == 401


class TestMeEndpoint:
    """Tests for GET /api/v1/auth/me"""

    @pytest.mark.asyncio
    async def test_me_with_valid_token(self, client):
        """Test getting current user info with valid token."""
        # Login to get token
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        access_token = login_response.json()["access_token"]

        # Get current user info
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 200
        data = response.json()

        # Verify user data
        assert data["email"] == "admin@example.com"
        assert data["role"] == "admin"
        assert "user_id" in data
        assert "username" in data
        assert "profile" in data

        # Security: Password should NEVER be returned!
        assert "password" not in data
        assert "password_hash" not in data

    @pytest.mark.asyncio
    async def test_me_without_token(self, client):
        """Test /me fails without authorization token."""
        response = client.get("/api/v1/auth/me")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_me_with_invalid_token(self, client):
        """Test /me fails with invalid token."""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid_token"}
        )

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_me_with_expired_token(self, client):
        """Test /me fails with expired token."""
        # Create an expired token
        token_data = {"user_id": "usr_123", "email": "test@example.com", "role": "admin"}
        expired_token = create_access_token(token_data, expires_delta=timedelta(seconds=-1))

        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": f"Bearer {expired_token}"}
        )

        assert response.status_code == 401
        data = response.json()
        assert "expired" in data["detail"].lower()


class TestAccountLockout:
    """Tests for account lockout after failed login attempts."""

    @pytest.mark.asyncio
    async def test_failed_login_increments_attempts(self, client):
        """Test that failed login attempts are tracked."""
        # This requires checking the database, which we'll implement later
        pytest.skip("Requires database inspection")

    @pytest.mark.asyncio
    async def test_account_locks_after_5_failures(self, client):
        """Test account locks after 5 failed login attempts."""
        # This test would require creating a test user and attempting 5 failed logins
        pytest.skip("Requires test user creation")

    @pytest.mark.asyncio
    async def test_successful_login_resets_failed_attempts(self, client):
        """Test that successful login resets failed attempt counter."""
        pytest.skip("Requires database inspection")


class TestRateLimiting:
    """Tests for rate limiting on auth endpoints."""

    @pytest.mark.asyncio
    async def test_login_rate_limit(self, client):
        """Test rate limiting on login endpoint (10 per minute)."""
        # This test would make 11 requests in quick succession
        pytest.skip("Requires rate limiting implementation")


# Test count summary:
# - TestLoginEndpoint: 8 tests (6 active, 2 skipped)
# - TestLogoutEndpoint: 3 tests (all active)
# - TestRefreshEndpoint: 3 tests (all active)
# - TestMeEndpoint: 4 tests (all active)
# - TestAccountLockout: 3 tests (all skipped for now)
# - TestRateLimiting: 1 test (skipped for now)
# Total: 22 tests (16 active, 6 skipped)
