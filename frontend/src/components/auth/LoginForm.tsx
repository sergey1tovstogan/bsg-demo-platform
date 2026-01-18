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
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSuccess }) => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateTemenosEmail = (email: string): boolean => {
    return /^[^\s@]+\.[^\s@]+@temenos\.com$/.test(email)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    // Validation - username can be anything (mocked, no validation)
    // Password must be a valid @temenos.com email
    if (!password) {
      setError('Password is required')
      return
    }

    if (!validateTemenosEmail(password)) {
      setError('Password must be a valid Temenos email address (e.g., firstname.lastname@temenos.com)')
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
          <label htmlFor="username">Username</label>
          <input
            id="username"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder=""
            disabled={isLoading}
            autoComplete="username"
            required
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
          />
        </div>

        <div className="login-form-group">
          <label htmlFor="password">Password (Temenos Email)</label>
          <input
            id="password"
            type="text"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=""
            disabled={isLoading}
            autoComplete="email"
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
            Need help? Contact apostolos.georgas@temenos.com
          </p>
        </div>
      </form>
    </div>
  )
}

export default LoginForm
