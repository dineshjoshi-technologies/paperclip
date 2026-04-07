'use client';

import { useState } from 'react';

interface TierData {
  name: string;
  count: number;
  percentage: number;
  monthlyRevenue: number;
  change: number;
  color: string;
}

interface SubscriptionChange {
  id: string;
  user: string;
  email: string;
  action: 'upgraded' | 'downgraded' | 'cancelled' | 'new';
  from: string;
  to: string;
  date: string;
}

const tierData: TierData[] = [
  { name: 'Free', count: 523, percentage: 42, monthlyRevenue: 0, change: -3, color: 'bg-zinc-400 dark:bg-zinc-500' },
  { name: 'Basic', count: 312, percentage: 25, monthlyRevenue: 9360, change: 8, color: 'bg-blue-500' },
  { name: 'Pro', count: 267, percentage: 22, monthlyRevenue: 26700, change: 15, color: 'bg-purple-500' },
  { name: 'Enterprise', count: 132, percentage: 11, monthlyRevenue: 39600, change: 22, color: 'bg-yellow-500' },
];

const recentChanges: SubscriptionChange[] = [
  { id: '1', user: 'John Doe', email: 'john@acmecorp.com', action: 'upgraded', from: 'Pro', to: 'Enterprise', date: '2h ago' },
  { id: '2', user: 'Jane Smith', email: 'jane@designstudio.io', action: 'downgraded', from: 'Pro', to: 'Basic', date: '5h ago' },
  { id: '3', user: 'Alex Johnson', email: 'alex@techstart.com', action: 'new', from: '-', to: 'Basic', date: '1d ago' },
  { id: '4', user: 'Sarah Chen', email: 'sarah@startup.co', action: 'cancelled', from: 'Basic', to: 'Free', date: '2d ago' },
  { id: '5', user: 'Michael Brown', email: 'mike@agency.net', action: 'upgraded', from: 'Basic', to: 'Pro', date: '3d ago' },
];

function ActionBadge({ action }: { action: SubscriptionChange['action'] }) {
  const styles: Record<SubscriptionChange['action'], string> = {
    upgraded: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    downgraded: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
    cancelled: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    new: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };
  return <span className={`${styles[action]} rounded-full text-xs font-medium px-2.5 py-0.5 capitalize`}>{action}</span>;
}

export function SubscriptionOverview() {
  const totalSubscribers = tierData.reduce((sum, t) => sum + t.count, 0);
  const totalMRR = tierData.reduce((sum, t) => sum + t.monthlyRevenue, 0);
  const maxWidth = 100;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {tierData.map((tier) => {
          const isPositive = tier.change >= 0;
          return (
            <div
              key={tier.name}
              className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-3 h-3 rounded-full ${tier.color}`} />
                <span className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{tier.name}</span>
              </div>
              <div className="space-y-3">
                <div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{tier.count}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">{tier.percentage}% of total</p>
                </div>
                {tier.monthlyRevenue > 0 && (
                  <div>
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                      ${tier.monthlyRevenue.toLocaleString()}/mo
                    </p>
                  </div>
                )}
                <span
                  className={`text-xs font-medium ${
                    isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}
                >
                  {isPositive ? '+' : ''}{tier.change}% from last month
                </span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Distribution</h3>
          <div className="space-y-4">
            {tierData.map((tier) => (
              <div key={tier.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium text-zinc-700 dark:text-zinc-300">{tier.name}</span>
                  <span className="text-zinc-500 dark:text-zinc-400">{tier.percentage}%</span>
                </div>
                <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${tier.color}`}
                    style={{ width: `${(tier.count / totalSubscribers) * maxWidth}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="mt-6 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <div className="flex justify-between text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Total Subscribers</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">{totalSubscribers.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm mt-2">
              <span className="text-zinc-500 dark:text-zinc-400">Total MRR</span>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">${totalMRR.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Churn Metrics</h3>
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="bg-red-50 dark:bg-red-950/10 rounded-lg p-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Cancelled (30d)</p>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">23</p>
            </div>
            <div className="bg-green-50 dark:bg-green-950/10 rounded-lg p-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">New (30d)</p>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400 mt-1">47</p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/10 rounded-lg p-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Churn Rate</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">4.2%</p>
            </div>
            <div className="bg-purple-50 dark:bg-purple-950/10 rounded-lg p-4">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Net Growth</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400 mt-1">+2.8%</p>
            </div>
          </div>

          <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Recent Changes</h4>
          <div className="space-y-3">
            {recentChanges.map((change) => (
              <div
                key={change.id}
                className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">{change.user}</p>
                  <p className="text-xs text-zinc-400 truncate">{change.email}</p>
                </div>
                <div className="flex items-center gap-3 ml-4">
                  <ActionBadge action={change.action} />
                  <span className="text-xs text-zinc-400">{change.date}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}