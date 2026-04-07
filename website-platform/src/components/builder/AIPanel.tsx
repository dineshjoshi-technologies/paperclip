'use client';

import { useState, useRef, useCallback } from 'react';

interface GeneratedContent {
  sectionType: string;
  prompt: string;
  content: Record<string, unknown>;
  raw: string;
}

interface AIPanelProps {
  onInsert: (content: GeneratedContent) => void;
}

const sectionTypes = ['hero', 'features', 'testimonials', 'pricing', 'cta', 'faq'];

export function AIPanel({ onInsert }: AIPanelProps) {
  const [prompt, setPrompt] = useState('');
  const [selectedType, setSelectedType] = useState('hero');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [streamingText, setStreamingText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const handleGenerate = useCallback(async (regenerate = false) => {
    if (!prompt.trim()) return;

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsGenerating(true);
    setError(null);
    setStreamingText('');
    setGeneratedContent(null);

    try {
      const res = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, sectionType: selectedType }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: 'Generation failed' }));
        throw new Error(errBody.error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No response reader available');

      const decoder = new TextDecoder();
      let fullContent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n').filter((l) => l.trim());

        for (const line of lines) {
          try {
            const parsed = JSON.parse(line);
            if (parsed.content) {
              fullContent += parsed.content;
              setStreamingText(fullContent);
            }
            if (parsed.done) {
              // Parse the final JSON content
              try {
                let jsonStr = fullContent;
                // Strip markdown code blocks if present
                jsonStr = jsonStr.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
                // Find the JSON object boundaries
                const startIdx = jsonStr.indexOf('{');
                const endIdx = jsonStr.lastIndexOf('}');
                if (startIdx !== -1 && endIdx !== -1) {
                  jsonStr = jsonStr.slice(startIdx, endIdx + 1);
                }
                const parsedContent = JSON.parse(jsonStr);
                setGeneratedContent({
                  sectionType: selectedType,
                  prompt,
                  content: parsedContent,
                  raw: fullContent,
                });
              } catch {
                // Keep raw text if JSON parsing fails
                setGeneratedContent({
                  sectionType: selectedType,
                  prompt,
                  content: { raw: fullContent },
                  raw: fullContent,
                });
              }
            }
          } catch {
            // skip malformed lines
          }
        }
      }
    } catch (err: unknown) {
      if (err instanceof Error && err.name === 'AbortError') return;
      setError(err instanceof Error ? err.message : 'Generation failed');
    } finally {
      setIsGenerating(false);
      abortRef.current = null;
    }
  }, [prompt, selectedType]);

  const handleCancel = useCallback(() => {
    abortRef.current?.abort();
    setIsGenerating(false);
    abortRef.current = null;
  }, []);

  const handleInsert = useCallback(() => {
    if (generatedContent) {
      onInsert(generatedContent);
      setGeneratedContent(null);
      setStreamingText('');
      setPrompt('');
    }
  }, [generatedContent, onInsert]);

  const handleDiscard = useCallback(() => {
    setGeneratedContent(null);
    setStreamingText('');
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Panel header */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-2">
          <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 text-sm">AI Generator</h3>
          <span className="ml-auto text-xs text-zinc-400">Ollama · gemma4:31b</span>
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
            className="w-full h-28 px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 dark:placeholder-zinc-500"
          />
        </div>

        {/* Generate button */}
        <div className="flex gap-2">
          {isGenerating ? (
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-200 text-sm font-medium rounded-lg hover:bg-zinc-300 dark:hover:bg-zinc-600 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Generating... Cancel
            </button>
          ) : (
            <>
              <button
                onClick={() => handleGenerate(false)}
                disabled={!prompt.trim()}
                className="flex-1 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-blue-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-purple-500/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Generate
              </button>
              {generatedContent && (
                <button
                  onClick={() => handleGenerate(true)}
                  className="px-3 py-2.5 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-sm font-medium rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                  title="Regenerate"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
            <p className="text-xs text-red-700 dark:text-red-300 font-medium">Generation failed</p>
            <p className="text-xs text-red-600 dark:text-red-400 mt-1">{error}</p>
            <button
              onClick={() => { setError(null); handleGenerate(false); }}
              className="mt-2 text-xs text-red-600 dark:text-red-400 hover:underline font-medium"
            >
              Try again
            </button>
          </div>
        )}

        {/* Streaming preview */}
        {isGenerating && streamingText && !generatedContent && (
          <div className="p-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <svg className="w-3.5 h-3.5 text-purple-500 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Generating...</span>
            </div>
            <pre className="text-xs text-zinc-500 dark:text-zinc-400 whitespace-pre-wrap font-mono max-h-40 overflow-auto">
              {streamingText}
            </pre>
          </div>
        )}

        {/* Generated preview with accept/reject */}
        {generatedContent && (
          <div className="p-3 bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="text-xs font-medium text-purple-700 dark:text-purple-300 capitalize">
                  {generatedContent.sectionType} section generated
                </span>
              </div>
            </div>

            {/* Rendered preview */}
            <div className="bg-white dark:bg-zinc-900 rounded-md p-3 space-y-2">
              {!!generatedContent.content.heading && (
                <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">
                  {generatedContent.content.heading as string}
                </h4>
              )}
              {!!generatedContent.content.subheading && (
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  {generatedContent.content.subheading as string}
                </p>
              )}
              {!!generatedContent.content.description && (
                <p className="text-xs text-zinc-600 dark:text-zinc-300">
                  {generatedContent.content.description as string}
                </p>
              )}
              {!!generatedContent.content.ctaText && (
                <span className="inline-block px-2.5 py-1 bg-purple-600 text-white text-xs rounded-md font-medium">
                  {generatedContent.content.ctaText as string}
                </span>
              )}
              {!!generatedContent.content.item1Title && (
                <div className="space-y-1 pt-1">
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {generatedContent.content.item1Title as string}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {generatedContent.content.item1Desc as string}
                  </p>
                </div>
              )}
              {!!generatedContent.content.item2Title && (
                <div className="space-y-1 pt-1">
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {generatedContent.content.item2Title as string}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {generatedContent.content.item2Desc as string}
                  </p>
                </div>
              )}
              {!!generatedContent.content.item3Title && (
                <div className="space-y-1 pt-1">
                  <p className="text-xs font-medium text-zinc-700 dark:text-zinc-300">
                    {generatedContent.content.item3Title as string}
                  </p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {generatedContent.content.item3Desc as string}
                  </p>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleInsert}
                className="flex-1 px-3 py-2 bg-purple-600 text-white text-xs font-medium rounded-md hover:bg-purple-700 transition-colors flex items-center justify-center gap-1.5"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Insert to Canvas
              </button>
              <button
                onClick={handleDiscard}
                className="px-3 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-medium rounded-md hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
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
              { label: 'Modern SaaS landing page', type: 'hero' },
              { label: 'Restaurant menu with food photos', type: 'hero' },
              { label: 'Portfolio for a photographer', type: 'hero' },
              { label: 'E-commerce product showcase', type: 'features' },
              { label: 'Pricing page for AI startup', type: 'pricing' },
              { label: 'Testimonials for agency', type: 'testimonials' },
            ].map((qp) => (
              <button
                key={qp.label}
                onClick={() => { setPrompt(qp.label); setSelectedType(qp.type); }}
                className="w-full text-left px-3 py-2 text-xs text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors"
              >
                {qp.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
