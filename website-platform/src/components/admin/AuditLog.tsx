'use client';

import { useState } from 'react';

interface AuditEntry {
  id: string;
  timestamp: Date;
  user: string;
  action: 'create' | 'update' | 'delete' | 'upgrade';
  entity: string;
  details: string;
}

const mockAuditLog: AuditEntry[] = [
  { id: '1', timestamp: new Date(Date.now() - 1000 * 60 * 12), user: 'admin@djtech.com', action: 'create', entity: 'User', details: 'Created new user: emily@personal.com' },
  { id: '2', timestamp: new Date(Date.now() - 1000 * 60 * 45), user: 'admin@djtech.com', action: 'update', entity: 'Website', details: 'Published website: acmecorp.com' },
  { id: '3', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), user: 'john@acmecorp.com', action: 'upgrade', entity: 'Subscription', details: 'Upgraded from Pro to Enterprise' },
  { id: '4', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 3), user: 'admin@djtech.com', action: 'delete', entity: 'User', details: 'Suspended user: spam@site.xyz' },
  { id: '5', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5), user: 'system', action: 'update', entity: 'Server', details: 'SSL certificate renewed for all domains' },
  { id: '6', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8), user: 'admin@djtech.com', action: 'create', entity: 'Website', details: 'New website registered: startup.co' },
  { id: '7', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 12), user: 'system', action: 'update', entity: 'Server', details: 'Database backup completed successfully' },
  { id: '8', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), user: 'admin@djtech.com', action: 'delete', entity: 'Website', details: 'Archived inactive website: oldsite.com' },
  { id: '9', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 26), user: 'jane@designstudio.io', action: 'update', entity: 'Website', details: 'Updated theme for designstudio.io' },
  { id: '10', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 30), user: 'system', action: 'create', entity: 'Backup', details: 'Weekly automated backup completed' },
  { id: '11', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 36), user: 'mike@agency.net', action: 'upgrade', entity: 'Subscription', details: 'Upgraded from Basic to Pro' },
  { id: '12', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), user: 'admin@djtech.com', action: 'create', entity: 'User', details: 'Created new user: david@enterprise.org' },
];

const ITEMS_PER_PAGE = 8;

function ActionBadge({ action }: { action: string }) {
  const styles: Record<string, string> = {
    create: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    update: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    delete: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    upgrade: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    downgrade: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  };
  return (
    <span className={`${styles[action] || styles.update} rounded-full text-xs font-medium px-2.5 py-0.5 capitalize`}>
      {action}
    </span>
  );
}

function relativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffMin < 1) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay === 1) return 'yesterday';
  return `${diffDay}d ago`;
}

export function AuditLog() {
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [entityFilter, setEntityFilter] = useState<string>('all');
  const [visibleCount, setVisibleCount] = useState(10);

  const filtered = mockAuditLog.filter((entry) => {
    const matchesAction = actionFilter === 'all' || entry.action === actionFilter;
    const matchesEntity = entityFilter === 'all' || entry.entity === entityFilter;
    return matchesAction && matchesEntity;
  });

  const visibleEntries = filtered.slice(0, visibleCount);

  const uniqueActions = Array.from(new Set(mockAuditLog.map((e) => e.action)));
  const uniqueEntities = Array.from(new Set(mockAuditLog.map((e) => e.entity)));

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col gap-4">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Audit Log</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} entries</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <select
              value={actionFilter}
              onChange={(e) => { setActionFilter(e.target.value); setVisibleCount(10); }}
              className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Actions</option>
              {uniqueActions.map((a) => (
                <option key={a} value={a}>{a.charAt(0).toUpperCase() + a.slice(1)}</option>
              ))}
            </select>
            <select
              value={entityFilter}
              onChange={(e) => { setEntityFilter(e.target.value); setVisibleCount(10); }}
              className="flex-1 px-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            >
              <option value="all">All Entities</option>
              {uniqueEntities.map((e) => (
                <option key={e} value={e}>{e}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="p-6">
        <div className="relative space-y-4">
          {/* Vertical timeline line */}
          <div className="absolute left-4 top-2 bottom-2 w-px bg-zinc-200 dark:bg-zinc-800" />

          {visibleEntries.map((entry) => (
            <div key={entry.id} className="relative flex gap-4 pl-8">
              {/* Timeline dot */}
              <div className="absolute left-0 top-1">
                <div
                  className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${
                    entry.action === 'create'
                      ? 'bg-green-50 dark:bg-green-950/10 border-green-500'
                      : entry.action === 'update'
                      ? 'bg-blue-50 dark:bg-blue-950/10 border-blue-500'
                      : 'bg-red-50 dark:bg-red-950/10 border-red-500'
                  }`}
                >
                  {entry.action === 'create' && (
                    <svg className="w-4 h-4 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                  )}
                  {entry.action === 'update' && (
                    <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  )}
                  {entry.action === 'delete' && (
                    <svg className="w-4 h-4 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  )}
                  {entry.action === 'upgrade' && (
                    <svg className="w-4 h-4 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  )}
                </div>
              </div>

              <div className="flex-1 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <ActionBadge action={entry.action} />
                    <span className="text-xs text-zinc-400">{entry.entity}</span>
                  </div>
                  <span className="text-xs text-zinc-400 whitespace-nowrap ml-2">{relativeTime(entry.timestamp)}</span>
                </div>
                <p className="text-sm text-zinc-900 dark:text-zinc-50">{entry.details}</p>
                <p className="text-xs text-zinc-400 mt-1">by {entry.user}</p>
              </div>
            </div>
          ))}
        </div>

        {visibleCount < filtered.length && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setVisibleCount((c) => c + 8)}
              className="px-4 py-2 rounded-lg text-sm font-medium text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
            >
              Load more ({filtered.length - visibleCount} remaining)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}