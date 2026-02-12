/**
 * Login Form Component
 *
 * Modern centered login with technology pillar icons background.
 */

import React, { useState, FormEvent } from 'react'
import type { LucideIcon } from 'lucide-react'
import {
  Cpu,
  Puzzle,
  GitBranch,
  Plug,
  Activity,
  Shield,
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { ThemeToggle } from '../ThemeToggle'
import './LoginForm.css'

const PILLAR_ICONS: Array<{
  Icon: LucideIcon
  size: number
  opacity: number
  color: string
  style: React.CSSProperties
}> = [
  { Icon: Cpu, size: 80, opacity: 0.2, color: '#3b82f6', style: { top: '8%', left: '5%' } },
  { Icon: Puzzle, size: 88, opacity: 0.18, color: '#8b5cf6', style: { top: '15%', right: '10%', left: 'auto' } },
  { Icon: GitBranch, size: 72, opacity: 0.17, color: '#10b981', style: { bottom: '25%', left: '8%', top: 'auto' } },
  { Icon: Plug, size: 84, opacity: 0.2, color: '#f59e0b', style: { top: '40%', right: '6%', left: 'auto' } },
  { Icon: Activity, size: 76, opacity: 0.18, color: '#ec4899', style: { bottom: '15%', right: '15%', left: 'auto', top: 'auto' } },
  { Icon: Shield, size: 88, opacity: 0.19, color: '#6366f1', style: { top: '25%', left: '15%' } },
  { Icon: Cpu, size: 64, opacity: 0.15, color: '#06b6d4', style: { bottom: '8%', right: '25%', left: 'auto', top: 'auto' } },
  { Icon: Plug, size: 68, opacity: 0.16, color: '#f97316', style: { top: '60%', left: '12%' } },
  { Icon: Activity, size: 72, opacity: 0.17, color: '#d946ef', style: { bottom: '35%', right: '8%', left: 'auto', top: 'auto' } },
  { Icon: Shield, size: 60, opacity: 0.15, color: '#4f46e5', style: { top: '75%', left: '20%' } },
]

interface LoginFormProps {
  onSuccess?: () => void
  theme?: 'light' | 'dark'
  onThemeChange?: (theme: 'light' | 'dark') => void
}

export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  theme = 'dark',
  onThemeChange,
}) => {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validateTemenosEmail = (email: string): boolean => {
    // Accept any Temenos mailbox, e.g. scomsa@temenos.com or firstname.lastname@temenos.com
    return /^[^\s@]+@temenos\.[a-zA-Z]{2,}$/.test(email)
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
      // Avoid leaking validation rules
      setError('Invalid credentials')
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
    <div
      className={`login-form-container login-form-container--${theme}`}
      data-theme={theme}
    >
      {onThemeChange && (
        <div className="login-form-theme-toggle">
          <ThemeToggle theme={theme} onThemeChange={onThemeChange} />
        </div>
      )}
      {/* Technology pillar icons as decorative background */}
      <div className="login-form-bg-icons" aria-hidden="true">
        {PILLAR_ICONS.map(({ Icon, size, opacity, color, style }, i) => (
          <div
            key={i}
            className="login-form-bg-icon"
            style={{
              width: size,
              height: size,
              opacity,
              color,
              ...style,
            }}
          >
            <Icon size={size} strokeWidth={1.2} />
          </div>
        ))}
      </div>
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
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder=""
            disabled={isLoading}
            autoComplete="off"
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
