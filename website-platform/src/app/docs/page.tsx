'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ThemeToggle } from '@/components/common/ThemeToggle';

interface ComponentDoc {
  name: string;
  description: string;
  props: { name: string; type: string; required: boolean; description: string }[];
  example: string;
}

const componentDocs: ComponentDoc[] = [
  {
    name: 'AnalyticsCard',
    description: 'A stat card with icon, value, label, and trend indicator for dashboard metrics.',
    props: [
      { name: 'title', type: 'string', required: true, description: 'Card label' },
      { name: 'value', type: 'string', required: true, description: 'Primary displayed value' },
      { name: 'change', type: 'number', required: true, description: 'Percentage change (positive = green, negative = red)' },
      { name: 'changeLabel', type: 'string', required: false, description: 'Label for change metric (default: "vs last month")' },
      { name: 'icon', type: 'React.ReactNode', required: true, description: 'Icon element' },
    ],
    example: `<AnalyticsCard
  title="Visitors"
  value="24.5K"
  change={12}
  icon={<UsersIcon />}
/>`,
  },
  {
    name: 'ActivityChart',
    description: 'A CSS-based bar chart for displaying weekly activity data with dark mode support.',
    props: [
      { name: 'data', type: 'Array<{label: string; value: number}>', required: false, description: 'Data points (uses defaults if not provided)' },
    ],
    example: `<ActivityChart 
  data={[
    { label: 'Mon', value: 65 },
    { label: 'Tue', value: 45 },
  ]} 
/>`,
  },
  {
    name: 'ViewportSwitcher',
    description: 'Toggle between desktop, tablet, and mobile viewport sizes in the builder canvas.',
    props: [
      { name: 'value', type: '"desktop" | "tablet" | "mobile"', required: true, description: 'Current active viewport' },
      { name: 'onChange', type: '(size) => void', required: true, description: 'Callback on viewport change' },
    ],
    example: `<ViewportSwitcher 
  value={viewport} 
  onChange={setViewport} 
/>`,
  },
  {
    name: 'ComponentPanel',
    description: 'Drag-and-drop component library with categorization and grid/list views for the builder.',
    props: [
      { name: 'onAddComponent', type: '(type: string) => void', required: true, description: 'Callback when component is added' },
    ],
    example: `<ComponentPanel onAddComponent={handleAdd} />`,
  },
  {
    name: 'AIPanel',
    description: 'AI-powered section generation panel with prompt input, section type selector, and quick prompts.',
    props: [
      { name: 'onGenerate', type: '(prompt: string, type: string) => void', required: true, description: 'Callback with user prompt and section type' },
      { name: 'isGenerating', type: 'boolean', required: true, description: 'Loading state during AI generation' },
    ],
    example: `<AIPanel
  onGenerate={handleGenerate}
  isGenerating={loading}
/>`,
  },
  {
    name: 'SEOMetaGenerator',
    description: 'SEO meta tag editor with AI generation, character counting, Google search results preview, and Open Graph fields.',
    props: [
      { name: 'initialMeta', type: '{title: string; description: string; keywords: string}', required: false, description: 'Initial meta values' },
      { name: 'onUpdate', type: '(meta) => void', required: true, description: 'Callback on meta change' },
    ],
    example: `<SEOMetaGenerator
  onUpdate={(meta) => saveSEO(meta)}
/>`,
  },
  {
    name: 'TemplateRecommendations',
    description: 'Industry-based template suggestions with preview cards and one-click apply.',
    props: [
      { name: 'onApplyTemplate', type: '(template: Template) => void', required: true, description: 'Callback when template is selected' },
    ],
    example: `<TemplateRecommendations
  onApplyTemplate={apply}
/>`,
  },
];

export default function DocsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      {/* Header */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">DJ</span>
              </div>
              <span className="font-bold text-lg text-zinc-900 dark:text-zinc-50">Docs</span>
            </Link>
            <Link href="/dashboard" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Dashboard</Link>
            <Link href="/builder" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors">Builder</Link>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">Component Library</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl">
            Reference documentation for all built-in components. Each component is production-ready, accessible, and supports dark mode.
          </p>
        </div>

        <div className="space-y-4">
          {componentDocs.map((doc) => (
            <div
              key={doc.name}
              className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setExpanded(expanded === doc.name ? null : doc.name)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <div>
                  <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{doc.name}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">{doc.description}</p>
                </div>
                <svg
                  className={`w-5 h-5 text-zinc-500 flex-shrink-0 transition-transform ${expanded === doc.name ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {expanded === doc.name && (
                <div className="px-6 pb-6 border-t border-zinc-200 dark:border-zinc-800 pt-6 space-y-6">
                  {/* Props table */}
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Props</h4>
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-zinc-200 dark:border-zinc-800">
                            <th className="text-left py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-50">Name</th>
                            <th className="text-left py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-50">Type</th>
                            <th className="text-left py-2 pr-4 font-medium text-zinc-900 dark:text-zinc-50">Required</th>
                            <th className="text-left py-2 font-medium text-zinc-900 dark:text-zinc-50">Description</th>
                          </tr>
                        </thead>
                        <tbody>
                          {doc.props.map((prop) => (
                            <tr key={prop.name} className="border-b border-zinc-100 dark:border-zinc-800/50">
                              <td className="py-2 pr-4 text-blue-600 dark:text-blue-400 font-mono text-xs">{prop.name}</td>
                              <td className="py-2 pr-4 text-purple-600 dark:text-purple-400 font-mono text-xs">{prop.type}</td>
                              <td className="py-2 pr-4 text-xs">
                                {prop.required ? (
                                  <span className="text-red-500 font-medium">Required</span>
                                ) : (
                                  <span className="text-zinc-400">Optional</span>
                                )}
                              </td>
                              <td className="py-2 text-zinc-600 dark:text-zinc-400 text-xs">{prop.description}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Example */}
                  <div>
                    <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-3">Example</h4>
                    <pre className="p-4 bg-zinc-900 dark:bg-zinc-800 rounded-lg overflow-x-auto">
                      <code className="text-sm text-green-400 font-mono">{doc.example}</code>
                    </pre>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </main>
    </div>
  );
}
