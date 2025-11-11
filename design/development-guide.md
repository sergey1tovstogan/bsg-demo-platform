# Development Guide - BSG Demo Platform

## Overview

This guide provides instructions for developers working on the BSG Demo Platform. It covers the git workflow, development setup, and parallel development strategy.

## Git Branching Strategy

### Branch Structure

```
main (production)
├── develop (integration)
├── feature/frontend
├── feature/infrastructure
├── feature/component-integration
├── feature/component-data-architecture
├── feature/component-deployment
├── feature/component-security
├── feature/component-observability
└── feature/component-design-time
```

### Branch Descriptions

#### Main Branch
- **Name**: `main`
- **Purpose**: Production-ready code
- **Protection**: Protected, requires pull request reviews
- **Merges from**: `develop` only

#### Development Branch
- **Name**: `develop`
- **Purpose**: Integration branch for all features
- **Protection**: Protected, requires pull request reviews
- **Merges from**: All feature branches

#### Feature Branches

1. **feature/frontend**
   - React application development
   - UI components for all demo components
   - Common UI utilities
   - State management
   - Routing and navigation

2. **feature/infrastructure**
   - Common backend services (authentication, logging, etc.)
   - Database schema and migrations
   - Docker configuration
   - API middleware
   - Video storage service

3. **feature/component-integration**
   - Integration, APIs and Events component
   - Backend API implementation
   - Demo integration logic
   - Content management

4. **feature/component-data-architecture**
   - Data Architecture component
   - Backend API implementation
   - Database demo integration
   - Schema visualization

5. **feature/component-deployment**
   - Deployment and Cloud component
   - Backend API implementation
   - Deployment demo integration
   - Infrastructure templates

6. **feature/component-security**
   - Security component
   - Backend API implementation
   - Security testing sandbox
   - Vulnerability demonstrations

7. **feature/component-observability**
   - Observability component
   - Backend API implementation
   - Metrics and logging demos
   - Dashboard implementations

8. **feature/component-design-time**
   - Design Time component
   - Backend API implementation
   - Design tool integration
   - Pattern catalog

## Developer Team Assignment

### Team 1: Frontend (1-2 developers)
**Branch**: `feature/frontend`
**Responsibilities**:
- React application setup
- Component library creation
- API client implementation
- Routing and navigation
- State management
- Responsive design
- Video player component
- Chatbot UI component

**Dependencies**:
- API specifications (available)
- Mock API data (can be created independently)

### Team 2: Infrastructure (1-2 developers)
**Branch**: `feature/infrastructure`
**Responsibilities**:
- Python backend setup (FastAPI/Flask)
- Authentication service
- Database setup and migrations
- Common middleware
- Video storage service
- Health check endpoints
- API documentation setup
- Docker configuration

**Dependencies**:
- None (foundational work)

### Teams 3-8: Component Development (1 developer each)

Each component team works independently on their assigned component:

**Team 3**: Integration component (`feature/component-integration`)
**Team 4**: Data Architecture component (`feature/component-data-architecture`)
**Team 5**: Deployment component (`feature/component-deployment`)
**Team 6**: Security component (`feature/component-security`)
**Team 7**: Observability component (`feature/component-observability`)
**Team 8**: Design Time component (`feature/component-design-time`)

**Component Team Responsibilities**:
- Implement component-specific API endpoints
- Develop content management for component
- Integrate with external demo systems
- Implement chatbot integration
- Create sample content/data
- Write component tests

**Dependencies**:
- Infrastructure team (authentication, database)
- API specifications (available)

## Development Workflow

### 1. Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd bsg-demo-platform

# Checkout your feature branch
git checkout -b feature/<your-branch>
```

### 2. Development Cycle

```bash
# Make changes
# ...

# Stage and commit
git add .
git commit -m "Descriptive commit message"

# Push to remote
git push origin feature/<your-branch>
```

### 3. Pull Request Process

1. Push your feature branch to remote
2. Create pull request to `develop` branch
3. Add description and link to requirements
4. Request review from team lead
5. Address review comments
6. Merge after approval

### 4. Staying Up-to-Date

```bash
# Update your branch with latest develop
git checkout develop
git pull origin develop
git checkout feature/<your-branch>
git merge develop

# Resolve conflicts if any
# ...

