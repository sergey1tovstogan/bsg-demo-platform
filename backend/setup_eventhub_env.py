"""
Helper script to set up Event Hub environment variables.

This script creates a .env file with the Event Hub connection string.
"""

import os
from pathlib import Path

# Event Hub configuration
EVENTHUB_CONFIG = {
    "EVENTHUB_CONNECTION_STRING": "Endpoint=sb://bbkeventstoreehnseventstore.servicebus.windows.net/;SharedAccessKeyName=RootManageSharedAccessKey;SharedAccessKey=CIn9ifBO5391MMhHifUdFtYskmszxxKXo+AEhKUOTcI=",
    "EVENTHUB_NAME": "modelbank-event-topic",
    "EVENTHUB_CONSUMER_GROUP": "$Default",
    "EVENTHUB_BUFFER_SIZE": "1000"
}

def setup_env_file():
    """Create or update .env file with Event Hub configuration."""
    # Get project root (parent of backend directory)
    backend_dir = Path(__file__).parent
    project_root = backend_dir.parent
    env_file = project_root / ".env"
    
    print("=" * 60)
    print("Event Hub Environment Setup")
    print("=" * 60)
    print()
    print(f"Project root: {project_root}")
    print(f"Environment file: {env_file}")
    print()
    
    # Check if .env exists
    if env_file.exists():
        print("⚠️  .env file already exists")
        response = input("Do you want to add/update Event Hub settings? (y/n): ")
        if response.lower() != 'y':
            print("Cancelled.")
            return
        
        # Read existing content
        with open(env_file, 'r') as f:
            existing_content = f.read()
    else:
        existing_content = ""
        print("Creating new .env file...")
    
    # Prepare Event Hub settings
    new_lines = []
    if "EVENTHUB_CONNECTION_STRING" not in existing_content:
        new_lines.append(f"# Azure Event Hub Configuration")
        for key, value in EVENTHUB_CONFIG.items():
            new_lines.append(f"{key}={value}")
        new_lines.append("")
    
    # Write to file
    with open(env_file, 'a') as f:
        if new_lines:
            f.write("\n".join(new_lines))
            print("✅ Event Hub configuration added to .env file")
        else:
            print("ℹ️  Event Hub settings already exist in .env file")
    
    print()
    print("Configuration added:")
    for key, value in EVENTHUB_CONFIG.items():
        if key == "EVENTHUB_CONNECTION_STRING":
            # Mask the key for display
            masked = value.split("SharedAccessKey=")[0] + "SharedAccessKey=***"
            print(f"  {key}={masked}")
        else:
            print(f"  {key}={value}")
    
    print()
    print("=" * 60)
    print("✅ Setup complete!")
    print("=" * 60)
    print()
    print("Next steps:")
    print("1. Start the backend: cd backend && uvicorn app.main:app --reload")
    print("2. Test connection: python test_eventhub_connection.py")
    print("3. Check health: curl http://localhost:8000/api/v1/events/health")

if __name__ == "__main__":
    try:
        setup_env_file()
    except KeyboardInterrupt:
        print("\n\nSetup cancelled by user")
    except Exception as e:
        print(f"\n\nError: {e}")
        import traceback
        traceback.print_exc()

