import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth-context'
import { LogOut } from 'lucide-react'

export function AdminHeader() {
  const { user, logout } = useAuth()

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-zinc-950/80 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <h1 className="font-semibold text-zinc-900 dark:text-zinc-50">
            Admin Dashboard
          </h1>
        </div>
        <div className="flex items-center gap-3">
          {user && (
            <span className="text-sm text-zinc-500 dark:text-zinc-400 hidden sm:inline">
              {user.name}
            </span>
          )}
          <Button variant="ghost" size="sm" onClick={logout} asChild>
            <Link href="/auth/login">
              <LogOut className="h-4 w-4 mr-1" />
              Sign Out
            </Link>
          </Button>
        </div>
      </div>
    </header>
  )
}