git push origin feature/<your-branch>
```

## Development Phases

### Phase 1: Foundation (Week 1-2)
**Teams**: Infrastructure, Frontend (setup only)

**Infrastructure Deliverables**:
- Python project structure
- Database setup
- Authentication service
- Basic middleware
- Docker configuration

**Frontend Deliverables**:
- React project structure
- Routing setup
- API client setup
- Basic layout components

### Phase 2: Parallel Component Development (Week 3-6)
**Teams**: All component teams + Frontend

**Component Teams Deliverables**:
- Component API endpoints
- Content CRUD operations
- Demo API stubs
- Video API implementation
- Chatbot API implementation
- Unit tests

**Frontend Deliverables**:
- Component pages
- Content viewer
- Video player
- Chatbot interface
- Navigation

### Phase 3: Integration (Week 7-8)
**Teams**: All teams

**Deliverables**:
- Integrate components with frontend
- End-to-end testing
- Bug fixes
- Performance optimization
- Documentation updates

### Phase 4: External Integrations (Week 9-10)
**Teams**: Component teams

**Deliverables**:
- Connect to external demo systems
- Implement demo scenarios
- Connect to chatbot KB API
- Integration testing

### Phase 5: Polish and Deploy (Week 11-12)
**Teams**: All teams

**Deliverables**:
- UI/UX refinements
- Performance tuning
- Security hardening
- Deployment preparation
- User documentation

## Code Standards

### Python (Backend)
- Follow PEP 8
- Use type hints
- Write docstrings
- Minimum 70% test coverage
- Use pylint and black

### JavaScript/React (Frontend)
- Follow ESLint configuration
- Use TypeScript (optional but recommended)
- Write JSDoc comments
- Use Prettier for formatting
- Component-based architecture

### Git Commit Messages
```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types**: feat, fix, docs, style, refactor, test, chore

**Examples**:
```
feat(auth): add JWT token refresh endpoint

Implement token refresh mechanism to allow users to obtain
new access tokens without re-authenticating.

Closes #123
```

## Testing Strategy

### Backend Testing
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py
```

### Frontend Testing
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Run specific test
npm test -- ComponentName.test.js
```

## Local Development Setup

### Backend
```bash
# Create virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
cd backend
pip install -r requirements.txt

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations
alembic upgrade head

# Start development server
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm start
```

### Database (Docker)
```bash
# Start PostgreSQL
docker-compose up -d postgres

# Stop PostgreSQL
docker-compose down
```

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://user:password@localhost:5432/bsg_demo
JWT_SECRET_KEY=your-secret-key-change-in-production
ENVIRONMENT=development
LOG_LEVEL=DEBUG
CORS_ORIGINS=http://localhost:3000
VIDEO_STORAGE_PATH=./videos
```

### Frontend (.env)
```
REACT_APP_API_URL=http://localhost:8000/api/v1
REACT_APP_WS_URL=ws://localhost:8000/ws/v1
```

## API Development

### Adding New Endpoint
1. Define route in appropriate router file
2. Implement handler function
3. Add request/response models (Pydantic)
4. Write unit tests
5. Update OpenAPI documentation
6. Test manually with Swagger UI

### Example
```python
from fastapi import APIRouter, Depends
from app.models import Content
from app.schemas import ContentCreate, ContentResponse

router = APIRouter()

@router.post("/content", response_model=ContentResponse)
async def create_content(
    content: ContentCreate,
    current_user = Depends(get_current_user)
):
    # Implementation
    pass
```

## Database Migrations

### Creating Migration
```bash
# Auto-generate migration
alembic revision --autogenerate -m "Add content table"

# Manual migration
alembic revision -m "Add custom index"

# Apply migrations
alembic upgrade head

# Rollback migration
alembic downgrade -1
```

## Debugging

### Backend
- Use VSCode debugger with launch.json
- Use `breakpoint()` for interactive debugging
- Check logs in console
- Use FastAPI interactive docs at `/docs`

### Frontend
- Use React Developer Tools
- Use browser console
- Use Redux DevTools (if using Redux)
- Network tab for API calls

## Common Issues and Solutions

### Issue: Database connection failed
**Solution**: Check DATABASE_URL, ensure PostgreSQL is running

### Issue: CORS error in frontend
**Solution**: Add frontend URL to CORS_ORIGINS in backend .env

### Issue: Module not found
**Solution**: Ensure virtual environment is activated and dependencies installed

### Issue: Migration conflicts
**Solution**: Pull latest develop, resolve conflicts in migration files

## Code Review Checklist

- [ ] Code follows style guidelines
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log or print debugging statements
- [ ] No hardcoded credentials or secrets
- [ ] Error handling is implemented
- [ ] Performance is acceptable
- [ ] Security best practices followed

## Resources

- **API Documentation**: http://localhost:8000/docs
- **Requirements**: `/design` folder
- **Architecture**: `/design/architecture-overview.md`
- **API Specs**: `/design/api-specifications.md`

## Communication

### Daily Standups
- What you did yesterday
- What you're doing today
- Any blockers

### Code Reviews
- Review PRs within 24 hours
- Be constructive and respectful
- Ask questions if unclear

### Questions
- Check documentation first
- Ask in team chat
- Create GitHub issues for bugs

## Deployment

### Development
```bash
docker-compose up
```

### Production
- Merge to `main` branch
- CI/CD pipeline handles deployment
- Monitor logs and metrics

## Next Steps

1. Read the architecture overview
2. Review API specifications
3. Checkout your assigned feature branch
4. Setup local development environment
5. Start development according to your team's phase
6. Submit pull requests regularly
7. Participate in code reviews
