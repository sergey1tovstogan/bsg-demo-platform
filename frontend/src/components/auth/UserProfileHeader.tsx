/**
 * User Profile Header Component
 *
 * Displays current user info and logout button in the header/navbar
 */

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './UserProfileHeader.css';

export const UserProfileHeader: React.FC = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  if (!isAuthenticated || !user) {
    return (
      <div className="user-profile-header">
        <a href="/login" className="btn-login">
          Login
        </a>
      </div>
    );
  }

  const handleLogout = async () => {
    try {
      await logout();
      window.location.href = '/login';
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const getRoleBadgeClass = (role: string) => {
    switch (role) {
      case 'admin':
        return 'role-badge-admin';
      case 'viewer':
        return 'role-badge-viewer';
      default:
        return 'role-badge-guest';
    }
  };

  const getInitials = (username: string) => {
    return username
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="user-profile-header">
      <div className="user-profile-wrapper">
        <button
          className="user-profile-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          <div className="user-avatar">
            {user.profile?.avatar_url ? (
              <img src={user.profile.avatar_url} alt={user.username} />
            ) : (
              <span className="user-initials">{getInitials(user.username)}</span>
            )}
          </div>
          <div className="user-info">
            <span className="user-name">{user.username}</span>
            <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
              {user.role}
            </span>
          </div>
          <svg
            className={`chevron-icon ${isMenuOpen ? 'chevron-open' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>

        {isMenuOpen && (
          <>
            <div
              className="menu-overlay"
              onClick={() => setIsMenuOpen(false)}
            />
            <div className="user-menu">
              <div className="menu-header">
                <p className="menu-email">{user.email}</p>
                <p className="menu-role">Role: <strong>{user.role}</strong></p>
              </div>

              <div className="menu-divider" />

              <button
                className="menu-item menu-logout"
                onClick={handleLogout}
              >
                <svg
                  className="menu-icon"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                  />
                </svg>
                <span>Logout</span>
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default UserProfileHeader;
