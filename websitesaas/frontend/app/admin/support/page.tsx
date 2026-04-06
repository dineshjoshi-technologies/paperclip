'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Modal } from '@/components/ui/modal'
import {
  Search,
  MessageSquare,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye,
  Reply,
} from 'lucide-react'

interface Ticket {
  id: string
  subject: string
  user: string
  userEmail: string
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  priority: 'low' | 'medium' | 'high' | 'critical'
  category: string
  createdAt: string
  lastUpdated: string
  messages: number
}

const mockTickets: Ticket[] = [
  { id: 'TK-001', subject: 'Cannot connect custom domain', user: 'John Doe', userEmail: 'john@example.com', status: 'open', priority: 'high', category: 'Technical', createdAt: '2024-11-22', lastUpdated: '2024-11-22', messages: 3 },
  { id: 'TK-002', subject: 'Billing discrepancy on invoice', user: 'Jane Smith', userEmail: 'jane@example.com', status: 'in_progress', priority: 'medium', category: 'Billing', createdAt: '2024-11-21', lastUpdated: '2024-11-22', messages: 5 },
  { id: 'TK-003', subject: 'Feature request: Dark mode', user: 'Bob Wilson', userEmail: 'bob@example.com', status: 'open', priority: 'low', category: 'Feature Request', createdAt: '2024-11-20', lastUpdated: '2024-11-20', messages: 1 },
  { id: 'TK-004', subject: 'Website not loading after publish', user: 'Alice Brown', userEmail: 'alice@example.com', status: 'in_progress', priority: 'critical', category: 'Technical', createdAt: '2024-11-22', lastUpdated: '2024-11-22', messages: 7 },
  { id: 'TK-005', subject: 'How to export my website?', user: 'Charlie Davis', userEmail: 'charlie@example.com', status: 'resolved', priority: 'low', category: 'General', createdAt: '2024-11-19', lastUpdated: '2024-11-20', messages: 2 },
  { id: 'TK-006', subject: 'Subscription cancellation issue', user: 'Diana Evans', userEmail: 'diana@example.com', status: 'open', priority: 'high', category: 'Billing', createdAt: '2024-11-22', lastUpdated: '2024-11-22', messages: 2 },
  { id: 'TK-007', subject: 'Template preview not working', user: 'Eve Foster', userEmail: 'eve@example.com', status: 'closed', priority: 'medium', category: 'Technical', createdAt: '2024-11-18', lastUpdated: '2024-11-19', messages: 4 },
]

export default function AdminSupportPage() {
  const [tickets] = useState<Ticket[]>(mockTickets)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [priorityFilter, setPriorityFilter] = useState('')
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)
  const [replyText, setReplyText] = useState('')

  const filtered = tickets.filter((ticket) => {
    const matchesSearch = ticket.subject.toLowerCase().includes(search.toLowerCase()) ||
      ticket.user.toLowerCase().includes(search.toLowerCase()) ||
      ticket.id.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || ticket.status === statusFilter
    const matchesPriority = !priorityFilter || ticket.priority === priorityFilter
    return matchesSearch && matchesStatus && matchesPriority
  })

  const openCount = tickets.filter((t) => t.status === 'open').length
  const inProgressCount = tickets.filter((t) => t.status === 'in_progress').length
  const resolvedCount = tickets.filter((t) => t.status === 'resolved').length

  const statusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <AlertCircle className="h-4 w-4" />
      case 'in_progress':
        return <Clock className="h-4 w-4" />
      case 'resolved':
        return <CheckCircle className="h-4 w-4" />
      case 'closed':
        return <XCircle className="h-4 w-4" />
      default:
        return <MessageSquare className="h-4 w-4" />
    }
  }

  const statusClasses = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'in_progress':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'resolved':
        return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
      case 'closed':
        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
      default:
        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
    }
  }

  const priorityClasses = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
      case 'high':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
      case 'medium':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
      case 'low':
        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
      default:
        return 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Support Tickets</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          View and manage user support requests
        </p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Open Tickets</CardDescription>
            <CardTitle className="text-2xl">{openCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>In Progress</CardDescription>
            <CardTitle className="text-2xl">{inProgressCount}</CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Resolved</CardDescription>
            <CardTitle className="text-2xl">{resolvedCount}</CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search tickets..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'open', label: 'Open' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'resolved', label: 'Resolved' },
                { value: 'closed', label: 'Closed' },
              ]}
            />
            <Select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              options={[
                { value: '', label: 'All Priorities' },
                { value: 'critical', label: 'Critical' },
                { value: 'high', label: 'High' },
                { value: 'medium', label: 'Medium' },
                { value: 'low', label: 'Low' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Tickets */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Ticket</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Priority</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Category</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Updated</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((ticket) => (
                  <tr key={ticket.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{ticket.subject}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{ticket.id}</p>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-zinc-900 dark:text-zinc-50">{ticket.user}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{ticket.userEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusClasses(ticket.status)}`}>
                        {statusIcon(ticket.status)}
                        {ticket.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priorityClasses(ticket.priority)}`}>
                        {ticket.priority}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 hidden lg:table-cell">{ticket.category}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">{ticket.lastUpdated}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedTicket(ticket)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Reply className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              No tickets found matching your filters
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Detail Modal */}
      <Modal open={!!selectedTicket} onClose={() => setSelectedTicket(null)}>
        {selectedTicket && (
          <>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{selectedTicket.subject}</h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{selectedTicket.id} • {selectedTicket.user}</p>
              </div>
              <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusClasses(selectedTicket.status)}`}>
                {statusIcon(selectedTicket.status)}
                {selectedTicket.status.replace('_', ' ')}
              </span>
            </div>
            <div className="space-y-4 mb-6">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900/50 rounded-lg">
                <p className="text-sm text-zinc-700 dark:text-zinc-300">
                  <strong>User:</strong> {selectedTicket.user} ({selectedTicket.userEmail})
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">
                  <strong>Category:</strong> {selectedTicket.category}
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">
                  <strong>Created:</strong> {selectedTicket.createdAt}
                </p>
                <p className="text-sm text-zinc-700 dark:text-zinc-300 mt-2">
                  <strong>Messages:</strong> {selectedTicket.messages}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Reply</label>
                <textarea
                  className="w-full min-h-[100px] px-3 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" onClick={() => setSelectedTicket(null)}>Close</Button>
              <Button variant="primary">
                <Reply className="h-4 w-4 mr-1" />
                Send Reply
              </Button>
            </div>
          </>
        )}
      </Modal>
    </div>
  )
}
