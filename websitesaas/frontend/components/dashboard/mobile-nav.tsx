'use client'

import { useState, type ReactNode } from 'react'
import { Menu, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface MobileNavProps {
  open: boolean
  onToggle: () => void
  children: ReactNode
}

export function MobileNav({ open, onToggle, children }: MobileNavProps) {
  return (
    <>
      <button
        onClick={onToggle}
        className="lg:hidden fixed top-4 left-4 z-50 h-9 w-9 flex items-center justify-center rounded-md border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950"
        aria-label={open ? 'Close navigation' : 'Open navigation'}
      >
        {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
      </button>

      {open && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/40"
          onClick={onToggle}
        />
      )}

      <aside
        className={cn(
          'lg:hidden fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-zinc-950 border-r border-zinc-200 dark:border-zinc-800 transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="pt-14">
          {children}
        </div>
      </aside>
    </>
  )
}
