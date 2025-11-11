# Member 2: Backend API Developer

**Branch Prefix:** `feature/api-*`

---

## Your Mission

Build the FastAPI backend with database models, authentication, and API endpoints for Content and Demo modules.

---

## Your Territory (Files You Own)

```
backend/
├── app/
│   ├── api/
│   │   ├── router.py        ← YOU OWN (coordinate with Member 4)
│   │   ├── deps.py          ← YOU OWN
│   │   ├── content.py       ← YOU OWN
│   │   ├── demos.py         ← YOU OWN
│   │   └── auth.py          ← YOU OWN
│   ├── models/
│   │   ├── base.py          ← YOU OWN
│   │   ├── content.py       ← YOU OWN
│   │   └── demo.py          ← YOU OWN
│   ├── schemas/
│   │   ├── content.py       ← YOU OWN
│   │   ├── demo.py          ← YOU OWN
│   │   └── auth.py          ← YOU OWN
│   ├── core/                ← YOU OWN ALL
│   │   ├── config.py
│   │   ├── security.py
│   │   └── logging.py
│   └── database/            ← YOU OWN ALL
│       ├── session.py
│       └── init_db.py
├── main.py                  ← YOU OWN
└── requirements.txt         ← YOU MAINTAIN (others add via PR)
```

---

## Week 1 Tasks (Days 1-7)

### Day 1-2: Project Setup
- [ ] Create backend directory structure
  ```bash
  mkdir -p backend/app/{api,models,schemas,core,database,services,tests}
  touch backend/app/__init__.py
  ```
- [ ] Create `requirements.txt` with dependencies:
  ```
  fastapi==0.104.1
  uvicorn[standard]==0.24.0
  sqlalchemy==2.0.23
  pydantic==2.5.0
  python-jose[cryptography]==3.3.0
  passlib[bcrypt]==1.7.4
  python-multipart==0.0.6
  python-dotenv==1.0.0
  ```
- [ ] Create virtual environment
  ```bash
  cd backend
  python -m venv venv
  source venv/bin/activate  # Windows: venv\Scripts\activate
  pip install -r requirements.txt
  ```
- [ ] Create `main.py` with FastAPI app initialization
- [ ] Create `.env.example` with environment variables
- [ ] Test basic FastAPI server runs
- [ ] Create Git branch: `feature/api-setup`

### Day 3-4: Database Setup
- [ ] Create `core/config.py` with settings management
  ```python
  from pydantic_settings import BaseSettings

  class Settings(BaseSettings):
      DATABASE_URL: str = "sqlite:///./bsg-demo.db"
      JWT_SECRET_KEY: str
      JWT_ALGORITHM: str = "HS256"
      JWT_EXPIRATION: int = 3600

      class Config:
          env_file = ".env"
  ```
- [ ] Create `database/session.py` with SQLAlchemy setup
- [ ] Create `models/base.py` with Base model class
- [ ] Create `models/content.py` - Content table
  ```python
  from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, JSON
  from datetime import datetime
  from .base import Base

  class Content(Base):
      __tablename__ = "content"

      id = Column(Integer, primary_key=True, index=True)
      title = Column(String(255), nullable=False)
      description = Column(Text)
      body = Column(Text, nullable=False)
      category = Column(String(100))
      tags = Column(JSON)
      created_at = Column(DateTime, default=datetime.utcnow)
      updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
      published = Column(Boolean, default=False)
      author = Column(String(100))
  ```
- [ ] Create `models/demo.py` - Demo table
- [ ] Create `database/init_db.py` - Database initialization script
- [ ] Create Git branch: `feature/api-database`

### Day 5-6: Schemas & Authentication
- [ ] Create `schemas/content.py` with Pydantic models
  ```python
  from pydantic import BaseModel
  from typing import Optional, List
  from datetime import datetime

  class ContentBase(BaseModel):
      title: str
      description: Optional[str] = None
      body: str
      category: Optional[str] = None
      tags: Optional[List[str]] = []
      published: bool = False
      author: Optional[str] = None

  class ContentCreate(ContentBase):
      pass

  class ContentResponse(ContentBase):
      id: int
      created_at: datetime
      updated_at: datetime

      class Config:
          from_attributes = True
  ```
