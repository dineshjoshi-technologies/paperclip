'use client'

import { useState } from 'react'
import { type BuilderComponent, type BuilderStyle } from './types'
import { cn } from '@/lib/utils'
import { ChevronDown, ChevronRight, Palette, Type as TypeIcon, Layout, Square } from 'lucide-react'

interface ComponentPropertiesProps {
  component: BuilderComponent | null
  onUpdateConfig: (config: Record<string, unknown>) => void
  onUpdateStyle: (style: BuilderStyle) => void
}

type TabKey = 'content' | 'style'

interface StyleSection {
  key: string
  label: string
  icon: React.FC<{ className?: string }>
  fields: StyleField[]
}

interface StyleField {
  key: keyof BuilderStyle
  label: string
  type: 'color' | 'text' | 'select' | 'number'
  options?: { label: string; value: string }[]
  unit?: string
}

const STYLE_SECTIONS: StyleSection[] = [
  {
    key: 'appearance',
    label: 'Appearance',
    icon: Palette,
    fields: [
      { key: 'backgroundColor', label: 'Background', type: 'color' },
      { key: 'textColor', label: 'Text Color', type: 'color' },
      { key: 'opacity', label: 'Opacity', type: 'number', unit: '%' },
    ],
  },
  {
    key: 'typography',
    label: 'Typography',
    icon: TypeIcon,
    fields: [
      { key: 'fontSize', label: 'Font Size', type: 'text' },
      {
        key: 'fontWeight',
        label: 'Weight',
        type: 'select',
        options: [
          { label: 'Light', value: '300' },
          { label: 'Normal', value: '400' },
          { label: 'Medium', value: '500' },
          { label: 'Semibold', value: '600' },
          { label: 'Bold', value: '700' },
        ],
      },
      {
        key: 'textAlign',
        label: 'Align',
        type: 'select',
        options: [
          { label: 'Left', value: 'left' },
          { label: 'Center', value: 'center' },
          { label: 'Right', value: 'right' },
        ],
      },
    ],
  },
  {
    key: 'spacing',
    label: 'Spacing',
    icon: Layout,
    fields: [
      { key: 'padding', label: 'Padding', type: 'text' },
      { key: 'margin', label: 'Margin', type: 'text' },
      { key: 'width', label: 'Width', type: 'text' },
      { key: 'height', label: 'Height', type: 'text' },
    ],
  },
  {
    key: 'border',
    label: 'Border',
    icon: Square,
    fields: [
      { key: 'borderRadius', label: 'Radius', type: 'text' },
      { key: 'borderWidth', label: 'Width', type: 'text' },
      { key: 'borderColor', label: 'Color', type: 'color' },
      {
        key: 'borderStyle',
        label: 'Style',
        type: 'select',
        options: [
          { label: 'None', value: 'none' },
          { label: 'Solid', value: 'solid' },
          { label: 'Dashed', value: 'dashed' },
          { label: 'Dotted', value: 'dotted' },
        ],
      },
    ],
  },
]

function ContentFields({ component, onUpdateConfig }: { component: BuilderComponent; onUpdateConfig: (config: Record<string, unknown>) => void }) {
  const entries = Object.entries(component.config).filter(([key]) => key !== 'children')

  if (entries.length === 0) {
    return <p className="text-xs text-zinc-400 py-2">No content fields for this component</p>
  }

  return (
    <div className="space-y-3">
      {entries.map(([key, value]) => (
        <div key={key}>
          <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1 capitalize">
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </label>
          {typeof value === 'boolean' ? (
            <input
              type="checkbox"
              checked={value as boolean}
              onChange={(e) => onUpdateConfig({ ...component.config, [key]: e.target.checked })}
              className="rounded border-zinc-300 dark:border-zinc-700"
            />
          ) : typeof value === 'number' ? (
            <input
              type="number"
              value={value as number}
              onChange={(e) => onUpdateConfig({ ...component.config, [key]: Number(e.target.value) })}
              className="w-full h-8 px-2 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          ) : typeof value === 'string' && value.length > 80 ? (
            <textarea
              value={value as string}
              onChange={(e) => onUpdateConfig({ ...component.config, [key]: e.target.value })}
              rows={3}
              className="w-full px-2 py-1 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 resize-none"
            />
          ) : Array.isArray(value) ? (
            <p className="text-xs text-zinc-400 py-1">{value.length} item(s) - edit in content panel</p>
          ) : (
            <input
              type="text"
              value={value as string}
              onChange={(e) => onUpdateConfig({ ...component.config, [key]: e.target.value })}
              className="w-full h-8 px-2 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
            />
          )}
        </div>
      ))}
    </div>
  )
}

