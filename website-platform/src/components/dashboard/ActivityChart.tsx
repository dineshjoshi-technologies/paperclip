'use client';

interface ActivityChartProps {
  data?: { label: string; value: number }[];
}

const defaultData = [
  { label: 'Mon', value: 65 },
  { label: 'Tue', value: 45 },
  { label: 'Wed', value: 78 },
  { label: 'Thu', value: 52 },
  { label: 'Fri', value: 89 },
  { label: 'Sat', value: 34 },
  { label: 'Sun', value: 56 },
];

export function ActivityChart({ data = defaultData }: ActivityChartProps) {
  const maxVal = Math.max(...data.map((d) => d.value));

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-6">Weekly Activity</h3>
      <div className="flex items-end gap-2 h-48">
        {data.map((item, i) => {
          const heightPct = (item.value / maxVal) * 100;
          return (
            <div key={item.label} className="flex-1 flex flex-col items-center gap-2">
              <div className="w-full relative flex items-end justify-center" style={{ height: '160px' }}>
                <div
                  className={`w-full rounded-t-md transition-all duration-500 ${
                    i === data.length - 2
                      ? 'bg-gradient-to-t from-blue-600 to-blue-400'
                      : 'bg-zinc-200 dark:bg-zinc-700 hover:bg-zinc-300 dark:hover:bg-zinc-600'
                  }`}
                  style={{ height: `${heightPct}%` }}
                />
              </div>
              <span className="text-xs text-zinc-500 dark:text-zinc-400">{item.label}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
