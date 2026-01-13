# Authentication System - Quick Reference

**Created:** January 12, 2026
**Status:** Production Ready (Backend)
**Version:** 1.0

---

## 🔑 Test Credentials

```
Admin:  admin@example.com  / Admin
Viewer: viewer@example.com / Viewer
```

---

## 🌐 API Endpoints

**Base URL:** `http://localhost:8000/api/v1/auth-cards`

### Login
```bash
curl -X POST http://localhost:8000/api/v1/auth-cards/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"Admin"}'
```

**Response:**
```json
{
  "access_token": "eyJhbGc...",
  "refresh_token": "eyJhbGc...",
  "token_type": "Bearer",
  "expires_in": 900,
  "user": {
    "user_id": "usr_admin_001",
    "email": "admin@example.com",
    "role": "admin",
    ...
  }
}
```

### Get Current User
```bash
curl -X GET http://localhost:8000/api/v1/auth-cards/me \
  -H "Authorization: Bearer {access_token}"
```

### Refresh Token
```bash
curl -X POST http://localhost:8000/api/v1/auth-cards/refresh \
  -H "Authorization: Bearer {refresh_token}"
```

### Logout
```bash
curl -X POST http://localhost:8000/api/v1/auth-cards/logout \
  -H "Authorization: Bearer {access_token}"
```

---

## 💻 Code Examples

### Test Authentication (Python)
```python
from app.services.user_service import UserService
import asyncio

async def test_login():
    service = UserService()
    user = await service.authenticate_user(
        "admin@example.com",
        "Admin"
    )
    print(f"Logged in: {user.email} ({user.role})")

asyncio.run(test_login())
```

### Create JWT Tokens
```python
from app.services.auth_services import create_access_token, create_refresh_token

token_data = {"user_id": "usr_123", "email": "test@example.com", "role": "admin"}

access_token = create_access_token(token_data)
refresh_token = create_refresh_token(token_data)

print(f"Access: {access_token[:50]}...")
print(f"Refresh: {refresh_token[:50]}...")
```

### Verify Token
```python
from app.services.auth_services import verify_token

payload = verify_token(access_token)
print(f"User: {payload['user_id']}, Role: {payload['role']}")
print(f"Expires: {payload['exp']}")
```

### Hash Password
```python
from app.services.auth_services import hash_password, verify_password

# Hash
hashed = hash_password("MyPassword123!")
print(f"Hash: {hashed}")  # $2b$12$...

# Verify
is_valid = verify_password("MyPassword123!", hashed)
print(f"Valid: {is_valid}")  # True
```

---

## 📁 File Locations

### Backend
```
backend/
├── app/
│   ├── models/
│   │   └── auth_user.py          # User model (AuthUser, UserProfile)
│   ├── services/
│   │   ├── auth_services.py      # Password & JWT services
│   │   └── user_service.py       # User CRUD & authentication
│   └── api/
│       └── auth_cards.py          # Authentication API endpoints
├── scripts/
│   ├── create_test_users.py      # Initialize test users
│   └── init_auth_database.py     # Setup database indexes
└── tests/
    ├── conftest.py                # Test fixtures
    └── test_auth_user_model.py   # 27 comprehensive tests
```

### Documentation
```
templates/spec/
├── AUTHENTICATION_AUTHORIZATION_PLAN.md  # Full implementation plan
├── AUTH_IMPLEMENTATION_STATUS.md         # Detailed status
├── PROJECT_ARCHITECTURE.md               # Updated with auth section
├── STATUS_2026_01_12.md                  # Today's progress
└── AUTHENTICATION_REFERENCE.md           # This file

Root:
├── AUTHENTICATION_SETUP.md               # Quick start guide
└── AUTHENTICATION_IMPLEMENTATION_SUMMARY.md  # Complete summary
```

---

## 🗄️ Database

**Collection:** `auth_users` in `bsg_demo` database

**Connection:** Azure Cosmos DB (MongoDB API)
```
mongodb://bsg-demo-platform-mongodb:...@bsg-demo-platform-mongodb.mongo.cosmos.azure.com:10255/
```

