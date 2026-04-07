'use client';

import { AdminLayout } from '@/components/admin/AdminLayout';
import { AdminMetrics } from '@/components/admin/AdminMetrics';
import { RevenueChart } from '@/components/admin/RevenueChart';
import { SubscriptionOverview } from '@/components/admin/SubscriptionOverview';
import { PlatformHealth } from '@/components/admin/PlatformHealth';
import { AuditLog } from '@/components/admin/AuditLog';

export default function AdminOverviewPage() {
  return (
    <AdminLayout>
      <div className="p-4 lg:p-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Super Admin Overview</h1>
            <p className="text-zinc-500 dark:text-zinc-400 mt-1">Platform-wide metrics and system health.</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded-full bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
              <span className="w-2 h-2 rounded-full bg-green-500" />
              All systems operational
            </span>
          </div>
        </div>

        <AdminMetrics />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <PlatformHealth />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SubscriptionOverview />
          <AuditLog />
        </div>
      </div>
    </AdminLayout>
  );
}
