/**
 * Main App Component
 * 
 * Sets up routing for the application.
 */

import React from 'react'
import { Routes, Route, Link, useLocation } from 'react-router-dom'
import { useAuth } from './contexts/AuthContext'
import { ProtectedRoute, UserProfileHeader } from './components/auth'
import { LoginPage } from './pages/LoginPage'
import { UserManagement } from './pages/UserManagement'
import { DeploymentContentViewer } from './components/deployment/DeploymentContentViewer'

// Layout component with header
const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, hasRole } = useAuth()
  const location = useLocation()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <header style={{
        background: 'white',
        borderBottom: '1px solid #e2e8f0',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#1a202c' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 700 }}>BSG Demo Platform</h1>
          </Link>
          <nav style={{ display: 'flex', gap: '1rem' }}>
            {isAuthenticated && hasRole('admin') && (
              <Link
                to="/admin/users"
                style={{
                  textDecoration: 'none',
                  color: location.pathname === '/admin/users' ? '#667eea' : '#4a5568',
                  fontWeight: location.pathname === '/admin/users' ? 600 : 400,
                  padding: '0.5rem 1rem',
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                }}
                onMouseEnter={(e) => {
                  if (location.pathname !== '/admin/users') {
                    e.currentTarget.style.background = '#f7fafc'
                  }
                }}
                onMouseLeave={(e) => {
                  if (location.pathname !== '/admin/users') {
                    e.currentTarget.style.background = 'transparent'
                  }
                }}
              >
                User Management
              </Link>
            )}
          </nav>
        </div>
        <UserProfileHeader />
      </header>

      {/* Main content */}
      <main style={{ flex: 1 }}>
        {children}
      </main>
    </div>
  )
}

// Simple Dashboard/Home component
const Dashboard: React.FC = () => {
  return (
    <Layout>
      <div style={{ padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
        <DeploymentContentViewer />
      </div>
    </Layout>
  )
}

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected routes */}
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute requireAuth requireRole="admin">
            <Layout>
              <UserManagement />
            </Layout>
          </ProtectedRoute>
        }
      />

      {/* Default route - Dashboard */}
      <Route path="/*" element={<Dashboard />} />
    </Routes>
  )
}

export default App
