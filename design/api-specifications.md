# BSG Demo Platform - API Specifications

## Overview

This document provides the complete API specification for the BSG Demo Platform. All components follow consistent API patterns and conventions.

## Base URL

```
Production: https://api.bsg-demo.com
Development: http://localhost:8000
```

## API Versioning

All APIs are versioned using URL-based versioning:
```
/api/v1/*
```

## Global Endpoints

### Authentication

#### POST /api/v1/auth/register
Register a new user.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!",
  "name": "John Doe"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "user_id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "role": "user"
  }
}
```

#### POST /api/v1/auth/login
Authenticate user and receive JWT token.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

#### POST /api/v1/auth/refresh
Refresh access token.

**Request:**
```json
{
  "refresh_token": "refresh-token"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "access_token": "new-jwt-token",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

#### POST /api/v1/auth/logout
Invalidate current session.

**Headers:**
```
Authorization: Bearer <token>
```

**Response (204):**
No content.

### Health Check

#### GET /api/v1/health
Get system health status.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-01-01T00:00:00Z",
    "checks": {
      "database": "healthy",
      "redis": "healthy"
    }
  }
}
```

#### GET /api/v1/ready
Kubernetes readiness probe.

**Response (200):**
```json
{
  "ready": true
}
```

#### GET /api/v1/live
Kubernetes liveness probe.

**Response (200):**
```json
{
  "alive": true
}
```

### Component Discovery

#### GET /api/v1/components
List all available components.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "component_id": "integration",
      "name": "Integration, APIs and Events",
      "description": "Enterprise integration patterns and API design",
      "status": "active"
    },
    {
      "component_id": "data-architecture",
      "name": "Data Architecture",
      "description": "Database design and data modeling",
      "status": "active"
    }
  ]
}
```

## Component API Pattern

All components follow the same API structure. Replace `{component-id}` with:
- `integration` - Integration, APIs and Events
- `data-architecture` - Data Architecture
- `deployment` - Deployment and Cloud
- `security` - Security
- `observability` - Observability
- `design-time` - Design Time

### Content APIs

#### GET /api/v1/components/{component-id}/content
List all content for a component.

