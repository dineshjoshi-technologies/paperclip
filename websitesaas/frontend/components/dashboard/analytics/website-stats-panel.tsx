'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts'
import {
  Globe,
  TrendingUp,
  Clock,
  CheckCircle2,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
} from 'lucide-react'

interface WebsiteStat {
  totalSites: number
  activeSites: number
  draftSites: number
  publishedThisWeek: number
  publishedThisMonth: number
  avgTimeToPublish: string
  topTemplates: { name: string; count: number; color: string }[]
  sitesByDay: { day: string; created: number; published: number }[]
  trend: { month: string; sites: number }[]
  changes?: {
    totalSitesChange: string
    activeSitesChange: string
    publishedChange: string
    trend: 'up' | 'down' | 'neutral'
  }
}

interface WebsiteStatsPanelProps {
  stats: WebsiteStat
  title?: string
  description?: string
  className?: string
}

export function WebsiteStatsPanel({
  stats,
  title = 'Website Creation Stats',
  description = 'Platform website generation metrics',
  className = '',
}: WebsiteStatsPanelProps) {
  const [chartView, setChartView] = useState<'weekly' | 'monthly'>('weekly')

  const avgPerDay = useMemo(() => {
    const total = stats.sitesByDay.reduce((sum, d) => sum + d.created, 0)
    return (total / stats.sitesByDay.length).toFixed(1)
  }, [stats.sitesByDay])

  const publishRate = useMemo(() => {
    if (stats.totalSites === 0) return '0%'
    return ((stats.activeSites / stats.totalSites) * 100).toFixed(0) + '%'
  }, [stats])

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-0.5">
            <button
              onClick={() => setChartView('weekly')}
              className={cn(
                'px-2.5 py-1 text-xs rounded-md transition-colors',
                chartView === 'weekly'
                  ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-500 dark:text-zinc-400',
              )}
            >
              Weekly
            </button>
            <button
              onClick={() => setChartView('monthly')}
              className={cn(
                'px-2.5 py-1 text-xs rounded-md transition-colors',
                chartView === 'monthly'
                  ? 'bg-white dark:bg-zinc-700 shadow-sm text-zinc-900 dark:text-zinc-50'
                  : 'text-zinc-500 dark:text-zinc-400',
              )}
            >
              Monthly
            </button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-4">
        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <Globe className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
            <div>
              <p className="text-xl font-semibold text-blue-700 dark:text-blue-300">
                {stats.totalSites.toLocaleString()}
              </p>
              <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Total Sites</p>
              {stats.changes && (
                <div className={cn(
                  'flex items-center gap-0.5 text-xs mt-1',
                  stats.changes.totalSitesChange.startsWith('+')
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400',
                )}>
                  {stats.changes.totalSitesChange.startsWith('+') ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stats.changes.totalSitesChange}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
            <div>
              <p className="text-xl font-semibold text-green-700 dark:text-green-300">
                {stats.activeSites.toLocaleString()}
              </p>
              <p className="text-xs text-green-600/70 dark:text-green-400/70">Active ({publishRate})</p>
              {stats.changes && (
                <div className={cn(
                  'flex items-center gap-0.5 text-xs mt-1',
                  stats.changes.activeSitesChange.startsWith('+')
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400',
                )}>
                  {stats.changes.activeSitesChange.startsWith('+') ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stats.changes.activeSitesChange}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400 mt-0.5" />
            <div>
              <p className="text-xl font-semibold text-purple-700 dark:text-purple-300">
                {stats.publishedThisMonth}
              </p>
              <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Published (MTD)</p>
              {stats.changes && (
                <div className={cn(
                  'flex items-center gap-0.5 text-xs mt-1',
                  stats.changes.publishedChange.startsWith('+')
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-red-600 dark:text-red-400',
                )}>
                  {stats.changes.publishedChange.startsWith('+') ? (
                    <ArrowUpRight className="h-3 w-3" />
                  ) : (
                    <ArrowDownRight className="h-3 w-3" />
                  )}
                  {stats.changes.publishedChange}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-start gap-3 p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
            <Clock className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div>
              <p className="text-xl font-semibold text-amber-700 dark:text-amber-300">
                {stats.avgTimeToPublish}
              </p>
              <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Avg to Publish</p>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="border-t border-zinc-100 dark:border-zinc-800 pt-4">
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              {chartView === 'weekly' ? (
                <BarChart data={stats.sitesByDay}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                  <XAxis dataKey="day" className="stroke-zinc-500" fontSize={11} />
                  <YAxis className="stroke-zinc-500" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background, #fff)',
                      border: '1px solid #e4e4e7',
                      borderRadius: '8px',
                      color: 'var(--foreground, #171717)',
                    }}
                  />
                  <Bar dataKey="created" fill="#3b82f6" name="Created" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="published" fill="#22c55e" name="Published" radius={[4, 4, 0, 0]} />
                </BarChart>
              ) : (
                <LineChart data={stats.trend}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                  <XAxis dataKey="month" className="stroke-zinc-500" fontSize={11} />
                  <YAxis className="stroke-zinc-500" fontSize={11} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'var(--background, #fff)',
                      border: '1px solid #e4e4e7',
                      borderRadius: '8px',
                      color: 'var(--foreground, #171717)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="sites"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    dot={{ fill: '#8b5cf6', r: 3 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row: Template Stats & Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-zinc-100 dark:border-zinc-800 pt-4">
          {/* Top Templates */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-zinc-500" />
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Top Templates</p>
            </div>
            <div className="space-y-2">
              {stats.topTemplates.map((template) => (
                <div key={template.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: template.color }} />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{template.name}</span>
                  </div>
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{template.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Calendar className="h-4 w-4 text-zinc-500" />
              <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Quick Stats</p>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Draft Sites</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{stats.draftSites}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Published This Week</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{stats.publishedThisWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-600 dark:text-zinc-400">Avg Created/Day</span>
                <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{avgPerDay}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
