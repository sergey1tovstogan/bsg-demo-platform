/**
 * ProtectedRoute Component
 *
 * Wrapper component for routes that require authentication and/or specific roles.
 * Redirects unauthenticated users to login page.
 * Shows access denied for authenticated users without required permissions.
 */

import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'guest' | 'viewer' | 'admin';
  requiredPermission?: string;
}

/**
 * ProtectedRoute Component
 *
 * @param children - The component to render if authorized
 * @param requiredRole - Minimum role required (optional)
 * @param requiredPermission - Specific permission required (optional)
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  requiredRole,
  requiredPermission,
}) => {
  const { isAuthenticated, user, isLoading, hasRole, hasPermission } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="protected-route-loading">
        <div className="loading-spinner">
          <svg className="spinner" viewBox="0 0 24 24">
            <circle
              className="spinner-circle"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
              fill="none"
              strokeDasharray="62.83"
              strokeDashoffset="47.12"
            />
          </svg>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Check role requirement
  if (requiredRole && !hasRole(requiredRole)) {
    return <AccessDenied requiredRole={requiredRole} userRole={user?.role} />;
  }

  // Check permission requirement
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <AccessDenied requiredPermission={requiredPermission} />;
  }

  // User is authenticated and authorized
  return <>{children}</>;
};

/**
 * AccessDenied Component
 *
 * Shown when user is authenticated but lacks required permissions
 */
interface AccessDeniedProps {
  requiredRole?: string;
  requiredPermission?: string;
  userRole?: string;
}

const AccessDenied: React.FC<AccessDeniedProps> = ({
  requiredRole,
  requiredPermission,
  userRole,
}) => {
  return (
    <div className="access-denied-container">
      <div className="access-denied-card">
        <svg
          className="access-denied-icon"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
          />
        </svg>

        <h2>Access Denied</h2>

        <p className="access-denied-message">
          {requiredRole && (
            <>
              This page requires <strong>{requiredRole}</strong> role access.
              {userRole && (
                <>
                  {' '}
                  Your current role is <strong>{userRole}</strong>.
                </>
              )}
            </>
          )}
          {requiredPermission && (
            <>
              You don't have the required permission:{' '}
              <strong>{requiredPermission}</strong>
            </>
          )}
        </p>

        <p className="access-denied-help">
          If you believe this is an error, please contact your administrator.
        </p>

        <a href="/" className="btn-back-home">
          Back to Home
        </a>
      </div>

      <style>{`
        .protected-route-loading {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f9fafb;
        }

        .loading-spinner {
          text-align: center;
          color: #003366;
        }

        .loading-spinner .spinner {
          width: 3rem;
          height: 3rem;
          margin-bottom: 1rem;
          animation: spin 1s linear infinite;
        }

        .loading-spinner p {
          font-size: 1rem;
          color: #6b7280;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .access-denied-container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #f9fafb;
          padding: 1rem;
        }

        .access-denied-card {
          background: white;
          border-radius: 1rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          padding: 3rem 2rem;
          max-width: 500px;
          text-align: center;
        }

        .access-denied-icon {
          width: 4rem;
          height: 4rem;
          color: #ef4444;
          margin: 0 auto 1.5rem;
        }

        .access-denied-card h2 {
          font-size: 1.75rem;
          font-weight: 700;
          color: #111827;
          margin: 0 0 1rem 0;
        }

        .access-denied-message {
          font-size: 1rem;
          color: #374151;
          line-height: 1.6;
          margin: 0 0 1rem 0;
        }

        .access-denied-message strong {
          color: #003366;
          font-weight: 600;
        }

        .access-denied-help {
          font-size: 0.9rem;
          color: #6b7280;
          margin: 0 0 2rem 0;
        }

        .btn-back-home {
          display: inline-block;
          padding: 0.75rem 1.5rem;
          background: linear-gradient(135deg, #003366 0%, #00A3E0 100%);
          color: white;
          text-decoration: none;
          border-radius: 0.5rem;
          font-weight: 600;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }

        .btn-back-home:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 20px rgba(0, 163, 224, 0.3);
        }
      `}</style>
    </div>
  );
};

export default ProtectedRoute;
