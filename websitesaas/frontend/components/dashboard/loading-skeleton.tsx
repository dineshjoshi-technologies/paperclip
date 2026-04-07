import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface LoadingSkeletonProps {
  variant?: 'metric' | 'chart' | 'list' | 'table-row'
  className?: string
  count?: number
}

export function LoadingSkeleton({ variant = 'metric', className = '', count = 1 }: LoadingSkeletonProps) {
  if (variant === 'metric') {
    return (
      <Card className={cn('p-6', className)}>
        <div className="flex items-center justify-between mb-3">
          <div className="h-4 w-24 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
          <div className="h-8 w-8 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        </div>
        <div className="h-7 w-20 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
        <div className="h-3 w-32 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mt-3" />
      </Card>
    )
  }

  if (variant === 'chart') {
    return (
      <Card className={cn('p-6', className)}>
        <div className="h-5 w-40 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-2" />
        <div className="h-3 w-56 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse mb-6" />
        <div className="h-64 rounded-lg bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      </Card>
    )
  }

  if (variant === 'list') {
    return (
      <Card className={cn('p-6', className)}>
        <div className="space-y-4">
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="h-2 w-2 rounded-full bg-zinc-200 dark:bg-zinc-800 animate-pulse mt-2" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-3/4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
                <div className="h-3 w-1/3 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </Card>
    )
  }

  return (
    <div className={cn('flex items-center gap-3 py-2 border-b border-zinc-100 dark:border-zinc-800', className)}>
      <div className="h-4 w-4 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      <div className="flex-1 h-4 w-1/2 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
      <div className="h-4 w-16 rounded bg-zinc-200 dark:bg-zinc-800 animate-pulse" />
    </div>
  )
}
