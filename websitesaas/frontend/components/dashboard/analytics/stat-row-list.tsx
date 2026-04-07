import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface StatRow {
  label: string
  value: string
  icon: LucideIcon
  color?: string
}

interface StatRowListProps {
  stats: StatRow[]
  title?: string
  description?: string
  className?: string
}

export function StatRowList({
  stats,
  title = 'Key Metrics',
  description = 'Platform health indicators',
  className = '',
}: StatRowListProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800 last:border-0"
            >
              <div className="flex items-center gap-3">
                <stat.icon className={cn('h-4 w-4', stat.color || 'text-zinc-500')} />
                <span className="text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</span>
              </div>
              <span className="font-semibold text-zinc-900 dark:text-zinc-50">{stat.value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
