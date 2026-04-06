'use client'

import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import { COMPONENT_CATEGORIES, type ComponentType, getTemplate } from './types'
import { cn } from '@/lib/utils'

interface ComponentPaletteProps {
  onAddComponent: (type: ComponentType) => void
  className?: string
}

export function ComponentPalette({ onAddComponent, className }: ComponentPaletteProps) {
  const [search, setSearch] = useState('')
  const [openCategory, setOpenCategory] = useState<string | null>('Basic')

  const filteredCategories = useMemo(() => {
    if (!search.trim()) return COMPONENT_CATEGORIES

    const query = search.toLowerCase()
    return COMPONENT_CATEGORIES.map((cat) => ({
      ...cat,
      types: cat.types.filter((type) => {
        const template = getTemplate(type)
        return (
          template.label.toLowerCase().includes(query) ||
          template.description.toLowerCase().includes(query) ||
          type.toLowerCase().includes(query)
        )
      }),
    })).filter((cat) => cat.types.length > 0)
  }, [search])

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <div className="p-3 border-b border-zinc-200 dark:border-zinc-800">
        <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
          Components
        </h3>
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
          <input
            type="text"
            placeholder="Search components..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-8 pl-8 pr-3 text-xs rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            aria-label="Search components"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-2">
        {filteredCategories.length === 0 ? (
          <p className="text-xs text-zinc-400 text-center py-4">No components found</p>
        ) : (
          filteredCategories.map((category) => (
            <div key={category.label} className="mb-1">
              <button
                onClick={() => setOpenCategory(openCategory === category.label ? null : category.label)}
                className="w-full flex items-center justify-between px-2 py-1.5 text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300 rounded"
                aria-expanded={openCategory === category.label}
              >
                <span>{category.label}</span>
                <svg
                  className={cn('h-3 w-3 transition-transform', openCategory === category.label ? 'rotate-180' : '')}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openCategory === category.label && (
                <div className="grid grid-cols-2 gap-1.5 px-1 py-1">
                  {category.types.map((type) => {
                    const template = getTemplate(type)
                    const Icon = template.icon
                    return (
                      <button
                        key={type}
                        onClick={() => onAddComponent(type)}
                        className="flex flex-col items-center gap-1 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left group"
                        title={template.description}
                      >
                        <Icon className="h-4 w-4 text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:group-hover:text-zinc-300" />
                        <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate w-full text-center">
                          {template.label}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
