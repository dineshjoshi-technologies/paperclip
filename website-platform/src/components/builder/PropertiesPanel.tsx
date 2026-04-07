'use client';

import { useState } from 'react';
import { AICopySuggestions } from './AICopySuggestions';
import { SEOMetaGenerator } from './SEOMetaGenerator';
import { TemplateRecommendations } from './TemplateRecommendations';

type TabKey = 'properties' | 'seo' | 'templates';

interface PropertiesPanelProps {
  selectedComponent: { type: string; props: Record<string, unknown> } | null;
  onUpdateProp: (key: string, value: string) => void;
}

export function PropertiesPanel({ selectedComponent, onUpdateProp }: PropertiesPanelProps) {
  const [activeTab, setActiveTab] = useState<TabKey>('properties');

  const tabs: { key: TabKey; label: string }[] = [
    { key: 'properties', label: 'Properties' },
    { key: 'seo', label: 'SEO' },
    { key: 'templates', label: 'Templates' },
  ];

  const renderProperties = () => {
    if (!selectedComponent) {
      return (
        <div className="text-center py-8 text-zinc-500 dark:text-zinc-400">
          <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
          </svg>
          <p className="text-sm">Select a component to edit</p>
        </div>
      );
    }

    const props = selectedComponent.props;
    const editableKeys = Object.keys(props).filter((k) => typeof props[k] === 'string');

    return (
      <div className="space-y-3">
        <div className="flex items-center gap-2 mb-4">
          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded text-xs font-medium">
            {selectedComponent.type}
          </span>
        </div>

        {editableKeys.map((key) => (
          <div key={key}>
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 capitalize block">{key}</label>
            <input
              type="text"
              value={props[key] as string}
              onChange={(e) => onUpdateProp(key, e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50"
            />
            {key === 'heading' && (
              <div className="mt-2">
                <AICopySuggestions
                  currentText={props[key] as string}
                  field="heading"
                  onApply={(text) => onUpdateProp(key, text)}
                />
              </div>
            )}
            {key === 'description' && (
              <div className="mt-2">
                <AICopySuggestions
                  currentText={props[key] as string}
                  field="description"
                  onApply={(text) => onUpdateProp(key, text)}
                />
              </div>
            )}
          </div>
        ))}

        {/* Spacing controls */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4 mt-4">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">Spacing</label>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Padding</label>
              <input type="text" defaultValue="16px" className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50" />
            </div>
            <div>
              <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">Margin</label>
              <input type="text" defaultValue="0px" className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50" />
            </div>
          </div>
        </div>

        {/* Color picker */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">Background</label>
          <div className="flex items-center gap-2">
            <input type="color" defaultValue="#ffffff" className="w-9 h-9 rounded border border-zinc-200 dark:border-zinc-700" />
            <input type="text" defaultValue="#ffffff" className="flex-1 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50 font-mono" />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 px-3 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400'
                : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-300'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4">
        {activeTab === 'properties' && renderProperties()}
        {activeTab === 'seo' && (
          <SEOMetaGenerator
            initialMeta={{ title: '', description: '', keywords: '' }}
            onUpdate={() => {}}
          />
        )}
        {activeTab === 'templates' && (
          <TemplateRecommendations onApplyTemplate={() => {}} />
        )}
      </div>
    </div>
  );
}
