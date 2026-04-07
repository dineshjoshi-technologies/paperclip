'use client';

import { useState } from 'react';

interface RevenueDataPoint {
  month: string;
  current: number;
  previous: number;
}

const defaultData: RevenueDataPoint[] = [
  { month: 'Jan', current: 32000, previous: 28000 },
  { month: 'Feb', current: 36000, previous: 30000 },
  { month: 'Mar', current: 34000, previous: 31000 },
  { month: 'Apr', current: 38000, previous: 33000 },
  { month: 'May', current: 42000, previous: 35000 },
  { month: 'Jun', current: 45678, previous: 37000 },
];

function formatCurrency(value: number): string {
  if (value >= 1000) {
    return `$${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`;
  }
  return `$${value}`;
}

export function RevenueChart({ data = defaultData }: { data?: RevenueDataPoint[] }) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const maxVal = Math.max(...data.flatMap((d) => [d.current, d.previous]));
  const chartHeight = 200;
  const padding = { top: 20, bottom: 40, left: 50, right: 20 };
  const width = 600 - padding.left - padding.right;
  const height = chartHeight - padding.top - padding.bottom;

  const getX = (i: number) => padding.left + (i / Math.max(data.length - 1, 1)) * width;
  const getY = (val: number) => padding.top + height - (val / (maxVal * 1.1)) * height;

  const currentPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.current)}`)
    .join(' ');

  const previousPath = data
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.previous)}`)
    .join(' ');

  const currentAreaPath = `${currentPath} L ${getX(data.length - 1)} ${padding.top + height} L ${getX(0)} ${padding.top + height} Z`;

  const yTicks = Array.from({ length: 5 }, (_, i) => {
    const val = (maxVal * 1.1 / 4) * i;
    return { val, y: getY(val) };
  });

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">Revenue Trend</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">6-month revenue comparison</p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-purple-600" />
            <span className="text-zinc-600 dark:text-zinc-400">Current</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
            <span className="text-zinc-600 dark:text-zinc-400">Previous</span>
          </div>
        </div>
      </div>

      {/* Mobile-friendly bar chart */}
      <div className="block lg:hidden">
        <div className="space-y-4">
          {data.map((d) => (
            <div key={d.month} className="space-y-1">
              <div className="flex justify-between text-xs text-zinc-500 dark:text-zinc-400">
                <span>{d.month}</span>
                <span>{formatCurrency(d.current)}</span>
              </div>
              <div className="h-2 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple-600 to-red-500 rounded-full transition-all"
                  style={{ width: `${(d.current / maxVal) * 100}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Desktop line chart */}
      <div className="hidden lg:block">
        <svg viewBox={`0 0 600 ${chartHeight}`} className="w-full">
          {/* Grid lines */}
          {yTicks.map((tick, i) => (
            <g key={i}>
              <line
                x1={padding.left}
                y1={tick.y}
                x2={600 - padding.right}
                y2={tick.y}
                stroke="currentColor"
                strokeOpacity="0.1"
                className="text-zinc-400"
              />
              <text
                x={padding.left - 10}
                y={tick.y + 4}
                textAnchor="end"
                className="text-zinc-400 fill-current"
                fontSize="11"
              >
                {formatCurrency(tick.val)}
              </text>
            </g>
          ))}

          {/* Area fill */}
          <path
            d={currentAreaPath}
            fill="url(#purpleGradient)"
            opacity="0.15"
          />

          {/* Previous line */}
          <path
            d={previousPath}
            fill="none"
            stroke="rgb(212, 212, 216)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />

          {/* Current line */}
          <path
            d={currentPath}
            fill="none"
            stroke="rgb(147, 51, 234)"
            strokeWidth="2.5"
          />

          {/* X labels */}
          {data.map((d, i) => (
            <g key={d.month}>
              <text
                x={getX(i)}
                y={padding.top + height + 25}
                textAnchor="middle"
                className="text-zinc-400 fill-current"
                fontSize="11"
              >
                {d.month}
              </text>

              {/* Data points */}
              <circle
                cx={getX(i)}
                cy={getY(d.current)}
                r="4"
                fill="rgb(147, 51, 234)"
                className="cursor-pointer"
                onMouseEnter={() => setActiveTooltip(d.month)}
                onMouseLeave={() => setActiveTooltip(null)}
              />
              <circle
                cx={getX(i)}
                cy={getY(d.current)}
                r="6"
                fill="transparent"
                className="cursor-pointer"
                onMouseEnter={() => setActiveTooltip(d.month)}
                onMouseLeave={() => setActiveTooltip(null)}
              />
            </g>
          ))}

          {/* Gradient definition */}
          <defs>
            <linearGradient id="purpleGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgb(147, 51, 234)" />
              <stop offset="100%" stopColor="rgb(147, 51, 234)" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>

        {/* Tooltip */}
        {activeTooltip && (
          <div className="text-center mb-2 p-2 bg-zinc-800 dark:bg-zinc-700 text-white rounded-lg text-sm inline-block">
            {(() => {
              const point = data.find((d) => d.month === activeTooltip);
              if (!point) return null;
              return (
                <span>
                  <strong>{point.month}</strong>: ${point.current.toLocaleString()}
                </span>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}