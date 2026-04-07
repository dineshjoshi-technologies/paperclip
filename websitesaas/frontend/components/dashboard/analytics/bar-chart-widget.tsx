import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

interface BarChartWidgetProps {
  data: { day: string; value: number }[]
  dataKey?: string
  title?: string
  description?: string
  fillColor?: string
  className?: string
}

export function BarChartWidget({
  data,
  dataKey = 'value',
  title = 'Weekly Activity',
  description = 'Signups and engagement by day',
  fillColor = '#8b5cf6',
  className = '',
}: BarChartWidgetProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <div>
          <CardTitle className="text-base">{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
              <XAxis dataKey="day" className="stroke-zinc-500" fontSize={12} />
              <YAxis className="stroke-zinc-500" fontSize={12} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'var(--background, #fff)',
                  border: '1px solid #e4e4e7',
                  borderRadius: '8px',
                  color: 'var(--foreground, #171717)',
                }}
              />
              <Bar dataKey={dataKey} fill={fillColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
