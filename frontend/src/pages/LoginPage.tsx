/**
 * Login Page
 * 
 * Simple wrapper page for the LoginForm component.
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/auth'

export const LoginPage: React.FC = () => {
  const navigate = useNavigate()

  const handleSuccess = () => {
    // Redirect to home page after successful login
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <LoginForm onSuccess={handleSuccess} />
    </div>
  )
}

export default LoginPage