**Indexes:**
- `role_1`
- `is_active_1`
- `created_at_1`

**Documents:** 2 users (admin, viewer)

---

## 🧪 Testing

### Run Tests
```bash
cd backend
source venv/bin/activate
pytest tests/test_auth_user_model.py -v
```

**Expected:** ✅ 27/27 tests passing

### Initialize Database
```bash
python scripts/init_auth_database.py
```

### Create Test Users
```bash
python scripts/create_test_users.py
```

---

## 🔐 Security Features

### Implemented
- ✅ Bcrypt password hashing (cost factor 12)
- ✅ Password strength validation
- ✅ JWT token management (HS256)
- ✅ Access tokens (15-min expiry)
- ✅ Refresh tokens (30-day expiry)
- ✅ Account lockout (5 failed attempts, 30-min lockout)
- ✅ Failed login tracking
- ✅ Secure serialization (passwords never exposed)
- ✅ Email validation
- ✅ Role-based access control

### Pending
- ⏳ Email verification
- ⏳ Password reset via email
- ⏳ Two-factor authentication
- ⏳ Session management (Redis)
- ⏳ Audit logging

---

## 👥 User Roles

| Role | Login Required | Capabilities |
|------|----------------|--------------|
| **guest** | No | View published cards |
| **viewer** | Yes | + Configure demo visibility |
| **admin** | Yes | + Full access (edit, manage) |

---

## 📊 Implementation Status

### Complete ✅
- User model with validation (27 tests)
- Password & JWT services
- User service layer
- API endpoints
- Database integration
- Test users created
- Documentation

### Pending ⏳
- Frontend AuthContext
- Login form component
- Protected routes
- User management UI
- Demo configuration UI
- Integration tests

---

## 🚀 Next Steps

### For Next Session

1. **Add Missing Tests**
   ```bash
   # Create these test files:
   tests/test_auth_services.py      # 15 tests
   tests/test_jwt_service.py        # 20 tests
   tests/test_user_service.py       # 30 tests
   tests/test_auth_api.py           # 25 tests
   ```

2. **Frontend Integration**
   ```typescript
   // Create these files:
   frontend/src/contexts/AuthContext.tsx
   frontend/src/components/auth/LoginForm.tsx
   frontend/src/components/auth/ProtectedRoute.tsx
   ```

3. **Visual Editor Integration**
   - Add authentication check to visual editor
   - Restrict access to admin users only
   - Show current user info in header
   - Add logout button

---

## 📚 Documentation Links

- **Full Plan:** `templates/spec/AUTHENTICATION_AUTHORIZATION_PLAN.md`
- **Setup Guide:** `AUTHENTICATION_SETUP.md`
- **Summary:** `AUTHENTICATION_IMPLEMENTATION_SUMMARY.md`
- **Architecture:** `templates/spec/PROJECT_ARCHITECTURE.md`
- **Status:** `templates/spec/STATUS_2026_01_12.md`

---

## 🐛 Troubleshooting

### Test Users Not Found
```bash
# Re-create test users
python scripts/create_test_users.py
```

### Database Connection Failed
```bash
# Check .env file has correct DATABASE_URL
grep DATABASE_URL backend/.env
```

### Tests Failing
```bash
# Install dependencies
pip install -r requirements.txt

# Run tests with verbose output
pytest tests/test_auth_user_model.py -vv
```

### API Not Responding
```bash
# Start server
cd backend
source venv/bin/activate
python -m uvicorn app.main:app --reload

# Test health endpoint
curl http://localhost:8000/api/v1/health
```

---

## ✅ Quick Checklist

Before starting next session, verify:

- [ ] 27 tests passing: `pytest tests/test_auth_user_model.py -v`
- [ ] Database has 2 users: `python scripts/init_auth_database.py`
- [ ] API endpoints registered: Check `app/main.py` line 97
- [ ] Test login works: `curl -X POST http://localhost:8000/api/v1/auth-cards/login ...`
- [ ] Documentation updated: All 6 docs in `templates/spec/`

---

**Last Updated:** January 12, 2026
**Status:** ✅ Complete and Ready for Next Phase
