/**
 * User Management Page
 *
 * Admin-only page for managing users (CRUD operations)
 * Integrates UserList and UserForm components
 */

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import UserList, { User } from '../components/admin/UserList';
import UserForm, { UserFormData } from '../components/admin/UserForm';
// Removed CSS import as we are using Tailwind classes directly
// import './UserManagement.css';

export const UserManagement: React.FC = () => {
  const { authenticatedFetch, user: currentUser } = useAuth();
  const navigate = useNavigate(); // Add useNavigate hook

  // UI state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Notification state
  const [notification, setNotification] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Show notification
  const showNotification = (type: 'success' | 'error', message: string) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  // Handle create user
  const handleCreateClick = () => {
    setEditingUser(null);
    setIsFormOpen(true);
  };

  // Handle edit user
  const handleEdit = (user: User) => {
    setEditingUser(user);
    setIsFormOpen(true);
  };

  // Handle delete user
  const handleDelete = async (user: User) => {
    // Prevent self-deletion
    if (user.user_id === currentUser?.user_id) {
      showNotification('error', 'You cannot delete your own account');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete user "${user.username}"?\n\nThis action cannot be undone.`
    );

    if (!confirmed) return;

    try {
      const response = await authenticatedFetch(`/api/v1/users/${user.user_id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to delete user' }));
        throw new Error(error.detail || 'Failed to delete user');
      }

      showNotification('success', `User "${user.username}" deleted successfully`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Delete error:', error);
      showNotification(
        'error',
        error instanceof Error ? error.message : 'Failed to delete user'
      );
    }
  };

  // Handle reset password
  const handleResetPassword = async (user: User) => {
    const confirmed = window.confirm(
      `Reset password for "${user.username}"?\n\nA temporary password will be generated and displayed.`
    );

    if (!confirmed) return;

    try {
      const response = await authenticatedFetch(
        `/api/v1/users/${user.user_id}/reset-password`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ detail: 'Failed to reset password' }));
        throw new Error(error.detail || 'Failed to reset password');
      }

      const data = await response.json();

      // Show temporary password in a prompt
      alert(
        `Password reset successful!\n\nTemporary password for ${user.username}:\n\n${data.temporary_password}\n\nPlease save this password and share it securely with the user.\nThey will be required to change it on next login.`
      );

      showNotification('success', `Password reset for "${user.username}"`);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Reset password error:', error);
      showNotification(
        'error',
        error instanceof Error ? error.message : 'Failed to reset password'
      );
    }
  };

  // Handle form save (create or update)
  const handleSave = async (formData: UserFormData) => {
    setIsSubmitting(true);

    try {
      if (editingUser) {
        // Update existing user
        const updateData: any = {
          username: formData.username,
          role: formData.role,
          is_active: formData.is_active,
        };

        // Only include password if it was changed
        if (formData.password) {
          updateData.password = formData.password;
        }

        const response = await authenticatedFetch(`/api/v1/users/${editingUser.user_id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ detail: 'Failed to update user' }));
          throw new Error(error.detail || 'Failed to update user');
        }

        showNotification('success', `User "${formData.username}" updated successfully`);
      } else {
        // Create new user
        const response = await authenticatedFetch('/api/v1/users', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });

        if (!response.ok) {
          const error = await response.json().catch(() => ({ detail: 'Failed to create user' }));
          throw new Error(error.detail || 'Failed to create user');
        }

        showNotification('success', `User "${formData.username}" created successfully`);
      }

      // Close form and refresh list
      setIsFormOpen(false);
      setEditingUser(null);
      setRefreshTrigger((prev) => prev + 1);
    } catch (error) {
      console.error('Save error:', error);
      showNotification(
        'error',
        error instanceof Error ? error.message : 'Failed to save user'
      );
      throw error; // Re-throw so form can handle it
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form cancel
  const handleCancel = () => {
    setIsFormOpen(false);
    setEditingUser(null);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Navigation Bar */}
        <div className="mb-6 flex justify-between items-center">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-slate-600 dark:text-slate-300 hover:text-[#003366] dark:hover:text-[#00A3E0] transition-colors font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Home
          </button>
        </div>

        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-50 mb-2">
              User Management
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-300">
              Create, edit, and manage user accounts and system permissions
            </p>
          </div>
          <button
            onClick={handleCreateClick}
            className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-semibold rounded-lg text-white bg-[#003366] hover:bg-[#004080] shadow-md hover:shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003366]"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create User
          </button>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`fixed top-4 right-4 max-w-sm w-full shadow-lg rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden animate-fade-in ${notification.type === 'success' ? 'bg-green-50' : 'bg-red-50'
            }`}>
            <div className="p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  {notification.type === 'success' ? (
                    <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ) : (
                    <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  )}
                </div>
                <div className="ml-3 w-0 flex-1 pt-0.5">
                  <p className={`text-sm font-medium ${notification.type === 'success' ? 'text-green-800' : 'text-red-800'
                    }`}>
                    {notification.message}
                  </p>
                </div>
                <div className="ml-4 flex-shrink-0 flex">
                  <button
                    className={`bg-transparent rounded-md inline-flex text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 ${notification.type === 'success' ? 'focus:ring-green-500' : 'focus:ring-red-500'
                      }`}
                    onClick={() => setNotification(null)}
                  >
                    <span className="sr-only">Close</span>
                    <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* User List */}
        <div className="bg-white dark:bg-slate-800 shadow-sm rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
          <UserList
            onEdit={handleEdit}
            onDelete={handleDelete}
            onResetPassword={handleResetPassword}
            refreshTrigger={refreshTrigger}
          />
        </div>

        {/* User Form Modal */}
        {isFormOpen && (
          <UserForm
            user={editingUser}
            onSave={handleSave}
            onCancel={handleCancel}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
};
export default UserManagement;
