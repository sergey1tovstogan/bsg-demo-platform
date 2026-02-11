/**
 * Authentication Context
 * 
 * Provides global authentication state management for the application.
 * Handles login, logout, token storage, and auto-refresh.
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import axios, { AxiosInstance } from 'axios'

// Types
export type UserRole = 'guest' | 'viewer' | 'admin'

export interface User {
  user_id: string
  email: string
  username: string
  role: UserRole
  profile?: {
    first_name?: string
    last_name?: string
    avatar_url?: string
    timezone?: string
  }
  is_active?: boolean
  last_login_at?: string
}

interface LoginCredentials {
  email: string
  password: string
  remember_me?: boolean
}


interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
  hasRole: (role: UserRole) => boolean
  hasPermission: (permission: string) => boolean
  authenticatedFetch: <T = any>(url: string, options?: RequestInit) => Promise<T>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// API base URL (when on Azure SWA use direct backend URL so POST works; SWA does not proxy POST to external)
const getApiBaseUrl = (): string => {
  if (typeof window !== 'undefined' && (window as any).API_BASE_URL) {
    return (window as any).API_BASE_URL
  }
  const viteEnv = (import.meta as any).env
  if (viteEnv && viteEnv.VITE_API_URL) {
    return viteEnv.VITE_API_URL as string
  }
  const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
  if (hostname.includes('azurestaticapps.net') || hostname.includes('demo-platform.bsg.temenos.com')) {
    return 'https://bsg-demo-backend.jollydune-6bb98d42.eastus.azurecontainerapps.io/api/v1'
  }
  return '/api/v1'
}

// Create axios instance
const createAuthClient = (): AxiosInstance => {
  const baseURL = getApiBaseUrl()
  return axios.create({
    baseURL,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

const authClient = createAuthClient()

// Storage keys
const ACCESS_TOKEN_KEY = 'auth_access_token'
const REFRESH_TOKEN_KEY = 'auth_refresh_token'
const USER_KEY = 'auth_user'

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Clear auth state (defined first so login/logout can use it)
  const clearAuth = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setUser(null)
  }, [])

  // Load user from localStorage on mount and when auth changes in another tab
  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem(USER_KEY)
        const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
        
        if (storedUser && accessToken) {
          const parsedUser = JSON.parse(storedUser)
          setUser(parsedUser)
          
          // Set up auto-refresh
          setupAutoRefresh()
        } else {
          setUser(null)
        }
      } catch (error) {
        console.error('Error loading user from storage:', error)
        clearAuth()
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()

    // Sync auth when localStorage changes (e.g. login/logout in another tab)
    const handleStorage = (e: StorageEvent) => {
      if (e.key === USER_KEY || e.key === ACCESS_TOKEN_KEY) {
        loadUser()
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  // Setup auto-refresh (every 14 minutes) - skip for mock tokens (no backend refresh)
  const setupAutoRefresh = useCallback(() => {
    const refreshVal = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (refreshVal?.startsWith('mock_')) {
      // Mock auth: tokens never expire, no need to call backend refresh
      return () => {}
    }
    const interval = setInterval(() => {
      refreshToken().catch((error) => {
        console.error('Auto-refresh failed:', error)
        logout()
      })
    }, 14 * 60 * 1000) // 14 minutes
    return () => clearInterval(interval)
  // eslint-disable-next-line react-hooks/exhaustive-deps -- refreshToken, logout defined later
  }, [])

  // Login function with mocked authentication
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      // Clear previous user so the UI never shows a stale "Welcome previous_user" after new login
      clearAuth()

      // Mocked authentication: accept any Temenos mailbox (no examples in errors)
      const temenosEmailPattern = /^[^\s@]+@temenos\.[a-zA-Z]{2,}$/i
      const emailFromPassword = temenosEmailPattern.test(credentials.password)
      const emailFromUsername = temenosEmailPattern.test(credentials.email?.trim() || '')
      if (!emailFromPassword && !emailFromUsername) {
        throw new Error('Invalid credentials')
      }
      // Use Temenos email from Password field (primary); fallback to Username field
      const userEmail = emailFromPassword ? credentials.password : (credentials.email?.trim() || '')
      const localPart = userEmail.split('@')[0] || ''
      const displayName = (localPart.split('.')[0] || localPart).trim()

      // Create mock user data
      const mockUser: User = {
        user_id: `usr_${displayName.toLowerCase()}_001`,
        email: userEmail,
        username: displayName,
        role: 'viewer', // Default role
        profile: {
          first_name: displayName,
        },
        is_active: true,
      }

      // Create mock tokens
      const mockAccessToken = `mock_access_token_${Date.now()}`
      const mockRefreshToken = `mock_refresh_token_${Date.now()}`

      // Store tokens and user
      localStorage.setItem(ACCESS_TOKEN_KEY, mockAccessToken)
      localStorage.setItem(REFRESH_TOKEN_KEY, mockRefreshToken)
      localStorage.setItem(USER_KEY, JSON.stringify(mockUser))

      setUser(mockUser)
      setupAutoRefresh()
    } catch (error: any) {
      // Never surface detailed validation errors here
      throw new Error('Login failed')
    }
  }, [clearAuth, setupAutoRefresh])

  // Logout function
  const logout = useCallback(() => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    
    // Call logout endpoint (fire and forget)
    if (accessToken) {
      authClient.post('/auth/logout', {}, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }).catch(() => {
        // Ignore errors on logout
      })
    }

    clearAuth()
  }, [clearAuth])

  // Refresh token function
  const refreshToken = useCallback(async () => {
    const refreshTokenValue = localStorage.getItem(REFRESH_TOKEN_KEY)
    if (!refreshTokenValue) {
      throw new Error('No refresh token available')
    }
    // Mock tokens: no backend call needed, stay logged in
    if (refreshTokenValue.startsWith('mock_')) {
      return
    }
    try {
      const response = await authClient.post<{ access_token: string }>('/auth/refresh', {
        refresh_token: refreshTokenValue,
      })
      const { access_token } = response.data
      localStorage.setItem(ACCESS_TOKEN_KEY, access_token)
    } catch (error: any) {
      clearAuth()
      throw error
    }
  }, [])

  // Check if user has role
  const hasRole = useCallback((role: UserRole): boolean => {
    if (!user) return false
    
    // Role hierarchy: admin > viewer > guest
    const roleHierarchy: Record<UserRole, number> = {
      guest: 0,
      viewer: 1,
      admin: 2,
    }

    return roleHierarchy[user.role] >= roleHierarchy[role]
  }, [user])

  // Check if user has permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!user) return false

    // Admin has all permissions
    if (user.role === 'admin') return true

    // Define permissions by role
    const rolePermissions: Record<UserRole, string[]> = {
      guest: [],
      viewer: ['view:cards', 'configure:demos'],
      admin: ['*'], // All permissions
    }

    const userPermissions = rolePermissions[user.role] || []
    return userPermissions.includes(permission) || userPermissions.includes('*')
  }, [user])

  // Authenticated fetch helper
  const authenticatedFetch = useCallback(async <T = any>(url: string, options: RequestInit = {}): Promise<T> => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY)
    
    if (!accessToken) {
      throw new Error('Not authenticated')
    }

    const headers = new Headers(options.headers)
    headers.set('Authorization', `Bearer ${accessToken}`)
    if (!headers.has('Content-Type') && options.body) {
      headers.set('Content-Type', 'application/json')
    }

    try {
      const response = await fetch(`${getApiBaseUrl()}${url}`, {
        ...options,
        headers,
      })

      if (response.status === 401) {
        // Token expired, try to refresh
        await refreshToken()
        
        // Retry with new token
        const newToken = localStorage.getItem(ACCESS_TOKEN_KEY)
        const retryHeaders = new Headers(options.headers)
        retryHeaders.set('Authorization', `Bearer ${newToken}`)
        if (!retryHeaders.has('Content-Type') && options.body) {
          retryHeaders.set('Content-Type', 'application/json')
        }

        const retryResponse = await fetch(`${getApiBaseUrl()}${url}`, {
          ...options,
          headers: retryHeaders,
        })

        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}))
          throw new Error(errorData.detail || errorData.message || `Request failed: ${retryResponse.statusText}`)
        }

        return await retryResponse.json()
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || `Request failed: ${response.statusText}`)
      }

      return await response.json()
    } catch (error) {
      console.error('Authenticated fetch error:', error)
      throw error
    }
  }, [refreshToken])

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    refreshToken,
    hasRole,
    hasPermission,
    authenticatedFetch,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Hook to use auth context
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
