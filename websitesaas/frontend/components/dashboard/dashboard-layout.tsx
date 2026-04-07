interface DashboardLayoutProps {
  header: React.ReactNode
  sidebar: React.ReactNode
  children: React.ReactNode
}

export function DashboardLayout({ header, sidebar, children }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {header}
      <div className="flex">
        <div className="w-56 hidden lg:block flex-shrink-0">
          {sidebar}
        </div>
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  )
}
