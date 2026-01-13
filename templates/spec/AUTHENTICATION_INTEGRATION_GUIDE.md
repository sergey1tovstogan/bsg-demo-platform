# Authentication & User Management - Integration Reference

**Status**: ✅ **Implemented and Live**
**Last Updated**: January 13, 2026

This document serves as a reference for how the authentication system and user management UI are currently integrated into the `bsg-demo-platform` frontend.

## 🏗️ Architecture Overview

The integration follows a standard React Router + Context pattern:

1.  **`main.tsx`**: Roots the application with `AuthProvider`.
2.  **`App.tsx`**: Defines the Route structure (Login vs Dashboard vs Admin).
3.  **`Sidebar.tsx`**: Provides navigation and access control visibility.

---

## 1. Application Entry (`src/main.tsx`)

The application is wrapped with `AuthProvider` to provide global session state.

```tsx
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <AuthProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </AuthProvider>
  </React.StrictMode>,
)
```

## 2. Routing Structure (`src/App.tsx`)

We use `react-router-dom` Routes to separate the public login page from the main application.

```tsx
function App() {
  const [theme, setTheme] = useState<'light' | 'dark'>('dark')
  
  // Theme logic...

  return (
    <div className={`...`}>
      <Routes>
        {/* 1. Public Login Route */}
        <Route path="/login" element={<LoginPage />} />
        
        {/* 2. Protected Admin Route */}
        <Route 
          path="/admin/users" 
          element={
            <ProtectedRoute requiredRole="admin">
              <UserManagement />
            </ProtectedRoute>
          } 
        />
        
        {/* 3. Main Dashboard (Catch-all) */}
        <Route 
          path="/*" 
          element={
            <Dashboard 
              theme={theme} 
              onThemeChange={handleThemeChange} 
            />
          } 
        />
      </Routes>
    </div>
  )
}
```

## 3. Navigation & Access Control (`src/components/Sidebar.tsx`)

The Sidebar is "Auth-Aware". It uses the `useAuth` hook to conditionally render items.

### Auth Hook Integration
```tsx
const { user, logout, hasRole, isAuthenticated } = useAuth()
const navigate = useNavigate()
```

### Conditional Admin Menu
Only renders if the user has the 'admin' role.

```tsx
{hasRole('admin') && (
  <>
    <p>Administration</p>
    <button onClick={() => navigate('/admin/users')}>
      <UsersIcon />
      <span>Users</span>
    </button>
  </>
)}
```

### Login/Logout Logic
Dynamic button at the bottom of the sidebar.

```tsx
<button
  onClick={() => {
    if (isAuthenticated) {
      logout()
      navigate('/')
    } else {
      navigate('/login')
    }
  }}
>
  {isAuthenticated ? <LogOut /> : <LogIn />}
  <span>{isAuthenticated ? "Log Out" : "Log In"}</span>
</button>
```

---

## 4. Protected Route Component (`src/components/auth/ProtectedRoute.tsx`)

Used to wrap any route that requires specific access.

- **Authenticated**: Checks `isAuthenticated`. If false -> Redirects to `/login`.
- **Role/Permission**: Checks `hasRole()` or `hasPermission()`. If false -> Shows Access Denied screen.

**Usage:**
```tsx
<ProtectedRoute requiredRole="admin">
  <AdminPage />
</ProtectedRoute>
```

---

## 5. Development Reference

### Key Components

| Component | Path | Purpose |
|-----------|------|---------|
| `AuthContext` | `src/contexts/AuthContext.tsx` | Global state, login/logout methods |
| `LoginPage` | `src/pages/LoginPage.tsx` | Public login interface |
| `UserManagement` | `src/pages/UserManagement.tsx` | Admin CRUD interface |
| `ProtectedRoute` | `src/components/auth/ProtectedRoute.tsx` | Security wrapper |

### Test Users

| User | Credentials | Role |
|------|-------------|------|
| **Admin** | `admin@example.com` / `Admin` | Full Access |
| **Viewer** | `viewer@example.com` / `Viewer` | Read Only |

---

## 💡 Adding New Protected Features

To add a new protected feature:

1.  Create your page component.
2.  Add a Route in `App.tsx`.
3.  Wrap it with `<ProtectedRoute>`.
4.  Add a navigation link (optionally check `hasRole` for visibility).

```tsx
// Example in App.tsx
<Route 
  path="/my-feature" 
  element={
    <ProtectedRoute requiredRequired="edit_cards">
      <MyFeature />
    </ProtectedRoute>
  } 
/>
```
