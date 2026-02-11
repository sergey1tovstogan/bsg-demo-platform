/**
 * Login Page
 *
 * Simple wrapper page for the LoginForm component.
 */

import React from 'react'
import { useNavigate } from 'react-router-dom'
import { LoginForm } from '../components/auth'

interface LoginPageProps {
  theme?: 'light' | 'dark'
  onThemeChange?: (theme: 'light' | 'dark') => void
}

export const LoginPage: React.FC<LoginPageProps> = ({
  theme = 'dark',
  onThemeChange,
}) => {
  const navigate = useNavigate()

  const handleSuccess = () => {
    navigate('/', { replace: true })
  }

  return (
    <div className="min-h-screen w-full flex flex-col">
      <LoginForm
        onSuccess={handleSuccess}
        theme={theme}
        onThemeChange={onThemeChange}
      />
    </div>
  )
}

export default LoginPage
