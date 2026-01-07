"""
Setup TDH Database Connections in MongoDB

This script creates database connection configurations for ODS and SDS
in MongoDB for use by the Data Architecture demo component.
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


async def setup_tdh_connections():
    """Setup ODS and SDS database connections in MongoDB"""
    
    # Connect to MongoDB
    client = AsyncIOMotorClient(settings.DATABASE_URL)
    db = client[settings.DATABASE_NAME]
    
    # Connection configurations
    connections = [
        {
            "config_type": "database_connection",
            "connection_name": "tdh_ods",
            "component_id": "data-architecture",
            "is_active": True,
            "host": "bsgtdh-sql-r2510.database.windows.net",
            "port": 1433,
            "user": "tdhadmin",
            "password": "TDH@R25.10.4#SecurePass!",
            "database": "ODS",
            "schema": "ODS",
            "schemas": ["ODS"],
            "description": "TDH ODS Database Connection",
            "created_at": "now"
        },
        {
            "config_type": "database_connection",
            "connection_name": "tdh_sds",
            "component_id": "data-architecture",
            "is_active": True,
            "host": "bsgtdh-sql-r2510.database.windows.net",
            "port": 1433,
            "user": "tdhadmin",
            "password": "TDH@R25.10.4#SecurePass!",
            "database": "SDS",
            "schema": "SDS",
            "schemas": ["SDS"],
            "description": "TDH SDS Database Connection",
            "created_at": "now"
        }
    ]
    
    try:
        # Insert or update connections
        for conn in connections:
            result = await db["data_architecture"].update_one(
                {
                    "config_type": "database_connection",
                    "connection_name": conn["connection_name"],
                    "component_id": conn["component_id"]
                },
                {
                    "$set": conn
                },
                upsert=True
            )
            
            if result.upserted_id:
                logger.info(f"Created connection: {conn['connection_name']} ({conn['database']})")
            else:
                logger.info(f"Updated connection: {conn['connection_name']} ({conn['database']})")
        
        logger.info("Successfully setup TDH database connections!")
        
    except Exception as e:
        logger.error(f"Error setting up connections: {e}")
        raise
    finally:
        client.close()


if __name__ == "__main__":
    asyncio.run(setup_tdh_connections())

