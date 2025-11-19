# Adapter Pattern in BSG Demo Platform

## What is an Adapter?

An **adapter** is a design pattern that allows the application to interact with external services or systems through a standardized interface, without being tightly coupled to specific implementations. Think of it as a "translator" that converts between your application's needs and the external service's requirements.

### Key Benefits

1. **Flexibility**: Switch between different providers (e.g., MongoDB → PostgreSQL, Temenos RAG → OpenAI) without changing core application code
2. **Testability**: Easily mock adapters for unit testing
3. **Maintainability**: Changes to external services are isolated to adapter implementations
4. **Consistency**: All services use the same interface, making code easier to understand

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    Application Services                      │
│  (TemenosService, UserService, ComponentService, etc.)      │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Uses standardized interfaces
                        │
┌───────────────────────▼─────────────────────────────────────┐
│                    Adapter Layer                              │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │ DatabaseAdapter  │         │   RAGAdapter     │          │
│  │   (Interface)    │         │   (Interface)    │          │
│  └────────┬─────────┘         └────────┬─────────┘          │
│           │                            │                     │
│  ┌────────▼─────────┐         ┌────────▼─────────┐          │
│  │ MongoDBAdapter   │         │ TemenosRAGAdapter│          │
│  │ (Implementation) │         │ (Implementation)│          │
│  └──────────────────┘         └──────────────────┘          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        │ Connects to external services
                        │
┌───────────────────────▼─────────────────────────────────────┐
│              External Services                                │
│  ┌──────────────┐              ┌──────────────┐             │
│  │   MongoDB    │              │ Temenos RAG  │             │
│  │ (Cosmos DB)  │              │     API      │             │
│  └──────────────┘              └──────────────┘             │
└───────────────────────────────────────────────────────────────┘
```

## Current Adapter Implementations

### 1. Database Adapter

**Location**: `backend/app/adapters/database/`

#### Base Interface (`base.py`)
Defines the contract that all database adapters must implement:

```python
class DatabaseAdapter(ABC):
    async def connect(self) -> None
    async def disconnect(self) -> None
    async def health_check(self) -> Dict[str, Any]
    async def get_database(self)
    async def get_collection(self, collection_name: str)
    async def find_one(self, collection_name: str, filter: Dict) -> Optional[Dict]
    async def find_many(self, collection_name: str, filter: Optional[Dict]) -> List[Dict]
    async def insert_one(self, collection_name: str, document: Dict) -> str
    async def insert_many(self, collection_name: str, documents: List[Dict]) -> List[str]
    async def update_one(self, collection_name: str, filter: Dict, update: Dict) -> bool
    async def delete_one(self, collection_name: str, filter: Dict) -> bool
    async def create_index(self, collection_name: str, index_fields: List[tuple]) -> None
```

#### Current Implementation: MongoDBAdapter (`mongodb_adapter.py`)

**What it does**:
- Connects to MongoDB (Azure Cosmos DB for MongoDB API)
- Uses Motor (async MongoDB driver) for async operations
- Handles connection pooling and error handling
- Provides health check functionality

**Configuration**:
- `DATABASE_URL`: MongoDB connection string
- `DATABASE_NAME`: Database name (default: `bsg_demo`)
- `DATABASE_TYPE`: Adapter type (default: `mongodb`)

**Usage Example**:
```python
from app.adapters.database import get_database_adapter

# Get adapter instance (singleton)
db_adapter = get_database_adapter()

# Connect to database
await db_adapter.connect()

# Use database operations
user = await db_adapter.find_one("users", {"email": "user@example.com"})
await db_adapter.insert_one("users", {"name": "John", "email": "john@example.com"})
```

**Supported Operations**:
- ✅ CRUD operations (Create, Read, Update, Delete)
- ✅ Index creation
- ✅ Health checks
- ✅ Connection management
- ✅ Async/await support

**Future Possibilities**:
- PostgreSQL adapter
- MySQL adapter
- SQLite adapter (for testing)
- In-memory adapter (for testing)

---

### 2. RAG Adapter

**Location**: `backend/app/adapters/rag/`

#### Base Interface (`base.py`)
Defines the contract for RAG (Retrieval-Augmented Generation) adapters:

```python
class RAGAdapter(ABC):
    async def query(
        self,
        question: str,
        region: str = "global",
        rag_model_id: Optional[str] = None,
        context: Optional[str] = None
    ) -> Dict[str, Any]
    
    async def health_check(self) -> Dict[str, Any]
