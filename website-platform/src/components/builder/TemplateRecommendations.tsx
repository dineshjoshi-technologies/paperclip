'use client';

import { useState } from 'react';

interface Template {
  id: string;
  name: string;
  industry: string;
  description: string;
  color: string;
}

const templates: Template[] = [
  { id: '1', name: 'Modern SaaS', industry: 'technology', description: 'Clean landing page for SaaS products', color: 'from-blue-500 to-cyan-500' },
  { id: '2', name: 'Restaurant Pro', industry: 'restaurant', description: 'Elegant menu and reservation system', color: 'from-orange-500 to-red-500' },
  { id: '3', name: 'Creative Studio', industry: 'creative', description: 'Bold portfolio for creatives', color: 'from-purple-500 to-pink-500' },
  { id: '4', name: 'Health & Wellness', industry: 'health', description: 'Calm and welcoming health services page', color: 'from-green-500 to-teal-500' },
  { id: '5', name: 'E-commerce Plus', industry: 'ecommerce', description: 'Product-focused storefront layout', color: 'from-amber-500 to-orange-500' },
  { id: '6', name: 'Corporate Edge', industry: 'business', description: 'Professional services and team page', color: 'from-slate-500 to-zinc-600' },
];

const industries = [
  { key: 'all', label: 'All Industries' },
  { key: 'technology', label: 'Technology' },
  { key: 'restaurant', label: 'Restaurant' },
  { key: 'creative', label: 'Creative' },
  { key: 'health', label: 'Health' },
  { key: 'ecommerce', label: 'E-commerce' },
  { key: 'business', label: 'Business' },
];

interface TemplateRecommendationsProps {
  onApplyTemplate: (template: Template) => void;
}

export function TemplateRecommendations({ onApplyTemplate }: TemplateRecommendationsProps) {
  const [selectedIndustry, setSelectedIndustry] = useState('all');

  const filtered = selectedIndustry === 'all'
    ? templates
    : templates.filter((t) => t.industry === selectedIndustry);

  return (
    <div className="space-y-4">
      {/* Industry selector */}
      <div>
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">Industry</label>
        <select
          value={selectedIndustry}
          onChange={(e) => setSelectedIndustry(e.target.value)}
          className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50 appearance-none"
        >
          {industries.map((ind) => (
            <option key={ind.key} value={ind.key}>{ind.label}</option>
          ))}
        </select>
      </div>

      {/* Templates grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((template) => (
          <button
            key={template.id}
            onClick={() => onApplyTemplate(template)}
            className="group text-left overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-md transition-all"
          >
            <div className={`h-20 bg-gradient-to-br ${template.color} flex items-center justify-center`}>
              <span className="text-white font-bold text-lg">{template.name.charAt(0)}</span>
            </div>
            <div className="p-2.5 bg-white dark:bg-zinc-800">
              <p className="text-xs font-medium text-zinc-900 dark:text-zinc-50 truncate">{template.name}</p>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate mt-0.5">{template.description}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
