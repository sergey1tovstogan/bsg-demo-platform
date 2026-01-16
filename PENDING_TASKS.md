# Pending Tasks Summary

**Last Updated:** January 16, 2026  
**Status:** Review of remaining tasks

---

## 🔴 Critical Issues (Fix Required)

### 1. Test Configuration Issue
**File:** `backend/pytest.ini`  
**Problem:** Tests fail with `'asyncio' not found in 'markers' configuration option`  
**Fix Required:** Add `asyncio` marker to pytest.ini  
**Priority:** HIGH (blocks test execution)

```ini
[pytest]
markers =
    asyncio: marks tests as async
```

---

## 🟡 Missing Tests (High Priority)

### 2. Password Service Tests
**File:** `backend/app/services/auth_services.py` - `PasswordService`  
**Status:** No tests exist  
**Required:** ~15 tests covering:
- Password hashing with bcrypt
- Password verification
- Password strength validation
- Edge cases (empty passwords, special characters, etc.)

**Priority:** HIGH

### 3. JWT Service Tests
**File:** `backend/app/services/auth_services.py` - `JWTService`  
**Status:** No tests exist  
**Required:** ~20 tests covering:
- Token creation (access & refresh)
- Token verification
- Token expiration handling
- Invalid token handling
- Token refresh logic

**Priority:** HIGH

### 4. User Service Tests
**File:** `backend/app/services/user_service.py`  
**Status:** No tests exist  
**Required:** ~30 tests covering:
- User CRUD operations
- Authentication logic
- Account lockout
- Password reset
- Duplicate email handling
- Error cases

**Priority:** HIGH

---

## 🟢 Features Not Yet Implemented

### 5. Demo Configuration UI (Phase 4)
**Status:** Not Started  
**Required Components:**
- [ ] Card visibility toggle interface
- [ ] Demo preset management
- [ ] Card ordering UI
- [ ] Preview mode

**Priority:** MEDIUM  
**Target Users:** Viewer role

### 6. Visual Editor Integration
**Status:** Not Started  
**Required:**
- [ ] Add authentication check to visual editor
- [ ] Restrict access to admins only
- [ ] Show user info in UI
- [ ] Add logout button to editor

**Priority:** MEDIUM

### 7. Token Blacklisting (Redis)
**File:** `backend/app/api/auth_v2.py` (line 195)  
**Status:** TODO comment exists  
**Required:** Implement Redis-based token blacklisting for logout  
**Priority:** MEDIUM (currently relies on client-side token deletion)

---

## 🔵 Future Enhancements (Low Priority)

### 8. Email Verification
**Status:** Not Started  
**Required:**
- [ ] Email verification on signup
- [ ] Verification email sending
- [ ] Verification link handling
- [ ] Resend verification email

**Priority:** LOW

### 9. Password Reset via Email
**Status:** Not Started  
**Required:**
- [ ] Password reset request endpoint
- [ ] Reset email sending
- [ ] Reset token generation
- [ ] Password reset form
- [ ] Reset token validation

**Priority:** LOW

### 10. Two-Factor Authentication (2FA)
**Status:** Not Started  
**Required:**
- [ ] 2FA setup flow
- [ ] QR code generation
- [ ] TOTP verification
- [ ] Backup codes
- [ ] 2FA enforcement

**Priority:** LOW

### 11. Session Management (Redis)
**Status:** Not Started  
**Required:**
- [ ] Redis integration
- [ ] Session storage
- [ ] Active session tracking
- [ ] Session invalidation
- [ ] Multi-device session management

**Priority:** LOW

### 12. Audit Logging UI
**Status:** Not Started  
**Required:**
- [ ] Audit log viewer component
- [ ] Filtering and search
- [ ] Export functionality
- [ ] Real-time updates

**Priority:** LOW

### 13. User Activity Dashboard
**Status:** Not Started  
**Required:**
- [ ] Activity tracking
- [ ] Dashboard component
- [ ] Charts and statistics
- [ ] User activity timeline

**Priority:** LOW

---

## 📊 Summary

### By Priority:
- **HIGH:** 4 items (Test config + 3 test suites)
- **MEDIUM:** 3 items (Demo config UI, Visual editor, Token blacklisting)
- **LOW:** 6 items (Future enhancements)

### By Category:
- **Testing:** 4 items
- **Features:** 3 items
- **Enhancements:** 6 items

### Estimated Effort:
- **Critical Fixes:** 1 hour
- **Missing Tests:** 15-20 hours
- **Medium Priority Features:** 20-30 hours
- **Future Enhancements:** 40-60 hours

---

## ✅ Completed (Recently)

- ✅ Frontend authentication components (AuthContext, LoginForm, ProtectedRoute)
- ✅ User management UI (UserList, UserForm, UserManagement page)
- ✅ Routing structure (App.tsx, main.tsx)
- ✅ All CSS styling
- ✅ Component exports and organization

---

## 🎯 Recommended Next Steps

1. **Fix pytest.ini** (15 minutes) - Unblocks test execution
2. **Add Password Service Tests** (4-5 hours) - Critical for security
3. **Add JWT Service Tests** (5-6 hours) - Critical for authentication
4. **Add User Service Tests** (6-8 hours) - Critical for user management
5. **Demo Configuration UI** (10-15 hours) - Core feature for viewers
6. **Visual Editor Integration** (5-8 hours) - Security requirement

---

**Note:** The authentication system is functionally complete for basic use. The pending items are primarily:
- Test coverage improvements
- Additional features for specific use cases
- Future enhancements for production readiness
