/**
 * Login Form Component
 * 
 * Provides a beautiful login form with validation and error handling.
 */

import React, { useState, FormEvent } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './LoginForm.css'

interface LoginFormProps {
  onSuccess?: () => void
  redirectTo?: string
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess, redirectTo }) => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation
    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!validateEmail(email)) {
      setError('Please enter a valid email address')
      return
    }

    if (!password) {
      setError('Password is required')
      return
    }

    setIsLoading(true)

    try {
      await login({
        email: email.trim(),
        password,
        remember_me: rememberMe,
      })

      if (onSuccess) {
        onSuccess()
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check your credentials.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-form-container">
      <form onSubmit={handleSubmit} className="login-form">
        <div className="login-form-header">
          <h1>Welcome Back</h1>
          <p>Sign in to your account to continue</p>
        </div>

        {error && (
          <div className="login-form-error" role="alert">
            {error}
          </div>
        )}

        <div className="login-form-group">
          <label htmlFor="email">Email Address</label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            disabled={isLoading}
            autoComplete="email"
            required
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
          />
        </div>

        <div className="login-form-group">
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            disabled={isLoading}
            autoComplete="current-password"
            required
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
          />
        </div>

        <div className="login-form-options">
          <label className="login-form-checkbox">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              disabled={isLoading}
            />
            <span>Remember me</span>
          </label>
        </div>

        <button
          type="submit"
          className="login-form-submit"
          disabled={isLoading}
          aria-busy={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign In'}
        </button>

        <div className="login-form-footer">
          <p className="login-form-help">
            Need help? Contact your administrator.
          </p>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
