/**
 * UserList Component
 *
 * Displays a table of users with search, filter, sort, and action buttons
 * Admin-only component for user management
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import './UserList.css';

export interface User {
  user_id: string;
  email: string;
  username: string;
  role: 'admin' | 'viewer' | 'guest';
  is_active: boolean;
  created_at: string;
  last_login?: string;
  is_locked?: boolean;
}

interface UserListProps {
  onEdit: (user: User) => void;
  onDelete: (user: User) => void;
  onResetPassword: (user: User) => void;
  refreshTrigger?: number; // Used to trigger refresh from parent
}

export const UserList: React.FC<UserListProps> = ({
  onEdit,
  onDelete,
  onResetPassword,
  refreshTrigger = 0,
}) => {
  const { authenticatedFetch } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter/Search state
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<keyof User>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Fetch users from API
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authenticatedFetch('/api/v1/users');

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.statusText}`);
      }

      const data = await response.json();

      // Handle both array response (current API) and object with users property (potential future)
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers(data.users || []);
      }
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  }, [authenticatedFetch]);

  // Initial load and refresh on trigger
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers, refreshTrigger]);

  // Apply filters, search, and sort
  useEffect(() => {
    let result = [...users];

    // Apply search
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (user) =>
          user.username.toLowerCase().includes(term) ||
          user.email.toLowerCase().includes(term) ||
          user.user_id.toLowerCase().includes(term)
      );
    }

    // Apply role filter
    if (roleFilter !== 'all') {
      result = result.filter((user) => user.role === roleFilter);
    }

    // Apply status filter
    if (statusFilter === 'active') {
      result = result.filter((user) => user.is_active);
    } else if (statusFilter === 'inactive') {
      result = result.filter((user) => !user.is_active);
    } else if (statusFilter === 'locked') {
      result = result.filter((user) => user.is_locked);
    }

    // Apply sort
    result.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];

      if (aValue === undefined || aValue === null) return 1;
      if (bValue === undefined || bValue === null) return -1;

      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
        comparison = aValue === bValue ? 0 : aValue ? 1 : -1;
      } else {
        comparison = aValue > bValue ? 1 : -1;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    setFilteredUsers(result);
  }, [users, searchTerm, roleFilter, statusFilter, sortField, sortDirection]);

  // Handle sort column click
  const handleSort = (field: keyof User) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  // Get role badge class
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

  if (isLoading) {
    return (
      <div className="user-list-loading">
        <div className="spinner"></div>
        <p>Loading users...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="user-list-error">
        <svg className="error-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <h3>Error Loading Users</h3>
        <p>{error}</p>
        <button className="btn-retry" onClick={fetchUsers}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="user-list-container">
      {/* Search and Filter Bar */}
      <div className="user-list-controls">
        <div className="search-box">
          <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          {searchTerm && (
            <button className="clear-search" onClick={() => setSearchTerm('')}>
              ×
            </button>
          )}
        </div>

        <div className="filters">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
            <option value="guest">Guest</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
            <option value="locked">Locked</option>
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="results-summary">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* User Table */}
      <div className="table-wrapper">
        <table className="user-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('username')} className="sortable">
                Username
                {sortField === 'username' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('email')} className="sortable">
                Email
                {sortField === 'email' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('role')} className="sortable">
                Role
                {sortField === 'role' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('is_active')} className="sortable">
                Status
                {sortField === 'is_active' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th onClick={() => handleSort('last_login')} className="sortable">
                Last Login
                {sortField === 'last_login' && (
                  <span className="sort-indicator">{sortDirection === 'asc' ? '↑' : '↓'}</span>
                )}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="no-results">
                  No users found matching your criteria
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>
                    <div className="user-name-cell">
                      {user.username}
                      {user.is_locked && (
                        <span className="locked-badge" title="Account is locked">
                          🔒
                        </span>
                      )}
                    </div>
                  </td>
                  <td>{user.email}</td>
                  <td>
                    <span className={`role-badge ${getRoleBadgeClass(user.role)}`}>
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`status-badge ${user.is_active ? 'status-active' : 'status-inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="date-cell">{formatDate(user.last_login)}</td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-action btn-edit"
                        onClick={() => onEdit(user)}
                        title="Edit user"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                          />
                        </svg>
                      </button>
                      <button
                        className="btn-action btn-reset"
                        onClick={() => onResetPassword(user)}
                        title="Reset password"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z"
                          />
                        </svg>
                      </button>
                      <button
                        className="btn-action btn-delete"
                        onClick={() => onDelete(user)}
                        title="Delete user"
                      >
                        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                          />
                        </svg>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UserList;
