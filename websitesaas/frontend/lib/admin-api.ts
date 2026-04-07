export interface PlatformMetrics {
  totalUsers: number
  userGrowth: number
  totalWebsites: number
  websiteGrowth: number
  monthlyRevenue: number
  revenueGrowth: number
  activeSubscriptions: number
  subscriptionGrowth: number
  mrr: number
  arr: number
  churnRate: number
  activeUsers30d: number
  ltv: number
}

export interface RevenueDataPoint {
  month: string
  revenue: number
}

export interface SignupDataPoint {
  day: string
  value: number
}

export interface SubscriptionDataPoint {
  name: string
  value: number
  color: string
}

export interface ActivityItem {
  id: string
  user: string
  action: string
  time: string
  type: string
}

export interface KeyMetric {
  label: string
  value: string
  icon: React.ComponentType<{ className?: string }>
  color: string
}

async function fetchWithAuth(url: string, token: string | null) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(url, {
    headers,
    cache: 'no-store',
  })

  if (!res.ok) {
    throw new Error(`API error: ${res.status}`)
  }

  return res.json()
}

export async function fetchPlatformMetrics(token: string | null): Promise<PlatformMetrics> {
  const data = await fetchWithAuth('/api/admin/metrics', token)
  return data.metrics
}

export async function fetchRevenueData(token: string | null): Promise<RevenueDataPoint[]> {
  return fetchWithAuth('/api/admin/revenue', token)
}

export async function fetchSignupsData(token: string | null): Promise<SignupDataPoint[]> {
  return fetchWithAuth('/api/admin/signups', token)
}

export async function fetchSubscriptionDistribution(token: string | null): Promise<SubscriptionDataPoint[]> {
  return fetchWithAuth('/api/admin/subscriptions/distribution', token)
}

export async function fetchRecentActivity(token: string | null): Promise<ActivityItem[]> {
  return fetchWithAuth('/api/admin/activity', token)
}
