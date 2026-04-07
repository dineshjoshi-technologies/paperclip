'use client';

import { useState } from 'react';

interface AICopySuggestionsProps {
  currentText: string;
  field: 'heading' | 'description' | 'cta';
  onApply: (text: string) => void;
}

const suggestions: Record<string, Record<string, string[]>> = {
  heading: {
    professional: ['Transform Your Digital Presence', 'Enterprise-Grade Solutions', 'Elevate Your Brand Today'],
    casual: ['Let&apos;s Build Something Amazing', 'Your Dream Website Starts Here', 'Ready to Level Up?'],
    fun: ['Magic Happens Here', 'Websites That Wow', 'Your Brand, Supercharged'],
  },
  description: {
    professional: ['Streamline your operations with our cutting-edge platform designed for modern businesses.', 'Deliver exceptional digital experiences with powerful, scalable solutions.'],
    casual: ['We make it easy to create beautiful websites that your customers will love.', 'No tech skills needed. Just tell us what you want and we&apos;ll handle the rest.'],
    fun: ['Watch your ideas come to life with a sprinkle of AI magic.', 'Turn your wildest website dreams into reality with just a few clicks.'],
  },
  cta: {
    professional: ['Get Started Today', 'Schedule a Demo', 'Request a Consultation'],
    casual: ['Let&apos;s Go!', 'Try It Free', 'Start Building'],
    fun: ['Make It Happen', 'Let&apos;s Create Magic', 'Launch Something Epic'],
  },
};

export function AICopySuggestions({ currentText, field, onApply }: AICopySuggestionsProps) {
  const [tone, setTone] = useState<string>('professional');
  const [isOpen, setIsOpen] = useState(false);

  const currentSuggestions = suggestions[field]?.[tone] || [];

  return (
    <div className="border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
      >
        <span className="flex items-center gap-1.5">
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          AI Suggestions for {field}
        </span>
        <svg
          className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="px-3 pb-3 space-y-3">
          {/* Tone selector */}
          <div className="flex gap-1">
            {['professional', 'casual', 'fun'].map((t) => (
              <button
                key={t}
                onClick={() => setTone(t)}
                className={`px-2.5 py-1 rounded-md text-xs transition-colors ${
                  tone === t
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                    : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          {/* Suggestions */}
          <div className="space-y-1.5">
            {currentSuggestions.map((suggestion, i) => (
              <button
                key={i}
                onClick={() => onApply(suggestion)}
                className="w-full text-left px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 rounded-md hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-colors text-zinc-700 dark:text-zinc-300 group"
              >
                <div className="flex items-center justify-between">
                  <span className="truncate">{suggestion}</span>
                  <svg className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 transition-colors flex-shrink-0 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
