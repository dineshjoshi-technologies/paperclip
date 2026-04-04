import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface DashboardHeaderProps {
  userName?: string
}

export function DashboardHeader({ userName }: DashboardHeaderProps) {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="font-bold text-lg text-zinc-900 dark:text-zinc-50">
            DJ Technologies
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link href="/dashboard" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              Websites
            </Link>
            <Link href="/dashboard/templates" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
              Templates
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          {userName && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:inline">
              {userName}
            </span>
          )}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Sign Out</Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
