/**
 * Protected Route Component
 * 
 * Wraps routes that require authentication and/or specific roles/permissions.
 */

import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth, UserRole } from '../../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAuth?: boolean
  requireRole?: UserRole
  requirePermission?: string
  redirectTo?: string
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requireAuth = true,
  requireRole,
  requirePermission,
  redirectTo = '/login',
}) => {
  const { isAuthenticated, isLoading, hasRole, hasPermission } = useAuth()
  const location = useLocation()

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh' 
      }}>
        <div>Loading...</div>
      </div>
    )
  }

  // Check authentication
  if (requireAuth && !isAuthenticated) {
    // Save the location they were trying to visit
    return <Navigate to={redirectTo} state={{ from: location }} replace />
  }

  // Check role requirement
  if (requireRole && !hasRole(requireRole)) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1a202c' }}>
          Access Denied
        </h1>
        <p style={{ color: '#718096', marginBottom: '2rem' }}>
          You don't have the required permissions to access this page.
        </p>
        <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>
          Required role: <strong>{requireRole}</strong>
        </p>
      </div>
    )
  }

  // Check permission requirement
  if (requirePermission && !hasPermission(requirePermission)) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        minHeight: '100vh',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '2rem', marginBottom: '1rem', color: '#1a202c' }}>
          Access Denied
        </h1>
        <p style={{ color: '#718096', marginBottom: '2rem' }}>
          You don't have the required permissions to access this page.
        </p>
        <p style={{ color: '#a0aec0', fontSize: '0.9rem' }}>
          Required permission: <strong>{requirePermission}</strong>
        </p>
      </div>
    )
  }

  // All checks passed, render children
  return <>{children}</>
}

export default ProtectedRoute
