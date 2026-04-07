'use client';

import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'User' | 'Developer' | 'Designer' | 'Support';
  status: 'Active' | 'Suspended' | 'Trial';
  websites: number;
  subscription: 'Free' | 'Basic' | 'Pro' | 'Enterprise';
  createdAt: string;
}

const mockUsers: User[] = [
  { id: '1', name: 'John Doe', email: 'john@acmecorp.com', role: 'Admin', status: 'Active', websites: 8, subscription: 'Enterprise', createdAt: '2023-03-15' },
  { id: '2', name: 'Jane Smith', email: 'jane@designstudio.io', role: 'Designer', status: 'Active', websites: 5, subscription: 'Pro', createdAt: '2023-06-22' },
  { id: '3', name: 'Alex Johnson', email: 'alex@techstart.com', role: 'Developer', status: 'Trial', websites: 2, subscription: 'Basic', createdAt: '2024-01-10' },
  { id: '4', name: 'Maria Garcia', email: 'maria@freelance.dev', role: 'User', status: 'Active', websites: 3, subscription: 'Basic', createdAt: '2023-09-05' },
  { id: '5', name: 'David Kim', email: 'david@enterprise.org', role: 'Support', status: 'Active', websites: 12, subscription: 'Enterprise', createdAt: '2023-01-20' },
  { id: '6', name: 'Sarah Chen', email: 'sarah@startup.co', role: 'Developer', status: 'Suspended', websites: 1, subscription: 'Free', createdAt: '2024-02-14' },
  { id: '7', name: 'Michael Brown', email: 'mike@agency.net', role: 'Admin', status: 'Active', websites: 6, subscription: 'Pro', createdAt: '2023-11-01' },
  { id: '8', name: 'Emily Watson', email: 'emily@personal.com', role: 'User', status: 'Trial', websites: 1, subscription: 'Basic', createdAt: '2024-03-08' },
];

const ITEMS_PER_PAGE = 5;

function RoleBadge({ role }: { role: User['role'] }) {
  const styles: Record<User['role'], string> = {
    Admin: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    User: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Developer: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Designer: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
    Support: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  };
  return <span className={`${styles[role]} rounded-full text-xs font-medium px-2.5 py-0.5`}>{role}</span>;
}

function StatusBadge({ status }: { status: User['status'] }) {
  const styles: Record<User['status'], string> = {
    Active: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    Suspended: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    Trial: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };
  return <span className={`${styles[status]} rounded-full text-xs font-medium px-2.5 py-0.5`}>{status}</span>;
}

function SubscriptionBadge({ tier }: { tier: User['subscription'] }) {
  const styles: Record<User['subscription'], string> = {
    Free: 'bg-zinc-100 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300',
    Basic: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Pro: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Enterprise: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  };
  return <span className={`${styles[tier]} rounded-full text-xs font-medium px-2.5 py-0.5`}>{tier}</span>;
}

export function UserManagement() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = mockUsers.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
  const paginated = filtered.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="p-6 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">User Management</h3>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{filtered.length} total users</p>
          </div>
          <div className="relative w-full sm:w-80">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search users..."
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 text-sm placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-zinc-500 dark:text-zinc-400 border-b border-zinc-200 dark:border-zinc-800">
              <th className="px-6 py-3 font-medium">User</th>
              <th className="px-6 py-3 font-medium">Email</th>
              <th className="px-6 py-3 font-medium">Role</th>
              <th className="px-6 py-3 font-medium">Status</th>
              <th className="px-6 py-3 font-medium text-center">Websites</th>
              <th className="px-6 py-3 font-medium">Subscription</th>
              <th className="px-6 py-3 font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map((user, idx) => (
              <tr
                key={user.id}
                className={`border-b border-zinc-100 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors ${
                  idx % 2 === 0 ? '' : 'bg-zinc-50/50 dark:bg-zinc-800/20'
                }`}
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-red-500 flex items-center justify-center">
                      <span className="text-white text-xs font-semibold">{user.name.split(' ').map((n) => n[0]).join('')}</span>
                    </div>
                    <span className="font-medium text-zinc-900 dark:text-zinc-50">{user.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">{user.email}</td>
                <td className="px-6 py-4"><RoleBadge role={user.role} /></td>
                <td className="px-6 py-4"><StatusBadge status={user.status} /></td>
                <td className="px-6 py-4 text-center font-medium text-zinc-900 dark:text-zinc-50">{user.websites}</td>
                <td className="px-6 py-4"><SubscriptionBadge tier={user.subscription} /></td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2">
                    <button className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400" aria-label="View user">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-700 text-zinc-500 dark:text-zinc-400" aria-label="Edit user">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    <button className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-zinc-500 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400" aria-label="Suspend user">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-zinc-200 dark:border-zinc-800">
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Showing {(page - 1) * ITEMS_PER_PAGE + 1} to {Math.min(page * ITEMS_PER_PAGE, filtered.length)} of {filtered.length}
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                onClick={() => setPage(i + 1)}
                className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                  page === i + 1
                    ? 'bg-purple-600 text-white'
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="px-3 py-1.5 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}