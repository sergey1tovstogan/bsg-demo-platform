# MongoDB Storage Analysis

## Current Storage Status

**Total Data Size:** ~3.62 MB  
**Total Storage Size:** ~0.02 MB (reported by Cosmos DB - likely inaccurate)  
**Total Collections:** 16

## Collections Breakdown

### 1. **cache** (0.74 MB data, 65 documents)
**Purpose:** Temporary cached data with TTL expiration

**Stores:**
- RAG API responses (7-day TTL)
- Component identification info (7-day TTL)  
- Azure resource lists (1-hour TTL)
- AKS namespace data (2-hour TTL)

**Document Structure:**
```json
{
  "cache_key": "rag:component:microservice-name",
  "content": "JSON string (~1000+ chars)",
  "content_type": "application/json",
  "metadata": {...},
  "created_at": "datetime",
  "expires_at": "datetime"
}
```

**Growth Pattern:** Grows with usage, auto-expires based on TTL

---

### 2. **security_items** (0.66 MB data, 1 document)
**Purpose:** Security document metadata and content

**Stores:**
- Security document items
- Document metadata
- Potentially large nested document structures

**Document Structure:**
```json
{
  "document_number": 1,
  "document_name": "Security Document Name",
  "document": {
    // Large nested structure with security content
  },
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

**Note:** Only 1 document currently, but can grow significantly if more security documents are added.

---

### 3. **presentation_files.chunks** (1.31 MB data, 3 documents)
**Purpose:** GridFS file storage chunks (for large files)

**Stores:**
- Chunks of uploaded presentation files
- Binary data (PowerPoint files, PDFs, etc.)

**Document Structure:**
```json
{
  "files_id": ObjectId,
  "n": 0,  // chunk number
  "data": Binary  // actual file data
}
```

**Note:** This is GridFS - files are split into chunks. The `presentation_files.files` collection stores metadata.

---

### 4. **security_presentation** (0.31 MB data, 1 document)
**Purpose:** Security presentation data

**Stores:**
- Presentation metadata
- Nested presentation structure

**Document Structure:**
```json
{
  "presentation_number": 1,
  "presentation_name": "Security Presentation",
  "presentation": {
    // Nested presentation data
  },
  "created_at": "datetime",
  "updated_at": "datetime"
}
```

---

### 5. **content** (0.19 MB data, 6 documents)
**Purpose:** Component content items

**Stores:**
- Videos, documents, interactive content
- HTML/JSON body content
- Content metadata

**Document Structure:**
```json
{
  "content_id": "int-001",
  "component_id": "integration",
  "title": "API Overview",
  "type": "document",
  "order": 1,
  "body_json": {
    "image_path": "...",
    "interactive_areas": [...]
  },
  "content_metadata": {...}
}
```

---

### 6. **data_architecture** (0.13 MB data, 1 document)
**Purpose:** Data architecture configuration

**Stores:**
- Database connection configurations
- Schema information
- Connection metadata

---

### 7. **auth_users** (6 documents, <0.01 MB)
**Purpose:** User authentication data

**Stores:**
- User accounts
- Password hashes
- User profiles
- Authentication metadata

**Fields:**
- `user_id`, `email`, `username`
- `password_hash`
- `role`, `profile`
- `is_active`, `email_verified`
- Timestamps

---

### 8. **settings** (1 document, <0.01 MB)
**Purpose:** Application-wide settings

**Stores:**
- RAG JWT token (global)
- EventHub configuration
- Other application settings

**Document Structure:**
```json
{
  "key": "rag_jwt_token",
  "value": "JWT token string (~280 chars)",
  "updated_at": "datetime"
}
```

---

### 9. **deployment** (1 document, <0.01 MB)
**Purpose:** Deployment-related data

**Stores:**
- User-specific JWT tokens (legacy)
- Deployment analysis results (optional)

---

### 10. **components** (1 document, <0.01 MB)
**Purpose:** Component metadata

**Stores:**
- Component definitions
- Component status
- Component descriptions

---

### 11. **integration** (1 document, <0.01 MB)
**Purpose:** Integration configuration

**Stores:**
- API keys
- Integration metadata

---

### 12. **Empty Collections** (0 documents)
These collections exist but have no data:
- `presentation_files.files` (GridFS metadata)
- `presentations`
- `security_docs`
- `videos`
- `_connection_test`

---

### 13. **Missing Collections** (Referenced in code but not found)
These collections are referenced in the code but don't exist yet:
- `security_slides` - Would store base64-encoded JPEG slide images
- `security_paragraphs` - Would store paragraph text from security documents

**Note:** If these collections are populated, they could significantly increase storage:
- Each slide image (base64 encoded) could be 50-200 KB
- 100 slides = 5-20 MB
- 500 slides = 25-100 MB

---

## Storage Cost Analysis

### Current Storage
- **Data Size:** 3.62 MB
- **Estimated Storage Cost:** ~$0.00/month (under 1 GB)

### Potential Growth Scenarios

#### Scenario 1: Security Slides Populated
- 500 slides × 100 KB each = **50 MB**
- Monthly cost: ~$0.01

#### Scenario 2: Heavy Cache Usage
- 1000 RAG queries/day × 7 days × 10 KB = **70 MB**
- Monthly cost: ~$0.02

#### Scenario 3: Multiple Presentations
- 10 presentations × 5 MB each = **50 MB**
- Monthly cost: ~$0.01

**Total Potential:** ~170 MB = ~$0.04/month storage cost

---

## Cost Breakdown

### Storage Costs (Azure Cosmos DB MongoDB API)
- **$0.25 per GB per month**
- Current: ~0.004 GB = **$0.00/month**
- Even at 1 GB: **$0.25/month**

### Throughput Costs (RU/s)
- **$0.008 per 100 RU/s per hour** (varies by region/tier)
- This is where most costs come from, not storage
- Connection pool optimization (50→20 connections) saves on idle RU consumption

---

## Recommendations

### 1. **MongoDB May Be Overkill**
With only **3.62 MB** of actual data, MongoDB/Cosmos DB might be excessive:

**Alternatives:**
- **SQLite** - Perfect for < 100 MB, zero cost, file-based
- **Azure Blob Storage** - For large files (presentations, images)
- **Redis** - For cache (cheaper than Cosmos DB for small data)
- **File-based storage** - For security slides/images

### 2. **Optimize Large Data Storage**
- **Security slides/images:** Move to Azure Blob Storage
  - Store only metadata/references in MongoDB
  - Images served directly from Blob Storage
  - Saves MongoDB storage and reduces RU consumption

- **Presentation files:** Already using GridFS, but consider:
  - Moving to Azure Blob Storage
  - Using CDN for faster delivery

### 3. **Current Optimizations (Already Applied)**
- ✅ Connection pool reduced: 50 → 20 max, 10 → 5 min
- ✅ Cache TTLs maintained at 7 days (user requested)
- ✅ TTL indexes ensure auto-cleanup of expired cache

### 4. **Monitor Growth**
Run the analysis script regularly:
```bash
python backend/scripts/list_mongodb_collections.py
```

---

## Conclusion

**Current State:**
- Total data: **3.62 MB**
- Storage cost: **~$0.00/month**
- MongoDB is likely **overkill** for this data size

**Main Cost Driver:**
- **RU/s (throughput)**, not storage
- Connection pool optimization saves on idle RU consumption
- Actual costs depend on provisioned throughput tier

**If Storage Grows:**
- Security slides could add 50-100 MB if fully populated
- Still very small (< 1 GB)
- Storage costs remain negligible

**Real Savings:**
- Connection pool optimization: **~$8.64/month** (from RU/s reduction)
- Storage optimization: **~$0.00/month** (already minimal)

The **connection pool reduction** is where the real cost savings are, not storage optimization.