```

#### Current Implementation: TemenosRAGAdapter (`temenos_adapter.py`)

**What it does**:
- Connects to Temenos RAG API (`tbsg.temenos.com`)
- Sends queries to retrieve information from Temenos knowledge base
- Handles authentication via JWT tokens
- Manages timeouts and error handling
- Returns structured responses with answers and sources

**Configuration**:
- `RAG_TYPE`: Adapter type (default: `temenos`)
- `RAG_JWT_TOKEN`: JWT token for API authentication (required)
- `RAG_API_URL`: Base URL (default: `https://tbsg.temenos.com`)

**Usage Example**:
```python
from app.adapters.rag import get_rag_adapter

# Get adapter instance (singleton)
rag_adapter = get_rag_adapter()

# Query RAG API
result = await rag_adapter.query(
    question="What are the Temenos cloud architecture models?",
    region="global",
    rag_model_id="ModularBanking, TechnologyOverview",
    context="This is about Temenos cloud architecture..."
)

# Result structure:
# {
#   "data": {
#     "answer": "...",
#     "sources": [...]
#   }
# }
```

**Supported Operations**:
- ✅ Query Temenos knowledge base
- ✅ Health checks
- ✅ Timeout handling (70 seconds)
- ✅ Error handling and logging
- ✅ Authentication via JWT

**Future Possibilities**:
- OpenAI RAG adapter
- Azure OpenAI adapter
- Local RAG adapter (for offline use)
- Multiple RAG provider support

---

## How Adapters Are Used in the Backend

### Factory Pattern

Both adapters use a **Factory Pattern** to create instances:

**Database Factory** (`backend/app/adapters/database/factory.py`):
```python
def get_database_adapter() -> DatabaseAdapter:
    global _db_adapter
    
    if _db_adapter is None:
        db_type = settings.DATABASE_TYPE.lower()  # e.g., "mongodb"
        
        if db_type == 'mongodb':
            _db_adapter = MongoDBAdapter()
        else:
            raise ValueError(f"Unsupported database type: {db_type}")
    
    return _db_adapter  # Returns singleton instance
```

**RAG Factory** (`backend/app/adapters/rag/factory.py`):
```python
def get_rag_adapter() -> RAGAdapter:
    global _rag_adapter
    
    if _rag_adapter is None:
        rag_type = settings.RAG_TYPE.lower()  # e.g., "temenos"
        
        if rag_type == 'temenos':
            _rag_adapter = TemenosRAGAdapter()
        else:
            raise ValueError(f"Unsupported RAG type: {rag_type}")
    
    return _rag_adapter  # Returns singleton instance
```

### Singleton Pattern

Both factories implement the **Singleton Pattern**, ensuring only one instance exists throughout the application lifecycle. This:
- Reduces memory usage
- Ensures consistent connection pooling
- Prevents multiple connections to the same service

### Service Layer Usage

Services use adapters through the factory functions:

**Example: TemenosService** (`backend/app/services/temenos_service.py`):
```python
from app.adapters.rag import get_rag_adapter

class TemenosService:
    def __init__(self):
        # Get RAG adapter instance
        self.rag_adapter = get_rag_adapter()
    
    async def query_rag(self, question: str, ...):
        # Use adapter without knowing implementation details
        return await self.rag_adapter.query(question, ...)
```

**Example: Database Usage** (`backend/app/core/database.py`):
```python
from app.adapters.database import get_database_adapter

# Get adapter and connect
_db_adapter = get_database_adapter()
await _db_adapter.connect()

# Use throughout application
users = await _db_adapter.find_many("users")
```

---

## Configuration

Adapters are configured via environment variables in `backend/app/core/config.py`:

