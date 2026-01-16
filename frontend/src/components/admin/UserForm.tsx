/**
 * User Form Component
 * 
 * Create/edit user form with validation and password strength indicator.
 */

import React, { useState, useEffect } from 'react'
import './UserForm.css'

export interface User {
  user_id: string
  email: string
  username: string
  role: 'admin' | 'viewer' | 'guest'
  is_active: boolean
}

interface UserFormProps {
  user?: User | null
  onSave: (userData: Partial<User> & { password?: string }) => Promise<void>
  onCancel: () => void
}

type PasswordStrength = 'weak' | 'medium' | 'strong'

export const UserForm: React.FC<UserFormProps> = ({ user, onSave, onCancel }) => {
  const isEditMode = !!user

  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'admin' | 'viewer' | 'guest'>('viewer')
  const [isActive, setIsActive] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    if (user) {
      setEmail(user.email)
      setUsername(user.username)
      setRole(user.role)
      setIsActive(user.is_active)
    }
  }, [user])

  const validateEmail = (email: string): boolean => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  }

  const calculatePasswordStrength = (password: string): PasswordStrength => {
    if (password.length < 8) return 'weak'
    
    const hasUpper = /[A-Z]/.test(password)
    const hasLower = /[a-z]/.test(password)
    const hasNumber = /[0-9]/.test(password)
    const hasSpecial = /[^A-Za-z0-9]/.test(password)

    const strength = [hasUpper, hasLower, hasNumber, hasSpecial].filter(Boolean).length

    if (strength >= 3 && password.length >= 10) return 'strong'
    if (strength >= 2) return 'medium'
    return 'weak'
  }

  const getPasswordRequirements = () => {
    const requirements = {
      length: password.length >= 8,
      uppercase: /[A-Z]/.test(password),
      lowercase: /[a-z]/.test(password),
      number: /[0-9]/.test(password),
    }
    return requirements
  }

  const passwordStrength = calculatePasswordStrength(password)
  const passwordRequirements = getPasswordRequirements()

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email address'
    }

    if (!username.trim()) {
      newErrors.username = 'Username is required'
    } else if (username.length < 2) {
      newErrors.username = 'Username must be at least 2 characters'
    }

    if (!isEditMode && !password) {
      newErrors.password = 'Password is required for new users'
    } else if (password && password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validate()) {
      return
    }

    setIsLoading(true)

    try {
      const userData: Partial<User> & { password?: string } = {
        email: email.trim(),
        username: username.trim(),
        role,
        is_active: isActive,
      }

      if (!isEditMode || password) {
        userData.password = password
      }

      await onSave(userData)
    } catch (err: any) {
      setErrors({ submit: err.message || 'Failed to save user' })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="user-form-overlay" onClick={onCancel}>
      <div className="user-form-container" onClick={(e) => e.stopPropagation()}>
        <div className="user-form-header">
          <h2>{isEditMode ? 'Edit User' : 'Create User'}</h2>
          <button className="user-form-close" onClick={onCancel}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          {errors.submit && (
            <div className="user-form-error">{errors.submit}</div>
          )}

          <div className="user-form-group">
            <label htmlFor="email">Email Address *</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isEditMode || isLoading}
              required
            />
            {errors.email && <span className="user-form-field-error">{errors.email}</span>}
          </div>

          <div className="user-form-group">
            <label htmlFor="username">Username *</label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isLoading}
              required
            />
            {errors.username && <span className="user-form-field-error">{errors.username}</span>}
          </div>

          <div className="user-form-group">
            <label htmlFor="password">
              Password {!isEditMode && '*'}
              {isEditMode && <span className="user-form-optional">(leave blank to keep current)</span>}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              required={!isEditMode}
            />
            {errors.password && <span className="user-form-field-error">{errors.password}</span>}

            {password && (
              <div className="user-form-password-strength">
                <div className="user-form-password-strength-bar">
                  <div
                    className={`user-form-password-strength-fill ${passwordStrength}`}
                    style={{
                      width: passwordStrength === 'weak' ? '33%' : passwordStrength === 'medium' ? '66%' : '100%',
                    }}
                  />
                </div>
                <div className="user-form-password-requirements">
                  <div className={passwordRequirements.length ? 'met' : ''}>
                    {passwordRequirements.length ? '✓' : '○'} At least 8 characters
                  </div>
                  <div className={passwordRequirements.uppercase ? 'met' : ''}>
                    {passwordRequirements.uppercase ? '✓' : '○'} One uppercase letter
                  </div>
                  <div className={passwordRequirements.lowercase ? 'met' : ''}>
                    {passwordRequirements.lowercase ? '✓' : '○'} One lowercase letter
                  </div>
                  <div className={passwordRequirements.number ? 'met' : ''}>
                    {passwordRequirements.number ? '✓' : '○'} One number
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="user-form-group">
            <label htmlFor="role">Role *</label>
            <select
              id="role"
              value={role}
              onChange={(e) => setRole(e.target.value as 'admin' | 'viewer' | 'guest')}
              disabled={isLoading}
              required
            >
              <option value="guest">Guest - Read-only access</option>
              <option value="viewer">Viewer - Can configure demos</option>
              <option value="admin">Admin - Full access</option>
            </select>
          </div>

          <div className="user-form-group">
            <label className="user-form-checkbox">
              <input
                type="checkbox"
                checked={isActive}
                onChange={(e) => setIsActive(e.target.checked)}
                disabled={isLoading}
              />
              <span>Active (user can log in)</span>
            </label>
          </div>

          <div className="user-form-actions">
            <button
              type="button"
              className="user-form-cancel"
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="user-form-submit"
              disabled={isLoading}
            >
              {isLoading ? 'Saving...' : isEditMode ? 'Update User' : 'Create User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default UserForm
