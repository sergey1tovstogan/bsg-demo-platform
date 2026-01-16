/**
 * User List Component
 * 
 * Displays a searchable, filterable, sortable table of users.
 */

import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import './UserList.css'

export interface User {
  user_id: string
  email: string
  username: string
  role: 'admin' | 'viewer' | 'guest'
  is_active: boolean
  created_at: string
  last_login_at?: string
}

interface UserListProps {
  onEdit: (user: User) => void
  onDelete: (user: User) => void
  onResetPassword: (user: User) => void
  refreshTrigger?: number
}

type SortField = 'username' | 'email' | 'role' | 'status' | 'last_login'
type SortDirection = 'asc' | 'desc'

export const UserList: React.FC<UserListProps> = ({
  onEdit,
  onDelete,
  onResetPassword,
  refreshTrigger,
}) => {
  const { authenticatedFetch } = useAuth()
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  
  // Sorting
  const [sortField, setSortField] = useState<SortField>('username')
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc')

  // Load users
  useEffect(() => {
    loadUsers()
  }, [refreshTrigger])

  // Filter and sort users
  useEffect(() => {
    let filtered = [...users]

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query) ||
          user.user_id.toLowerCase().includes(query)
      )
    }

    // Role filter
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter)
    }

    // Status filter
    if (statusFilter !== 'all') {
      const isActive = statusFilter === 'active'
      filtered = filtered.filter((user) => user.is_active === isActive)
    }

    // Sort
    filtered.sort((a, b) => {
      let aValue: any
      let bValue: any

      if (sortField === 'status') {
        aValue = a.is_active ? 1 : 0
        bValue = b.is_active ? 1 : 0
      } else if (sortField === 'last_login') {
        aValue = a.last_login_at || ''
        bValue = b.last_login_at || ''
      } else if (sortField === 'username') {
        aValue = a.username
        bValue = b.username
      } else if (sortField === 'email') {
        aValue = a.email
        bValue = b.email
      } else if (sortField === 'role') {
        aValue = a.role
        bValue = b.role
      } else {
        aValue = ''
        bValue = ''
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1
      return 0
    })

    setFilteredUsers(filtered)
  }, [users, searchQuery, roleFilter, statusFilter, sortField, sortDirection])

  const loadUsers = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const data = await authenticatedFetch<User[]>('/users')
      // Handle both array response and wrapped response
      const usersList = Array.isArray(data) ? data : (data as any).data || []
      setUsers(usersList)
    } catch (err: any) {
      setError(err.message || 'Failed to load users')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  const formatDate = (dateString?: string): string => {
    if (!dateString) return 'Never'
    try {
      return new Date(dateString).toLocaleDateString()
    } catch {
      return 'Invalid date'
    }
  }

  const getRoleBadgeColor = (role: string): string => {
    switch (role) {
      case 'admin':
        return '#e53e3e'
      case 'viewer':
        return '#3182ce'
      default:
        return '#718096'
    }
  }

  if (isLoading) {
    return (
      <div className="user-list-loading">
        <div>Loading users...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="user-list-error">
        <div>Error: {error}</div>
        <button onClick={loadUsers}>Retry</button>
      </div>
    )
  }

  return (
    <div className="user-list-container">
      {/* Filters */}
      <div className="user-list-filters">
        <div className="user-list-search">
          <input
            type="text"
            placeholder="Search by name, email, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="user-list-filter-group">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="all">All Roles</option>
            <option value="admin">Admin</option>
            <option value="viewer">Viewer</option>
            <option value="guest">Guest</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Results summary */}
      <div className="user-list-summary">
        Showing {filteredUsers.length} of {users.length} users
      </div>

      {/* Table */}
      <div className="user-list-table-container">
        <table className="user-list-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('username')}>
                Username {sortField === 'username' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('email')}>
                Email {sortField === 'email' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('role')}>
                Role {sortField === 'role' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('status')}>
                Status {sortField === 'status' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th onClick={() => handleSort('last_login')}>
                Last Login {sortField === 'last_login' && (sortDirection === 'asc' ? '↑' : '↓')}
              </th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="user-list-empty">
                  No users found
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.user_id}>
                  <td>{user.username}</td>
                  <td>{user.email}</td>
                  <td>
                    <span
                      className="user-list-role-badge"
                      style={{ backgroundColor: getRoleBadgeColor(user.role) }}
                    >
                      {user.role}
                    </span>
                  </td>
                  <td>
                    <span className={`user-list-status ${user.is_active ? 'active' : 'inactive'}`}>
                      {user.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{formatDate(user.last_login_at)}</td>
                  <td>
                    <div className="user-list-actions">
                      <button
                        className="user-list-action-btn edit"
                        onClick={() => onEdit(user)}
                        title="Edit user"
                      >
                        Edit
                      </button>
                      <button
                        className="user-list-action-btn reset"
                        onClick={() => onResetPassword(user)}
                        title="Reset password"
                      >
                        Reset
                      </button>
                      <button
                        className="user-list-action-btn delete"
                        onClick={() => onDelete(user)}
                        title="Delete user"
                      >
                        Delete
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
  )
}

export default UserList
