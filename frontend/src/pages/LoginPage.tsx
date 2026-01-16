/**
 * Login Page
 * 
 * Simple wrapper page for the LoginForm component.
 */

import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { LoginForm } from '../components/auth'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()
  const location = useLocation()

  const handleSuccess = () => {
    // Redirect to the page they were trying to access, or home
    const from = (location.state as any)?.from?.pathname || '/'
    navigate(from, { replace: true })
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      <LoginForm onSuccess={handleSuccess} />
    </div>
  )
}

export default LoginPage
