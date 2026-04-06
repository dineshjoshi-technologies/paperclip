'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Search, Filter, FileText, AlertTriangle, Info, CheckCircle } from 'lucide-react'

interface LogEntry {
  id: string
  timestamp: string
  level: 'info' | 'warning' | 'error' | 'success'
  user: string
  action: string
  details: string
  ip: string
}

const mockLogs: LogEntry[] = [
  { id: '1', timestamp: '2024-11-22 14:32:15', level: 'success', user: 'John Doe', action: 'Website Published', details: 'Published "Tech Startup" website', ip: '192.168.1.1' },
  { id: '2', timestamp: '2024-11-22 14:28:03', level: 'info', user: 'Jane Smith', action: 'Account Created', details: 'New user registration', ip: '10.0.0.5' },
  { id: '3', timestamp: '2024-11-22 14:15:42', level: 'warning', user: 'System', action: 'Rate Limit Hit', details: 'API rate limit exceeded for IP 203.0.113.42', ip: '203.0.113.42' },
  { id: '4', timestamp: '2024-11-22 13:58:19', level: 'error', user: 'Bob Wilson', action: 'Payment Failed', details: 'Stripe payment declined for subscription #1234', ip: '172.16.0.10' },
  { id: '5', timestamp: '2024-11-22 13:45:07', level: 'info', user: 'Alice Brown', action: 'Template Created', details: 'Created new template "Blog Classic"', ip: '192.168.1.100' },
  { id: '6', timestamp: '2024-11-22 13:30:55', level: 'success', user: 'Charlie Davis', action: 'Subscription Upgraded', details: 'Upgraded from Starter to Pro plan', ip: '10.0.0.15' },
  { id: '7', timestamp: '2024-11-22 12:58:33', level: 'warning', user: 'System', action: 'Disk Space Warning', details: 'Server disk usage at 85%', ip: '127.0.0.1' },
  { id: '8', timestamp: '2024-11-22 12:45:21', level: 'info', user: 'Diana Evans', action: 'Domain Connected', details: 'Connected custom domain agency.com', ip: '192.168.2.50' },
  { id: '9', timestamp: '2024-11-22 12:30:14', level: 'error', user: 'System', action: 'SSL Error', details: 'Failed to renew SSL certificate for example.com', ip: '127.0.0.1' },
  { id: '10', timestamp: '2024-11-22 12:15:08', level: 'success', user: 'Frank Green', action: 'Website Published', details: 'Published "SaaS Dashboard" website', ip: '10.0.0.25' },
]

export default function AdminLogsPage() {
  const [logs] = useState<LogEntry[]>(mockLogs)
  const [search, setSearch] = useState('')
  const [levelFilter, setLevelFilter] = useState('')
  const [userFilter, setUserFilter] = useState('')

  const filtered = logs.filter((log) => {
    const matchesSearch = log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.details.toLowerCase().includes(search.toLowerCase()) ||
      log.user.toLowerCase().includes(search.toLowerCase())
    const matchesLevel = !levelFilter || log.level === levelFilter
    const matchesUser = !userFilter || log.user === userFilter
    return matchesSearch && matchesLevel && matchesUser
  })

  const levelIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
      default:
        return <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
    }
  }

  const levelBg = (level: string) => {
    switch (level) {
      case 'success':
        return 'bg-green-100 dark:bg-green-900/30'
      case 'warning':
        return 'bg-amber-100 dark:bg-amber-900/30'
      case 'error':
        return 'bg-red-100 dark:bg-red-900/30'
      default:
        return 'bg-blue-100 dark:bg-blue-900/30'
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Activity Logs</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Monitor user actions and system events
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search logs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              options={[
                { value: '', label: 'All Levels' },
                { value: 'info', label: 'Info' },
                { value: 'success', label: 'Success' },
                { value: 'warning', label: 'Warning' },
                { value: 'error', label: 'Error' },
              ]}
            />
            <Select
              value={userFilter}
              onChange={(e) => setUserFilter(e.target.value)}
              options={[
                { value: '', label: 'All Users' },
                ...Array.from(new Set(logs.map((l) => l.user))).map((u) => ({ value: u, label: u })),
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Logs */}
      <Card>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {filtered.map((log) => (
              <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                <div className={`p-2 rounded-lg ${levelBg(log.level)}`}>
                  {levelIcon(log.level)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4">
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{log.action}</p>
                    <span className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-nowrap">{log.timestamp}</span>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">{log.details}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                    <span>User: {log.user}</span>
                    <span>IP: {log.ip}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {filtered.length === 0 && (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              No logs found matching your filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
