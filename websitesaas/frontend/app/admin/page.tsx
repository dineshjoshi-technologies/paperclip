'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Users,
  Globe,
  DollarSign,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
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
  PieChart,
  Pie,
  Cell,
} from 'recharts'

const revenueData = [
  { month: 'Jan', revenue: 12400, mrr: 12400 },
  { month: 'Feb', revenue: 15800, mrr: 15800 },
  { month: 'Mar', revenue: 18200, mrr: 18200 },
  { month: 'Apr', revenue: 22100, mrr: 22100 },
  { month: 'May', revenue: 28400, mrr: 28400 },
  { month: 'Jun', revenue: 32600, mrr: 32600 },
  { month: 'Jul', revenue: 38900, mrr: 38900 },
  { month: 'Aug', revenue: 42300, mrr: 42300 },
  { month: 'Sep', revenue: 48700, mrr: 48700 },
  { month: 'Oct', revenue: 54200, mrr: 54200 },
  { month: 'Nov', revenue: 61800, mrr: 61800 },
  { month: 'Dec', revenue: 68500, mrr: 68500 },
]

const subscriptionData = [
  { name: 'Free', value: 420, color: '#71717a' },
  { name: 'Starter', value: 185, color: '#3b82f6' },
  { name: 'Pro', value: 98, color: '#8b5cf6' },
  { name: 'Enterprise', value: 24, color: '#f59e0b' },
]

const weeklySignups = [
  { day: 'Mon', signups: 12 },
  { day: 'Tue', signups: 19 },
  { day: 'Wed', signups: 15 },
  { day: 'Thu', signups: 22 },
  { day: 'Fri', signups: 28 },
  { day: 'Sat', signups: 8 },
  { day: 'Sun', signups: 5 },
]

const recentActivity = [
  { id: 1, user: 'John Doe', action: 'Created website', time: '2 min ago', type: 'create' },
  { id: 2, user: 'Jane Smith', action: 'Upgraded to Pro', time: '15 min ago', type: 'upgrade' },
  { id: 3, user: 'Bob Wilson', action: 'Published site', time: '1 hour ago', type: 'publish' },
  { id: 4, user: 'Alice Brown', action: 'Registered account', time: '2 hours ago', type: 'register' },
  { id: 5, user: 'Charlie Davis', action: 'Cancelled subscription', time: '3 hours ago', type: 'cancel' },
]

const metricCards = [
  {
    title: 'Total Users',
    value: '727',
    change: '+12.5%',
    trend: 'up' as const,
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
  },
  {
    title: 'Total Websites',
    value: '1,284',
    change: '+8.2%',
    trend: 'up' as const,
    icon: Globe,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100 dark:bg-purple-900/30',
  },
  {
    title: 'Monthly Revenue',
    value: '$68,500',
    change: '+18.3%',
    trend: 'up' as const,
    icon: DollarSign,
    color: 'text-green-600',
    bgColor: 'bg-green-100 dark:bg-green-900/30',
  },
  {
    title: 'Active Subscriptions',
    value: '307',
    change: '-2.1%',
    trend: 'down' as const,
    icon: CreditCard,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
  },
]

export default function AdminOverviewPage() {
  const [chartView, setChartView] = useState<'revenue' | 'signups'>('revenue')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Platform Overview</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Monitor your platform performance and key metrics
        </p>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metricCards.map((metric) => (
          <Card key={metric.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardDescription className="text-sm">{metric.title}</CardDescription>
                <div className={`p-2 rounded-lg ${metric.bgColor}`}>
                  <metric.icon className={`h-4 w-4 ${metric.color}`} />
                </div>
              </div>
              <CardTitle className="text-2xl mt-1">{metric.value}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`flex items-center gap-1 text-sm ${
                metric.trend === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                {metric.trend === 'up' ? (
                  <ArrowUpRight className="h-3 w-3" />
                ) : (
                  <ArrowDownRight className="h-3 w-3" />
                )}
                <span>{metric.change}</span>
                <span className="text-zinc-500 dark:text-zinc-400">vs last month</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Revenue Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base">Revenue Overview</CardTitle>
                <CardDescription>Monthly recurring revenue trend</CardDescription>
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
          </CardHeader>
          <CardContent>
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
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                    <XAxis dataKey="month" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                    <Tooltip
                      formatter={(value: number) => [`$${value.toLocaleString()}`, 'Revenue']}
                      contentStyle={{
                        backgroundColor: 'hsl(0 0% 100%)',
                        border: '1px solid #e4e4e7',
                        borderRadius: '8px',
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
                  <BarChart data={weeklySignups}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e4e4e7" className="dark:stroke-zinc-800" />
                    <XAxis dataKey="day" stroke="#71717a" fontSize={12} />
                    <YAxis stroke="#71717a" fontSize={12} />
                    <Tooltip
                      formatter={(value: number) => [value, 'Signups']}
                      contentStyle={{
                        backgroundColor: 'hsl(0 0% 100%)',
                        border: '1px solid #e4e4e7',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="signups" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                )}
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Distribution */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Subscription Distribution</CardTitle>
            <CardDescription>Users by plan type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={subscriptionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {subscriptionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, 'Users']}
                    contentStyle={{
                      backgroundColor: 'hsl(0 0% 100%)',
                      border: '1px solid #e4e4e7',
                      borderRadius: '8px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="space-y-2 mt-4">
              {subscriptionData.map((item) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span className="text-zinc-600 dark:text-zinc-400">{item.name}</span>
                  </div>
                  <span className="font-medium text-zinc-900 dark:text-zinc-50">{item.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Key Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key Performance Metrics</CardTitle>
            <CardDescription>Platform health indicators</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { label: 'Monthly Recurring Revenue (MRR)', value: '$68,500', icon: TrendingUp, color: 'text-green-600' },
                { label: 'Customer Lifetime Value (LTV)', value: '$2,840', icon: DollarSign, color: 'text-blue-600' },
                { label: 'Churn Rate', value: '2.4%', icon: TrendingDown, color: 'text-red-600' },
                { label: 'Active Users (30d)', value: '542', icon: Activity, color: 'text-purple-600' },
              ].map((metric) => (
                <div key={metric.label} className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0">
                  <div className="flex items-center gap-3">
                    <metric.icon className={`h-4 w-4 ${metric.color}`} />
                    <span className="text-sm text-zinc-600 dark:text-zinc-400">{metric.label}</span>
                  </div>
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">{metric.value}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
            <CardDescription>Latest platform events</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-2 ${
                    activity.type === 'create' ? 'bg-blue-500' :
                    activity.type === 'upgrade' ? 'bg-green-500' :
                    activity.type === 'publish' ? 'bg-purple-500' :
                    activity.type === 'register' ? 'bg-amber-500' :
                    'bg-red-500'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-zinc-900 dark:text-zinc-50">
                      <span className="font-medium">{activity.user}</span>
                      {' '}{activity.action}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
