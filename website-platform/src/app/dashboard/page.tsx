'use client';

import { DashboardLayout } from '@/components/dashboard/Sidebar';
import { AnalyticsCard } from '@/components/dashboard/AnalyticsCard';
import { ActivityChart } from '@/components/dashboard/ActivityChart';
import { RecentWebsites } from '@/components/dashboard/RecentWebsites';
import { DashboardEmptyState } from '@/components/dashboard/EmptyState';

export default function DashboardPage() {
  const hasWebsites = true;

  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 space-y-8">
        {/* Page header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Dashboard</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Welcome back! Here&apos;s your platform overview.</p>
          </div>
          <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all">
            + New Website
          </button>
        </div>

        {!hasWebsites ? (
          <DashboardEmptyState
            title="No websites yet"
            description="Create your first website and start building amazing experiences with our AI-powered builder."
          />
        ) : (
          <>
            {/* Analytics Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <AnalyticsCard
                title="Total Websites"
                value="12"
                change={8}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                }
              />
              <AnalyticsCard
                title="Total Visitors"
                value="24.5K"
                change={12}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                }
              />
              <AnalyticsCard
                title="Revenue"
                value="$3,240"
                change={-3}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
              />
              <AnalyticsCard
                title="Conversions"
                value="342"
                change={18}
                icon={
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                }
              />
            </div>

            {/* Charts and recent */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <ActivityChart />
              </div>
              <RecentWebsites />
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