function StyleSectionPanel({
  section,
  style,
  onUpdateStyle,
}: {
  section: StyleSection
  style: BuilderStyle
  onUpdateStyle: (style: BuilderStyle) => void
}) {
  const [open, setOpen] = useState(true)
  const Icon = section.icon

  return (
    <div className="border-b border-zinc-100 dark:border-zinc-800 last:border-b-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200"
      >
        <span className="flex items-center gap-1.5">
          <Icon className="h-3 w-3" />
          {section.label}
        </span>
        {open ? <ChevronDown className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}
      </button>

      {open && (
        <div className="px-3 pb-3 space-y-2">
          {section.fields.map((field) => (
            <div key={field.key}>
              <label className="block text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                {field.label}
              </label>
              {field.type === 'color' ? (
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={(style[field.key] as string) || '#000000'}
                    onChange={(e) => onUpdateStyle({ ...style, [field.key]: e.target.value })}
                    className="h-7 w-7 rounded border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                  />
                  <input
                    type="text"
                    value={(style[field.key] as string) || ''}
                    onChange={(e) => onUpdateStyle({ ...style, [field.key]: e.target.value })}
                    placeholder="e.g. #ffffff"
                    className="flex-1 h-7 px-2 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                  />
                </div>
              ) : field.type === 'select' && field.options ? (
                <select
                  value={(style[field.key] as string) || ''}
                  onChange={(e) => onUpdateStyle({ ...style, [field.key]: e.target.value || undefined })}
                  className="w-full h-7 px-2 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                >
                  <option value="">Default</option>
                  {field.options.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              ) : field.type === 'number' ? (
                <input
                  type="number"
                  value={style[field.key] !== undefined ? Math.round((style[field.key] as number) * 100) : ''}
                  onChange={(e) => {
                    const val = e.target.value === '' ? undefined : Number(e.target.value) / 100
                    onUpdateStyle({ ...style, [field.key]: val })
                  }}
                  placeholder="100"
                  className="w-full h-7 px-2 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              ) : (
                <input
                  type="text"
                  value={(style[field.key] as string) || ''}
                  onChange={(e) => onUpdateStyle({ ...style, [field.key]: e.target.value || undefined })}
                  placeholder={field.key === 'padding' || field.key === 'margin' ? 'e.g. 1rem 2rem' : ''}
                  className="w-full h-7 px-2 text-xs rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400"
                />
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export function ComponentProperties({ component, onUpdateConfig, onUpdateStyle }: ComponentPropertiesProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('content')

  if (!component) {
    return (
      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
        <svg className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
        </svg>
        <p className="text-sm text-zinc-400 dark:text-zinc-500">Select a component to edit its properties</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {(['content', 'style'] as TabKey[]).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-1 py-2 text-xs font-medium capitalize transition-colors',
              activeTab === tab
                ? 'text-zinc-900 dark:text-zinc-50 border-b-2 border-zinc-900 dark:border-zinc-50'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-3 border-b border-zinc-100 dark:border-zinc-800">
          <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-50 capitalize">
            {component.type}
          </span>
        </div>

        {activeTab === 'content' ? (
          <div className="p-3">
            <ContentFields component={component} onUpdateConfig={onUpdateConfig} />
          </div>
        ) : (
          <div>
            {STYLE_SECTIONS.map((section) => (
              <StyleSectionPanel
                key={section.key}
                section={section}
                style={component.style}
                onUpdateStyle={onUpdateStyle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
