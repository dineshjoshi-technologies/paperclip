'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Modal } from '@/components/ui/modal'
import { Select } from '@/components/ui/select'
import {
  Search,
  UserPlus,
  MoreHorizontal,
  Mail,
  Shield,
  UserX,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react'

interface User {
  id: string
  name: string
  email: string
  role: string
  status: 'active' | 'suspended' | 'deleted'
  websites: number
  joinedAt: string
  lastActive: string
}

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@example.com', role: 'USER', status: 'active', websites: 3, joinedAt: '2024-01-15', lastActive: '2 hours ago' },
  { id: '2', name: 'Jane Smith', email: 'jane@example.com', role: 'PRO', status: 'active', websites: 7, joinedAt: '2024-02-20', lastActive: '5 min ago' },
  { id: '3', name: 'Bob Wilson', email: 'bob@example.com', role: 'USER', status: 'suspended', websites: 1, joinedAt: '2024-03-10', lastActive: '3 days ago' },
  { id: '4', name: 'Alice Brown', email: 'alice@example.com', role: 'ADMIN', status: 'active', websites: 12, joinedAt: '2024-01-05', lastActive: '1 hour ago' },
  { id: '5', name: 'Charlie Davis', email: 'charlie@example.com', role: 'USER', status: 'active', websites: 2, joinedAt: '2024-04-18', lastActive: '1 day ago' },
  { id: '6', name: 'Diana Evans', email: 'diana@example.com', role: 'PRO', status: 'active', websites: 5, joinedAt: '2024-05-22', lastActive: '30 min ago' },
  { id: '7', name: 'Eve Foster', email: 'eve@example.com', role: 'USER', status: 'active', websites: 1, joinedAt: '2024-06-30', lastActive: '4 hours ago' },
  { id: '8', name: 'Frank Green', email: 'frank@example.com', role: 'AGENCY', status: 'active', websites: 24, joinedAt: '2024-02-14', lastActive: '15 min ago' },
]

const roleOptions = [
  { value: 'USER', label: 'User' },
  { value: 'PRO', label: 'Pro' },
  { value: 'ADMIN', label: 'Admin' },
  { value: 'AGENCY', label: 'Agency' },
  { value: 'DEVELOPER', label: 'Developer' },
  { value: 'DESIGNER', label: 'Designer' },
  { value: 'SUPPORT', label: 'Support' },
]

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>(mockUsers)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showEditModal, setShowEditModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [editRole, setEditRole] = useState('')

  const filteredUsers = users.filter((user) => {
    const matchesSearch = user.name.toLowerCase().includes(search.toLowerCase()) ||
      user.email.toLowerCase().includes(search.toLowerCase())
    const matchesRole = !roleFilter || user.role === roleFilter
    const matchesStatus = !statusFilter || user.status === statusFilter
    return matchesSearch && matchesRole && matchesStatus
  })

  const handleEdit = (user: User) => {
    setSelectedUser(user)
    setEditRole(user.role)
    setShowEditModal(true)
  }

  const handleSaveEdit = () => {
    if (!selectedUser) return
    setUsers((prev) =>
      prev.map((u) => (u.id === selectedUser.id ? { ...u, role: editRole } : u))
    )
    setShowEditModal(false)
    setSelectedUser(null)
  }

  const handleSuspend = (user: User) => {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, status: u.status === 'suspended' ? 'active' : 'suspended' }
          : u
      )
    )
  }

  const handleDelete = (user: User) => {
    setSelectedUser(user)
    setShowDeleteModal(true)
  }

  const confirmDelete = () => {
    if (!selectedUser) return
    setUsers((prev) => prev.filter((u) => u.id !== selectedUser.id))
    setShowDeleteModal(false)
    setSelectedUser(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">User Management</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            View, manage, and moderate platform users
          </p>
        </div>
        <Button variant="primary" size="md">
          <UserPlus className="h-4 w-4 mr-2" />
          Add User
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search users by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
              options={[{ value: '', label: 'All Roles' }, ...roleOptions]}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'active', label: 'Active' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Role</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Websites</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Joined</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Last Active</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs font-medium">
                          {user.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{user.name}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                        <Shield className="h-3 w-3" />
                        {user.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        user.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : user.status === 'suspended'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 hidden md:table-cell">{user.websites}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">{user.joinedAt}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">{user.lastActive}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => handleEdit(user)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSuspend(user)}
                          className={user.status === 'suspended' ? 'text-green-600' : 'text-amber-600'}
                        >
                          <UserX className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(user)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredUsers.length === 0 && (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              No users found matching your filters
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Modal */}
      <Modal open={showEditModal} onClose={() => setShowEditModal(false)}>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Edit User: {selectedUser?.name}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Role</label>
            <Select
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              options={roleOptions}
            />
          </div>
          <div className="flex gap-2 justify-end">
            <Button variant="ghost" onClick={() => setShowEditModal(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleSaveEdit}>Save Changes</Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal open={showDeleteModal} onClose={() => setShowDeleteModal(false)}>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
          Delete User
        </h2>
        <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
          Are you sure you want to delete <strong>{selectedUser?.name}</strong>? This action cannot be undone.
        </p>
        <div className="flex gap-2 justify-end">
          <Button variant="ghost" onClick={() => setShowDeleteModal(false)}>Cancel</Button>
          <Button variant="destructive" onClick={confirmDelete}>Delete User</Button>
        </div>
      </Modal>
    </div>
  )
}
