"""
Azure Cosmos DB Serverless Migration Script

Migrates Cosmos DB from provisioned throughput to serverless mode.
This script uses Azure CLI to perform the migration.
"""

import subprocess
import sys
import json
from datetime import datetime

def run_azure_cli_command(command):
    """Run an Azure CLI command and return the result."""
    try:
        result = subprocess.run(
            command,
            shell=True,
            capture_output=True,
            text=True,
            check=True
        )
        return {"success": True, "output": result.stdout, "error": None}
    except subprocess.CalledProcessError as e:
        return {"success": False, "output": e.stdout, "error": e.stderr}

def check_current_configuration():
    """Check current Cosmos DB configuration."""
    print("=" * 80)
    print("Step 1: Checking Current Configuration")
    print("=" * 80)
    
    command = (
        "az cosmosdb show "
        "--name bsg-demo-platform-mongodb "
        "--resource-group bsg-demo-platform "
        "--output json"
    )
    
    result = run_azure_cli_command(command)
    
    if result["success"]:
        config = json.loads(result["output"])
        print(f"\nCurrent Configuration:")
        print(f"  Name: {config.get('name', 'N/A')}")
        print(f"  Location: {config.get('location', 'N/A')}")
        print(f"  Kind: {config.get('kind', 'N/A')}")
        
        # Check if already serverless
        capabilities = config.get('capabilities', [])
        if isinstance(capabilities, list):
            print(f"  Capabilities: {[cap.get('name', 'N/A') for cap in capabilities]}")
            is_serverless = any(cap.get('name') == 'EnableServerless' for cap in capabilities)
        else:
            print(f"  Capabilities: {capabilities}")
            is_serverless = False
        
        if is_serverless:
            print("\n[WARNING] Cosmos DB is already in serverless mode!")
            return False
        
        return True
    else:
        print(f"\n[ERROR] Error checking configuration:")
        print(result["error"])
        return False

def migrate_to_serverless():
    """Migrate Cosmos DB to serverless mode."""
    print("\n" + "=" * 80)
    print("Step 2: Migrating to Serverless Mode")
    print("=" * 80)
    
    print("\n[IMPORTANT] This will change your Cosmos DB to serverless mode.")
    print("   - Current cost: ~$134.67/month")
    print("   - Expected cost: ~$15/month")
    print("   - This change takes 1-2 minutes")
    print("   - Your data will NOT be affected")
    
    response = input("\nDo you want to proceed? (yes/no): ").strip().lower()
    
    if response != "yes":
        print("\n[INFO] Migration cancelled by user.")
        return False
    
    command = (
        "az cosmosdb update "
        "--name bsg-demo-platform-mongodb "
        "--resource-group bsg-demo-platform "
        "--capabilities EnableServerless"
    )
    
    print("\n[MIGRATING] Migrating to serverless mode...")
    result = run_azure_cli_command(command)
    
    if result["success"]:
        print("\n[SUCCESS] Successfully migrated to serverless mode!")
        return True
    else:
        print(f"\n[ERROR] Error during migration:")
        print(result["error"])
        return False

def verify_migration():
    """Verify that serverless mode is enabled."""
    print("\n" + "=" * 80)
    print("Step 3: Verifying Migration")
    print("=" * 80)
    
    command = (
        "az cosmosdb show "
        "--name bsg-demo-platform-mongodb "
        "--resource-group bsg-demo-platform "
        "--output json"
    )
    
    result = run_azure_cli_command(command)
    
    if result["success"]:
        config = json.loads(result["output"])
        capabilities = config.get('capabilities', [])
        if isinstance(capabilities, list):
            is_serverless = any(cap.get('name') == 'EnableServerless' for cap in capabilities)
        else:
            is_serverless = False
        
        if is_serverless:
            print("\n[SUCCESS] Serverless mode is enabled!")
            return True
        else:
            print("\n[WARNING] Serverless capability not found. Migration may not have completed.")
            return False
    else:
        print(f"\n[ERROR] Error verifying migration:")
        print(result["error"])
        return False

def main():
    """Main migration function."""
    print("\n" + "=" * 80)
    print("Azure Cosmos DB Serverless Migration")
    print("=" * 80)
    print(f"\nStarted at: {datetime.now().isoformat()}\n")
    
    # Step 1: Check current configuration
    if not check_current_configuration():
        sys.exit(1)
    
    # Step 2: Migrate to serverless
    if not migrate_to_serverless():
        sys.exit(1)
    
    # Step 3: Verify migration
    if not verify_migration():
        print("\n⚠️  Migration completed but verification failed.")
        print("   Please check Azure Portal manually.")
        sys.exit(1)
    
    print("\n" + "=" * 80)
    print("Migration Complete!")
    print("=" * 80)
    print("\n[SUCCESS] Cosmos DB has been successfully migrated to serverless mode.")
    print("\nNext Steps:")
    print("  1. Monitor costs in Azure Portal (should drop significantly)")
    print("  2. Test your application to ensure everything works")
    print("  3. Set up cost alerts ($30/month threshold)")
    print("  4. Monitor for cold starts (100-500ms delay on first request)")
    print("\n" + "=" * 80 + "\n")

if __name__ == "__main__":
    main()
