'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Search,
  CreditCard,
  CheckCircle,
  XCircle,
  AlertCircle,
  DollarSign,
  Calendar,
} from 'lucide-react'

interface Subscription {
  id: string
  user: string
  userEmail: string
  plan: string
  status: 'active' | 'cancelled' | 'past_due' | 'trialing'
  amount: number
  billingCycle: 'monthly' | 'yearly'
  startDate: string
  nextBilling: string
  paymentMethod: string
}

const mockSubscriptions: Subscription[] = [
  { id: '1', user: 'John Doe', userEmail: 'john@example.com', plan: 'Pro', status: 'active', amount: 49, billingCycle: 'monthly', startDate: '2024-01-15', nextBilling: '2024-12-15', paymentMethod: 'Visa •••• 4242' },
  { id: '2', user: 'Jane Smith', userEmail: 'jane@example.com', plan: 'Starter', status: 'active', amount: 19, billingCycle: 'monthly', startDate: '2024-02-20', nextBilling: '2024-12-20', paymentMethod: 'Mastercard •••• 5555' },
  { id: '3', user: 'Bob Wilson', userEmail: 'bob@example.com', plan: 'Pro', status: 'past_due', amount: 49, billingCycle: 'monthly', startDate: '2024-03-10', nextBilling: '2024-11-10', paymentMethod: 'Visa •••• 1234' },
  { id: '4', user: 'Alice Brown', userEmail: 'alice@example.com', plan: 'Enterprise', status: 'active', amount: 199, billingCycle: 'yearly', startDate: '2024-01-05', nextBilling: '2025-01-05', paymentMethod: 'Amex •••• 9876' },
  { id: '5', user: 'Charlie Davis', userEmail: 'charlie@example.com', plan: 'Starter', status: 'cancelled', amount: 19, billingCycle: 'monthly', startDate: '2024-04-18', nextBilling: '-', paymentMethod: '-' },
  { id: '6', user: 'Diana Evans', userEmail: 'diana@example.com', plan: 'Pro', status: 'trialing', amount: 49, billingCycle: 'monthly', startDate: '2024-11-22', nextBilling: '2024-12-22', paymentMethod: 'Visa •••• 7890' },
  { id: '7', user: 'Frank Green', userEmail: 'frank@example.com', plan: 'Enterprise', status: 'active', amount: 199, billingCycle: 'yearly', startDate: '2024-02-14', nextBilling: '2025-02-14', paymentMethod: 'Mastercard •••• 3333' },
]

export default function AdminSubscriptionsPage() {
  const [subscriptions] = useState<Subscription[]>(mockSubscriptions)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')

  const filtered = subscriptions.filter((sub) => {
    const matchesSearch = sub.user.toLowerCase().includes(search.toLowerCase()) ||
      sub.userEmail.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || sub.status === statusFilter
    const matchesPlan = !planFilter || sub.plan === planFilter
    return matchesSearch && matchesStatus && matchesPlan
  })

  const totalMRR = subscriptions
    .filter((s) => s.status === 'active' || s.status === 'trialing')
    .reduce((sum, s) => sum + (s.billingCycle === 'yearly' ? s.amount / 12 : s.amount), 0)

  const activeCount = subscriptions.filter((s) => s.status === 'active').length
  const pastDueCount = subscriptions.filter((s) => s.status === 'past_due').length
  const cancelledCount = subscriptions.filter((s) => s.status === 'cancelled').length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Subscription Management</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Monitor and manage all platform subscriptions
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Monthly Recurring Revenue</CardDescription>
            <CardTitle className="text-2xl">${totalMRR.toFixed(0)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <DollarSign className="h-4 w-4" />
              <span>Across all active plans</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Active Subscriptions</CardDescription>
            <CardTitle className="text-2xl">{activeCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle className="h-4 w-4" />
              <span>Currently active</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Past Due</CardDescription>
            <CardTitle className="text-2xl">{pastDueCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400">
              <AlertCircle className="h-4 w-4" />
              <span>Payment issues</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardDescription>Cancelled</CardDescription>
            <CardTitle className="text-2xl">{cancelledCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2 text-sm text-red-600 dark:text-red-400">
              <XCircle className="h-4 w-4" />
              <span>This period</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search subscriptions..."
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
                { value: 'active', label: 'Active' },
                { value: 'trialing', label: 'Trialing' },
                { value: 'past_due', label: 'Past Due' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
            />
            <Select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              options={[
                { value: '', label: 'All Plans' },
                { value: 'Starter', label: 'Starter' },
                { value: 'Pro', label: 'Pro' },
                { value: 'Enterprise', label: 'Enterprise' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Subscriptions Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Amount</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Next Billing</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Payment</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map((sub) => (
                  <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{sub.user}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{sub.userEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                        <CreditCard className="h-3 w-3" />
                        {sub.plan}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        sub.status === 'active'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : sub.status === 'trialing'
                          ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          : sub.status === 'past_due'
                          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                          : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                      }`}>
                        {sub.status === 'active' && <CheckCircle className="h-3 w-3" />}
                        {sub.status === 'trialing' && <Calendar className="h-3 w-3" />}
                        {sub.status === 'past_due' && <AlertCircle className="h-3 w-3" />}
                        {sub.status === 'cancelled' && <XCircle className="h-3 w-3" />}
                        {sub.status.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-900 dark:text-zinc-50 hidden md:table-cell">
                      ${sub.amount}/{sub.billingCycle === 'monthly' ? 'mo' : 'yr'}
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">{sub.nextBilling}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">{sub.paymentMethod}</td>
                    <td className="px-4 py-3 text-right">
                      <Button variant="ghost" size="sm">View Details</Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
