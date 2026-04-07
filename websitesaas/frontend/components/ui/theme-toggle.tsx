'use client'

import { Moon, Sun, Monitor } from 'lucide-react'
import { useTheme, type Theme } from '@/lib/theme-context'
import { cn } from '@/lib/utils'

interface ThemeToggleProps {
  className?: string
  size?: 'sm' | 'md'
}

export function ThemeToggle({ className = '', size = 'md' }: ThemeToggleProps) {
  const { theme, setTheme } = useTheme()
  const sizeClasses = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'

  const toggleNext = () => {
    const next: Record<Theme, Theme> = { light: 'dark', dark: 'system', system: 'light' }
    setTheme(next[theme])
  }

  return (
    <button
      onClick={toggleNext}
      className={cn(
        'inline-flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors',
        sizeClasses,
        className,
      )}
      aria-label={`Current theme: ${theme}. Click to change.`}
      title={`Theme: ${theme}`}
    >
      {theme === 'light' && <Sun className="h-4 w-4 text-amber-500" />}
      {theme === 'dark' && <Moon className="h-4 w-4 text-zinc-700 dark:text-zinc-300" />}
      {theme === 'system' && <Monitor className="h-4 w-4 text-zinc-500" />}
    </button>
  )
}
