/**
 * User Profile Header Component
 * 
 * Displays user profile with avatar, role badge, and dropdown menu.
 */

import React, { useState, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import './UserProfileHeader.css'

export const UserProfileHeader: React.FC = () => {
  const { user, isAuthenticated, logout } = useAuth()
  const navigate = useNavigate()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  if (!isAuthenticated || !user) {
    return (
      <button
        className="user-profile-login-btn"
        onClick={() => navigate('/login')}
      >
        Log In
      </button>
    )
  }

  const getInitials = (): string => {
    if (user.profile?.first_name && user.profile?.last_name) {
      return `${user.profile.first_name[0]}${user.profile.last_name[0]}`.toUpperCase()
    }
    if (user.username) {
      return user.username.substring(0, 2).toUpperCase()
    }
    return user.email.substring(0, 2).toUpperCase()
  }

  const getRoleBadgeColor = (): string => {
    switch (user.role) {
      case 'admin':
        return '#e53e3e'
      case 'viewer':
        return '#3182ce'
      default:
        return '#718096'
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/')
    setIsOpen(false)
  }

  return (
    <div className="user-profile-container" ref={dropdownRef}>
      <button
        className="user-profile-trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <div className="user-profile-avatar">
          {user.profile?.avatar_url ? (
            <img src={user.profile.avatar_url} alt={user.username} />
          ) : (
            <span>{getInitials()}</span>
          )}
        </div>
        <div className="user-profile-info">
          <span className="user-profile-name">{user.username}</span>
          <span 
            className="user-profile-role"
            style={{ backgroundColor: getRoleBadgeColor() }}
          >
            {user.role}
          </span>
        </div>
        <svg
          className={`user-profile-chevron ${isOpen ? 'open' : ''}`}
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M5 7.5L10 12.5L15 7.5"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="user-profile-dropdown">
          <div className="user-profile-dropdown-header">
            <div className="user-profile-dropdown-avatar">
              {user.profile?.avatar_url ? (
                <img src={user.profile.avatar_url} alt={user.username} />
              ) : (
                <span>{getInitials()}</span>
              )}
            </div>
            <div className="user-profile-dropdown-info">
              <div className="user-profile-dropdown-name">{user.username}</div>
              <div className="user-profile-dropdown-email">{user.email}</div>
            </div>
          </div>

          <div className="user-profile-dropdown-divider" />

          <div className="user-profile-dropdown-menu">
            {user.role === 'admin' && (
              <button
                className="user-profile-dropdown-item"
                onClick={() => {
                  navigate('/admin/users')
                  setIsOpen(false)
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path
                    d="M8 8C10.2091 8 12 6.20914 12 4C12 1.79086 10.2091 0 8 0C5.79086 0 4 1.79086 4 4C4 6.20914 5.79086 8 8 8Z"
                    fill="currentColor"
                  />
                  <path
                    d="M0 14C0 11.2386 2.23858 9 5 9H11C13.7614 9 16 11.2386 16 14V16H0V14Z"
                    fill="currentColor"
                  />
                </svg>
                User Management
              </button>
            )}
            <button
              className="user-profile-dropdown-item"
              onClick={handleLogout}
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M6 14H3C2.44772 14 2 13.5523 2 13V3C2 2.44772 2.44772 2 3 2H6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
                <path
                  d="M10 11L14 7L10 3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M14 7H6"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default UserProfileHeader
