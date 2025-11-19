"""
Import Converted PPT HTML to MongoDB

This script takes a converted HTML file and imports it into MongoDB
as observability content, making it available in the application.
"""

import asyncio
import os
from pathlib import Path
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables
load_dotenv()


async def import_html_to_mongodb(html_file_path: str, content_id: str = "monitoring-interaction-ppt"):
    """Import HTML content to MongoDB."""
    
    connection_string = os.getenv("DATABASE_URL")
    database_name = os.getenv("DATABASE_NAME", "bsg_demo")
    
    html_path = Path(html_file_path)
    
    if not html_path.exists():
        print(f"[ERROR] HTML file not found: {html_file_path}")
        return False
    
    # Read HTML content
    html_content = html_path.read_text(encoding='utf-8')
    
    try:
        print(f"Connecting to MongoDB...")
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
        
        # Prepare content document
        content_doc = {
            "component_id": "observability",
            "content_id": content_id,
            "title": "Monitoring Interaction",
            "type": "html",
            "order": 1,
            "body": {
                "html": html_content
            },
            "metadata": {
                "source": "PowerPoint",
                "converted_at": datetime.utcnow().isoformat(),
                "interactive": True
            },
            "created_at": datetime.utcnow().isoformat(),
            "updated_at": datetime.utcnow().isoformat()
        }
        
        # Upsert content (update if exists, insert if not)
        result = await db.content.update_one(
            {
                "component_id": "observability",
                "content_id": content_id
            },
            {
                "$set": content_doc
            },
            upsert=True
        )
        
        if result.upserted_id:
            print(f"[OK] Content inserted with ID: {result.upserted_id}")
        else:
            print(f"[OK] Content updated successfully")
        
        print(f"[OK] HTML content imported to MongoDB")
        print(f"    Component: observability")
        print(f"    Content ID: {content_id}")
        print(f"    Size: {len(html_content) / 1024:.2f} KB")
        
        client.close()
        return True
        
    except Exception as e:
        print(f"[ERROR] Error: {e}")
        import traceback
        traceback.print_exc()
        return False


def main():
    """Main import function."""
    import sys
    
    if len(sys.argv) < 2:
        print("Usage: python import_ppt_html_to_mongodb.py <path_to_html> [content_id]")
        print("\nExample:")
        print("  python import_ppt_html_to_mongodb.py presentation.html")
        print("  python import_ppt_html_to_mongodb.py presentation.html custom-id")
        sys.exit(1)
    
    html_file = sys.argv[1]
    content_id = sys.argv[2] if len(sys.argv) > 2 else "monitoring-interaction-ppt"
    
    success = asyncio.run(import_html_to_mongodb(html_file, content_id))
    sys.exit(0 if success else 1)


if __name__ == "__main__":
    main()

