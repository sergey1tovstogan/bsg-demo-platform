"""
MSSQL Database Service for External Database Access
Provides connection and query functionality for ODS/SDS databases
"""

import pyodbc
from typing import List, Dict, Any, Optional
from contextlib import contextmanager
import logging
from motor.motor_asyncio import AsyncIOMotorClient
from app.core.config import settings

logger = logging.getLogger(__name__)


class MSSQLService:
    """Service for managing MSSQL database connections and queries"""

    def __init__(
        self,
        host: Optional[str] = None,
        port: Optional[int] = None,
        user: Optional[str] = None,
        password: Optional[str] = None,
        database: Optional[str] = None,
        schema: Optional[str] = None
    ):
        """
        Initialize MSSQL service with connection parameters.
        If parameters are not provided, falls back to settings (for backward compatibility).
        """
        self.host = host or settings.MSSQL_HOST
        self.port = port or settings.MSSQL_PORT
        self.user = user or settings.MSSQL_USER
        self.password = password or settings.MSSQL_PASSWORD
        self.database = database or settings.MSSQL_DATABASE
        self.schema = schema or settings.MSSQL_SCHEMA

    @classmethod
    async def from_mongodb(
        cls,
        connection_name: str = "demo_sql_server",
        component_id: str = "data-architecture"
    ) -> "MSSQLService":
        """
        Create MSSQLService instance with connection details from MongoDB.

        Args:
            connection_name: Name of the connection configuration in MongoDB
            component_id: Component ID to filter connections

        Returns:
            MSSQLService instance configured with MongoDB connection details

        Raises:
            ValueError: If connection configuration not found in MongoDB
        """
        try:
            # Connect to MongoDB
            client = AsyncIOMotorClient(settings.DATABASE_URL)
            db = client[settings.DATABASE_NAME]

            # Fetch connection details from data_architecture collection
            connection_config = await db["data_architecture"].find_one({
                "config_type": "database_connection",
                "connection_name": connection_name,
                "component_id": component_id,
                "is_active": True
            })

            if not connection_config:
                logger.error(
                    f"Database connection '{connection_name}' not found in MongoDB "
                    f"for component '{component_id}'. Falling back to settings."
                )
                client.close()
                return cls()  # Fall back to settings

            logger.info(
                f"Loaded database connection '{connection_name}' from MongoDB "
                f"(host: {connection_config['host']}:{connection_config['port']})"
            )

            client.close()

            # Create instance with MongoDB connection details
            return cls(
                host=connection_config["host"],
                port=connection_config["port"],
                user=connection_config["user"],
                password=connection_config["password"],
                database=connection_config["database"],
                schema=connection_config.get("schemas", [connection_config["database"]])[0]
            )

        except Exception as e:
            logger.error(f"Error loading connection from MongoDB: {e}. Falling back to settings.")
            return cls()  # Fall back to settings on error

    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = None
        try:
            # Build pyodbc connection string
            # For Azure SQL Database, we need Encryption and TrustServerCertificate
            is_azure_sql = '.database.windows.net' in self.host.lower()
            
            if is_azure_sql:
                # Azure SQL Database connection string
                # Try format without port first (Azure SQL auto-detects port 1433)
                # If that fails, we can try with port
                
                # Build connection string with proper Azure SQL attributes
                # Note: Azure SQL often works better without explicit port when using full server name
                conn_str_parts = [
                    "DRIVER={ODBC Driver 17 for SQL Server}",
                    f"Server={self.host}",  # Try without port first
                    f"Database={self.database}",
                    f"Uid={self.user}",
                    f"Pwd={self.password}",  # pyodbc handles special characters automatically
                    "Encrypt=yes",
                    "TrustServerCertificate=no",
                    "Connection Timeout=60"
                ]
                
                conn_str = ";".join(conn_str_parts) + ";"
                
                logger.info(f"Attempting Azure SQL connection to {self.host}, database: {self.database}")
                logger.debug(f"Connection string format: Server={self.host} (port auto-detected)")
            else:
                # On-premises SQL Server connection string
                conn_str = (
                    f"DRIVER={{ODBC Driver 17 for SQL Server}};"
                    f"SERVER={self.host},{self.port};"
                    f"DATABASE={self.database};"
                    f"UID={self.user};"
                    f"PWD={self.password};"
                    f"Connection Timeout=30;"
                )
                logger.info(f"Attempting SQL Server connection to {self.host}:{self.port}, database: {self.database}")
            
            conn = pyodbc.connect(conn_str)
            logger.info(f"Successfully connected to {self.database} on {self.host}")
            yield conn
        except pyodbc.Error as e:
            error_msg = str(e)
            logger.error(f"MSSQL connection error: {error_msg}")
            
            # Provide helpful error message for Azure SQL firewall/VNet issues
            if is_azure_sql and ('timeout' in error_msg.lower() or 'not accessible' in error_msg.lower()):
                logger.error(
                    f"Azure SQL connection failed. This is likely a firewall/VNet configuration issue. "
                    f"Since Azure Bastion is used, ensure one of the following: "
                    f"1) VNet subnet is allowed in SQL firewall rules, "
                    f"2) Private endpoint is configured for SQL, or "
                    f"3) Service endpoint is enabled. "
                    f"Server: {self.host}, Database: {self.database}"
                )
            
            raise
        except Exception as e:
            logger.error(f"Unexpected connection error: {e}")
            raise
        finally:
            if conn:
                conn.close()

    def test_connection(self) -> Dict[str, Any]:
        """Test database connection"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                cursor.execute("SELECT @@VERSION as version")
                result = cursor.fetchone()
                return {
                    "status": "connected",
                    "database": self.database,
                    "host": self.host,
                    "version": result[0] if result else "Unknown"
                }
        except Exception as e:
            logger.error(f"Connection test failed: {e}")
            return {
                "status": "failed",
                "error": str(e),
                "database": self.database,
                "host": self.host
            }

    def get_tables(self, schema: Optional[str] = None) -> List[Dict[str, str]]:
        """Get list of tables in the database"""
        schema = schema or self.schema
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                query = """
                    SELECT
                        TABLE_SCHEMA,
                        TABLE_NAME,
                        TABLE_TYPE
                    FROM INFORMATION_SCHEMA.TABLES
                    WHERE TABLE_SCHEMA = ?
                    ORDER BY TABLE_NAME
                """
                cursor.execute(query, (schema,))

                tables = []
                for row in cursor.fetchall():
                    tables.append({
                        "schema": row[0],
                        "name": row[1],
                        "type": row[2]
                    })
                return tables
        except Exception as e:
            logger.error(f"Error fetching tables: {e}")
            raise

    def get_table_columns(self, table_name: str, schema: Optional[str] = None) -> List[Dict[str, Any]]:
        """Get columns for a specific table"""
        schema = schema or self.schema
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()
                query = """
                    SELECT
                        COLUMN_NAME,
                        DATA_TYPE,
                        CHARACTER_MAXIMUM_LENGTH,
                        IS_NULLABLE,
                        COLUMN_DEFAULT
                    FROM INFORMATION_SCHEMA.COLUMNS
                    WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
                    ORDER BY ORDINAL_POSITION
                """
                cursor.execute(query, (schema, table_name))

                columns = []
                for row in cursor.fetchall():
                    columns.append({
                        "name": row[0],
                        "type": row[1],
                        "max_length": row[2],
                        "nullable": row[3] == 'YES',
                        "default": row[4]
                    })
                return columns
        except Exception as e:
            logger.error(f"Error fetching columns for table {table_name}: {e}")
            raise

    def execute_query(
        self,
        query: str,
        params: Optional[tuple] = None,
        limit: int = 100
    ) -> Dict[str, Any]:
        """Execute a SELECT query and return results"""
        try:
            with self.get_connection() as conn:
                cursor = conn.cursor()

                # Add limit to query if not present
                # Don't add TOP if query already has OFFSET/FETCH (SQL Server doesn't support both)
                if 'TOP' not in query.upper() and 'LIMIT' not in query.upper() and 'OFFSET' not in query.upper() and 'FETCH' not in query.upper():
                    if query.strip().upper().startswith('SELECT'):
                        query = query.replace('SELECT', f'SELECT TOP {limit}', 1)

                if params:
                    cursor.execute(query, params)
                else:
                    cursor.execute(query)

                # Get column names
                columns = [desc[0] for desc in cursor.description] if cursor.description else []

                # Fetch results
                rows = cursor.fetchall()

                # Convert to list of dictionaries
                data = []
                for row in rows:
                    row_dict = {}
                    for idx, value in enumerate(row):
                        # Convert bytes to string if needed
                        if isinstance(value, bytes):
                            value = value.decode('utf-8', errors='replace')
                        row_dict[columns[idx]] = value
                    data.append(row_dict)

                return {
                    "columns": columns,
                    "data": data,
                    "row_count": len(data),
                    "query": query
                }
        except Exception as e:
            logger.error(f"Error executing query: {e}")
            raise

    def get_table_data(
        self,
        table_name: str,
        schema: Optional[str] = None,
        limit: int = 100,
        offset: int = 0
    ) -> Dict[str, Any]:
        """Get data from a specific table"""
        schema = schema or self.schema
        try:
            # Sanitize table name to prevent SQL injection
            # Only allow alphanumeric and underscore
            if not all(c.isalnum() or c == '_' for c in table_name):
                raise ValueError("Invalid table name")
            if not all(c.isalnum() or c == '_' for c in schema):
                raise ValueError("Invalid schema name")

            query = f"""
                SELECT *
                FROM [{schema}].[{table_name}]
                ORDER BY (SELECT NULL)
                OFFSET {offset} ROWS
                FETCH NEXT {limit} ROWS ONLY
            """

            return self.execute_query(query, limit=limit)
        except Exception as e:
            logger.error(f"Error fetching table data: {e}")
            raise

    def get_row_count(self, table_name: str, schema: Optional[str] = None) -> int:
        """Get total row count for a table"""
        schema = schema or self.schema
        try:
            # Sanitize table name
            if not all(c.isalnum() or c == '_' for c in table_name):
                raise ValueError("Invalid table name")
            if not all(c.isalnum() or c == '_' for c in schema):
                raise ValueError("Invalid schema name")

            with self.get_connection() as conn:
                cursor = conn.cursor()
                query = f"SELECT COUNT(*) FROM [{schema}].[{table_name}]"
                cursor.execute(query)
                result = cursor.fetchone()
                return result[0] if result else 0
        except Exception as e:
            logger.error(f"Error getting row count: {e}")
            raise


# Global instance
mssql_service = MSSQLService()
