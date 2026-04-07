'use client';

export type ViewportSize = 'desktop' | 'tablet' | 'mobile';

interface ViewportSwitcherProps {
  value: ViewportSize;
  onChange: (size: ViewportSize) => void;
}

export function ViewportSwitcher({ value, onChange }: ViewportSwitcherProps) {
  const viewports: { size: ViewportSize; label: string; icon: React.ReactNode }[] = [
    {
      size: 'desktop',
      label: 'Desktop',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      size: 'tablet',
      label: 'Tablet',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      size: 'mobile',
      label: 'Mobile',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-lg p-1 gap-1">
      {viewports.map(({ size, label, icon }) => (
        <button
          key={size}
          onClick={() => onChange(size)}
          className={`p-2 rounded-md transition-all ${
            value === size
              ? 'bg-white dark:bg-zinc-700 text-blue-600 dark:text-blue-400 shadow-sm'
              : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
          title={label}
          aria-label={`Switch to ${label} viewport`}
        >
          {icon}
        </button>
      ))}
    </div>
  );
}
