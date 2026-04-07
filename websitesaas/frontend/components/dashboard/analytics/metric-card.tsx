import { type LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

interface MetricCardProps {
  title: string
  value: string
  change?: string
  trend?: 'up' | 'down' | 'neutral'
  icon: LucideIcon
  color?: string
  bgColor?: string
  className?: string
}

export function MetricCard({
  title,
  value,
  change,
  trend = 'neutral',
  icon: Icon,
  color = 'text-blue-600',
  bgColor = 'bg-blue-100 dark:bg-blue-900/30',
  className = '',
}: MetricCardProps) {
  return (
    <Card className={cn('hover:shadow-md transition-shadow', className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardDescription className="text-sm">{title}</CardDescription>
          <div className={cn('p-2 rounded-lg', bgColor)}>
            <Icon className={cn('h-4 w-4', color)} />
          </div>
        </div>
        <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-50 mt-1">
          {value}
        </p>
      </CardHeader>
      {change && (
        <CardContent>
          <div className={cn(
            'flex items-center gap-1 text-sm',
            trend === 'up' ? 'text-green-600 dark:text-green-400' :
            trend === 'down' ? 'text-red-600 dark:text-red-400' :
            'text-zinc-500 dark:text-zinc-400',
          )}>
            {trend === 'up' ? (
              <ArrowUpRight className="h-3 w-3" />
            ) : trend === 'down' ? (
              <ArrowDownRight className="h-3 w-3" />
            ) : null}
            <span>{change}</span>
            <span className="text-zinc-500 dark:text-zinc-400">vs last month</span>
          </div>
        </CardContent>
      )}
    </Card>
  )
}
