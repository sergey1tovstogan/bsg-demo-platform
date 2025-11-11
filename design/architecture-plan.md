# BSG Demo Platform - Architecture Plan

**Version:** 1.0
**Date:** November 11, 2025
**Status:** Design Phase

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [System Architecture](#system-architecture)
3. [Technology Stack](#technology-stack)
4. [Folder Structure](#folder-structure)
5. [Database Design](#database-design)
6. [API Specification](#api-specification)
7. [Component Architecture](#component-architecture)
8. [Authentication & Security](#authentication--security)
9. [Cloud Storage Integration](#cloud-storage-integration)
10. [Deployment Strategy](#deployment-strategy)
11. [Development Workflow](#development-workflow)
12. [Recommended Tools](#recommended-tools)

---

## Project Overview

### Purpose
The BSG Demo Platform is a full-stack web application designed to showcase and deliver three core content types:
- **Content**: Documentation, articles, tutorials, and educational materials
- **Demos**: Interactive HTML/CSS/JS demonstrations with live preview capabilities
- **Videos**: Video content stored in cloud storage with streaming capabilities

### Key Objectives
- Provide an intuitive user interface for browsing content, demos, and videos
- Enable admin capabilities for content management
- Support scalable cloud deployment (AWS/Azure/GCP)
- Maintain clean separation between frontend and backend
- Ensure extensibility for future feature additions

---

## System Architecture

### High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                             │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │            React Frontend (TypeScript + Vite)              │  │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │  │
│  │  │ Content  │  │  Demo    │  │  Video   │  │  Admin   │  │  │
│  │  │ Viewer   │  │  Player  │  │  Player  │  │  Panel   │  │  │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────────────┬─────────────────────────────────┘
                                │ HTTPS / REST API
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                       APPLICATION LAYER                          │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │          FastAPI Backend (Python)                          │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐       │  │
│  │  │   Content   │  │    Demo     │  │    Video    │       │  │
│  │  │     API     │  │     API     │  │     API     │       │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘       │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │         Admin Auth Middleware                        │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
└───────────────────────┬───────────────────┬─────────────────────┘
                        │                   │
           ┌────────────▼────────┐  ┌───────▼──────────┐
           │   DATA LAYER        │  │  STORAGE LAYER    │
           │                     │  │                   │
           │  ┌──────────────┐   │  │  ┌─────────────┐ │
           │  │   SQLite     │   │  │  │ Cloud       │ │
           │  │  (dev/simple)│   │  │  │ Storage     │ │
           │  └──────────────┘   │  │  │ (S3/Azure)  │ │
           │  ┌──────────────┐   │  │  └─────────────┘ │
           │  │  Migration   │   │  │  (Video Files)   │
           │  │  Ready for   │   │  └──────────────────┘
           │  │  PostgreSQL  │   │
           │  └──────────────┘   │
           └─────────────────────┘
```

### Architecture Principles
- **Separation of Concerns**: Frontend and backend are decoupled
- **Scalability**: Cloud-native design supporting horizontal scaling
- **Modularity**: Each content type (content/demo/video) is a separate module
- **Security**: Admin authentication, CORS protection, input validation
- **Flexibility**: Database-agnostic design allowing easy migration

---

## Technology Stack

### Frontend Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | React 18+ | UI component framework |
| **Language** | TypeScript | Type-safe JavaScript |
| **Build Tool** | Vite | Fast build and dev server |
| **Styling** | Tailwind CSS | Utility-first CSS framework |
| **HTTP Client** | Axios | API communication |
| **State Management** | React Query | Server state management |
| **Routing** | React Router v6 | Client-side routing |
| **Video Player** | Video.js or React Player | Video playback |
| **Code Editor** | Monaco Editor or CodeMirror | Demo code editing |

### Backend Stack

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Framework** | FastAPI | Modern Python web framework |
| **Language** | Python 3.10+ | Backend programming language |
| **Validation** | Pydantic | Data validation and serialization |
| **Database (Initial)** | SQLite | Simple file-based database |
| **Database (Future)** | PostgreSQL | Production relational database |
| **ORM** | SQLAlchemy | Database abstraction layer |
| **CORS** | FastAPI CORS Middleware | Cross-origin resource sharing |
| **Cloud SDK** | boto3 (AWS) or azure-storage-blob | Cloud storage integration |
| **Authentication** | JWT (PyJWT) | Token-based authentication |

### DevOps & Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Containerization** | Docker | Application containerization |
| **Orchestration** | Docker Compose | Multi-container orchestration |
| **Cloud Platform** | AWS/Azure/GCP | Cloud hosting |
| **Storage** | S3 (AWS) / Blob Storage (Azure) | Video file storage |
| **CI/CD** | GitHub Actions | Continuous integration/deployment |
| **Reverse Proxy** | Nginx | Load balancing and SSL termination |

---

## Folder Structure

### Complete Project Structure

```
bsg-demo-platform/
├── README.md                          # Project documentation
├── .gitignore                         # Git ignore rules
├── docker-compose.yml                 # Multi-container setup
├── .env.example                       # Environment variables template
│
├── frontend/                          # React Application
│   ├── package.json                   # Frontend dependencies
│   ├── package-lock.json
│   ├── tsconfig.json                  # TypeScript configuration
│   ├── vite.config.ts                 # Vite build configuration
│   ├── .env.example                   # Frontend environment template
│   ├── .eslintrc.json                 # ESLint configuration
│   ├── tailwind.config.js             # Tailwind CSS configuration
│   ├── postcss.config.js              # PostCSS configuration
│   ├── index.html                     # HTML entry point
│   ├── public/                        # Static assets
│   │   ├── favicon.ico
│   │   └── assets/
│   └── src/
│       ├── main.tsx                   # Application entry point
│       ├── App.tsx                    # Root component
│       ├── vite-env.d.ts              # Vite type definitions
│       │
│       ├── components/                # Reusable components
│       │   ├── Layout/
│       │   │   ├── Header.tsx
│       │   │   ├── Footer.tsx
│       │   │   ├── Sidebar.tsx
│       │   │   └── Navigation.tsx
│       │   ├── Content/
│       │   │   ├── ContentCard.tsx
│       │   │   ├── ContentViewer.tsx
│       │   │   ├── ContentList.tsx
│       │   │   └── MarkdownRenderer.tsx
│       │   ├── Demo/
│       │   │   ├── DemoPlayer.tsx
│       │   │   ├── DemoCard.tsx
│       │   │   ├── DemoIframe.tsx
│       │   │   ├── DemoControls.tsx
│       │   │   └── CodeEditor.tsx
│       │   ├── Video/
│       │   │   ├── VideoPlayer.tsx
│       │   │   ├── VideoCard.tsx
│       │   │   ├── VideoList.tsx
│       │   │   └── VideoControls.tsx
│       │   ├── Admin/
│       │   │   ├── AdminPanel.tsx
│       │   │   ├── LoginForm.tsx
│       │   │   ├── ContentEditor.tsx
│       │   │   ├── DemoEditor.tsx
│       │   │   └── VideoUploader.tsx
│       │   └── Common/
│       │       ├── Button.tsx
│       │       ├── Card.tsx
│       │       ├── Modal.tsx
│       │       ├── Loader.tsx
│       │       └── ErrorBoundary.tsx
│       │
│       ├── pages/                     # Page components
│       │   ├── HomePage.tsx
│       │   ├── ContentPage.tsx
│       │   ├── DemoPage.tsx
│       │   ├── VideoPage.tsx
│       │   ├── AdminPage.tsx
│       │   └── NotFoundPage.tsx
│       │
│       ├── services/                  # API services
│       │   ├── api.ts                 # Axios configuration
│       │   ├── contentService.ts      # Content API calls
│       │   ├── demoService.ts         # Demo API calls
│       │   ├── videoService.ts        # Video API calls
│       │   └── authService.ts         # Authentication API calls
│       │
│       ├── hooks/                     # Custom React hooks
│       │   ├── useAuth.ts
│       │   ├── useContent.ts
│       │   ├── useDemos.ts
│       │   └── useVideos.ts
│       │
│       ├── contexts/                  # React contexts
│       │   └── AuthContext.tsx
│       │
│       ├── types/                     # TypeScript types
│       │   ├── content.ts
│       │   ├── demo.ts
│       │   ├── video.ts
│       │   └── auth.ts
│       │
│       ├── utils/                     # Utility functions
│       │   ├── formatters.ts
│       │   ├── validators.ts
│       │   └── constants.ts
│       │
│       └── styles/                    # Global styles
│           ├── index.css              # Global CSS + Tailwind imports
│           └── themes.css             # Theme variables
│
├── backend/                           # FastAPI Application
│   ├── requirements.txt               # Python dependencies
│   ├── requirements-dev.txt           # Development dependencies
│   ├── .env.example                   # Backend environment template
│   ├── alembic.ini                    # Database migration config (optional)
│   ├── Dockerfile                     # Backend Docker image
│   ├── main.py                        # FastAPI entry point
│   │
│   ├── app/
│   │   ├── __init__.py
│   │   │
│   │   ├── api/                       # API endpoints
│   │   │   ├── __init__.py
│   │   │   ├── deps.py                # Shared dependencies
│   │   │   ├── router.py              # Main API router
│   │   │   ├── content.py             # Content endpoints
│   │   │   ├── demos.py               # Demo endpoints
│   │   │   ├── videos.py              # Video endpoints
│   │   │   └── auth.py                # Authentication endpoints
│   │   │
│   │   ├── core/                      # Core functionality
│   │   │   ├── __init__.py
│   │   │   ├── config.py              # Configuration management
│   │   │   ├── security.py            # Security utilities (JWT, hashing)
│   │   │   └── logging.py             # Logging configuration
│   │   │
│   │   ├── models/                    # Database models
│   │   │   ├── __init__.py
│   │   │   ├── base.py                # Base model class
│   │   │   ├── content.py             # Content model
│   │   │   ├── demo.py                # Demo model
│   │   │   └── video.py               # Video model
│   │   │
│   │   ├── schemas/                   # Pydantic schemas
│   │   │   ├── __init__.py
│   │   │   ├── content.py             # Content request/response schemas
│   │   │   ├── demo.py                # Demo schemas
│   │   │   ├── video.py               # Video schemas
│   │   │   └── auth.py                # Auth schemas
│   │   │
│   │   ├── services/                  # Business logic
│   │   │   ├── __init__.py
│   │   │   ├── content_service.py     # Content operations
│   │   │   ├── demo_service.py        # Demo operations
│   │   │   ├── video_service.py       # Video operations
│   │   │   └── storage_service.py     # Cloud storage operations
│   │   │
│   │   ├── database/                  # Database configuration
│   │   │   ├── __init__.py
│   │   │   ├── session.py             # Database session management
│   │   │   └── init_db.py             # Database initialization
│   │   │
│   │   └── utils/                     # Utility functions
│   │       ├── __init__.py
│   │       └── helpers.py
│   │
│   └── tests/                         # Backend tests
│       ├── __init__.py
│       ├── conftest.py                # Pytest configuration
│       ├── test_content.py
│       ├── test_demos.py
│       └── test_videos.py
│
├── design/                            # Design documentation
│   ├── architecture-plan.md           # This document
│   ├── api-specification.md           # Detailed API docs (future)
│   ├── database-schema.md             # Database schema (future)
│   └── ui-mockups/                    # UI design files (future)
│
├── architecture/                      # Architecture diagrams
│   └── system-diagram.png             # Visual architecture diagram
│
├── deployments/                       # Deployment configurations
│   ├── docker/
│   │   ├── frontend.Dockerfile
│   │   └── backend.Dockerfile
│   ├── kubernetes/                    # K8s manifests (future)
│   └── terraform/                     # Infrastructure as code (future)
│
├── presentations/                     # Presentation materials
│   └── demo-slides.pdf
│
├── videos/                            # Video references
│   └── video-metadata.json
│
├── integrations/                      # Third-party integrations
│   └── api-references/
│
└── security/                          # Security documentation
    ├── security-policy.md
    └── compliance/
```

### Frontend Tree View (Detailed)

```
frontend/
├── src/
│   ├── components/          # 30+ reusable components
│   │   ├── Layout/          # Layout components (4)
│   │   ├── Content/         # Content-related components (5)
│   │   ├── Demo/            # Demo player components (5)
│   │   ├── Video/           # Video player components (4)
│   │   ├── Admin/           # Admin panel components (5)
│   │   └── Common/          # Shared UI components (5)
│   ├── pages/               # 6 page components
│   ├── services/            # 5 API service modules
│   ├── hooks/               # 4+ custom hooks
│   ├── contexts/            # React context providers
│   ├── types/               # TypeScript definitions
│   ├── utils/               # Helper functions
│   └── styles/              # Global styles
└── public/                  # Static assets
```

### Backend Tree View (Detailed)

```
backend/
├── app/
│   ├── api/                 # API endpoint definitions
│   │   ├── content.py       # GET, POST, PUT, DELETE for content
│   │   ├── demos.py         # GET, POST, PUT, DELETE for demos
│   │   ├── videos.py        # GET, POST, PUT, DELETE + upload
│   │   └── auth.py          # POST /login, /logout
│   ├── core/                # Core configuration
│   │   ├── config.py        # Settings from env vars
│   │   └── security.py      # JWT token generation/validation
│   ├── models/              # SQLAlchemy ORM models
│   │   ├── content.py       # Content table definition
│   │   ├── demo.py          # Demo table definition
│   │   └── video.py         # Video table definition
│   ├── schemas/             # Pydantic models for validation
│   │   ├── content.py       # ContentCreate, ContentResponse
│   │   ├── demo.py          # DemoCreate, DemoResponse
│   │   └── video.py         # VideoCreate, VideoResponse
│   ├── services/            # Business logic layer
│   │   ├── content_service.py   # CRUD operations for content
│   │   ├── demo_service.py      # CRUD operations for demos
│   │   ├── video_service.py     # CRUD + S3 upload for videos
│   │   └── storage_service.py   # S3/Azure storage wrapper
│   └── database/            # Database setup
│       ├── session.py       # SQLAlchemy session factory
│       └── init_db.py       # Create tables, seed data
└── tests/                   # Unit and integration tests
```

---

## Database Design

### Database Strategy

**Phase 1: Development (SQLite)**
- Use SQLite for rapid development and testing
- File-based database (`bsg-demo.db`)
- Zero configuration required
- Easy to version control schema

**Phase 2: Production (PostgreSQL)**
- Migrate to PostgreSQL for production
- Use SQLAlchemy ORM for database abstraction
- Alembic for schema migrations
- Supports horizontal scaling

### Entity Relationship Diagram

```
┌─────────────────────┐
│      Content        │
├─────────────────────┤
│ id (PK)             │
│ title               │
│ description         │
│ body (markdown)     │
│ category            │
│ tags (JSON)         │
│ created_at          │
│ updated_at          │
│ published           │
│ author              │
└─────────────────────┘

┌─────────────────────┐
│       Demo          │
├─────────────────────┤
│ id (PK)             │
│ title               │
│ description         │
│ html_code           │
│ css_code            │
│ js_code             │
│ tags (JSON)         │
│ thumbnail_url       │
│ created_at          │
│ updated_at          │
│ published           │
└─────────────────────┘

┌─────────────────────┐
│       Video         │
├─────────────────────┤
│ id (PK)             │
│ title               │
│ description         │
│ cloud_storage_url   │
│ thumbnail_url       │
│ duration            │
│ file_size           │
│ format              │
│ tags (JSON)         │
│ created_at          │
│ uploaded_at         │
│ published           │
└─────────────────────┘
```

### Schema Definitions

#### Content Table

```sql
CREATE TABLE content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    body TEXT NOT NULL,
    category VARCHAR(100),
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published BOOLEAN DEFAULT FALSE,
    author VARCHAR(100)
);
```

#### Demo Table

```sql
CREATE TABLE demo (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    html_code TEXT,
    css_code TEXT,
    js_code TEXT,
    tags JSON,
    thumbnail_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published BOOLEAN DEFAULT FALSE
);
```

#### Video Table

```sql
CREATE TABLE video (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    cloud_storage_url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500),
    duration INTEGER,
    file_size BIGINT,
    format VARCHAR(50),
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published BOOLEAN DEFAULT FALSE
);
```

---

## API Specification

### Base URL

- **Development**: `http://localhost:8000/api/v1`
- **Production**: `https://your-domain.com/api/v1`

### Authentication

All admin endpoints require authentication via JWT token:

```
Authorization: Bearer <jwt_token>
```

### API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| **Authentication** |
| POST | `/auth/login` | Admin login | No |
| POST | `/auth/logout` | Admin logout | Yes |
| GET | `/auth/verify` | Verify token | Yes |
| **Content** |
| GET | `/content` | List all content | No |
| GET | `/content/{id}` | Get content by ID | No |
| POST | `/content` | Create content | Yes |
| PUT | `/content/{id}` | Update content | Yes |
| DELETE | `/content/{id}` | Delete content | Yes |
| **Demos** |
| GET | `/demos` | List all demos | No |
| GET | `/demos/{id}` | Get demo by ID | No |
| POST | `/demos` | Create demo | Yes |
| PUT | `/demos/{id}` | Update demo | Yes |
| DELETE | `/demos/{id}` | Delete demo | Yes |
| **Videos** |
| GET | `/videos` | List all videos | No |
| GET | `/videos/{id}` | Get video by ID | No |
| POST | `/videos` | Upload video | Yes |
| PUT | `/videos/{id}` | Update video metadata | Yes |
| DELETE | `/videos/{id}` | Delete video | Yes |
| GET | `/videos/{id}/stream` | Get video stream URL | No |

### Detailed Endpoint Specifications

#### Authentication Endpoints

**POST /auth/login**
```json
Request:
{
  "password": "admin_password"
}

Response:
{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

#### Content Endpoints

**GET /content**
```json
Query Parameters:
- page: int (default: 1)
- limit: int (default: 10)
- category: string (optional)
- published: boolean (optional)

Response:
{
  "data": [
    {
      "id": 1,
      "title": "Getting Started Guide",
      "description": "Introduction to the platform",
      "body": "# Welcome\n\nThis is a getting started guide...",
      "category": "tutorial",
      "tags": ["beginner", "introduction"],
      "created_at": "2025-11-11T10:00:00Z",
      "updated_at": "2025-11-11T10:00:00Z",
      "published": true,
      "author": "Admin"
    }
  ],
  "total": 50,
  "page": 1,
  "limit": 10
}
```

**POST /content**
```json
Request:
{
  "title": "New Tutorial",
  "description": "Learn something new",
  "body": "# Tutorial Content\n\nLorem ipsum...",
  "category": "tutorial",
  "tags": ["advanced", "tutorial"],
  "published": true,
  "author": "Admin"
}

Response:
{
  "id": 2,
  "title": "New Tutorial",
  ...
  "created_at": "2025-11-11T11:00:00Z"
}
```

#### Demo Endpoints

**GET /demos/{id}**
```json
Response:
{
  "id": 1,
  "title": "Interactive Button Demo",
  "description": "A demo showing interactive button states",
  "html_code": "<button id='btn'>Click Me</button>",
  "css_code": "button { padding: 10px 20px; }",
  "js_code": "document.getElementById('btn').addEventListener('click', ...)",
  "tags": ["javascript", "interactive"],
  "thumbnail_url": "https://storage.../thumbnail.png",
  "created_at": "2025-11-11T10:00:00Z",
  "published": true
}
```

**POST /demos**
```json
Request:
{
  "title": "Animation Demo",
  "description": "CSS animation example",
  "html_code": "<div class='box'></div>",
  "css_code": ".box { animation: slide 2s; }",
  "js_code": "",
  "tags": ["css", "animation"],
  "published": true
}
```

#### Video Endpoints

**POST /videos**
```
Request: multipart/form-data
- file: video file (binary)
- title: string
- description: string
- tags: JSON array

Response:
{
  "id": 1,
  "title": "Introduction Video",
  "description": "Platform overview",
  "cloud_storage_url": "https://s3.amazonaws.com/bucket/video.mp4",
  "thumbnail_url": "https://s3.amazonaws.com/bucket/thumb.jpg",
  "duration": 120,
  "file_size": 15728640,
  "format": "mp4",
  "tags": ["introduction", "overview"],
  "uploaded_at": "2025-11-11T10:00:00Z"
}
```

**GET /videos/{id}/stream**
```json
Response:
{
  "stream_url": "https://s3.amazonaws.com/bucket/video.mp4?signed_url...",
  "expires_in": 3600
}
```

---

## Component Architecture

### Frontend Components

#### Core Layout Components

**Header.tsx**
- Logo and branding
- Navigation menu
- Admin login button
- Responsive mobile menu

**Navigation.tsx**
- Links to Content, Demos, Videos pages
- Active state highlighting
- Breadcrumb navigation

**Sidebar.tsx** (Optional)
- Category filters
- Tag filters
- Search functionality

#### Content Components

**ContentViewer.tsx**
- Markdown rendering
- Syntax highlighting for code blocks
- Table of contents generation
- Print functionality

**ContentCard.tsx**
- Preview card for content list
- Title, description, tags
- Read time estimation
- Category badge

#### Demo Components

**DemoPlayer.tsx**
- Iframe-based demo renderer
- Sandboxed HTML/CSS/JS execution
- Live preview updates
- Fullscreen mode

**CodeEditor.tsx**
- Syntax-highlighted code editor
- HTML/CSS/JS tabs
- Code formatting
- Copy to clipboard

**DemoControls.tsx**
- Play/pause demo
- Reset demo state
- Toggle between code and preview
- Share demo link

#### Video Components

**VideoPlayer.tsx**
- HTML5 video player or Video.js
- Playback controls
- Quality selection
- Subtitle support (future)

**VideoCard.tsx**
- Thumbnail preview
- Duration display
- Title and description
- View count (future)

#### Admin Components

**AdminPanel.tsx**
- Dashboard overview
- Content/Demo/Video statistics
- Quick actions

**ContentEditor.tsx**
- Markdown editor with preview
- Category and tag selection
- Publish/unpublish toggle
- Save draft functionality

**DemoEditor.tsx**
- Multi-pane code editor (HTML/CSS/JS)
- Live preview
- Save and publish

**VideoUploader.tsx**
- File upload with progress bar
- Metadata form (title, description, tags)
- Thumbnail upload
- Cloud storage integration

### Backend Components

#### API Layer

**content.py**
- CRUD endpoints for content
- Query filtering (category, tags, published)
- Pagination support

**demos.py**
- CRUD endpoints for demos
- Code validation
- Thumbnail generation (optional)

**videos.py**
- Video metadata CRUD
- File upload to cloud storage
- Signed URL generation for streaming

**auth.py**
- Admin login with password
- JWT token generation
- Token validation middleware

#### Service Layer

**content_service.py**
- Business logic for content operations
- Markdown validation
- Search functionality (future)

**demo_service.py**
- Demo code validation
- Sanitization of HTML/CSS/JS
- Demo preview generation

**video_service.py**
- Video upload to S3/Azure
- Thumbnail extraction
- Video metadata extraction (duration, format)

**storage_service.py**
- Abstraction layer for cloud storage
- Support for multiple providers (S3, Azure Blob)
- Signed URL generation
- File deletion

---

## Authentication & Security

### Admin Authentication Strategy

**Approach**: Simple token-based authentication with JWT

#### Implementation

1. **Admin Password Storage**
   - Store admin password hash in environment variable or secure config
   - Use bcrypt or Argon2 for password hashing
   - Single admin account (scalable to multiple admins later)

2. **JWT Token Generation**
   - Token contains: `{ "admin": true, "exp": <expiry_timestamp> }`
   - Token expiry: 1 hour (configurable)
   - Token refresh: Re-login required (or implement refresh tokens)

3. **Authentication Flow**
   ```
   1. Admin enters password in login form
   2. Frontend sends POST /auth/login with password
   3. Backend validates password hash
   4. Backend generates JWT token
   5. Frontend stores token in localStorage or httpOnly cookie
   6. Frontend includes token in Authorization header for admin requests
   7. Backend validates token using middleware
   ```

#### Security Middleware

**FastAPI Dependency**
```python
from fastapi import Depends, HTTPException
from fastapi.security import HTTPBearer

security = HTTPBearer()

async def verify_admin_token(token: str = Depends(security)):
    # Decode JWT token
    # Verify signature and expiry
    # Return admin status or raise HTTPException(401)
```

### Security Best Practices

1. **Environment Variables**
   - Store sensitive config in `.env` files
   - Never commit `.env` to version control
   - Use different secrets for dev/staging/production

2. **CORS Configuration**
   - Whitelist only trusted origins
   - Allow credentials for authenticated requests
   ```python
   app.add_middleware(
       CORSMiddleware,
       allow_origins=["https://yourdomain.com"],
       allow_credentials=True,
       allow_methods=["*"],
       allow_headers=["*"],
   )
   ```

3. **Input Validation**
   - Use Pydantic schemas for all API inputs
   - Validate file uploads (size, format, content)
   - Sanitize HTML/JS in demos (prevent XSS)

4. **Rate Limiting** (Future)
   - Limit login attempts
   - Rate limit API requests
   - Use libraries like `slowapi`

5. **HTTPS Only**
   - Enforce HTTPS in production
   - Use Let's Encrypt for SSL certificates
   - Set secure headers (HSTS, CSP)

---

## Cloud Storage Integration

### Video Storage Architecture

**Cloud Provider Options**:
- **AWS S3**: Most popular, extensive features
- **Azure Blob Storage**: Good for Microsoft ecosystems
- **Google Cloud Storage**: Good for GCP deployments

### Implementation Strategy

#### AWS S3 Integration

**Setup**:
1. Create S3 bucket for video storage
2. Configure IAM user with S3 access permissions
3. Install `boto3` in backend
4. Store credentials in environment variables

**Video Upload Flow**:
```
1. Frontend: User selects video file
2. Frontend: POST /videos with multipart/form-data
3. Backend: Receives file upload
4. Backend: Generates unique filename (UUID)
5. Backend: Upload file to S3 bucket
6. Backend: Store S3 URL in database
7. Backend: Generate thumbnail (optional)
8. Backend: Return video metadata to frontend
```

**Video Streaming Flow**:
```
1. Frontend: Request video by ID
2. Backend: Generate signed S3 URL (temporary access)
3. Backend: Return signed URL with expiry (1 hour)
4. Frontend: Stream video using signed URL
5. S3: Serves video directly to client
```

#### Python Code Example

```python
import boto3
from botocore.exceptions import ClientError

class StorageService:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
            aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
            region_name=os.getenv('AWS_REGION')
        )
        self.bucket_name = os.getenv('S3_BUCKET_NAME')

    def upload_video(self, file, filename):
        try:
            self.s3_client.upload_fileobj(
                file,
                self.bucket_name,
                filename,
                ExtraArgs={'ContentType': 'video/mp4'}
            )
            return f"https://{self.bucket_name}.s3.amazonaws.com/{filename}"
        except ClientError as e:
            raise Exception(f"Upload failed: {str(e)}")

    def generate_signed_url(self, filename, expiration=3600):
        try:
            url = self.s3_client.generate_presigned_url(
                'get_object',
                Params={'Bucket': self.bucket_name, 'Key': filename},
                ExpiresIn=expiration
            )
            return url
        except ClientError as e:
            raise Exception(f"URL generation failed: {str(e)}")
```

#### Azure Blob Storage (Alternative)

**Setup**:
1. Create Azure Storage Account
2. Create Blob container for videos
3. Install `azure-storage-blob`
4. Configure connection string

```python
from azure.storage.blob import BlobServiceClient, generate_blob_sas

class AzureStorageService:
    def __init__(self):
        connection_string = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
        self.blob_service_client = BlobServiceClient.from_connection_string(connection_string)
        self.container_name = os.getenv('AZURE_CONTAINER_NAME')

    def upload_video(self, file, filename):
        blob_client = self.blob_service_client.get_blob_client(
            container=self.container_name,
            blob=filename
        )
        blob_client.upload_blob(file, overwrite=True)
        return blob_client.url
```

### Storage Best Practices

1. **File Naming**: Use UUIDs to avoid conflicts
2. **Metadata**: Store file metadata in database, not S3
3. **Access Control**: Use signed URLs, not public buckets
4. **Lifecycle Policies**: Archive or delete old videos
5. **CDN**: Use CloudFront (AWS) or Azure CDN for faster delivery
6. **Backup**: Enable versioning and cross-region replication

---

## Deployment Strategy

### Cloud Deployment Architecture

**Target Platforms**: AWS, Azure, GCP (cloud-agnostic design)

### Deployment Options

#### Option 1: Docker Containers on Cloud VMs

**Architecture**:
```
┌─────────────────────────────────────────┐
│         Load Balancer / CDN             │
│         (CloudFront / Azure CDN)        │
└───────────────┬─────────────────────────┘
                │
┌───────────────▼─────────────────────────┐
│         Reverse Proxy (Nginx)           │
│         - SSL Termination               │
│         - Static file serving           │
└────────┬──────────────────┬─────────────┘
         │                  │
┌────────▼────────┐  ┌──────▼──────────────┐
│  Frontend       │  │  Backend            │
│  (React/Nginx)  │  │  (FastAPI/uvicorn)  │
│  Port: 80       │  │  Port: 8000         │
└─────────────────┘  └─────────┬───────────┘
                               │
                     ┌─────────▼───────────┐
                     │  Database           │
                     │  (PostgreSQL)       │
                     │  or SQLite          │
                     └─────────────────────┘
```

**Steps**:
1. Create Docker images for frontend and backend
2. Deploy to cloud VM (EC2, Azure VM, GCE)
3. Use Docker Compose for orchestration
4. Set up Nginx as reverse proxy
5. Configure SSL with Let's Encrypt
6. Point domain to VM IP

#### Option 2: Managed Container Services

**AWS**:
- Frontend: S3 + CloudFront (static hosting)
- Backend: ECS Fargate or App Runner
- Database: RDS PostgreSQL
- Storage: S3

**Azure**:
- Frontend: Static Web Apps or Blob Storage + CDN
- Backend: Container Apps or App Service
- Database: Azure Database for PostgreSQL
- Storage: Blob Storage

**GCP**:
- Frontend: Cloud Storage + Cloud CDN
- Backend: Cloud Run
- Database: Cloud SQL PostgreSQL
- Storage: Cloud Storage

#### Option 3: Platform as a Service (PaaS)

**Options**:
- **Vercel**: Frontend deployment (React)
- **Railway** / **Render**: Backend deployment (FastAPI)
- **Heroku**: Full-stack deployment
- **DigitalOcean App Platform**: Simplified cloud deployment

### Docker Configuration

**docker-compose.yml**
```yaml
version: '3.8'

services:
  frontend:
    build:
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:80"
    environment:
      - VITE_API_URL=http://backend:8000
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=sqlite:///./bsg-demo.db
      - AWS_ACCESS_KEY_ID=${AWS_ACCESS_KEY_ID}
      - AWS_SECRET_ACCESS_KEY=${AWS_SECRET_ACCESS_KEY}
      - S3_BUCKET_NAME=${S3_BUCKET_NAME}
      - ADMIN_PASSWORD_HASH=${ADMIN_PASSWORD_HASH}
    volumes:
      - ./backend/data:/app/data
    depends_on:
      - db

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_USER=bsg_user
      - POSTGRES_PASSWORD=${DB_PASSWORD}
      - POSTGRES_DB=bsg_demo
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
      - "443:443"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
      - ./ssl:/etc/ssl
    depends_on:
      - frontend
      - backend

volumes:
  postgres_data:
```

### CI/CD Pipeline

**GitHub Actions Workflow** (`.github/workflows/deploy.yml`):
```yaml
name: Deploy to Cloud

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Build Frontend
        run: |
          cd frontend
          npm install
          npm run build

      - name: Build Backend
        run: |
          cd backend
          pip install -r requirements.txt
          pytest

      - name: Build Docker Images
        run: |
          docker build -t bsg-frontend ./frontend
          docker build -t bsg-backend ./backend

      - name: Deploy to Cloud
        run: |
          # Deploy commands for your chosen platform
```

### Environment Variables

**Backend (.env)**
```bash
# Database
DATABASE_URL=sqlite:///./bsg-demo.db
# or: postgresql://user:password@localhost/bsg_demo

# AWS S3
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=bsg-demo-videos

# Authentication
ADMIN_PASSWORD_HASH=$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5oe2kBZOX7e
JWT_SECRET_KEY=your_secret_key_here
JWT_ALGORITHM=HS256
JWT_EXPIRATION=3600

# CORS
ALLOWED_ORIGINS=https://yourdomain.com,http://localhost:3000
```

**Frontend (.env)**
```bash
VITE_API_URL=https://api.yourdomain.com
VITE_APP_NAME=BSG Demo Platform
```

---

## Development Workflow

### Initial Setup

**Prerequisites**:
- Node.js 18+ and npm
- Python 3.10+
- Git
- Docker (optional)

**Setup Steps**:

1. **Clone Repository**
   ```bash
   git clone https://github.com/yourusername/bsg-demo-platform.git
   cd bsg-demo-platform
   ```

2. **Frontend Setup**
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   # Edit .env with your configuration
   npm run dev
   ```
   Frontend runs on: `http://localhost:5173`

3. **Backend Setup**
   ```bash
   cd backend
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   python -m app.database.init_db  # Initialize database
   uvicorn app.main:app --reload
   ```
   Backend runs on: `http://localhost:8000`
   API docs: `http://localhost:8000/docs`

### Development Commands

**Frontend**:
```bash
npm run dev          # Start dev server
npm run build        # Production build
npm run preview      # Preview production build
npm run lint         # Run ESLint
npm run test         # Run tests (when added)
```

**Backend**:
```bash
uvicorn app.main:app --reload     # Start dev server
pytest                             # Run tests
python -m app.database.init_db    # Reset database
alembic revision --autogenerate   # Create migration
alembic upgrade head              # Apply migrations
```

### Git Workflow

**Branch Strategy**:
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/feature-name`: Feature branches
- `fix/bug-name`: Bug fix branches

**Commit Conventions**:
```
feat: Add video upload functionality
fix: Resolve demo iframe sandboxing issue
docs: Update API documentation
style: Format code with prettier
refactor: Restructure content service
test: Add unit tests for auth
```

### Code Quality

**Frontend**:
- ESLint for code linting
- Prettier for code formatting
- TypeScript for type safety
- Jest/Vitest for testing (future)

**Backend**:
- Black for code formatting
- Flake8 for linting
- mypy for type checking
- pytest for testing

---

## Recommended Tools

### Development Tools

| Tool | Purpose | Link |
|------|---------|------|
| **VS Code** | Primary IDE | https://code.visualstudio.com/ |
| **Postman** | API testing | https://www.postman.com/ |
| **DBeaver** | Database management | https://dbeaver.io/ |
| **Docker Desktop** | Containerization | https://www.docker.com/ |

### VS Code Extensions

**Frontend**:
- ES7+ React/Redux/React-Native snippets
- Tailwind CSS IntelliSense
- ESLint
- Prettier
- Auto Import

**Backend**:
- Python
- Pylance
- Black Formatter
- autoDocstring
- Thunder Client (API testing)

**General**:
- GitLens
- Docker
- Live Share
- Better Comments

### Cloud & DevOps Tools

| Tool | Purpose |
|------|---------|
| **AWS CLI** | AWS management |
| **Azure CLI** | Azure management |
| **Terraform** | Infrastructure as Code (future) |
| **GitHub Actions** | CI/CD |
| **Nginx** | Reverse proxy |
| **Let's Encrypt** | SSL certificates |

### Monitoring & Analytics (Future)

| Tool | Purpose |
|------|---------|
| **Sentry** | Error tracking |
| **Google Analytics** | User analytics |
| **Prometheus** | Metrics collection |
| **Grafana** | Metrics visualization |
| **CloudWatch** (AWS) | Log aggregation |

### Testing Tools

| Tool | Purpose |
|------|---------|
| **Vitest** | Frontend unit tests |
| **Cypress** | E2E testing |
| **pytest** | Backend unit tests |
| **Locust** | Load testing |

---

## Next Steps

### Immediate Actions (Phase 1)

1. **Project Initialization**
   - [ ] Create frontend React project with Vite
   - [ ] Create backend FastAPI project structure
   - [ ] Set up version control (.gitignore)
   - [ ] Create environment variable templates

2. **Basic Infrastructure**
   - [ ] Implement database models (SQLite)
   - [ ] Create API endpoints (CRUD for all modules)
   - [ ] Build core React components
   - [ ] Set up CORS and API integration

3. **Core Features**
   - [ ] Implement content management (CRUD)
   - [ ] Implement demo player (iframe-based)
   - [ ] Implement video player (basic)
   - [ ] Add admin authentication

4. **Testing & Documentation**
   - [ ] Test all API endpoints
   - [ ] Write API documentation (auto-generated with FastAPI)
   - [ ] Update README with setup instructions
   - [ ] Create sample content/demos/videos

### Future Enhancements (Phase 2+)

- [ ] User authentication (beyond admin)
- [ ] Comments and ratings system
- [ ] Search functionality (ElasticSearch or Algolia)
- [ ] Analytics dashboard
- [ ] Content versioning
- [ ] Multi-language support
- [ ] Accessibility improvements (WCAG compliance)
- [ ] Progressive Web App (PWA) features
- [ ] Email notifications
- [ ] Social media sharing
- [ ] Advanced video features (captions, chapters, quality selection)

---

## Appendix

### Glossary

- **FastAPI**: Modern Python web framework for building APIs
- **Vite**: Next-generation frontend build tool
- **SQLAlchemy**: Python SQL toolkit and ORM
- **Pydantic**: Data validation using Python type annotations
- **JWT**: JSON Web Token for authentication
- **CORS**: Cross-Origin Resource Sharing
- **S3**: Amazon Simple Storage Service
- **CDN**: Content Delivery Network
- **ORM**: Object-Relational Mapping

### Reference Links

- **FastAPI Documentation**: https://fastapi.tiangolo.com/
- **React Documentation**: https://react.dev/
- **Vite Documentation**: https://vitejs.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **SQLAlchemy**: https://docs.sqlalchemy.org/
- **AWS S3 Documentation**: https://docs.aws.amazon.com/s3/
- **Azure Blob Storage**: https://docs.microsoft.com/azure/storage/blobs/

### Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-11 | Initial architecture plan |

---

**Document Status**: Ready for Review
**Next Review Date**: After Phase 1 Implementation

---

*This architecture plan is a living document and should be updated as the project evolves.*