### Database Configuration
```python
DATABASE_URL: str  # MongoDB connection string
DATABASE_NAME: str = "bsg_demo"  # Database name
DATABASE_TYPE: str = "mongodb"  # Adapter type
```

### RAG Configuration
```python
RAG_TYPE: str = "temenos"  # Adapter type
RAG_JWT_TOKEN: Optional[str]  # JWT token (required for Temenos)
RAG_API_URL: str = "https://tbsg.temenos.com"  # Base URL
```

---

## Adding a New Adapter

To add a new adapter implementation (e.g., PostgreSQL for database):

1. **Create the implementation** (`postgresql_adapter.py`):
```python
from app.adapters.database.base import DatabaseAdapter

class PostgreSQLAdapter(DatabaseAdapter):
    async def connect(self) -> None:
        # PostgreSQL-specific connection logic
        pass
    
    # Implement all abstract methods...
```

2. **Update the factory** (`factory.py`):
```python
from app.adapters.database.postgresql_adapter import PostgreSQLAdapter

def get_database_adapter() -> DatabaseAdapter:
    global _db_adapter
    
    if _db_adapter is None:
        db_type = settings.DATABASE_TYPE.lower()
        
        if db_type == 'mongodb':
            _db_adapter = MongoDBAdapter()
        elif db_type == 'postgresql':  # New option
            _db_adapter = PostgreSQLAdapter()
        else:
            raise ValueError(f"Unsupported database type: {db_type}")
    
    return _db_adapter
```

3. **Update configuration** (`config.py`):
```python
DATABASE_TYPE: str = Field(default="mongodb", description="Database type: mongodb, postgresql")
```

4. **Set environment variable**:
```bash
DATABASE_TYPE=postgresql
```

**No changes needed** to services or API endpoints! They continue using the same interface.

---

## Current Support Summary

### ✅ Database Adapters
- **MongoDBAdapter**: Fully implemented and in use
  - Connects to Azure Cosmos DB (MongoDB API)
  - Supports all CRUD operations
  - Health checks
  - Connection pooling

### ✅ RAG Adapters
- **TemenosRAGAdapter**: Fully implemented and in use
  - Connects to Temenos RAG API
  - JWT authentication
  - Query support
  - Health checks
  - Timeout handling

### 🔄 Future Adapter Possibilities

**Database**:
- PostgreSQL adapter
- MySQL adapter
- SQLite adapter (testing)
- In-memory adapter (testing)

**RAG**:
- OpenAI adapter
- Azure OpenAI adapter
- Local/offline RAG adapter

**Other Potential Adapters**:
- Storage adapter (S3, Azure Blob, local filesystem)
- Cache adapter (Redis, Memcached, in-memory)
- Message queue adapter (RabbitMQ, Azure Service Bus, Kafka)
- Email adapter (SMTP, SendGrid, AWS SES)

---

## Benefits in Practice

### Example: Switching Database Providers

**Before (without adapters)**:
- Change database calls in 50+ files
- Update connection logic everywhere
- Risk breaking existing functionality
- Difficult to test

**After (with adapters)**:
- Change `DATABASE_TYPE` environment variable
- Update factory to support new adapter
- Create new adapter implementation
- **Zero changes** to services or API endpoints

### Example: Testing

```python
# In tests, use mock adapter
class MockDatabaseAdapter(DatabaseAdapter):
    def __init__(self):
        self.data = {}
    
    async def find_one(self, collection, filter):
        # Return mock data
        return self.data.get(collection, {})

# Use in tests without real database
test_db = MockDatabaseAdapter()
result = await test_db.find_one("users", {"id": 1})
```

---

## Key Takeaways

1. **Adapters provide abstraction**: Services don't need to know implementation details
2. **Easy to swap**: Change providers by updating configuration
3. **Consistent interface**: All adapters follow the same contract
4. **Testable**: Easy to mock for unit testing
5. **Maintainable**: Changes isolated to adapter implementations
6. **Extensible**: Add new adapters without changing core code

The adapter pattern is a powerful architectural choice that makes the BSG Demo Platform flexible, maintainable, and future-proof.

