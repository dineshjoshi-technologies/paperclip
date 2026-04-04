import { type SelectHTMLAttributes, forwardRef } from 'react'

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  options: { value: string; label: string }[]
  error?: string
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className = '', options, error, ...props }, ref) => (
    <div className="w-full">
      <select
        ref={ref}
        className={`w-full h-10 px-3 rounded-lg border bg-transparent text-sm transition-colors
          focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2
          disabled:opacity-50 disabled:pointer-events-none
          ${error
            ? 'border-red-500 focus:ring-red-400'
            : 'border-zinc-300 dark:border-zinc-700 focus:border-zinc-400'
          }
          ${className}`}
        {...props}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
)
Select.displayName = 'Select'

export { Select }
