"""Create MongoDB collections for BSG Demo Platform."""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

async def create_collections():
    """Create required collections in MongoDB."""
    connection_string = "mongodb://bsg-demo-platform-mongodb:wC418aLYO4SazuhljALVOclZc48spvoHidWukgFDOoBCjO5Z4wjjKPziuJ44TAUyVlOs89HeL4a5ACDbdAs80w==@bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255/?ssl=true&replicaSet=globaldb&retrywrites=false&maxIdleTimeMS=120000&appName=@bsg-demo-platform-mongodb@"
    database_name = "bsg_demo"
    
    collections_to_create = [
        "videos",
        "security_docs",  # MongoDB collection names can't have spaces, using underscore
        "presentations",
        "data_architecture"  # Data Architecture component collection
    ]
    
    try:
        print(f"Connecting to MongoDB...")
        print(f"Host: bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255")
        
        client = AsyncIOMotorClient(
            connection_string,
            serverSelectionTimeoutMS=30000,
            connectTimeoutMS=30000,
            socketTimeoutMS=30000,
        )
        
        # Test connection
        await client.admin.command('ping')
        print("[OK] Connection successful!")
        
        # Get database
        db = client[database_name]
        print(f"[OK] Database '{database_name}' accessible")
        
        # Create collections
        print(f"\nCreating collections...")
        for collection_name in collections_to_create:
            # Check if collection exists
            existing_collections = await db.list_collection_names()
            
            if collection_name in existing_collections:
                print(f"  [SKIP] Collection '{collection_name}' already exists")
            else:
                # Create collection by inserting an empty document and then deleting it
                # This ensures the collection is created
                await db[collection_name].insert_one({"_created": True})
                await db[collection_name].delete_one({"_created": True})
                print(f"  [OK] Created collection '{collection_name}'")
        
        # Create indexes for better performance
        print(f"\nCreating indexes...")
        
        # Videos collection indexes
        await db["videos"].create_index("video_id", unique=True)
        await db["videos"].create_index("component_id")
        await db["videos"].create_index("title")
        print("  [OK] Indexes created for 'videos' collection")
        
        # Security docs collection indexes
        await db["security_docs"].create_index("doc_id", unique=True)
        await db["security_docs"].create_index("title")
        await db["security_docs"].create_index("category")
        print("  [OK] Indexes created for 'security_docs' collection")
        
        # Presentations collection indexes
        await db["presentations"].create_index("presentation_id", unique=True)
        await db["presentations"].create_index("title")
        await db["presentations"].create_index("component_id")
        print("  [OK] Indexes created for 'presentations' collection")

        # Data Architecture collection indexes
        await db["data_architecture"].create_index("content_id", unique=True)
        await db["data_architecture"].create_index("title")
        await db["data_architecture"].create_index("type")
        await db["data_architecture"].create_index("order")
        # Add index for database connection configs
        await db["data_architecture"].create_index([
            ("config_type", 1),
            ("connection_name", 1),
            ("component_id", 1)
        ], unique=True)
        print("  [OK] Indexes created for 'data_architecture' collection")

        # Insert SQL Server connection configuration
        print(f"\nInserting SQL Server connection configuration...")
        connection_config = {
            "config_type": "database_connection",
            "connection_name": "demo_sql_server",
            "component_id": "data-architecture",
            "host": "10.1.4.135",
            "port": 1433,
            "user": "dist1",
            "password": "dist1",
            "database": "ODS",
            "schemas": ["ODS"],
            "description": "Demo SQL Server for Data Architecture component",
            "is_active": True
        }

        # Check if connection config already exists
        existing_config = await db["data_architecture"].find_one({
            "config_type": "database_connection",
            "connection_name": "demo_sql_server",
            "component_id": "data-architecture"
        })

        if existing_config:
            # Update existing config
            await db["data_architecture"].update_one(
                {
                    "config_type": "database_connection",
                    "connection_name": "demo_sql_server",
                    "component_id": "data-architecture"
                },
                {"$set": connection_config}
            )
            print("  [OK] Updated existing SQL Server connection configuration")
        else:
            # Insert new config
            await db["data_architecture"].insert_one(connection_config)
            print("  [OK] Inserted SQL Server connection configuration")

        # List all collections
        print(f"\nAll collections in database:")
        all_collections = await db.list_collection_names()
        for coll in sorted(all_collections):
            count = await db[coll].count_documents({})
            print(f"  - {coll}: {count} document(s)")
        
        client.close()
        print(f"\n[SUCCESS] All collections created successfully!")
        return True
        
    except (ConnectionFailure, ServerSelectionTimeoutError) as e:
        print(f"[ERROR] Connection failed: {e}")
        return False
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == "__main__":
    success = asyncio.run(create_collections())
    exit(0 if success else 1)

