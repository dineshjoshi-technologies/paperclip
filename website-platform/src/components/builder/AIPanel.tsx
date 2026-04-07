'use client';

import { useState } from 'react';

interface AIPanelProps {
  onGenerate: (prompt: string, sectionType: string) => void;
  isGenerating: boolean;
}

const sectionTypes = ['hero', 'features', 'testimonials', 'pricing', 'cta', 'faq'];

export function AIPanel({ onGenerate, isGenerating }: AIPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState('hero');
  const [generatedPreview, setGeneratedPreview] = useState<string | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setGeneratedPreview(null);
    onGenerate(prompt, selectedType);
    setTimeout(() => {
      setGeneratedPreview(`AI-generated ${selectedType} section based on "${prompt.substring(0, 50)}${prompt.length > 50 ? '...' : ''}". Ready to insert into canvas.`);
    }, 2000);
  };

  return (
    <div className="h-full flex flex-col">
      {/* Panel header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">AI Generator</h3>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Section type selector */}
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">Section Type</label>
          <div className="grid grid-cols-3 gap-1.5">
            {sectionTypes.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`px-2 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  selectedType === type
                    ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border border-purple-200 dark:border-purple-800'
                    : 'bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-700 hover:border-purple-300 dark:hover:border-purple-700'
                }`}
              >
                {type.charAt(0).toUpperCase() + type.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Prompt input */}
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">Describe your section</label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., A modern hero section for a fitness gym with bold typography and energetic colors..."
            className="w-full h-32 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>

        {/* Generate button */}
        <button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating...
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Generate with AI
            </>
          )}
        </button>

        {/* Generated preview */}
        {generatedPreview && (
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg space-y-3">
            <p className="text-xs text-purple-700 dark:text-purple-300">{generatedPreview}</p>
            <div className="flex gap-2">
              <button className="flex-1 px-3 py-1.5 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 transition-colors">
                Insert to Canvas
              </button>
              <button
                onClick={() => setGeneratedPreview(null)}
                className="px-3 py-1.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Discard
              </button>
            </div>
          </div>
        )}

        {/* Quick prompts */}
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">Quick prompts</label>
          <div className="space-y-1.5">
            {[
              'Modern SaaS landing page',
              'Restaurant menu with food photos',
              'Portfolio for a photographer',
              'E-commerce product showcase',
            ].map((qp) => (
              <button
                key={qp}
                onClick={() => setPrompt(qp)}
                className="w-full text-left px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                {qp}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
