'use client';

import { useState } from 'react';

const mockWebsites = [
  { id: 1, name: 'GreenLeaf Cafe', url: 'greenleaf.djtech.app', status: 'published', date: '2 hours ago' },
  { id: 2, name: 'TechStart Portfolio', url: 'techstart.djtech.app', status: 'draft', date: '1 day ago' },
  { id: 3, name: 'DigitalFlow Agency', url: 'digitalflow.djtech.app', status: 'published', date: '3 days ago' },
  { id: 4, name: 'FitZone Gym', url: 'fitzone.djtech.app', status: 'published', date: '1 week ago' },
];

export function RecentWebsites() {
  const [websites] = useState(mockWebsites);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">Recent Websites</h3>
      <div className="space-y-3">
        {websites.map((site) => (
          <div
            key={site.id}
            className="flex items-center justify-between p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center text-sm font-bold text-blue-600 dark:text-blue-400">
                {site.name.charAt(0)}
              </div>
              <div>
                <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{site.name}</p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{site.url}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span
                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                  site.status === 'published'
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                }`}
              >
                {site.status}
              </span>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{site.date}</span>
              <button
                className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors"
                aria-label={`Edit ${site.name}`}
              >
                <svg className="w-4 h-4 text-zinc-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
