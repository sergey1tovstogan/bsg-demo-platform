"""
Pytest configuration and fixtures for authentication tests.
"""

import pytest
import bcrypt


@pytest.fixture
def valid_password_hash():
    """Generate a valid bcrypt password hash for testing."""
    return bcrypt.hashpw(b'testpassword', bcrypt.gensalt()).decode()


@pytest.fixture
def fixed_password_hash():
    """Fixed bcrypt hash for consistent tests."""
    # Hash of "testpassword"
    return "$2b$12$goQh.8mW.2yb8BRU/qW8ZeGv4aTKzLwKBuQgj71bbiAfFd9KQSQ8S"
