"""
Authentication Services

Password hashing/verification and JWT token management.
"""

import bcrypt
import jwt
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from app.core.config import settings


class PasswordService:
    """Service for password hashing and verification."""

    @staticmethod
    def hash_password(password: str) -> str:
        """
        Hash a password using bcrypt.

        Args:
            password: Plain text password

        Returns:
            Bcrypt hash string (60 characters)
        """
        password_bytes = password.encode('utf-8')
        salt = bcrypt.gensalt(rounds=12)
        hashed = bcrypt.hashpw(password_bytes, salt)
        return hashed.decode('utf-8')

    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """
        Verify a password against a hash.

        Args:
            plain_password: Plain text password to verify
            hashed_password: Bcrypt hash to check against

        Returns:
            True if password matches, False otherwise
        """
        password_bytes = plain_password.encode('utf-8')
        hashed_bytes = hashed_password.encode('utf-8')
        return bcrypt.checkpw(password_bytes, hashed_bytes)

    @staticmethod
    def validate_password_strength(password: str) -> tuple[bool, str]:
        """
        Validate password meets security requirements.

        Requirements:
        - Minimum 8 characters
        - At least 1 uppercase letter
        - At least 1 lowercase letter
        - At least 1 number
        - At least 1 special character

        Args:
            password: Password to validate

        Returns:
            Tuple of (is_valid, error_message)
        """
        if len(password) < 8:
            return False, "Password must be at least 8 characters long"

        if not any(c.isupper() for c in password):
            return False, "Password must contain at least one uppercase letter"

        if not any(c.islower() for c in password):
            return False, "Password must contain at least one lowercase letter"

        if not any(c.isdigit() for c in password):
            return False, "Password must contain at least one number"

        special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        if not any(c in special_chars for c in password):
            return False, "Password must contain at least one special character (!@#$%^&*()_+-=[]{}|;:,.<>?)"

        return True, ""


class JWTService:
    """Service for JWT token creation and verification."""

    SECRET_KEY = getattr(settings, 'JWT_SECRET_KEY', getattr(settings, 'SECRET_KEY', 'dev-secret-key-change-in-production'))
    ALGORITHM = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES = 15
    REFRESH_TOKEN_EXPIRE_DAYS = 30

    @classmethod
    def create_access_token(cls, data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
        """
        Create a JWT access token.

        Args:
            data: Payload data to encode in token
            expires_delta: Optional custom expiration time

        Returns:
            Encoded JWT token string
        """
        to_encode = data.copy()

        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=cls.ACCESS_TOKEN_EXPIRE_MINUTES)

        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "access"
        })

        encoded_jwt = jwt.encode(to_encode, cls.SECRET_KEY, algorithm=cls.ALGORITHM)
        return encoded_jwt

    @classmethod
    def create_refresh_token(cls, data: Dict[str, Any]) -> str:
        """
        Create a JWT refresh token (longer expiration).

        Args:
            data: Payload data to encode in token

        Returns:
            Encoded JWT token string
        """
        to_encode = data.copy()
        expire = datetime.utcnow() + timedelta(days=cls.REFRESH_TOKEN_EXPIRE_DAYS)

        to_encode.update({
            "exp": expire,
            "iat": datetime.utcnow(),
            "type": "refresh"
        })

        encoded_jwt = jwt.encode(to_encode, cls.SECRET_KEY, algorithm=cls.ALGORITHM)
        return encoded_jwt

    @classmethod
    def verify_token(cls, token: str) -> Dict[str, Any]:
        """
        Verify and decode a JWT token.

        Args:
            token: JWT token string to verify

        Returns:
            Decoded token payload

        Raises:
            jwt.ExpiredSignatureError: Token has expired
            jwt.InvalidTokenError: Token is invalid
        """
        try:
            payload = jwt.decode(token, cls.SECRET_KEY, algorithms=[cls.ALGORITHM])
            return payload
        except jwt.ExpiredSignatureError:
            raise jwt.ExpiredSignatureError("Token has expired")
        except jwt.InvalidTokenError:
            raise jwt.InvalidTokenError("Invalid token")

    @classmethod
    def refresh_access_token(cls, refresh_token: str) -> str:
        """
        Create a new access token from a refresh token.

        Args:
            refresh_token: Valid refresh token

        Returns:
            New access token

        Raises:
            jwt.InvalidTokenError: Refresh token is invalid or wrong type
        """
        payload = cls.verify_token(refresh_token)

        if payload.get("type") != "refresh":
            raise jwt.InvalidTokenError("Token is not a refresh token")

        # Create new access token with user data
        user_data = {k: v for k, v in payload.items() if k not in ["exp", "iat", "type"]}
        return cls.create_access_token(user_data)


# Convenience exports
hash_password = PasswordService.hash_password
verify_password = PasswordService.verify_password
validate_password_strength = PasswordService.validate_password_strength

create_access_token = JWTService.create_access_token
create_refresh_token = JWTService.create_refresh_token
verify_token = JWTService.verify_token
refresh_access_token = JWTService.refresh_access_token