- [ ] Create `schemas/demo.py` with Demo schemas
- [ ] Create `schemas/auth.py` with Token schema
- [ ] Create `core/security.py` with JWT functions
  ```python
  from jose import jwt
  from passlib.context import CryptContext
  from datetime import datetime, timedelta

  pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

  def verify_password(plain_password: str, hashed_password: str) -> bool:
      return pwd_context.verify(plain_password, hashed_password)

  def create_access_token(data: dict, expires_delta: timedelta) -> str:
      to_encode = data.copy()
      expire = datetime.utcnow() + expires_delta
      to_encode.update({"exp": expire})
      return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
  ```
- [ ] Create `api/deps.py` with authentication dependency
- [ ] Create `api/auth.py` with login endpoint
- [ ] Create Git branch: `feature/api-auth`

### Day 7: Content API Endpoints
- [ ] Create `api/content.py` with CRUD endpoints
  - GET `/content` - List all content
  - GET `/content/{id}` - Get content by ID
  - POST `/content` - Create content (admin only)
  - PUT `/content/{id}` - Update content (admin only)
  - DELETE `/content/{id}` - Delete content (admin only)
- [ ] Add pagination support
- [ ] Add filtering by category, tags, published
- [ ] Test endpoints with Thunder Client or Postman
- [ ] Create Git branch: `feature/api-content-endpoints`

---

## Week 2 Tasks (Days 8-14)

### Day 8-9: Demo API Endpoints
- [ ] Create `api/demos.py` with CRUD endpoints
  - GET `/demos` - List all demos
  - GET `/demos/{id}` - Get demo by ID
  - POST `/demos` - Create demo (admin only)
  - PUT `/demos/{id}` - Update demo (admin only)
  - DELETE `/demos/{id}` - Delete demo (admin only)
- [ ] Add code validation for HTML/CSS/JS
- [ ] Test demo endpoints
- [ ] Create Git branch: `feature/api-demo-endpoints`

### Day 10-11: Advanced Features
- [ ] Implement search functionality (title, description)
- [ ] Add sorting options (created_at, title)
- [ ] Improve pagination (limit, offset)
- [ ] Add CORS middleware configuration
  ```python
  from fastapi.middleware.cors import CORSMiddleware

  app.add_middleware(
      CORSMiddleware,
      allow_origins=["http://localhost:5173"],  # Frontend URL
      allow_credentials=True,
      allow_methods=["*"],
      allow_headers=["*"],
  )
  ```
- [ ] Add request logging
- [ ] Create Git branch: `feature/api-advanced`

### Day 12-13: Testing & Documentation
- [ ] Write pytest tests for Content API
  ```python
  def test_create_content(client):
      response = client.post("/api/v1/content", json={
          "title": "Test Content",
          "body": "Test body",
          "published": True
      })
      assert response.status_code == 200
      assert response.json()["title"] == "Test Content"
  ```
- [ ] Write tests for Demo API
- [ ] Write tests for Auth API
- [ ] Add API documentation (FastAPI auto-generates at `/docs`)
- [ ] Update README with API setup instructions
- [ ] Create Git branch: `feature/api-testing`

### Day 14: Integration & Deployment Prep
- [ ] Coordinate with Member 4 on API router (merge video routes)
- [ ] Test full API with frontend (Member 1)
- [ ] Fix any bugs found during integration
- [ ] Ensure all endpoints work in Docker (coordinate with Member 5)
- [ ] Create sample data for demo

---

## Dependencies & Coordination

### You Depend On:
- **Member 5** (DevOps): Docker setup, environment configuration

### Others Depend On You:
- **Member 1** (Frontend): Needs your API endpoints to function
- **Member 3** (Demo/Content): Needs your API endpoints for integration
- **Member 4** (Video): Needs your auth middleware and base API structure

### Coordination Points:
- **Day 3**: Share API contract (endpoints, request/response schemas) with Members 1, 3, 4
- **Day 5**: Share authentication flow with Member 1
- **Day 7**: Coordinate with Member 4 on `router.py` (video routes)
- **Day 10**: Integration testing with Member 1

---

## Git Workflow

### Create Feature Branch
```bash
git checkout develop
git pull origin develop
git checkout -b feature/api-your-feature-name
```

### Daily Work
```bash
# Make changes
git add .
git commit -m "feat: description of what you did"
git push origin feature/api-your-feature-name
```

