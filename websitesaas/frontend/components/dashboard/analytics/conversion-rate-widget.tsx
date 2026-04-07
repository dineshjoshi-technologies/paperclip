'use client'

import { useState, useMemo, Suspense } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { TrendingUp, ArrowDown, AlertCircle, Target } from 'lucide-react'
import { LoadingSkeleton } from '@/components/dashboard/loading-skeleton'

interface FunnelStep {
  name: string
  value: number
  color: string
}

interface ConversionRateWidgetProps {
  funnelSteps: FunnelStep[]
  trends?: { month: string; rate: number }[]
  title?: string
  description?: string
  className?: string
}

const defaultColors = ['#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#c084fc', '#e879f9']

export function ConversionRateWidget({
  funnelSteps,
  trends = [],
  title = 'Conversion Funnel',
  description = 'Visitor to customer conversion pipeline',
  className = '',
}: ConversionRateWidgetProps) {
  const [view, setView] = useState<'funnel' | 'bar' | 'trend'>('funnel')

  const overallRate = useMemo(() => {
    if (funnelSteps.length === 0) return '0%'
    const top = funnelSteps[0].value
    const bottom = funnelSteps[funnelSteps.length - 1].value
    return top === 0 ? '0%' : ((bottom / top) * 100).toFixed(1) + '%'
  }, [funnelSteps])

  const stepRates = useMemo(() => {
    return funnelSteps.map((step, index) => {
      if (index === 0) return { step: step.name, rate: 100, value: step.value }
      const prev = funnelSteps[index - 1].value
      return { step: step.name, rate: prev === 0 ? 0 : (step.value / prev) * 100, value: step.value }
    })
  }, [funnelSteps])

  const biggestDrop = useMemo(() => {
    let maxDrop = { step: '', drop: 0 }
    for (let i = 1; i < funnelSteps.length; i++) {
      const drop = ((funnelSteps[i - 1].value - funnelSteps[i].value) / funnelSteps[i - 1].value) * 100
      if (drop > maxDrop.drop) maxDrop = { step: funnelSteps[i].name, drop }
    }
    return maxDrop.drop > 0 ? maxDrop : null
  }, [funnelSteps])

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle>{title}</CardTitle>
            {description && <CardDescription>{description}</CardDescription>}
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">{overallRate}</p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">Overall Conversion</p>
          </div>
        </div>

        <div className="flex items-center gap-1 mt-3">
          {(['funnel', 'bar', 'trend'] as const).map((v) => (
            <button key={v} onClick={() => setView(v)}
              className={cn('px-2.5 py-1 text-xs rounded-md transition-colors capitalize',
                view === v ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-zinc-800 dark:text-zinc-400',
              )}>
              {v}
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        {biggestDrop && biggestDrop.drop > 30 && (
          <div className="flex items-center gap-2 p-3 mb-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
            <AlertCircle className="h-4 w-4 text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-sm text-amber-700 dark:text-amber-300">
              Biggest drop-off: <span className="font-medium">{biggestDrop.step}</span> ({biggestDrop.drop.toFixed(1)}% loss)
            </p>
          </div>
        )}

        <Suspense fallback={<LoadingSkeleton variant="chart" />}>
          {view === 'funnel' && (
            <div className="space-y-4">
              {funnelSteps.map((step, index) => {
                const width = funnelSteps[0].value === 0 ? 100 : (step.value / funnelSteps[0].value) * 100
                const color = step.color || defaultColors[index % defaultColors.length]

                return (
                  <div key={step.name} className="relative">
                    <div className="h-12 rounded-lg flex items-center px-4 transition-all duration-300"
                      style={{ width: `${Math.max(width, 15)}%`, backgroundColor: color + '33', borderLeft: `3px solid ${color}` }}>
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <Target className="h-4 w-4" style={{ color }} />
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{step.name}</span>
                        </div>
                        <span className="text-sm font-semibold" style={{ color }}>{step.value.toLocaleString()}</span>
                      </div>
                    </div>
                    {index > 0 && (
                      <div className="flex items-center gap-1 ml-2 mt-1 mb-1">
                        <ArrowDown className="h-3 w-3 text-zinc-400" />
                        <span className="text-xs text-zinc-500 dark:text-zinc-400">
                          {stepRates[index]?.rate.toFixed(1)}% from previous
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {view === 'bar' && (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stepRates}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                  <XAxis dataKey="step" className="stroke-zinc-500" fontSize={11} interval={0} tick={{ angle: -15, textAnchor: 'end' }} />
                  <YAxis className="stroke-zinc-500" fontSize={11} unit="%" />
                  <Tooltip
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Conversion Rate']}
                    contentStyle={{ backgroundColor: 'var(--background, #fff)', border: '1px solid #e4e4e7', borderRadius: '8px', color: '#171717' }}
                  />
                  <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                    {stepRates.map((_, index) => (
                      <Cell key={index} fill={defaultColors[index % defaultColors.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {view === 'trend' && (
            <div className="h-64">
              {trends.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-zinc-400 dark:text-zinc-500 text-sm">
                  <TrendingUp className="h-8 w-8 mb-2 opacity-50" />
                  <p>Trend data not available</p>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trends}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-zinc-200 dark:stroke-zinc-800" />
                    <XAxis dataKey="month" className="stroke-zinc-500" fontSize={11} />
                    <YAxis className="stroke-zinc-500" fontSize={11} unit="%" />
                    <Tooltip
                      formatter={(value) => [`${Number(value).toFixed(1)}%`, 'Conversion Rate']}
                      contentStyle={{ backgroundColor: 'var(--background, #fff)', border: '1px solid #e4e4e7', borderRadius: '8px', color: '#171717' }}
                    />
                    <Bar dataKey="rate" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          )}
        </Suspense>

        <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {stepRates.map((s, i) => (
              <div key={s.step} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: funnelSteps[i]?.color || defaultColors[i % defaultColors.length] }} />
                <div className="min-w-0">
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate">{s.step}</p>
                  <p className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{s.rate.toFixed(1)}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}