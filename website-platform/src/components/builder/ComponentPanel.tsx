'use client';

import { useState } from 'react';

interface ComponentItem {
  type: string;
  label: string;
  icon: React.ReactNode;
  category: string;
}

const componentLibrary: ComponentItem[] = [
  {
    type: 'hero',
    label: 'Hero Section',
    category: 'layout',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
      </svg>
    ),
  },
  {
    type: 'features',
    label: 'Features Grid',
    category: 'layout',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    ),
  },
  {
    type: 'cta',
    label: 'Call to Action',
    category: 'layout',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
      </svg>
    ),
  },
  {
    type: 'footer',
    label: 'Footer',
    category: 'layout',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 19h16M4 15h16M4 11h16M4 7h16" />
      </svg>
    ),
  },
  {
    type: 'text',
    label: 'Text Block',
    category: 'content',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h14" />
      </svg>
    ),
  },
];

const categories = [
  { key: 'layout', label: 'Layout' },
  { key: 'content', label: 'Content' },
];

interface ComponentPanelProps {
  onAddComponent: (type: string) => void;
}

export function ComponentPanel({ onAddComponent }: ComponentPanelProps) {
  const [activeCategory, setActiveCategory] = useState('layout');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const filtered = componentLibrary.filter((c) => c.category === activeCategory);

  const handleDragStart = (e: React.DragEvent, type: string) => {
    e.dataTransfer.setData('component-type', type);
    e.dataTransfer.effectAllowed = 'copy';
  };

  return (
    <div className="h-full flex flex-col">
      {/* Panel header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
        <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">Components</h3>
        <div className="flex items-center bg-zinc-100 dark:bg-zinc-800 rounded-md p-0.5">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1 rounded ${viewMode === 'grid' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''}`}
            aria-label="Grid view"
          >
            <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1 rounded ${viewMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow-sm' : ''}`}
            aria-label="List view"
          >
            <svg className="w-4 h-4 text-zinc-600 dark:text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="px-4 py-2 border-b border-zinc-200 dark:border-zinc-800 flex gap-2 overflow-x-auto">
        {categories.map((cat) => (
          <button
            key={cat.key}
            onClick={() => setActiveCategory(cat.key)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
              activeCategory === cat.key
                ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Components list */}
      <div className="flex-1 overflow-auto p-4">
        <div className={viewMode === 'grid' ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
          {filtered.map((comp) => (
            <div
              key={comp.type}
              draggable
              onDragStart={(e) => handleDragStart(e, comp.type)}
              onClick={() => onAddComponent(comp.type)}
              className={`p-3 bg-zinc-50 dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md cursor-grab active:cursor-grabbing transition-all group`}
            >
              <div className="text-zinc-500 dark:text-zinc-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors mb-2">
                {comp.icon}
              </div>
              <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">{comp.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
