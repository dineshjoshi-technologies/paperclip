'use client';

interface AnalyticsCardProps {
  title: string;
  value: string;
  change: number;
  changeLabel?: string;
  icon: React.ReactNode;
}

export function AnalyticsCard({ title, value, change, changeLabel = 'vs last month', icon }: AnalyticsCardProps) {
  const isPositive = change >= 0;

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">{title}</span>
        <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-950/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
          {icon}
        </div>
      </div>
      <div className="flex items-end justify-between">
        <div>
          <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
          <div className="flex items-center gap-1.5 mt-2">
            <span className={`text-sm font-medium ${isPositive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {isPositive ? '+' : ''}{change}%
            </span>
            <span className="text-xs text-zinc-500 dark:text-zinc-400">{changeLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
