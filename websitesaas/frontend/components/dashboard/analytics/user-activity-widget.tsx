'use client'

import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { type LucideIcon, Users, ArrowUpRight, ArrowDownRight, Minus, Calendar, Filter, ArrowUp, ArrowDown } from 'lucide-react'

interface UserActivity {
  id: string
  user: string
  email: string
  action: string
  details?: string
  time: string
  timestamp: Date
  type: 'register' | 'login' | 'publish' | 'create-site' | 'upgrade' | 'cancel' | 'invite' | string
  tier?: string
}

interface UserActivityWidgetProps {
  activities: UserActivity[]
  title?: string
  description?: string
  className?: string
  maxItems?: number
}

type TimeRange = '24h' | '7d' | '30d' | '90d'
type ActivityFilter = 'all' | 'register' | 'publish' | 'create-site' | 'upgrade'

const FILTER_OPTIONS: { key: ActivityFilter; label: string; icon: LucideIcon }[] = [
  { key: 'all', label: 'All', icon: Filter },
  { key: 'register', label: 'Signups', icon: Users },
  { key: 'publish', label: 'Publishes', icon: ArrowUpRight },
  { key: 'create-site', label: 'New Sites', icon: ArrowUpRight },
  { key: 'upgrade', label: 'Upgrades', icon: ArrowUp },
]

const TIME_RANGES: { key: TimeRange; label: string }[] = [
  { key: '24h', label: '24h' },
  { key: '7d', label: '7d' },
  { key: '30d', label: '30d' },
  { key: '90d', label: '90d' },
]

const typeColors: Record<string, string> = {
  register: 'bg-blue-500',
  login: 'bg-zinc-400',
  publish: 'bg-purple-500',
  'create-site': 'bg-green-500',
  upgrade: 'bg-amber-500',
  cancel: 'bg-red-500',
  invite: 'bg-cyan-500',
}

const typeBadges: Record<string, string> = {
  register: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  login: 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
  publish: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
  'create-site': 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
  upgrade: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  cancel: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
  invite: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-300',
}

export function UserActivityWidget({
  activities,
  title = 'User Activity',
  description = 'Track user actions across the platform',
  className = '',
  maxItems = 10,
}: UserActivityWidgetProps) {
  const [timeRange, setTimeRange] = useState<TimeRange>('7d')
  const [filter, setFilter] = useState<ActivityFilter>('all')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')

  const filteredActivities = useMemo(() => {
    let result = [...activities]

    if (filter !== 'all') {
      result = result.filter((a) => a.type === filter)
    }

    const now = new Date()
    const rangeMs =
      timeRange === '24h' ? 24 * 60 * 60 * 1000 :
      timeRange === '7d' ? 7 * 24 * 60 * 60 * 1000 :
      timeRange === '30d' ? 30 * 24 * 60 * 60 * 1000 :
      90 * 24 * 60 * 60 * 1000

    result = result.filter((a) => now.getTime() - a.timestamp.getTime() <= rangeMs)

    result.sort((a, b) =>
      sortOrder === 'newest'
        ? b.timestamp.getTime() - a.timestamp.getTime()
        : a.timestamp.getTime() - b.timestamp.getTime()
    )

    return result.slice(0, maxItems)
  }, [activities, filter, timeRange, sortOrder, maxItems])

  const summaryStats = useMemo(() => {
    const uniqueUsers = new Set(activities.map((a) => a.email)).size
    const registrations = activities.filter((a) => a.type === 'register').length
    const publishes = activities.filter((a) => a.type === 'publish').length
    const upgrades = activities.filter((a) => a.type === 'upgrade').length

    return { uniqueUsers, registrations, publishes, upgrades }
  }, [activities])

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="flex items-center gap-1 text-xs text-zinc-500 dark:text-zinc-400">
            <Calendar className="h-3.5 w-3.5" />
            <span>{timeRange}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-center">
            <p className="text-lg font-semibold text-blue-700 dark:text-blue-300">{summaryStats.uniqueUsers}</p>
            <p className="text-xs text-blue-600/70 dark:text-blue-400/70">Users</p>
          </div>
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2 text-center">
            <p className="text-lg font-semibold text-green-700 dark:text-green-300">{summaryStats.registrations}</p>
            <p className="text-xs text-green-600/70 dark:text-green-400/70">Signups</p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2 text-center">
            <p className="text-lg font-semibold text-purple-700 dark:text-purple-300">{summaryStats.publishes}</p>
            <p className="text-xs text-purple-600/70 dark:text-purple-400/70">Publishes</p>
          </div>
          <div className="bg-amber-50 dark:bg-amber-900/20 rounded-lg p-2 text-center">
            <p className="text-lg font-semibold text-amber-700 dark:text-amber-300">{summaryStats.upgrades}</p>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70">Upgrades</p>
          </div>
        </div>
      </CardHeader>

      <div className="px-6 pb-2">
        <div className="flex flex-wrap items-center gap-2">
          {FILTER_OPTIONS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={cn(
                'inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full transition-colors',
                filter === key
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-700',
              )}
            >
              <Icon className="h-3 w-3" />
              {label}
            </button>
          ))}

          <div className="ml-auto flex items-center gap-1">
            {TIME_RANGES.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setTimeRange(key)}
                className={cn(
                  'px-2 py-1 text-xs rounded transition-colors',
                  timeRange === key
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900'
                    : 'text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300',
                )}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <CardContent className="flex-1 mt-2">
        <div className="space-y-0">
          {filteredActivities.length === 0 ? (
            <div className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
              No activity found for the selected filters
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between px-2 py-1.5 text-xs text-zinc-500 dark:text-zinc-400 border-b border-zinc-100 dark:border-zinc-800">
                <span>User</span>
                <button
                  onClick={() => setSortOrder(sortOrder === 'newest' ? 'oldest' : 'newest')}
                  className="flex items-center gap-1 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Time
                  {sortOrder === 'newest' ? (
                    <ArrowDown className="h-3 w-3" />
                  ) : (
                    <ArrowUp className="h-3 w-3" />
                  )}
                </button>
              </div>
              {filteredActivities.map((activity, index) => (
                <div
                  key={activity.id}
                  className={cn(
                    'flex items-start gap-3 px-2 py-2.5 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors',
                    index < filteredActivities.length - 1 && 'border-b border-zinc-50 dark:border-zinc-800/50',
                  )}
                >
                  <div className={cn(
                    'w-2 h-2 rounded-full mt-1.5 flex-shrink-0',
                    typeColors[activity.type] || 'bg-zinc-400',
                  )} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
                        {activity.user}
                      </p>
                      <span className={cn(
                        'text-xs px-1.5 py-0.5 rounded-full font-medium',
                        typeBadges[activity.type] || 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400',
                      )}>
                        {activity.type}
                      </span>
                      {activity.tier && (
                        <span className="text-xs bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 px-1.5 py-0.5 rounded-full">
                          {activity.tier}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5">
                      {activity.action}
                    </p>
                    {activity.details && (
                      <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5 line-clamp-1">
                        {activity.details}
                      </p>
                    )}
                  </div>
                  <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                    {activity.time}
                  </span>
                </div>
              ))}
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
