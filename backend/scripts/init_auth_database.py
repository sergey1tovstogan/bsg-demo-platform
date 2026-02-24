#!/usr/bin/env python3
"""
Initialize Authentication Database

Creates indexes and ensures the auth_users collection is properly configured
in the centralized Azure Cosmos DB MongoDB database.
"""

import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.adapters.database import get_database_adapter
from app.core.logging import get_logger

logger = get_logger(__name__)


async def init_auth_database():
    """Initialize authentication database with indexes."""

    print("=" * 60)
    print("Initializing Authentication Database")
    print("=" * 60)

    # Connect to database
    adapter = get_database_adapter()
    await adapter.connect()
    db = await adapter.get_database()

    auth_users = db["auth_users"]

    print("\n📊 Creating indexes for auth_users collection...")

    # Create indexes
    indexes_created = []
    doc_count = await auth_users.count_documents({})

    # Check for duplicates before creating unique indexes
    if doc_count > 0:
        print(f"  ℹ️  Collection has {doc_count} documents, checking for duplicates...")

        # Check for duplicate emails
        email_pipeline = [
            {"$group": {"_id": "$email", "count": {"$sum": 1}}},
            {"$match": {"count": {"$gt": 1}}}
        ]
        email_duplicates = await auth_users.aggregate(email_pipeline).to_list(length=None)

        # Check for duplicate user_ids
        user_id_pipeline = [
            {"$group": {"_id": "$user_id", "count": {"$sum": 1}}},
            {"$match": {"count": {"$gt": 1}}}
        ]
        user_id_duplicates = await auth_users.aggregate(user_id_pipeline).to_list(length=None)

        if email_duplicates:
            print(f"  ⚠️  Found {len(email_duplicates)} duplicate emails!")
            for dup in email_duplicates:
                print(f"      - {dup['_id']}: {dup['count']} occurrences")
            print("  ⚠️  Please clean up duplicates before creating unique index on email")

        if user_id_duplicates:
            print(f"  ⚠️  Found {len(user_id_duplicates)} duplicate user_ids!")
            for dup in user_id_duplicates:
                print(f"      - {dup['_id']}: {dup['count']} occurrences")
            print("  ⚠️  Please clean up duplicates before creating unique index on user_id")

        if not email_duplicates and not user_id_duplicates:
            print("  ✓ No duplicates found, but Cosmos DB cannot create unique indexes on existing collections")
            print("  ℹ️  Unique constraints will be enforced by application logic")

    # Try to create indexes (may fail for unique indexes if documents exist)
    index_configs = [
        ("email", True, "email (unique)"),
        ("user_id", True, "user_id (unique)"),
        ("role", False, "role"),
        ("is_active", False, "is_active"),
        ("created_at", False, "created_at"),
    ]

    for field, is_unique, description in index_configs:
        try:
            if is_unique and doc_count > 0:
                # Skip unique indexes if documents exist (Cosmos DB limitation)
                print(f"  ⊘ Skipped unique index on '{field}' (enforced by application)")
                continue

            await auth_users.create_index(field, unique=is_unique)
            indexes_created.append(description)
            print(f"  ✓ Created index on '{field}'")
        except Exception as e:
            print(f"  ⚠️  Could not create index on '{field}': {str(e)[:80]}")

    # List all indexes
    print("\n📋 Current indexes on auth_users collection:")
    indexes = await auth_users.list_indexes().to_list(length=None)
    for idx in indexes:
        print(f"  - {idx.get('name')}: {idx.get('key')}")

    # Count documents
    doc_count = await auth_users.count_documents({})
    print(f"\n👥 Total users in database: {doc_count}")

    if doc_count > 0:
        # Show sample users
        users = await auth_users.find({}, {"email": 1, "role": 1, "username": 1, "is_active": 1}).to_list(length=10)
        print("\n📝 Sample users:")
        for user in users:
            status = "✓ Active" if user.get("is_active", True) else "✗ Inactive"
            print(f"  - {user.get('email'):30s} | {user.get('role'):10s} | {status}")

    print("\n" + "=" * 60)
    print("Database Initialization Complete")
    print("=" * 60)
    print(f"\n✓ Indexes created: {len(indexes_created)}")
    print(f"✓ Total users: {doc_count}")
    print(f"✓ Database: {db.name}")
    print(f"✓ Collection: auth_users")

    await adapter.disconnect()


if __name__ == "__main__":
    try:
        asyncio.run(init_auth_database())
    except KeyboardInterrupt:
        print("\n\nOperation cancelled by user.")
        sys.exit(1)
    except Exception as e:
        print(f"\n\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
