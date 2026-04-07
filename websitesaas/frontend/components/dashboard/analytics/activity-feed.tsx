import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { type LucideIcon } from 'lucide-react'

interface ActivityFeedProps {
  activities: {
    id: number | string
    user: string
    action: string
    time: string
    type: 'create' | 'upgrade' | 'publish' | 'register' | 'cancel' | string
  }[]
  title?: string
  description?: string
  className?: string
}

const activityTypeColors: Record<string, string> = {
  create: 'bg-blue-500',
  upgrade: 'bg-green-500',
  publish: 'bg-purple-500',
  register: 'bg-amber-500',
  cancel: 'bg-red-500',
}

export function ActivityFeed({
  activities,
  title = 'Recent Activity',
  description = 'Latest platform events',
  className = '',
}: ActivityFeedProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start gap-3">
              <div className={cn(
                'w-2 h-2 rounded-full mt-2',
                activityTypeColors[activity.type] || 'bg-zinc-400',
              )} />
              <div className="flex-1 min-w-0">
                <p className="text-sm text-zinc-900 dark:text-zinc-50">
                  <span className="font-medium">{activity.user}</span>
                  {' '}{activity.action}
                </p>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