### Create Pull Request
1. Go to GitHub → Pull Requests → New PR
2. Select: `develop` ← `feature/api-your-feature-name`
3. Title: `[Backend] Brief description`
4. Add description of changes
5. Request review from Member 5 + one peer

---

## Code Style Guidelines

### Endpoint Structure
```python
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from ..database.session import get_db
from ..schemas.content import ContentCreate, ContentResponse
from ..models.content import Content
from ..api.deps import get_current_admin

router = APIRouter(prefix="/content", tags=["content"])

@router.get("/", response_model=List[ContentResponse])
def get_all_content(
    skip: int = 0,
    limit: int = 10,
    db: Session = Depends(get_db)
):
    content = db.query(Content).offset(skip).limit(limit).all()
    return content

@router.post("/", response_model=ContentResponse)
def create_content(
    content: ContentCreate,
    db: Session = Depends(get_db),
    admin = Depends(get_current_admin)
):
    db_content = Content(**content.dict())
    db.add(db_content)
    db.commit()
    db.refresh(db_content)
    return db_content
```

### Naming Conventions
- Files: snake_case (e.g., `content_service.py`)
- Classes: PascalCase (e.g., `ContentCreate`)
- Functions: snake_case (e.g., `get_all_content`)
- Variables: snake_case

---

## Tools & Extensions

### Required VS Code Extensions
- Python
- Pylance
- Black Formatter
- autoDocstring
- Thunder Client (API testing)

### Useful Commands
```bash
# Start development server
uvicorn app.main:app --reload

# Run tests
pytest

# Format code
black .

# Check types
mypy app/

# Initialize database
python -m app.database.init_db
```

---

## API Documentation

### Auto-Generated Docs
Once your server is running, FastAPI automatically generates:
- **Swagger UI**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

### Manual Documentation
Document your endpoints in `design/api-specification.md` (coordinate with Member 5)

---

## Communication

### Daily Standup Template
```
Member 2 (Backend):
✅ Yesterday: [what you completed]
🔨 Today: [what you're working on]
⚠️  Blockers: [any issues or dependencies]
```

### When to Share Updates
- **Day 3**: Share API contract with frontend team
- **Day 5**: Notify when authentication is ready
- **Day 7**: Notify when Content API is ready for integration
- **Day 9**: Notify when Demo API is ready

---

## Success Checklist

### Week 1 Done When:
- [ ] FastAPI server runs successfully
- [ ] Database models created and tables initialized
- [ ] Authentication system working (JWT tokens)
- [ ] Content API endpoints complete (CRUD)
- [ ] Demo API endpoints complete (CRUD)
- [ ] API documentation accessible at `/docs`

### Week 2 Done When:
- [ ] All API tests passing
- [ ] Pagination and filtering working
- [ ] CORS configured for frontend
- [ ] Integration with frontend successful
- [ ] Sample data created

---

## Quick Reference

### Project Structure You Create
```
backend/
├── main.py
├── requirements.txt
├── .env.example
└── app/
    ├── __init__.py
    ├── api/
    │   ├── __init__.py
    │   ├── router.py
    │   ├── deps.py
    │   ├── content.py
    │   ├── demos.py
    │   └── auth.py
    ├── core/
    │   ├── __init__.py
    │   ├── config.py
    │   ├── security.py
    │   └── logging.py
    ├── models/
    │   ├── __init__.py
    │   ├── base.py
    │   ├── content.py
    │   └── demo.py
    ├── schemas/
    │   ├── __init__.py
    │   ├── content.py
    │   ├── demo.py
    │   └── auth.py
    ├── database/
    │   ├── __init__.py
    │   ├── session.py
    │   └── init_db.py
    └── tests/
        ├── __init__.py
        ├── conftest.py
        ├── test_content.py
        └── test_demos.py
```

### Environment Variables (.env.example)
```bash
DATABASE_URL=sqlite:///./bsg-demo.db
JWT_SECRET_KEY=your-secret-key-here-change-in-production
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600
ADMIN_PASSWORD_HASH=$2b$12$...
ALLOWED_ORIGINS=http://localhost:5173
```

---

**Remember:** You're the backbone of the application. Focus on clean, well-tested code!

**Questions?** Ask in #backend or ping @Member5 (Tech Lead)

**Good luck! 🚀**
