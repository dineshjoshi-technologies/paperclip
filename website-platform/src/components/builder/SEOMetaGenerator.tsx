'use client';

import { useState } from 'react';

interface SEOMetaGeneratorProps {
  initialMeta?: { title: string; description: string; keywords: string };
  onUpdate: (meta: { title: string; description: string; keywords: string }) => void;
}

export function SEOMetaGenerator({ initialMeta, onUpdate }: SEOMetaGeneratorProps) {
  const [meta, setMeta] = useState({
    title: initialMeta?.title || 'My Website | DJ Technologies',
    description: initialMeta?.description || 'A modern website built with DJ Technologies AI platform.',
    keywords: initialMeta?.keywords || 'website, business, services',
    ogTitle: '',
    ogDescription: '',
    ogImage: '',
    twitterCard: 'summary_large_image',
  });

  const [isGenerating, setIsGenerating] = useState(false);

  const handleAISuggest = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setMeta((prev) => ({
        ...prev,
        title: 'Professional Web Design & Development | Your Brand',
        description: 'Transform your online presence with our expert web design services. Fast, responsive, and SEO-optimized websites built with cutting-edge AI technology.',
        keywords: 'web design, website development, AI website builder, responsive design',
        ogTitle: 'Professional Web Design & Development | Your Brand',
        ogDescription: 'Transform your online presence with expert web design services.',
      }));
      setIsGenerating(false);
    }, 1500);
  };

  const handleChange = (field: string, value: string) => {
    const updated = { ...meta, [field]: value };
    setMeta(updated);
    onUpdate({ title: updated.title, description: updated.description, keywords: updated.keywords });
  };

  const titleLength = meta.title.length;
  const descLength = meta.description.length;

  return (
    <div className="space-y-4">
      {/* AI Generate button */}
      <button
        onClick={handleAISuggest}
        disabled={isGenerating}
        className="w-full px-3 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-xs font-medium rounded-lg hover:shadow-md disabled:opacity-50 transition-all flex items-center justify-center gap-1.5"
      >
        {isGenerating ? (
          <>
            <svg className="w-3.5 h-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Generating...
          </>
        ) : (
          <>
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            AI Generate SEO Tags
          </>
        )}
      </button>

      {/* Fields */}
      <div className="space-y-3">
        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">Meta Title</label>
          <input
            type="text"
            value={meta.title}
            onChange={(e) => handleChange('title', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50"
            maxLength={60}
          />
          <p className={`text-xs mt-1 ${titleLength > 60 ? 'text-red-500' : 'text-zinc-400'}`}>
            {titleLength}/60 characters
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">Meta Description</label>
          <textarea
            value={meta.description}
            onChange={(e) => handleChange('description', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-zinc-900 dark:text-zinc-50"
            maxLength={160}
            rows={3}
          />
          <p className={`text-xs mt-1 ${descLength > 160 ? 'text-red-500' : 'text-zinc-400'}`}>
            {descLength}/160 characters
          </p>
        </div>

        <div>
          <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-1 block">Keywords</label>
          <input
            type="text"
            value={meta.keywords}
            onChange={(e) => handleChange('keywords', e.target.value)}
            className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50"
            placeholder="keyword1, keyword2, keyword3"
          />
        </div>
      </div>

      {/* Google Preview */}
      <div>
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-2 block">Google Preview</label>
        <div className="p-4 bg-white dark:bg-zinc-800 rounded-lg border border-zinc-200 dark:border-zinc-700">
          <p className="text-base text-blue-600 dark:text-blue-400 truncate">{meta.title}</p>
          <p className="text-xs text-green-700 dark:text-green-500 mt-0.5">example.djtech.app</p>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-0.5 line-clamp-2">{meta.description}</p>
        </div>
      </div>

      {/* Open Graph */}
      <div className="border-t border-zinc-200 dark:border-zinc-800 pt-4">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400 mb-3 block">Open Graph / Twitter</label>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">OG Title</label>
            <input
              type="text"
              value={meta.ogTitle}
              onChange={(e) => handleChange('ogTitle', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50"
              placeholder="Same as meta title if empty"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">OG Description</label>
            <input
              type="text"
              value={meta.ogDescription}
              onChange={(e) => handleChange('ogDescription', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50"
              placeholder="Same as meta description if empty"
            />
          </div>
          <div>
            <label className="text-xs text-zinc-500 dark:text-zinc-400 mb-1 block">OG Image URL</label>
            <input
              type="text"
              value={meta.ogImage}
              onChange={(e) => handleChange('ogImage', e.target.value)}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-zinc-900 dark:text-zinc-50"
              placeholder="https://example.com/image.jpg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
