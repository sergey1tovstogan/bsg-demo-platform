"""
MSSQL Database Service for External Database Access
Provides connection and query functionality for ODS/SDS databases
"""

import pymssql
from typing import List, Dict, Any, Optional
from contextlib import contextmanager
import logging
from app.core.config import settings

logger = logging.getLogger(__name__)


class MSSQLService:
    """Service for managing MSSQL database connections and queries"""

    def __init__(self):
        self.host = settings.MSSQL_HOST
        self.port = settings.MSSQL_PORT
        self.user = settings.MSSQL_USER
        self.password = settings.MSSQL_PASSWORD
        self.database = settings.MSSQL_DATABASE
        self.schema = settings.MSSQL_SCHEMA

    @contextmanager
    def get_connection(self):
        """Context manager for database connections"""
        conn = None
        try:
            conn = pymssql.connect(
                server=self.host,
                port=self.port,
                user=self.user,
                password=self.password,
                database=self.database,
                timeout=30,
                login_timeout=30
            )
            yield conn
        except pymssql.Error as e:
            logger.error(f"MSSQL connection error: {e}")
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
                    WHERE TABLE_SCHEMA = %s
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
                    WHERE TABLE_SCHEMA = %s AND TABLE_NAME = %s
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
