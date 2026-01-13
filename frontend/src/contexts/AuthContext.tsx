/**
 * Authentication Context
 *
 * Provides global authentication state and methods for the application.
 * Manages JWT tokens, user state, login/logout, and permission checking.
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

// API base URL - adjust based on environment
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Types
export interface UserProfile {
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  timezone: string;
}

export interface User {
  user_id: string;
  email: string;
  username: string;
  role: 'guest' | 'viewer' | 'admin';
  profile: UserProfile;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  last_login_at: string | null;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (role: 'guest' | 'viewer' | 'admin') => boolean;
  authenticatedFetch: (url: string, options?: RequestInit) => Promise<Response>;
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Local storage keys
const ACCESS_TOKEN_KEY = 'access_token';
const REFRESH_TOKEN_KEY = 'refresh_token';
const USER_KEY = 'user';

// Permission mappings
const ROLE_PERMISSIONS: Record<string, string[]> = {
  guest: ['view_cards'],
  viewer: ['view_cards', 'configure_demo'],
  admin: ['view_cards', 'configure_demo', 'edit_cards', 'manage_users', 'access_editor']
};

/**
 * AuthProvider Component
 *
 * Wraps the application and provides authentication context.
 */
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Check if user is authenticated
  const isAuthenticated = user !== null;

  /**
   * Initialize auth state from localStorage on mount
   */
  useEffect(() => {
    const initAuth = () => {
      try {
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
        const storedUser = localStorage.getItem(USER_KEY);

        if (accessToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        }
      } catch (error) {
        console.error('Failed to initialize auth state:', error);
        // Clear invalid data
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  /**
   * Auto-refresh token before expiry
   * Access tokens expire in 15 minutes, so refresh after 14 minutes
   */
  useEffect(() => {
    if (!isAuthenticated) return;

    const refreshInterval = setInterval(() => {
      refreshToken().catch(error => {
        console.error('Auto-refresh failed:', error);
        logout();
      });
    }, 14 * 60 * 1000); // 14 minutes

    return () => clearInterval(refreshInterval);
  }, [isAuthenticated]);

  /**
   * Login user
   */
  const login = useCallback(async (credentials: LoginCredentials): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();

      // Store tokens and user data
      localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
      localStorage.setItem(REFRESH_TOKEN_KEY, data.refresh_token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));

      setUser(data.user);
      setError(null);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed';
      setError(errorMessage);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Logout user
   */
  const logout = useCallback(async (): Promise<void> => {
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

      if (accessToken) {
        // Call logout endpoint (don't fail if it errors)
        await fetch(`${API_BASE_URL}/api/v1/auth/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        }).catch(error => {
          console.warn('Logout API call failed:', error);
        });
      }
    } finally {
      // Clear local state regardless of API call result
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      setUser(null);
      setError(null);
      setIsLoading(false);
    }
  }, []);

  /**
   * Refresh access token
   */
  const refreshToken = useCallback(async (): Promise<void> => {
    const refresh_token = localStorage.getItem(REFRESH_TOKEN_KEY);

    if (!refresh_token) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ refresh_token }),
      });

      if (!response.ok) {
        throw new Error('Token refresh failed');
      }

      const data = await response.json();

      // Update access token
      localStorage.setItem(ACCESS_TOKEN_KEY, data.access_token);
    } catch (error) {
      console.error('Token refresh failed:', error);
      // Clear auth state on refresh failure
      await logout();
      throw error;
    }
  }, [logout]);

  /**
   * Check if user has a specific permission
   */
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false;

    const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
    return rolePermissions.includes(permission);
  }, [user]);

  /**
   * Check if user has a specific role (or higher)
   */
  const hasRole = useCallback((role: 'guest' | 'viewer' | 'admin'): boolean => {
    if (!user) return false;

    const roleHierarchy: Record<string, number> = {
      guest: 0,
      viewer: 1,
      admin: 2,
    };

    return roleHierarchy[user.role] >= roleHierarchy[role];
  }, [user]);

  const value: AuthContextType = {
    user,
    isAuthenticated,
    isLoading,
    error,
    login,
    logout,
    refreshToken,
    hasPermission,
    hasRole,
    authenticatedFetch,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * useAuth Hook
 *
 * Custom hook to access authentication context.
 * Must be used within an AuthProvider.
 */
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

/**
 * Get access token from localStorage
 * Useful for API calls outside of React components
 */
export const getAccessToken = (): string | null => {
  return localStorage.getItem(ACCESS_TOKEN_KEY);
};

/**
 * API client helper that automatically adds auth header
 */
export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {}
): Promise<Response> => {
  const accessToken = getAccessToken();

  const headers = {
    ...options.headers,
    ...(accessToken && { 'Authorization': `Bearer ${accessToken}` }),
  };

  return fetch(url, {
    ...options,
    headers,
  });
};
