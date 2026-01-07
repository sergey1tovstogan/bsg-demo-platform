# TDH Database Connections Setup

This document explains how to configure the TDH (ODS/SDS) database connections for the Data Architecture demo.

## Database Connection Details

The following connections are configured:

### ODS (Operational Data Store)
- **Server**: bsgtdh-sql-r2510.database.windows.net
- **Port**: 1433
- **User**: tdhadmin
- **Password**: TDH@R25.10.4#SecurePass!
- **Database**: ODS
- **Schema**: ODS

### SDS (Structured Data Store)
- **Server**: bsgtdh-sql-r2510.database.windows.net
- **Port**: 1433
- **User**: tdhadmin
- **Password**: TDH@R25.10.4#SecurePass!
- **Database**: SDS
- **Schema**: SDS

## Setup Instructions

1. **Run the setup script** to insert connection details into MongoDB:

```bash
cd backend
python scripts/setup_tdh_database_connections.py
```

This script will:
- Create/update the `tdh_ods` connection in MongoDB
- Create/update the `tdh_sds` connection in MongoDB
- Store connections in the `data_architecture` collection

2. **Verify the connections** by checking the MongoDB collection:

The connections are stored in MongoDB with the following structure:
```json
{
  "config_type": "database_connection",
  "connection_name": "tdh_ods",  // or "tdh_sds"
  "component_id": "data-architecture",
  "is_active": true,
  "host": "bsgtdh-sql-r2510.database.windows.net",
  "port": 1433,
  "user": "tdhadmin",
  "password": "TDH@R25.10.4#SecurePass!",
  "database": "ODS",  // or "SDS"
  "schema": "ODS",    // or "SDS"
  "schemas": ["ODS"]  // or ["SDS"]
}
```

## VNet and Firewall Configuration

Since Azure Bastion is used for authentication, the backend is likely in a VNet. For Azure SQL connections from a VNet, configure one of the following:

### Option 1: Allow VNet Subnet in SQL Firewall
1. Go to Azure Portal → SQL Server (`bsgtdh-sql-r2510`) → **Networking**
2. Under **Firewall rules**, click **Add existing virtual network**
3. Select the VNet and subnet where the backend is running
4. Save the changes

### Option 2: Configure Private Endpoint
1. Go to Azure Portal → SQL Server → **Networking**
2. Under **Private access**, configure a private endpoint
3. This allows private connectivity from the VNet

### Option 3: Enable Service Endpoint
1. Go to Azure Portal → VNet → **Service endpoints**
2. Add `Microsoft.Sql` service endpoint to the subnet
3. Then allow the subnet in SQL Server firewall rules

## Usage

The frontend component `DatabaseRecordsTile` uses the `tdh_ods` connection by default. To switch to SDS, you can:

1. Update the component to accept a connection prop
2. Or modify the default connection in `simulation.config.ts`

## API Endpoints

The database API supports both connections:

- **Test Connection**: `GET /api/v1/database/connection/test?connection=tdh_ods`
- **Execute Query**: `POST /api/v1/database/query` with `connection` field in request body

## Notes

- The connections are stored in MongoDB for flexibility
- If MongoDB connection details are not found, the system falls back to settings in `config.py`
- The default connection used by the frontend is `tdh_ods`

