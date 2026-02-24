/**
 * User Management Page
 * 
 * Admin interface for managing users (CRUD operations).
 */

import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { UserList, UserForm, User } from '../components/admin'
import './UserManagement.css'

export const UserManagement: React.FC = () => {
  const { authenticatedFetch, user: currentUser } = useAuth()
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message })
    setTimeout(() => setNotification(null), 5000)
  }

  const handleCreate = () => {
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleDelete = async (user: User) => {
    // Prevent self-deletion
    if (user.user_id === currentUser?.user_id) {
      showNotification('error', 'You cannot delete your own account')
      return
    }

    if (!window.confirm(`Are you sure you want to delete user "${user.username}"? This action cannot be undone.`)) {
      return
    }

    try {
      await authenticatedFetch(`/users/${user.user_id}`, {
        method: 'DELETE',
      })
      showNotification('success', `User "${user.username}" deleted successfully`)
      setRefreshTrigger((prev) => prev + 1)
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to delete user')
    }
  }

  const handleResetPassword = async (user: User) => {
    if (!window.confirm(`Reset password for user "${user.username}"? A temporary password will be generated.`)) {
      return
    }

    try {
      const response = await authenticatedFetch<{ temporary_password: string; message: string }>(
        `/users/${user.user_id}/reset-password`,
        {
          method: 'POST',
        }
      )
      showNotification('success', `Password reset successful. Temporary password: ${response.temporary_password}`)
    } catch (err: any) {
      showNotification('error', err.message || 'Failed to reset password')
    }
  }

  const handleSave = async (userData: Partial<User> & { password?: string }) => {
    try {
      const headers = {
        'Content-Type': 'application/json',
      }

      if (selectedUser) {
        // Update existing user
        await authenticatedFetch(`/users/${selectedUser.user_id}`, {
          method: 'PUT',
          headers,
          body: JSON.stringify(userData),
        })
        showNotification('success', `User "${userData.username}" updated successfully`)
      } else {
        // Create new user
        await authenticatedFetch('/users', {
          method: 'POST',
          headers,
          body: JSON.stringify(userData),
        })
        showNotification('success', `User "${userData.username}" created successfully`)
      }

      setIsFormOpen(false)
      setSelectedUser(null)
      setRefreshTrigger((prev) => prev + 1)
    } catch (err: any) {
      throw new Error(err.message || 'Failed to save user')
    }
  }

  const handleCancel = () => {
    setIsFormOpen(false)
    setSelectedUser(null)
  }

  return (
    <div className="user-management-container">
      <div className="user-management-header">
        <h1>User Management</h1>
        <button className="user-management-create-btn" onClick={handleCreate}>
          Create User
        </button>
      </div>

      {notification && (
        <div className={`user-management-notification ${notification.type}`}>
          {notification.message}
        </div>
      )}

      <UserList
        onEdit={handleEdit}
        onDelete={handleDelete}
        onResetPassword={handleResetPassword}
        refreshTrigger={refreshTrigger}
      />

      {isFormOpen && (
        <UserForm
          user={selectedUser}
          onSave={handleSave}
          onCancel={handleCancel}
        />
      )}
    </div>
  )
}

export default UserManagement
