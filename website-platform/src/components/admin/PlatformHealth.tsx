'use client';

import { useState, useEffect } from 'react';

interface ServiceStatus {
  name: string;
  status: 'operational' | 'degraded' | 'down';
  uptime: string;
}

interface ErrorLog {
  id: string;
  severity: 'critical' | 'warning';
  message: string;
  timestamp: string;
  source: string;
}

const serviceStatuses: ServiceStatus[] = [
  { name: 'API Server', status: 'operational', uptime: '99.99%' },
  { name: 'Web App', status: 'operational', uptime: '99.98%' },
  { name: 'Database', status: 'operational', uptime: '99.99%' },
  { name: 'CDN', status: 'operational', uptime: '99.97%' },
  { name: 'Auth Service', status: 'degraded', uptime: '98.50%' },
  { name: 'Email Service', status: 'operational', uptime: '99.95%' },
  { name: 'Background Jobs', status: 'operational', uptime: '99.90%' },
  { name: 'Payment Gateway', status: 'operational', uptime: '99.99%' },
];

const errorLogs: ErrorLog[] = [
  { id: '1', severity: 'critical', message: 'Database connection timeout after 30s', timestamp: '12m ago', source: 'PostgreSQL Primary' },
  { id: '2', severity: 'critical', message: 'Payment webhook failed: 502 Bad Gateway', timestamp: '45m ago', source: 'Payment Gateway' },
  { id: '3', severity: 'critical', message: 'Redis memory usage exceeded 95% threshold', timestamp: '2h ago', source: 'Redis Cache' },
  { id: '4', severity: 'warning', message: 'API response time > 2s on /api/websites endpoint', timestamp: '3h ago', source: 'API Server' },
  { id: '5', severity: 'warning', message: 'SSL certificate expires in 14 days for staging.djtech.com', timestamp: '6h ago', source: 'CDN' },
];

function ProgressBar({ value, color, label }: { value: number; color: string; label?: string }) {
  const barColor =
    value > 90
      ? 'bg-red-500'
      : value > 70
      ? 'bg-yellow-500'
      : color;

  return (
    <div className="space-y-2">
      {label && (
        <div className="flex justify-between text-sm">
          <span className="text-zinc-600 dark:text-zinc-400">{label}</span>
          <span className="font-semibold text-zinc-900 dark:text-zinc-50">{value}%</span>
        </div>
      )}
      <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${barColor}`}
          style={{ width: `${Math.min(value, 100)}%` }}
        />
      </div>
    </div>
  );
}

function StatusIndicator({ status }: { status: ServiceStatus['status'] }) {
  const colors: Record<ServiceStatus['status'], string> = {
    operational: 'bg-green-500',
    degraded: 'bg-yellow-500',
    down: 'bg-red-500',
  };
  const labels: Record<ServiceStatus['status'], string> = {
    operational: 'Operational',
    degraded: 'Degraded',
    down: 'Down',
  };
  return (
    <div className="flex items-center gap-2">
      <span className={`relative flex h-2.5 w-2.5`}>
        <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${colors[status]}`} />
        <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${colors[status]}`} />
      </span>
      <span className="text-xs text-zinc-600 dark:text-zinc-400">{labels[status]}</span>
    </div>
  );
}

export function PlatformHealth() {
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastRefresh(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastRefresh(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const criticalLogs = errorLogs.filter((l) => l.severity === 'critical');
  const warningLogs = errorLogs.filter((l) => l.severity === 'warning');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Platform Health</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Last updated: {lastRefresh.toLocaleTimeString()}
            <span className="ml-2 inline-block h-2 w-2 rounded-full bg-green-500 animate-pulse" />
          </p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isRefreshing}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors disabled:opacity-40"
        >
          <svg className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {isRefreshing ? 'Refreshing...' : 'Refresh'}
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">CPU Usage</span>
          <div className="mt-4">
            <ProgressBar value={67} color="bg-blue-500" />
          </div>
          <p className="text-xs text-zinc-400 mt-2">4 cores, 2.8GHz avg</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Memory</span>
          <div className="mt-4">
            <ProgressBar value={74} color="bg-purple-500" />
          </div>
          <p className="text-xs text-zinc-400 mt-2">12.1 GB / 16 GB used</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">Disk Usage</span>
          <div className="mt-4">
            <ProgressBar value={55} color="bg-green-500" />
          </div>
          <p className="text-xs text-zinc-400 mt-2">275 GB / 500 GB used</p>
        </div>
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">DB Connections</span>
          <div className="mt-4">
            <ProgressBar value={48} color="bg-yellow-500" />
          </div>
          <p className="text-xs text-zinc-400 mt-2">48 / 100 active connections</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Service Status</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">Real-time service health monitoring</p>
          <div className="space-y-4">
            {serviceStatuses.map((service) => (
              <div
                key={service.name}
                className="flex items-center justify-between py-3 border-b border-zinc-100 dark:border-zinc-800 last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <StatusIndicator status={service.status} />
                  <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{service.name}</span>
                </div>
                <span className="text-xs text-zinc-500 dark:text-zinc-400">{service.uptime} uptime</span>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center gap-2">
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-green-500" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {serviceStatuses.filter((s) => s.status === 'operational').length} Operational
              </span>
            </div>
            <span className="text-zinc-300 dark:text-zinc-700">|</span>
            <div className="flex gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-yellow-500" />
              <span className="text-xs text-zinc-500 dark:text-zinc-400">
                {serviceStatuses.filter((s) => s.status === 'degraded').length} Degraded
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-1">Recent Error Logs</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
            <span className="text-red-500 font-semibold">{criticalLogs.length}</span> critical,{' '}
            <span className="text-yellow-500 font-semibold">{warningLogs.length}</span> warnings
          </p>

          <div className="space-y-3">
            {criticalLogs.map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-lg bg-red-50 dark:bg-red-950/10 border border-red-200 dark:border-red-900/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded-full text-xs font-medium px-2 py-0.5">
                        Critical
                      </span>
                      <span className="text-xs text-zinc-400">{log.source}</span>
                    </div>
                    <p className="text-sm text-zinc-900 dark:text-zinc-50">{log.message}</p>
                  </div>
                  <span className="text-xs text-zinc-400 whitespace-nowrap ml-3">{log.timestamp}</span>
                </div>
              </div>
            ))}

            {warningLogs.slice(0, 2).map((log) => (
              <div
                key={log.id}
                className="p-4 rounded-lg bg-yellow-50 dark:bg-yellow-950/10 border border-yellow-200 dark:border-yellow-900/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full text-xs font-medium px-2 py-0.5">
                        Warning
                      </span>
                      <span className="text-xs text-zinc-400">{log.source}</span>
                    </div>
                    <p className="text-sm text-zinc-900 dark:text-zinc-50">{log.message}</p>
                  </div>
                  <span className="text-xs text-zinc-400 whitespace-nowrap ml-3">{log.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}