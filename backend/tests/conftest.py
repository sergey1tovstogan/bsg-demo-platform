"""
Pytest configuration and fixtures for authentication tests.
"""

import pytest
import bcrypt
from fastapi.testclient import TestClient
from datetime import datetime
from app.main import app
from app.models.auth_user import AuthUser, UserProfile
from app.services.auth_services import hash_password, create_access_token
from app.services.user_service import UserService


@pytest.fixture
def valid_password_hash():
    """Generate a valid bcrypt password hash for testing."""
    return bcrypt.hashpw(b'testpassword', bcrypt.gensalt()).decode()


@pytest.fixture
def fixed_password_hash():
    """Fixed bcrypt hash for consistent tests."""
    # Hash of "testpassword"
    return "$2b$12$goQh.8mW.2yb8BRU/qW8ZeGv4aTKzLwKBuQgj71bbiAfFd9KQSQ8S"


@pytest.fixture
def client():
    """FastAPI test client."""
    return TestClient(app)


@pytest.fixture
async def test_admin_user():
    """Create a test admin user."""
    return AuthUser(
        user_id="usr_test_admin",
        email="testadmin@example.com",
        username="Test Admin",
        password_hash=hash_password("AdminPass123!"),
        role="admin",
        profile=UserProfile(
            first_name="Test",
            last_name="Admin",
            avatar_url=None,
            timezone="UTC"
        ),
        is_active=True,
        email_verified=True,
        must_change_password=False,
        failed_login_attempts=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        created_by="system",
        updated_by="system"
    )


@pytest.fixture
async def test_viewer_user():
    """Create a test viewer user."""
    return AuthUser(
        user_id="usr_test_viewer",
        email="testviewer@example.com",
        username="Test Viewer",
        password_hash=hash_password("ViewerPass123!"),
        role="viewer",
        profile=UserProfile(
            first_name="Test",
            last_name="Viewer",
            avatar_url=None,
            timezone="UTC"
        ),
        is_active=True,
        email_verified=True,
        must_change_password=False,
        failed_login_attempts=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        created_by="system",
        updated_by="system"
    )


@pytest.fixture
def admin_token(test_admin_user):
    """Generate JWT token for admin user."""
    token_data = {
        "user_id": test_admin_user.user_id,
        "email": test_admin_user.email,
        "role": test_admin_user.role
    }
    return create_access_token(token_data)


@pytest.fixture
def viewer_token(test_viewer_user):
    """Generate JWT token for viewer user."""
    token_data = {
        "user_id": test_viewer_user.user_id,
        "email": test_viewer_user.email,
        "role": test_viewer_user.role
    }
    return create_access_token(token_data)


@pytest.fixture
def admin_client(client, admin_token):
    """HTTP client authenticated as admin."""
    client.headers["Authorization"] = f"Bearer {admin_token}"
    return client


@pytest.fixture
def viewer_client(client, viewer_token):
    """HTTP client authenticated as viewer."""
    client.headers["Authorization"] = f"Bearer {viewer_token}"
    return client
