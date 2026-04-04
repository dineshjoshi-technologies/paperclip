import { type ComponentType, COMPONENT_TEMPLATES, createComponent } from './types'
import { cn } from '@/lib/utils'

interface ComponentPaletteProps {
  onAddComponent: (type: ComponentType) => void
  className?: string
}

export function ComponentPalette({ onAddComponent, className }: ComponentPaletteProps) {
  return (
    <div className={cn('p-4', className)}>
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">
        Components
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {COMPONENT_TEMPLATES.map((template) => (
          <button
            key={template.type}
            onClick={() => onAddComponent(template.type)}
            className="flex flex-col items-center gap-1 p-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-zinc-400 dark:hover:border-zinc-600 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors text-left"
          >
            <span className="text-lg">{template.icon}</span>
            <span className="text-xs text-zinc-600 dark:text-zinc-400 truncate w-full text-center">
              {template.label}
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
