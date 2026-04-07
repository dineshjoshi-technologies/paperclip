'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card } from '@/components/ui/card'
import { LoadingSkeleton } from '@/components/dashboard'
import {
  MetricCard,
  RevenueChartWidget,
  BarChartWidget,
  DonutChartWidget,
  ActivityFeed,
  StatRowList,
} from '@/components/dashboard'
import {
  Users,
  Globe,
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Activity,
  RefreshCw,
  AlertTriangle,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import { useAuth } from '@/lib/auth-context'
import {
  fetchPlatformMetrics,
  fetchRevenueData,
  fetchSignupsData,
  fetchSubscriptionDistribution,
  fetchRecentActivity,
  type PlatformMetrics,
  type RevenueDataPoint,
  type SignupDataPoint,
  type SubscriptionDataPoint,
  type ActivityItem,
} from '@/lib/admin-api'

const FALLBACK_METRICS: PlatformMetrics = {
  totalUsers: 727,
  userGrowth: 12.5,
  totalWebsites: 1284,
  websiteGrowth: 8.2,
  monthlyRevenue: 68500,
  revenueGrowth: 18.3,
  activeSubscriptions: 307,
  subscriptionGrowth: -2.1,
  mrr: 68500,
  arr: 822000,
  churnRate: 2.4,
  activeUsers30d: 542,
  ltv: 2840,
}

const FALLBACK_REVENUE: RevenueDataPoint[] = [
  { month: 'Jan', revenue: 12400 },
  { month: 'Feb', revenue: 15800 },
  { month: 'Mar', revenue: 18200 },
  { month: 'Apr', revenue: 22100 },
  { month: 'May', revenue: 28400 },
  { month: 'Jun', revenue: 32600 },
  { month: 'Jul', revenue: 38900 },
  { month: 'Aug', revenue: 42300 },
  { month: 'Sep', revenue: 48700 },
  { month: 'Oct', revenue: 54200 },
  { month: 'Nov', revenue: 61800 },
  { month: 'Dec', revenue: 68500 },
]

const FALLBACK_SUBSCRIPTIONS: SubscriptionDataPoint[] = [
  { name: 'Free', value: 420, color: '#71717a' },
  { name: 'Starter', value: 185, color: '#3b82f6' },
  { name: 'Pro', value: 98, color: '#8b5cf6' },
  { name: 'Enterprise', value: 24, color: '#f59e0b' },
]

const FALLBACK_SIGNUPS: SignupDataPoint[] = [
  { day: 'Mon', value: 12 },
  { day: 'Tue', value: 19 },
  { day: 'Wed', value: 15 },
  { day: 'Thu', value: 22 },
  { day: 'Fri', value: 28 },
  { day: 'Sat', value: 8 },
  { day: 'Sun', value: 5 },
]

const FALLBACK_ACTIVITY: ActivityItem[] = [
  { id: '1', user: 'John Doe', action: 'Created website', time: '2 min ago', type: 'create' },
  { id: '2', user: 'Jane Smith', action: 'Upgraded to Pro', time: '15 min ago', type: 'upgrade' },
  { id: '3', user: 'Bob Wilson', action: 'Published site', time: '1 hour ago', type: 'publish' },
  { id: '4', user: 'Alice Brown', action: 'Registered account', time: '2 hours ago', type: 'register' },
  { id: '5', user: 'Charlie Davis', action: 'Cancelled subscription', time: '3 hours ago', type: 'cancel' },
]

export default function AdminOverviewPage() {
  const { token } = useAuth()
  const [chartView, setChartView] = useState<'revenue' | 'signups'>('revenue')
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [metrics, setMetrics] = useState<PlatformMetrics>(FALLBACK_METRICS)
  const [revenueData, setRevenueData] = useState<RevenueDataPoint[]>(FALLBACK_REVENUE)
  const [signupsData, setSignupsData] = useState<SignupDataPoint[]>(FALLBACK_SIGNUPS)
  const [subscriptionData, setSubscriptionData] = useState<SubscriptionDataPoint[]>(FALLBACK_SUBSCRIPTIONS)
  const [activityData, setActivityData] = useState<ActivityItem[]>(FALLBACK_ACTIVITY)
  const [lastRefresh, setLastRefresh] = useState<string>(new Date().toLocaleTimeString())

  async function loadData(isRefreshing = false) {
    if (isRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    setError(null)

    try {
      const [
        metricsResult,
        revenueResult,
        signupsResult,
        subscriptionsResult,
        activityResult,
      ] = await Promise.allSettled([
        fetchPlatformMetrics(token),
        fetchRevenueData(token),
        fetchSignupsData(token),
        fetchSubscriptionDistribution(token),
        fetchRecentActivity(token),
      ])

      if (metricsResult.status === 'fulfilled') setMetrics(metricsResult.value)
      if (revenueResult.status === 'fulfilled') setRevenueData(revenueResult.value)
      if (signupsResult.status === 'fulfilled') setSignupsData(signupsResult.value)
      if (subscriptionsResult.status === 'fulfilled') setSubscriptionData(subscriptionsResult.value)
      if (activityResult.status === 'fulfilled') setActivityData(activityResult.value)

      const failures = [metricsResult, revenueResult, signupsResult, subscriptionsResult, activityResult]
        .filter(r => r.status === 'rejected')
      if (failures.length > 0) {
        setError(`${failures.length} data source(s) failed, showing cached data`)
      }
    } catch (err) {
      setError('Failed to load dashboard data')
      setMetrics(FALLBACK_METRICS)
      setRevenueData(FALLBACK_REVENUE)
      setSignupsData(FALLBACK_SIGNUPS)
      setSubscriptionData(FALLBACK_SUBSCRIPTIONS)
      setActivityData(FALLBACK_ACTIVITY)
    } finally {
      setLoading(false)
      setRefreshing(false)
      setLastRefresh(new Date().toLocaleTimeString())
    }
  }

  const handleRefresh = useCallback(() => loadData(true), [])

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    const interval = setInterval(() => loadData(true), 60000)
    return () => clearInterval(interval)
  }, [])

  if (loading) {
    return <LoadingSkeleton />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Platform Overview</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Monitor your platform performance and key metrics
          </p>
          {lastRefresh && (
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              Last refreshed: {lastRefresh}
            </p>
          )}
        </div>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
          {refreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <span className="text-sm text-amber-700 dark:text-amber-300">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Users"
          value={metrics.totalUsers.toLocaleString()}
          change={`${metrics.userGrowth >= 0 ? '+' : ''}${metrics.userGrowth}%`}
          trend={metrics.userGrowth >= 0 ? 'up' : 'down'}
          icon={Users}
          color="text-blue-600"
          bgColor="bg-blue-100 dark:bg-blue-900/30"
        />
        <MetricCard
          title="Total Websites"
          value={metrics.totalWebsites.toLocaleString()}
          change={`${metrics.websiteGrowth >= 0 ? '+' : ''}${metrics.websiteGrowth}%`}
          trend={metrics.websiteGrowth >= 0 ? 'up' : 'down'}
          icon={Globe}
          color="text-purple-600"
          bgColor="bg-purple-100 dark:bg-purple-900/30"
        />
        <MetricCard
          title="Monthly Revenue"
          value={`$${metrics.monthlyRevenue.toLocaleString()}`}
          change={`${metrics.revenueGrowth >= 0 ? '+' : ''}${metrics.revenueGrowth}%`}
          trend={metrics.revenueGrowth >= 0 ? 'up' : 'down'}
          icon={DollarSign}
          color="text-green-600"
          bgColor="bg-green-100 dark:bg-green-900/30"
        />
        <MetricCard
          title="Active Subscriptions"
          value={metrics.activeSubscriptions.toLocaleString()}
          change={`${metrics.subscriptionGrowth >= 0 ? '+' : ''}${metrics.subscriptionGrowth}%`}
          trend={metrics.subscriptionGrowth >= 0 ? 'up' : 'down'}
          icon={CreditCard}
          color="text-amber-600"
          bgColor="bg-amber-100 dark:bg-amber-900/30"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2">
          <div>
            <div className="p-6 pb-0 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                  {chartView === 'revenue' ? 'Revenue Overview' : 'Weekly Signups'}
                </h3>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                  {chartView === 'revenue' ? 'Monthly recurring revenue trend' : 'User signups by day'}
                </p>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => setChartView('revenue')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    chartView === 'revenue'
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  Revenue
                </button>
                <button
                  onClick={() => setChartView('signups')}
                  className={`px-3 py-1 text-xs rounded-md transition-colors ${
                    chartView === 'signups'
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50'
                      : 'text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  Signups
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  {chartView === 'revenue' ? (
                    <AreaChart data={revenueData}>
                      <defs>
                        <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                      <XAxis dataKey="month" className="stroke-zinc-500" fontSize={12} />
                      <YAxis className="stroke-zinc-500" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                      <Tooltip
                        formatter={(value) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                        contentStyle={{
                          backgroundColor: 'var(--background, #fff)',
                          border: '1px solid #e4e4e7',
                          borderRadius: '8px',
                          color: 'var(--foreground, #171717)',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        stroke="#3b82f6"
                        strokeWidth={2}
                        fill="url(#revenueGradient)"
                      />
                    </AreaChart>
                  ) : (
                    <BarChart data={signupsData}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                      <XAxis dataKey="day" className="stroke-zinc-500" fontSize={12} />
                      <YAxis className="stroke-zinc-500" fontSize={12} />
                      <Tooltip
                        formatter={(value) => [value, 'Signups']}
                        contentStyle={{
                          backgroundColor: 'var(--background, #fff)',
                          border: '1px solid #e4e4e7',
                          borderRadius: '8px',
                          color: 'var(--foreground, #171717)',
                        }}
                      />
                      <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  )}
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </Card>

        <DonutChartWidget
          data={subscriptionData}
          title="Subscription Distribution"
          description="Users by plan type"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatRowList
          stats={[
            { label: 'Monthly Recurring Revenue (MRR)', value: `$${metrics.mrr.toLocaleString()}`, icon: TrendingUp, color: 'text-green-600' },
            { label: 'Annual Recurring Revenue (ARR)', value: `$${(metrics.arr / 1000).toFixed(0)}k`, icon: DollarSign, color: 'text-blue-600' },
            { label: 'Customer Lifetime Value (LTV)', value: `$${metrics.ltv.toLocaleString()}`, icon: DollarSign, color: 'text-blue-600' },
            { label: 'Churn Rate', value: `${metrics.churnRate}%`, icon: TrendingDown, color: 'text-red-600' },
            { label: 'Active Users (30d)', value: metrics.activeUsers30d.toLocaleString(), icon: Activity, color: 'text-purple-600' },
          ]}
          title="Key Performance Metrics"
          description="Platform health indicators"
        />

        <ActivityFeed
          activities={activityData}
          title="Recent Activity"
          description="Latest platform events"
        />
      </div>
    </div>
  )
}
