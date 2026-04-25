'use client'

import { AdminGuard, AdminSidebar, AdminHeader } from '@/components/admin'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AdminGuard>
      <a
        href="#admin-main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-white focus:rounded-md"
      >
        Skip to main content
      </a>
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main id="admin-main-content" tabIndex={-1} className="flex-1 p-6 focus:outline-none">
            {children}
          </main>
        </div>
      </div>
    </AdminGuard>
  )
}
