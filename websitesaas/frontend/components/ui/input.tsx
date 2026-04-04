import { type InputHTMLAttributes, forwardRef } from 'react'

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className = '', error, type = 'text', ...props }, ref) => (
    <div className="w-full">
      <input
        type={type}
        ref={ref}
        className={`w-full h-10 px-3 rounded-lg border bg-transparent text-sm transition-colors
          placeholder:text-zinc-400 dark:placeholder:text-zinc-500
          focus:outline-none focus:ring-2 focus:ring-zinc-400 focus:ring-offset-2
          disabled:opacity-50 disabled:pointer-events-none
          ${error
            ? 'border-red-500 focus:ring-red-400'
            : 'border-zinc-300 dark:border-zinc-700 focus:border-zinc-400'
          }
          ${className}`}
        {...props}
      />
      {error && <p className="mt-1 text-xs text-red-500">{error}</p>}
    </div>
  )
)
Input.displayName = 'Input'

export { Input }
