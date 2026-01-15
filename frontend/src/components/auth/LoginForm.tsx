/**
 * LoginForm Component
 *
 * Provides a user-friendly login form with validation and error handling.
 */

import React, { useState, FormEvent } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import './LoginForm.css';

interface LocationState {
  from?: {
    pathname: string;
  };
}

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, error: authError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Get the page the user was trying to access
  const from = (location.state as LocationState)?.from?.pathname || '/';

  /**
   * Validate email format
   */
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      setEmailError('Email is required');
      return false;
    }
    if (!emailRegex.test(email)) {
      setEmailError('Please enter a valid email address');
      return false;
    }
    setEmailError('');
    return true;
  };

  /**
   * Validate password
   */
  const validatePassword = (password: string): boolean => {
    if (!password) {
      setPasswordError('Password is required');
      return false;
    }
    if (password.length < 3) {
      setPasswordError('Password must be at least 3 characters');
      return false;
    }
    setPasswordError('');
    return true;
  };

  /**
   * Handle form submission
   */
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate inputs
    const isEmailValid = validateEmail(email);
    const isPasswordValid = validatePassword(password);

    if (!isEmailValid || !isPasswordValid) {
      return;
    }

    setIsSubmitting(true);

    try {
      await login({ email, password });

      // Redirect to intended page or home
      navigate(from, { replace: true });
    } catch (error) {
      // Error is handled by AuthContext and displayed below
      console.error('Login failed:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * Handle email blur (validation)
   */
  const handleEmailBlur = () => {
    validateEmail(email);
  };

  /**
   * Handle password blur (validation)
   */
  const handlePasswordBlur = () => {
    validatePassword(password);
  };

  return (
    <div className="login-form-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome</h2>
          <p>Sign in to access administration features</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form" noValidate>
          {/* Email Field */}
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className={`form-input ${emailError ? 'input-error' : ''}`}
              placeholder="admin@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onBlur={handleEmailBlur}
              disabled={isSubmitting}
              autoComplete="email"
              required
            />
            {emailError && (
              <span className="error-message">{emailError}</span>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              className={`form-input ${passwordError ? 'input-error' : ''}`}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onBlur={handlePasswordBlur}
              disabled={isSubmitting}
              autoComplete="current-password"
              required
            />
            {passwordError && (
              <span className="error-message">{passwordError}</span>
            )}
          </div>

          {/* Remember Me */}
          <div className="form-group-inline">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                disabled={isSubmitting}
              />
              <span>Remember me</span>
            </label>
          </div>

          {/* Auth Error */}
          {authError && (
            <div className="alert alert-error" role="alert">
              <svg
                className="alert-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{authError}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-submit"
            disabled={isSubmitting || !!emailError || !!passwordError}
          >
            {isSubmitting ? (
              <>
                <svg className="spinner" viewBox="0 0 24 24">
                  <circle
                    className="spinner-circle"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                </svg>
                <span>Signing in...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Helper Text */}
        <div className="login-footer">
          <button
            type="button"
            className="btn-link"
            onClick={() => navigate('/')}
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
