import { type BuilderComponent } from './types'

interface ComponentPropertiesProps {
  component: BuilderComponent | null
  onUpdateConfig: (config: Record<string, unknown>) => void
}

export function ComponentProperties({ component, onUpdateConfig }: ComponentPropertiesProps) {
  if (!component) {
    return (
      <div className="p-4 text-sm text-zinc-500 dark:text-zinc-400">
        Select a component to edit its properties
      </div>
    )
  }

  const entries = Object.entries(component.config)

  return (
    <div className="p-4 space-y-3">
      <h3 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 capitalize">
        {component.type} Properties
      </h3>
      {entries.map(([key, value]) => (
        <div key={key}>
          <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          {typeof value === 'boolean' ? (
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => onUpdateConfig({ ...component.config, [key]: e.target.checked })}
              className="rounded border-zinc-300 dark:border-zinc-700"
            />
          ) : typeof value === 'number' ? (
            <input
              type="number"
              value={value as number}
              onChange={(e) => onUpdateConfig({ ...component.config, [key]: Number(e.target.value) })}
              className="w-full h-8 px-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-transparent"
            />
          ) : typeof value === 'string' && value.length > 60 ? (
            <textarea
              value={value as string}
              onChange={(e) => onUpdateConfig({ ...component.config, [key]: e.target.value })}
              rows={3}
              className="w-full px-2 py-1 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-transparent resize-none"
            />
          ) : (
            <input
              type="text"
              value={value as string}
              onChange={(e) => onUpdateConfig({ ...component.config, [key]: e.target.value })}
              className="w-full h-8 px-2 text-sm rounded border border-zinc-300 dark:border-zinc-700 bg-transparent"
            />
          )}
        </div>
      ))}
    </div>
  )
}
