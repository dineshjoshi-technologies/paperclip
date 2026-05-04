'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardHeader, DashboardSidebar } from '@/components/layout'
import { MobileNav } from '@/components/dashboard/mobile-nav'
import { MetricCard, RevenueChartWidget, StatRowList, ActivityFeed, LoadingSkeleton } from '@/components/dashboard'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { apiFetch, formatDate, slugify, cn } from '@/lib/utils'
import {
  Globe,
  TrendingUp,
  Clock,
  Eye,
  MousePointerClick,
  Users,
  Zap,
  Activity,
  Plus,
  Trash2,
  Pencil,
} from 'lucide-react'

interface Website {
  id: string
  name: string
  slug: string
  status: string
  views?: number
  createdAt: string
  updatedAt: string
}

const userRevenueData = [
  { month: 'Jan', revenue: 0 },
  { month: 'Feb', revenue: 120 },
  { month: 'Mar', revenue: 340 },
  { month: 'Apr', revenue: 580 },
  { month: 'May', revenue: 890 },
  { month: 'Jun', revenue: 1240 },
]

const weeklyVisitors = [
  { day: 'Mon', value: 42 },
  { day: 'Tue', value: 65 },
  { day: 'Wed', value: 53 },
  { day: 'Thu', value: 78 },
  { day: 'Fri', value: 91 },
  { day: 'Sat', value: 34 },
  { day: 'Sun', value: 21 },
]

const recentUserActivity = [
  { id: 1, user: 'You', action: 'Created "Portfolio" website', time: '2 min ago', type: 'create' },
  { id: 2, user: 'You', action: 'Published "Landing Page" site', time: '1 hour ago', type: 'publish' },
  { id: 3, user: 'You', action: 'Updated "Blog" components', time: '3 hours ago', type: 'upgrade' },
  { id: 4, user: 'You', action: 'Registered account', time: 'Yesterday', type: 'register' },
]

export default function DashboardPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    loadWebsites()
  }, [])

  async function loadWebsites() {
    try {
      const data = await apiFetch<Website[]>('/api/websites')
      setWebsites(data)
    } catch {
      setWebsites([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const website = await apiFetch<Website>('/api/websites', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim(), slug: slugify(newName) }),
      })
      setWebsites((prev) => [...prev, website])
      setNewName('')
      setShowCreateModal(false)
    } catch (err) {
      console.error('Failed to create website:', err)
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/websites/${id}`, { method: 'DELETE' })
      setWebsites((prev) => prev.filter((w) => w.id !== id))
    } catch (err) {
      console.error('Failed to delete website:', err)
    }
  }

  const totalViews = websites.reduce((sum, w) => sum + (w.views || 0), 0)
  const publishedCount = websites.filter((w) => w.status === 'PUBLISHED').length

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <MobileNav open={mobileNavOpen} onToggle={() => setMobileNavOpen(!mobileNavOpen)}>
        <DashboardSidebar />
      </MobileNav>
      <DashboardHeader />

      <div className="flex">
        <div className="w-56 hidden lg:block flex-shrink-0">
          <DashboardSidebar />
        </div>
        <main className="flex-1 p-6">
          {/* Dashboard Analytics Section */}
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">My Websites</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              Manage your websites and track performance
            </p>
          </div>

          {/* User Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {loading ? (
              <>
                <LoadingSkeleton variant="metric" />
                <LoadingSkeleton variant="metric" />
                <LoadingSkeleton variant="metric" />
                <LoadingSkeleton variant="metric" />
              </>
            ) : (
              <>
                <MetricCard
                  title="Total Websites"
                  value={String(websites.length)}
                  icon={Globe}
                  color="text-blue-600"
                  bgColor="bg-blue-100 dark:bg-blue-900/30"
                />
                <MetricCard
                  title="Published Sites"
                  value={String(publishedCount)}
                  icon={Eye}
                  color="text-green-600"
                  bgColor="bg-green-100 dark:bg-green-900/30"
                />
                <MetricCard
                  title="Total Views"
                  value={totalViews.toLocaleString()}
                  icon={MousePointerClick}
                  color="text-purple-600"
                  bgColor="bg-purple-100 dark:bg-purple-900/30"
                />
                <MetricCard
                  title="Est. Revenue"
                  value={`$${userRevenueData[userRevenueData.length - 1]?.revenue || 0}`}
                  change="+42%"
                  trend="up"
                  icon={TrendingUp}
                  color="text-amber-600"
                  bgColor="bg-amber-100 dark:bg-amber-900/30"
                />
              </>
            )}
          </div>

          {/* Action Button */}
          <div className="mb-8">
            <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
              <Plus className="h-4 w-4 mr-1" />
              New Website
            </Button>
          </div>

          {/* Website Creation Statistics Panel */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-8">
            {/* Activity Chart */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="text-base">Website Activity</CardTitle>
                <CardDescription>Weekly visitor engagement across your sites</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  {loading ? (
                    <div className="h-full rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                  ) : (
                    <ActivityFeed
                      activities={recentUserActivity}
                      title=""
                      description=""
                    />
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Quick Stats</CardTitle>
                <CardDescription>Your platform overview</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="space-y-4">
                    <LoadingSkeleton variant="table-row" />
                    <LoadingSkeleton variant="table-row" />
                    <LoadingSkeleton variant="table-row" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {[
                      { label: 'Websites Created', value: String(websites.length), icon: Globe, color: 'text-blue-600' },
                      { label: 'Published', value: String(publishedCount), icon: Eye, color: 'text-green-600' },
                      { label: 'Drafts', value: String(websites.length - publishedCount), icon: Pencil, color: 'text-amber-600' },
                    ].map((stat) => (
                      <div key={stat.label} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                        <div className="flex items-center gap-3">
                          <stat.icon className={cn('h-4 w-4', stat.color)} />
                          <span className="text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</span>
                        </div>
                        <span className="font-semibold text-zinc-900 dark:text-zinc-50">{stat.value}</span>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Website Listing */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Your Websites</h2>
            {loading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <LoadingSkeleton variant="chart" />
                <LoadingSkeleton variant="chart" />
                <LoadingSkeleton variant="chart" />
              </div>
            ) : websites.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12">
                  <Globe className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mb-3" />
                  <p className="text-zinc-500 dark:text-zinc-400 mb-2">
                    No websites yet. Create your first one to get started.
                  </p>
                  <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
                    <Plus className="h-4 w-4 mr-1" />
                    Create Website
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {websites.map((site) => (
                  <Card key={site.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <CardTitle className="text-base truncate">{site.name}</CardTitle>
                      <CardDescription>
                        <span className={cn(
                          'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium',
                          site.status === 'PUBLISHED'
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : site.status === 'ARCHIVED'
                            ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                        )}>
                          {site.status.toLowerCase()}
                        </span>
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center gap-4 text-xs text-zinc-400 dark:text-zinc-500">
                        <span>Updated {formatDate(site.updatedAt)}</span>
                        {site.views && (
                          <span className="flex items-center gap-1">
                            <Eye className="h-3 w-3" />
                            {site.views.toLocaleString()} views
                          </span>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className="flex gap-2">
                      <Button variant="primary" size="sm" className="flex-1" asChild>
                        <Link href={`/builder?websiteId=${site.id}`}>
                          Edit
                        </Link>
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(site.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Create New Website
        </h2>
        <Input
          placeholder="Website name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
          autoFocus
        />
        <div className="flex gap-2 mt-4 justify-end">
          <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={creating || !newName.trim()}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