**Query Parameters:**
- `page` (optional, default: 1) - Page number
- `page_size` (optional, default: 20) - Items per page
- `type` (optional) - Filter by content type

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "content_id": "uuid",
      "title": "Introduction to REST APIs",
      "type": "slide",
      "order": 1,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 100,
    "total_pages": 5
  }
}
```

#### GET /api/v1/components/{component-id}/content/{content-id}
Get specific content item.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content_id": "uuid",
    "title": "Introduction to REST APIs",
    "type": "slide",
    "order": 1,
    "body": {
      "heading": "REST APIs",
      "bullets": [
        "Representational State Transfer",
        "HTTP-based architecture",
        "Stateless communication"
      ],
      "code_examples": []
    },
    "metadata": {
      "duration_minutes": 5,
      "difficulty": "beginner"
    },
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

#### POST /api/v1/components/{component-id}/content
Create new content (admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request:**
```json
{
  "title": "GraphQL vs REST",
  "type": "slide",
  "order": 10,
  "body": {
    "heading": "GraphQL vs REST",
    "bullets": ["Flexibility", "Performance", "Complexity"]
  },
  "metadata": {
    "duration_minutes": 10
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "content_id": "uuid",
    "title": "GraphQL vs REST",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### PUT /api/v1/components/{component-id}/content/{content-id}
Update existing content (admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
```

**Request:**
```json
{
  "title": "Updated Title",
  "body": { /* updated content */ }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "content_id": "uuid",
    "updated_at": "2025-01-01T00:00:00Z"
  }
}
```

#### DELETE /api/v1/components/{component-id}/content/{content-id}
Delete content (admin only).

**Response (204):**
No content.

### Demo APIs

#### GET /api/v1/components/{component-id}/demo
Get demo configuration.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "demo_id": "uuid",
    "name": "Integration Demo",
    "external_system_url": "https://demo.integration-platform.com",
    "connection_type": "websocket",
    "configuration": {
      "supported_scenarios": ["rest-api", "webhook", "pub-sub"]
    }
  }
}
```

#### POST /api/v1/components/{component-id}/demo/connect
Connect to external demo system.

**Request:**
```json
{
  "scenario": "rest-api",
  "parameters": {
    "endpoint": "users"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "status": "connected",
    "connection_url": "wss://demo.system/session-uuid"
  }
}
```

#### POST /api/v1/components/{component-id}/demo/execute
Execute demo scenario.

**Request:**
```json
{
  "session_id": "uuid",
  "action": "send_request",
  "parameters": {
    "method": "GET",
    "path": "/api/users"
  }
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "execution_id": "uuid",
    "status": "completed",
    "result": {
      "request": {
        "method": "GET",
        "url": "/api/users"
      },
      "response": {
        "status": 200,
        "body": { /* response data */ }
      }
    }
  }
}
```

#### GET /api/v1/components/{component-id}/demo/status
Get demo connection status.

**Query Parameters:**
- `session_id` - Demo session ID

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "status": "connected",
    "connected_at": "2025-01-01T00:00:00Z",
    "last_activity": "2025-01-01T00:05:00Z"
  }
}
```

#### POST /api/v1/components/{component-id}/demo/disconnect
Disconnect from demo system.

**Request:**
```json
{
  "session_id": "uuid"
}
```

**Response (204):**
No content.

### Video APIs

#### GET /api/v1/components/{component-id}/videos
List available videos.

**Query Parameters:**
- `page` (optional, default: 1)
- `page_size` (optional, default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "video_id": "uuid",
      "title": "REST API Demo Walkthrough",
      "description": "Step-by-step guide to REST APIs",
      "duration": 300,
      "format": "mp4",
      "size": 52428800,
      "thumbnail_url": "/api/v1/videos/uuid/thumbnail",
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 50
  }
}
```

#### GET /api/v1/components/{component-id}/videos/{video-id}
Get video metadata.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "video_id": "uuid",
    "title": "REST API Demo Walkthrough",
    "description": "Step-by-step guide to REST APIs",
    "duration": 300,
    "format": "mp4",
    "size": 52428800,
    "resolution": "1920x1080",
    "file_path": "/videos/integration/demo1.mp4",
    "chapters": [
      {
        "title": "Introduction",
        "timestamp": 0
      },
      {
        "title": "Creating API Endpoints",
        "timestamp": 60
      }
    ],
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### GET /api/v1/components/{component-id}/videos/{video-id}/stream
Stream video content.

**Headers (Optional):**
```
Range: bytes=0-1023
```

**Response (200 or 206):**
```
Content-Type: video/mp4
Content-Length: 52428800
Accept-Ranges: bytes
Content-Range: bytes 0-1023/52428800

<binary video data>
```

#### POST /api/v1/components/{component-id}/videos
Upload video (admin only).

**Headers:**
```
Authorization: Bearer <admin-token>
Content-Type: multipart/form-data
```

**Request:**
```
file: <video file>
title: "New Demo Video"
description: "Description of the video"
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "video_id": "uuid",
    "title": "New Demo Video",
    "upload_status": "processing"
  }
}
```

### Chatbot APIs

#### POST /api/v1/components/{component-id}/chatbot/session
Create new chat session.

**Headers:**
```
Authorization: Bearer <token>
```

