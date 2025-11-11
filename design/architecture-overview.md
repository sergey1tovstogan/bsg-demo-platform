# BSG Demo Platform - Architecture Overview

## 1. Executive Summary

The BSG Demo Platform is a modular, component-based application designed to deliver interactive demonstrations across multiple technical domains. Each component operates independently while sharing common infrastructure, enabling parallel development and flexible deployment.

## 2. System Architecture

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (SPA)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Component   │  │  Component   │  │  Component   │      │
│  │   Viewer     │  │  Navigation  │  │   Manager    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                              │
                    REST API Gateway
                              │
┌─────────────────────────────────────────────────────────────┐
│              Python Backend (FastAPI/Flask)                  │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Common Services Layer                    │   │
│  │  • Authentication  • Logging  • Rate Limiting         │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │ Integration │  │    Data     │  │ Deployment  │         │
│  │ API Service │  │Architecture │  │   Service   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │  Security   │  │Observability│  │Design Time  │         │
│  │   Service   │  │   Service   │  │   Service   │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
│                                                               │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Content Management Layer                 │   │
│  │  • Content API  • Video API  • Demo API  • Chat API  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        │                     │                     │
┌───────▼─────┐   ┌──────────▼──────┐   ┌─────────▼─────────┐
│ PostgreSQL  │   │  Video Storage  │   │ External Systems  │
│  Container  │   │  (File System)  │   │ • Demo Systems    │
│             │   │                 │   │ • Chatbot KB API  │
└─────────────┘   └─────────────────┘   └───────────────────┘
```

### 2.2 Component Architecture

Each demo component consists of four sub-modules:

1. **Content Module**: Manages presentation content (slides, explanations, benefits)
2. **Demo Module**: Provides web frame interface to external demo systems
3. **Video Module**: Serves demonstration videos
4. **Chatbot Module**: Interfaces with external knowledge base API

## 3. Technology Stack

### 3.1 Frontend
- **Framework**: React 18+
- **State Management**: React Context API / Redux
- **HTTP Client**: Axios
- **Routing**: React Router
- **UI Framework**: Material-UI / Tailwind CSS

### 3.2 Backend
- **Framework**: Python FastAPI (recommended) or Flask
- **API Documentation**: OpenAPI/Swagger
- **ORM**: SQLAlchemy
- **Migration Tool**: Alembic
- **Validation**: Pydantic

### 3.3 Database
- **Primary Database**: PostgreSQL 15+
- **Container**: Docker
- **Data Persistence**: Volume mapped to codebase directory

### 3.4 Storage
- **Video Storage**: Local file system (videos directory in codebase)
- **Content Storage**: PostgreSQL + JSON fields
- **Static Assets**: File system with CDN-ready structure

## 4. API Design Principles

### 4.1 RESTful API Structure

All component APIs follow a consistent pattern:

```
/api/v1/components/{component-name}/content
/api/v1/components/{component-name}/demo
/api/v1/components/{component-name}/video
/api/v1/components/{component-name}/chatbot
```

### 4.2 Common Endpoints

Each component exposes:
- `GET /content` - Retrieve presentation content
- `GET /content/{slide-id}` - Retrieve specific slide
- `GET /demo` - Retrieve demo configuration
- `POST /demo/connect` - Establish connection to external demo system
- `GET /video` - Retrieve video metadata
- `GET /video/stream` - Stream video content
- `POST /chatbot/query` - Send query to chatbot
- `GET /chatbot/history` - Retrieve chat history

## 5. Data Architecture

### 5.1 Database Schema (Logical)

**Components Table**
- component_id (PK)
- name
- description
- category
- status
- created_at
- updated_at

**Content Table**
- content_id (PK)
- component_id (FK)
- slide_order
- title
- body (JSON)
- type
- metadata (JSON)

**Videos Table**
- video_id (PK)
- component_id (FK)
- title
- description
- file_path
- duration
- format
- size

**Demo_Configs Table**
- demo_id (PK)
- component_id (FK)
- external_system_url
- connection_type
- configuration (JSON)

**Chatbot_Sessions Table**
- session_id (PK)
- component_id (FK)
- user_id
- kb_endpoint
- created_at
- last_active

**Chat_Messages Table**
- message_id (PK)
- session_id (FK)
- role (user/assistant)
- content
- timestamp

## 6. Component Independence

### 6.1 Isolation Principles
- Each component has its own service module
- No direct inter-component dependencies
- Shared infrastructure through common services layer
- Independent database schemas (separate tables per component)

### 6.2 Standalone Operation
- Each component can be deployed independently
- Component APIs can function without other components
- Frontend components can be lazy-loaded
- Database migrations per component

## 7. Common Infrastructure

### 7.1 Shared Services
- **Authentication Service**: JWT-based authentication
- **Logging Service**: Centralized logging (ELK/CloudWatch compatible)
- **Configuration Service**: Environment-based configuration
- **Caching Service**: Redis (optional, for performance)
- **Health Check Service**: Component health monitoring

### 7.2 Middleware
- CORS handling
- Request validation
- Rate limiting
- Error handling
- Response formatting

## 8. Deployment Architecture

### 8.1 Containerization
- Frontend: Nginx container serving React build
- Backend: Python application container
- Database: PostgreSQL container with persistent volume
- Optional: Redis container for caching

### 8.2 Volume Mapping
```
./videos -> /app/videos (container)
./data/postgres -> /var/lib/postgresql/data (container)
```

## 9. Security Considerations

- API authentication and authorization
- Rate limiting on all endpoints
- Input validation and sanitization
- SQL injection prevention (ORM)
- CORS configuration
- Secrets management (environment variables)
- HTTPS enforcement in production

## 10. Scalability Considerations

- Stateless API design
- Horizontal scaling capability
- Database connection pooling
- Video streaming optimization (chunked transfer)
- Caching strategy for static content
- Load balancer ready

## 11. Development Workflow

### 11.1 Git Branching Strategy
- `main`: Production-ready code
- `develop`: Integration branch
- `feature/component-{name}`: Individual component development
- `feature/frontend`: Frontend development
- `feature/infrastructure`: Common infrastructure development

### 11.2 Parallel Development
- Frontend team works on React application
- Backend teams work on individual component services
- Infrastructure team works on common services
- Independent testing per component
- Integration testing on develop branch

## 12. API Versioning

- URL-based versioning: `/api/v1/`
- Backward compatibility maintenance
- Deprecation notices in response headers
- Version documentation in OpenAPI spec

## 13. Monitoring and Observability

- Application logs
- API performance metrics
- Error tracking
- Component health status
- Database query performance
- Video streaming metrics

## 14. Directory Structure

```
bsg-demo-platform/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── integration/
│   │   │   ├── data-architecture/
│   │   │   ├── deployment/
│   │   │   ├── security/
│   │   │   ├── observability/
│   │   │   └── design-time/
│   │   ├── services/
│   │   ├── common/
│   │   └── App.js
│   └── package.json
├── backend/
│   ├── app/
│   │   ├── api/
│   │   │   ├── v1/
│   │   │   │   ├── integration/
│   │   │   │   ├── data_architecture/
│   │   │   │   ├── deployment/
│   │   │   │   ├── security/
│   │   │   │   ├── observability/
│   │   │   │   └── design_time/
│   │   ├── models/
│   │   ├── services/
│   │   ├── common/
│   │   └── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── videos/
│   ├── integration/
│   ├── data-architecture/
│   ├── deployment/
│   ├── security/
│   ├── observability/
│   └── design-time/
├── data/
│   └── postgres/
├── docker-compose.yml
└── README.md
```

## 15. Success Criteria

- All components accessible via unified REST API
- Each component functions independently
- Common infrastructure reduces code duplication
- Parallel development capability
- Scalable architecture
- Easy to add new components
- Comprehensive API documentation
- Automated testing framework
