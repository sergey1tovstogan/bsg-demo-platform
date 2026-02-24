#!/usr/bin/env python3
"""
Create Test Users Script

Creates initial test users for the authentication system:
- Admin user (username: Admin, password: Admin)
- Viewer user (username: Viewer, password: Viewer)
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.adapters.database import get_database_adapter
from app.models.auth_user import AuthUser, UserProfile
from app.services.auth_services import hash_password
from app.utils.datetime_utils import utc_now


async def create_test_users():
    """Create test users in MongoDB."""

    print("=" * 60)
    print("Creating Test Users for Authentication System")
    print("=" * 60)

    # Initialize database
    adapter = get_database_adapter()
    await adapter.connect()
    db = await adapter.get_database()

    users_collection = db["auth_users"]

    # Check if users already exist
    existing_admin = await users_collection.find_one({"email": "admin@example.com"})
    existing_viewer = await users_collection.find_one({"email": "viewer@example.com"})

    if existing_admin and existing_viewer:
        print("\n✓ Test users already exist!")
        print(f"  - Admin user: admin@example.com")
        print(f"  - Viewer user: viewer@example.com")
        await adapter.disconnect()
        return

    # Create Admin user
    if not existing_admin:
        print("\nCreating Admin user...")
        admin_password_hash = hash_password("Admin")

        admin_user = AuthUser(
            user_id="usr_admin_001",
            email="admin@example.com",
            username="Admin User",
            password_hash=admin_password_hash,
            role="admin",
            profile=UserProfile(
                first_name="Admin",
                last_name="User",
                timezone="UTC"
            ),
            is_active=True,
            email_verified=True,
            created_by="system",
            updated_by="system"
        )

        await users_collection.insert_one(admin_user.dict(by_alias=True))
        print("  ✓ Admin user created successfully")
        print(f"    Email: admin@example.com")
        print(f"    Password: Admin")
        print(f"    Role: admin")
    else:
        print("\n  → Admin user already exists")

    # Create Viewer user
    if not existing_viewer:
        print("\nCreating Viewer user...")
        viewer_password_hash = hash_password("Viewer")

        viewer_user = AuthUser(
            user_id="usr_viewer_001",
            email="viewer@example.com",
            username="Viewer User",
            password_hash=viewer_password_hash,
            role="viewer",
            profile=UserProfile(
                first_name="Viewer",
                last_name="User",
                timezone="UTC"
            ),
            is_active=True,
            email_verified=True,
            created_by="system",
            updated_by="system"
        )

        await users_collection.insert_one(viewer_user.dict(by_alias=True))
        print("  ✓ Viewer user created successfully")
        print(f"    Email: viewer@example.com")
        print(f"    Password: Viewer")
        print(f"    Role: viewer")
    else:
        print("\n  → Viewer user already exists")

    print("\n" + "=" * 60)
    print("Test Users Summary")
    print("=" * 60)
    print("\n1. ADMIN USER")
    print("   Email:    admin@example.com")
    print("   Password: Admin")
    print("   Role:     admin")
    print("   Permissions:")
    print("   - Full access to visual editor")
    print("   - Can create/edit/delete cards")
    print("   - Can manage users")
    print("   - Can import/export cards")
    print("\n2. VIEWER USER")
    print("   Email:    viewer@example.com")
    print("   Password: Viewer")
    print("   Role:     viewer")
    print("   Permissions:")
    print("   - Can configure demo card visibility")
    print("   - Can view all published cards")
    print("   - Cannot edit cards or manage users")

    print("\n" + "=" * 60)
    print("Next Steps:")
    print("=" * 60)
    print("\n1. Start the backend server:")
    print("   cd backend")
    print("   source venv/bin/activate")
    print("   python -m uvicorn app.main:app --reload")
    print("\n2. Test login via API:")
    print("   curl -X POST http://localhost:8000/api/v1/auth/login \\")
    print("     -H 'Content-Type: application/json' \\")
    print("     -d '{\"email\":\"admin@example.com\",\"password\":\"Admin\"}'")
    print("\n3. Access the application:")
    print("   - Frontend: http://localhost:5173")
    print("   - Backend API: http://localhost:8000")
    print("   - API Docs: http://localhost:8000/docs")

    print("\n" + "=" * 60)

    await adapter.disconnect()


if __name__ == "__main__":
    try:
        asyncio.run(create_test_users())
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