**Request:**
```json
{
  "context": {
    "topic": "REST APIs",
    "user_level": "beginner"
  }
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "kb_endpoint": "https://kb.api.com/v1/chat",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

#### POST /api/v1/components/{component-id}/chatbot/query
Send query to chatbot.

**Request:**
```json
{
  "session_id": "uuid",
  "message": "What is the difference between REST and GraphQL?"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "message_id": "uuid",
    "role": "assistant",
    "content": "REST and GraphQL are both API architectures, but they differ in several ways...",
    "timestamp": "2025-01-01T00:00:00Z",
    "sources": [
      {
        "title": "REST vs GraphQL Guide",
        "url": "https://docs.example.com/rest-vs-graphql"
      }
    ]
  }
}
```

#### GET /api/v1/components/{component-id}/chatbot/history/{session-id}
Get chat history.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "session_id": "uuid",
    "messages": [
      {
        "message_id": "uuid",
        "role": "user",
        "content": "What is REST?",
        "timestamp": "2025-01-01T00:00:00Z"
      },
      {
        "message_id": "uuid",
        "role": "assistant",
        "content": "REST is...",
        "timestamp": "2025-01-01T00:00:01Z"
      }
    ],
    "total_messages": 2
  }
}
```

#### DELETE /api/v1/components/{component-id}/chatbot/session/{session-id}
End chat session.

**Response (204):**
No content.

## Error Responses

### 400 Bad Request
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "email",
      "reason": "Invalid email format"
    }
  },
  "metadata": {
    "timestamp": "2025-01-01T00:00:00Z",
    "request_id": "uuid"
  }
}
```

### 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

### 403 Forbidden
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions"
  }
}
```

### 404 Not Found
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Resource not found"
  }
}
```

### 429 Too Many Requests
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retry_after": 60
    }
  }
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "error": {
    "code": "INTERNAL_ERROR",
    "message": "An unexpected error occurred"
  }
}
```

## Rate Limiting

All authenticated endpoints are subject to rate limiting:
- **Default**: 1000 requests per hour per user
- **Public endpoints**: 100 requests per hour per IP
- **Admin endpoints**: 5000 requests per hour

Rate limit headers are included in all responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1640995200
```

## Pagination

List endpoints support pagination with the following parameters:
- `page` - Page number (default: 1)
- `page_size` - Items per page (default: 20, max: 100)

Pagination metadata is included in responses:
```json
{
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total_items": 100,
    "total_pages": 5,
    "has_next": true,
    "has_previous": false
  }
}
```

## Authentication

### JWT Token Format

Tokens are passed in the Authorization header:
```
Authorization: Bearer <jwt-token>
```

Token payload structure:
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "user",
  "exp": 1640995200,
  "iat": 1640991600
}
```

### Token Expiration
- Access tokens: 1 hour
- Refresh tokens: 7 days

## CORS Configuration

Allowed origins are configurable per environment.

Exposed headers:
- `X-Request-ID`
- `X-RateLimit-*`

Allowed headers:
- `Authorization`
- `Content-Type`
- `X-Request-ID`

## WebSocket Endpoints (Optional)

For real-time features (demo streaming, live metrics):

```
ws://localhost:8000/ws/v1/components/{component-id}/demo/stream
```

### Connection
```javascript
const ws = new WebSocket('ws://localhost:8000/ws/v1/components/integration/demo/stream?token=<jwt-token>');
```

### Message Format
```json
{
  "type": "event",
  "data": {
    "event_type": "api_response",
    "payload": { /* event data */ }
  },
  "timestamp": "2025-01-01T00:00:00Z"
}
```

## API Client Examples

### JavaScript/TypeScript
```javascript
const response = await fetch('http://localhost:8000/api/v1/components/integration/content', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const data = await response.json();
```

### Python
```python
import requests

response = requests.get(
    'http://localhost:8000/api/v1/components/integration/content',
    headers={'Authorization': f'Bearer {token}'}
)
data = response.json()
```

### cURL
```bash
curl -X GET \
  'http://localhost:8000/api/v1/components/integration/content' \
  -H 'Authorization: Bearer <token>'
```

## OpenAPI Documentation

Interactive API documentation is available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`
- OpenAPI JSON: `http://localhost:8000/openapi.json`

## Versioning Strategy

- Current version: v1
- Breaking changes require new version (v2, v3, etc.)
- Old versions supported for 6 months after new version release
- Version deprecation announced via response headers:
  ```
  X-API-Deprecation: version=v1, sunset=2025-12-31
  ```
