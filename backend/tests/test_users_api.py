"""
Integration tests for user management API endpoints.

Following TDD approach - these tests are written FIRST, before implementation.
Tests will initially fail (RED), then we implement to make them pass (GREEN).
"""

import pytest
from app.models.auth_user import UserCreateRequest


class TestListUsersEndpoint:
    """Tests for GET /api/v1/users"""

    @pytest.mark.asyncio
    async def test_admin_can_list_users(self, client):
        """Test admin can list all users."""
        # First login as admin
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        access_token = login_response.json()["access_token"]

        # List users
        response = client.get(
            "/api/v1/users",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert isinstance(data, list)
        assert len(data) >= 2  # At least admin and viewer users

        # Verify no passwords in response
        for user in data:
            assert "password_hash" not in user
            assert "password" not in user
            assert "email" in user
            assert "role" in user

    @pytest.mark.asyncio
    async def test_viewer_cannot_list_users(self, client):
        """Test viewer cannot access user list."""
        # Login as viewer
        login_response = client.post("/api/v1/auth/login", json={
            "email": "viewer@example.com",
            "password": "Viewer"
        })
        access_token = login_response.json()["access_token"]

        # Try to list users
        response = client.get(
            "/api/v1/users",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 403
        assert "permission" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_unauthenticated_cannot_list_users(self, client):
        """Test unauthenticated users cannot list users."""
        response = client.get("/api/v1/users")

        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_list_users_with_role_filter(self, client):
        """Test filtering users by role."""
        # Login as admin
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        access_token = login_response.json()["access_token"]

        # List only admin users
        response = client.get(
            "/api/v1/users?role=admin",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        for user in data:
            assert user["role"] == "admin"


class TestGetUserEndpoint:
    """Tests for GET /api/v1/users/:user_id"""

    @pytest.mark.asyncio
    async def test_admin_can_get_user_details(self, client):
        """Test admin can get user details."""
        # Login as admin
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        access_token = login_response.json()["access_token"]
        admin_user_id = login_response.json()["user"]["user_id"]

        # Get user details
        response = client.get(
            f"/api/v1/users/{admin_user_id}",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "admin@example.com"
        assert data["role"] == "admin"
        assert "password_hash" not in data

    @pytest.mark.asyncio
    async def test_get_nonexistent_user(self, client):
        """Test getting non-existent user returns 404."""
        # Login as admin
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        access_token = login_response.json()["access_token"]

        # Try to get non-existent user
        response = client.get(
            "/api/v1/users/usr_nonexistent",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 404


class TestCreateUserEndpoint:
    """Tests for POST /api/v1/users"""

    @pytest.mark.asyncio
    async def test_admin_can_create_user(self, client):
        """Test admin can create new user."""
        # Login as admin
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        access_token = login_response.json()["access_token"]

        # Create new user
        new_user_data = {
            "email": "newuser@example.com",
            "username": "New Test User",
            "password": "SecurePass123!",
            "role": "viewer"
        }

        response = client.post(
            "/api/v1/users",
            json=new_user_data,
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "newuser@example.com"
        assert data["role"] == "viewer"
        assert "user_id" in data
        assert "password" not in data
        assert "password_hash" not in data

    @pytest.mark.asyncio
    async def test_viewer_cannot_create_user(self, client):
        """Test viewer cannot create users."""
        # Login as viewer
        login_response = client.post("/api/v1/auth/login", json={
            "email": "viewer@example.com",
            "password": "Viewer"
        })
        access_token = login_response.json()["access_token"]

        # Try to create user
        response = client.post(
            "/api/v1/users",
            json={
                "email": "blocked@example.com",
                "username": "Blocked User",
                "password": "Pass123!",
                "role": "viewer"
            },
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 403

    @pytest.mark.asyncio
    async def test_create_user_with_duplicate_email(self, client):
        """Test creating user with existing email fails."""
        # Login as admin
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        access_token = login_response.json()["access_token"]

        # Try to create user with admin's email
        response = client.post(
            "/api/v1/users",
            json={
                "email": "admin@example.com",  # Duplicate!
                "username": "Duplicate Admin",
                "password": "Pass123!",
                "role": "viewer"
            },
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 400
        assert "email" in response.json()["detail"].lower() or "exists" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_create_user_with_weak_password(self, client):
        """Test creating user with weak password fails."""
        # Login as admin
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        access_token = login_response.json()["access_token"]

        # Try to create user with weak password
        response = client.post(
            "/api/v1/users",
            json={
                "email": "weakpass@example.com",
                "username": "Weak Password User",
                "password": "weak",  # Too weak!
                "role": "viewer"
            },
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code in [400, 422]  # Validation error


class TestUpdateUserEndpoint:
    """Tests for PUT /api/v1/users/:user_id"""

    @pytest.mark.asyncio
    async def test_admin_can_update_user(self, client):
        """Test admin can update user."""
        # Login as admin
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        access_token = login_response.json()["access_token"]

        # Get viewer user ID
        users_response = client.get(
            "/api/v1/users",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        viewer_user = next((u for u in users_response.json() if u["email"] == "viewer@example.com"), None)
        assert viewer_user is not None

        # Update viewer user
        response = client.put(
            f"/api/v1/users/{viewer_user['user_id']}",
            json={"username": "Updated Viewer Name"},
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert data["username"] == "Updated Viewer Name"

    @pytest.mark.asyncio
    async def test_admin_can_change_user_role(self, client):
        """Test admin can change user role."""
        # Login as admin
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        access_token = login_response.json()["access_token"]

        # Get viewer user
        users_response = client.get(
            "/api/v1/users",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        viewer_user = next((u for u in users_response.json() if u["email"] == "viewer@example.com"), None)

        # Change role to admin
        response = client.put(
            f"/api/v1/users/{viewer_user['user_id']}",
            json={"role": "admin"},
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 200
        assert response.json()["role"] == "admin"

    @pytest.mark.asyncio
    async def test_viewer_cannot_update_users(self, client):
        """Test viewer cannot update users."""
        # Login as viewer
        login_response = client.post("/api/v1/auth/login", json={
            "email": "viewer@example.com",
            "password": "Viewer"
        })
        access_token = login_response.json()["access_token"]
        viewer_user_id = login_response.json()["user"]["user_id"]

        # Try to update own profile
        response = client.put(
            f"/api/v1/users/{viewer_user_id}",
            json={"username": "Hacked Name"},
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 403


class TestDeleteUserEndpoint:
    """Tests for DELETE /api/v1/users/:user_id"""

    @pytest.mark.asyncio
    async def test_admin_can_delete_user(self, client):
        """Test admin can delete users."""
        # Login as admin
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        access_token = login_response.json()["access_token"]

        # Create a user to delete
        create_response = client.post(
            "/api/v1/users",
            json={
                "email": "todelete@example.com",
                "username": "To Delete",
                "password": "Pass123!",
                "role": "viewer"
            },
            headers={"Authorization": f"Bearer {access_token}"}
        )
        user_id = create_response.json()["user_id"]

        # Delete the user
        response = client.delete(
            f"/api/v1/users/{user_id}",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 204

        # Verify user is deleted
        get_response = client.get(
            f"/api/v1/users/{user_id}",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        assert get_response.status_code == 404

    @pytest.mark.asyncio
    async def test_admin_cannot_delete_themselves(self, client):
        """Test admin cannot delete their own account."""
        # Login as admin
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        access_token = login_response.json()["access_token"]
        admin_user_id = login_response.json()["user"]["user_id"]

        # Try to delete own account
        response = client.delete(
            f"/api/v1/users/{admin_user_id}",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 400
        assert "yourself" in response.json()["detail"].lower() or "own" in response.json()["detail"].lower()

    @pytest.mark.asyncio
    async def test_viewer_cannot_delete_users(self, client):
        """Test viewer cannot delete users."""
        # Login as viewer
        login_response = client.post("/api/v1/auth/login", json={
            "email": "viewer@example.com",
            "password": "Viewer"
        })
        access_token = login_response.json()["access_token"]

        # Try to delete admin user
        response = client.delete(
            "/api/v1/users/usr_admin_001",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 403


class TestResetPasswordEndpoint:
    """Tests for POST /api/v1/users/:user_id/reset-password"""

    @pytest.mark.asyncio
    async def test_admin_can_reset_user_password(self, client):
        """Test admin can reset user password."""
        # Login as admin
        login_response = client.post("/api/v1/auth/login", json={
            "email": "admin@example.com",
            "password": "Admin"
        })
        access_token = login_response.json()["access_token"]

        # Get viewer user
        users_response = client.get(
            "/api/v1/users",
            headers={"Authorization": f"Bearer {access_token}"}
        )
        viewer_user = next((u for u in users_response.json() if u["email"] == "viewer@example.com"), None)

        # Reset password
        response = client.post(
            f"/api/v1/users/{viewer_user['user_id']}/reset-password",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 200
        data = response.json()
        assert "temporary_password" in data
        assert "must_change_password" in data
        assert data["must_change_password"] == True
        assert len(data["temporary_password"]) >= 12

    @pytest.mark.asyncio
    async def test_viewer_cannot_reset_passwords(self, client):
        """Test viewer cannot reset passwords."""
        # Login as viewer
        login_response = client.post("/api/v1/auth/login", json={
            "email": "viewer@example.com",
            "password": "Viewer"
        })
        access_token = login_response.json()["access_token"]

        # Try to reset admin password
        response = client.post(
            "/api/v1/users/usr_admin_001/reset-password",
            headers={"Authorization": f"Bearer {access_token}"}
        )

        assert response.status_code == 403


# Test count summary:
# - TestListUsersEndpoint: 4 tests
# - TestGetUserEndpoint: 2 tests
# - TestCreateUserEndpoint: 4 tests
# - TestUpdateUserEndpoint: 3 tests
# - TestDeleteUserEndpoint: 3 tests
# - TestResetPasswordEndpoint: 2 tests
# Total: 18 tests
