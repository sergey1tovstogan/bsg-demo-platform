/**
 * UserForm Component
 *
 * Form for creating new users or editing existing users
 * Includes validation and password strength indicator
 */

import React, { useState, useEffect } from 'react';
import { User } from './UserList';
import './UserForm.css';

interface UserFormProps {
  user?: User | null; // If provided, we're in edit mode
  onSave: (userData: UserFormData) => Promise<void>;
  onCancel: () => void;
  isSubmitting?: boolean;
}

export interface UserFormData {
  email: string;
  username: string;
  password?: string;
  role: 'admin' | 'viewer' | 'guest';
  is_active: boolean;
}

export const UserForm: React.FC<UserFormProps> = ({
  user,
  onSave,
  onCancel,
  isSubmitting = false,
}) => {
  const isEditMode = !!user;

  // Form state
  const [formData, setFormData] = useState<UserFormData>({
    email: user?.email || '',
    username: user?.username || '',
    password: '',
    role: user?.role || 'viewer',
    is_active: user?.is_active ?? true,
  });

  // Validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof UserFormData, string>>>({});

  // Password strength
  const [passwordStrength, setPasswordStrength] = useState<{
    score: number;
    label: string;
    color: string;
  }>({ score: 0, label: '', color: '' });

  // Update form when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email,
        username: user.username,
        password: '',
        role: user.role,
        is_active: user.is_active,
      });
      setErrors({});
    }
  }, [user]);

  // Validate email
  const validateEmail = (email: string): string | null => {
    if (!email) {
      return 'Email is required';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return null;
  };

  // Validate username
  const validateUsername = (username: string): string | null => {
    if (!username) {
      return 'Username is required';
    }
    if (username.length < 2) {
      return 'Username must be at least 2 characters';
    }
    return null;
  };

  // Validate password
  const validatePassword = (password: string, isRequired: boolean): string | null => {
    if (isRequired && !password) {
      return 'Password is required';
    }
    if (password && password.length < 8) {
      return 'Password must be at least 8 characters';
    }
    if (password && !/[A-Z]/.test(password)) {
      return 'Password must contain at least one uppercase letter';
    }
    if (password && !/[a-z]/.test(password)) {
      return 'Password must contain at least one lowercase letter';
    }
    if (password && !/[0-9]/.test(password)) {
      return 'Password must contain at least one number';
    }
    return null;
  };

  // Calculate password strength
  const calculatePasswordStrength = (password: string) => {
    if (!password) {
      setPasswordStrength({ score: 0, label: '', color: '' });
      return;
    }

    let score = 0;

    // Length
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;

    // Character types
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^a-zA-Z0-9]/.test(password)) score++;

    // Determine label and color
    let label = '';
    let color = '';

    if (score <= 2) {
      label = 'Weak';
      color = '#dc2626';
    } else if (score <= 4) {
      label = 'Medium';
      color = '#f59e0b';
    } else {
      label = 'Strong';
      color = '#059669';
    }

    setPasswordStrength({ score, label, color });
  };

  // Handle input change
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));

    // Clear error for this field
    setErrors((prev) => ({
      ...prev,
      [name]: undefined,
    }));

    // Update password strength
    if (name === 'password') {
      calculatePasswordStrength(value);
    }
  };

  // Validate form
  const validateForm = (): boolean => {
    const newErrors: Partial<Record<keyof UserFormData, string>> = {};

    const emailError = validateEmail(formData.email);
    if (emailError) newErrors.email = emailError;

    const usernameError = validateUsername(formData.username);
    if (usernameError) newErrors.username = usernameError;

    // Password is required only when creating a new user
    const passwordError = validatePassword(formData.password || '', !isEditMode);
    if (passwordError) newErrors.password = passwordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSave(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className="user-form-overlay">
      <div className="user-form-container">
        <div className="user-form-header">
          <h2>{isEditMode ? 'Edit User' : 'Create New User'}</h2>
          <button className="btn-close" onClick={onCancel} disabled={isSubmitting}>
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="user-form">
          {/* Email */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email <span className="required">*</span>
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className={`form-input ${errors.email ? 'input-error' : ''}`}
              disabled={isEditMode || isSubmitting}
              placeholder="user@example.com"
            />
            {errors.email && <div className="error-message">{errors.email}</div>}
            {isEditMode && (
              <div className="field-hint">Email cannot be changed after creation</div>
            )}
          </div>

          {/* Username */}
          <div className="form-group">
            <label htmlFor="username" className="form-label">
              Username <span className="required">*</span>
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleChange}
              className={`form-input ${errors.username ? 'input-error' : ''}`}
              disabled={isSubmitting}
              placeholder="John Doe"
            />
            {errors.username && <div className="error-message">{errors.username}</div>}
          </div>

          {/* Password */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password {!isEditMode && <span className="required">*</span>}
              {isEditMode && <span className="optional">(leave blank to keep current)</span>}
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className={`form-input ${errors.password ? 'input-error' : ''}`}
              disabled={isSubmitting}
              placeholder={isEditMode ? 'Enter new password' : 'Minimum 8 characters'}
            />
            {errors.password && <div className="error-message">{errors.password}</div>}

            {/* Password Strength Indicator */}
            {formData.password && (
              <div className="password-strength">
                <div className="strength-bar">
                  <div
                    className="strength-fill"
                    style={{
                      width: `${(passwordStrength.score / 6) * 100}%`,
                      backgroundColor: passwordStrength.color,
                    }}
                  />
                </div>
                <div className="strength-label" style={{ color: passwordStrength.color }}>
                  {passwordStrength.label}
                </div>
              </div>
            )}

            <div className="password-requirements">
              <p className="requirements-title">Password must contain:</p>
              <ul className="requirements-list">
                <li className={formData.password && formData.password.length >= 8 ? 'met' : ''}>
                  At least 8 characters
                </li>
                <li className={formData.password && /[A-Z]/.test(formData.password) ? 'met' : ''}>
                  One uppercase letter
                </li>
                <li className={formData.password && /[a-z]/.test(formData.password) ? 'met' : ''}>
                  One lowercase letter
                </li>
                <li className={formData.password && /[0-9]/.test(formData.password) ? 'met' : ''}>
                  One number
                </li>
              </ul>
            </div>
          </div>

          {/* Role */}
          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Role <span className="required">*</span>
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-select"
              disabled={isSubmitting}
            >
              <option value="guest">Guest - View cards only</option>
              <option value="viewer">Viewer - View and configure demo</option>
              <option value="admin">Admin - Full access including user management</option>
            </select>
          </div>

          {/* Active Status */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                name="is_active"
                checked={formData.is_active}
                onChange={handleChange}
                className="form-checkbox"
                disabled={isSubmitting}
              />
              <span>Active (user can login)</span>
            </label>
            {!formData.is_active && (
              <div className="field-hint warning">
                Inactive users will not be able to login
              </div>
            )}
          </div>

          {/* Form Actions */}
          <div className="form-actions">
            <button
              type="button"
              onClick={onCancel}
              className="btn-cancel"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="btn-spinner"></span>
                  {isEditMode ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                <>{isEditMode ? 'Update User' : 'Create User'}</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
