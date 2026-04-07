'use client';

import { useState, useCallback } from 'react';
import { BuilderToolbar } from '@/components/builder/BuilderToolbar';
import { ComponentPanel } from '@/components/builder/ComponentPanel';
import { Canvas } from '@/components/builder/Canvas';
import { PropertiesPanel } from '@/components/builder/PropertiesPanel';
import { AIPanel } from '@/components/builder/AIPanel';
import { ViewportSize } from '@/components/builder/ViewportSwitcher';

interface BuilderComponent {
  id: string;
  type: string;
  props: Record<string, unknown>;
}

const defaultComponents: BuilderComponent[] = [
  { id: '1', type: 'hero', props: { heading: 'Build Something Amazing', description: 'Create stunning websites without writing a single line of code.' } },
  { id: '2', type: 'features', props: { heading: 'Why Choose Us' } },
];

export default function BuilderPage() {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [components, setComponents] = useState<BuilderComponent[]>(defaultComponents);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [rightPanelTab, setRightPanelTab] = useState<string>('properties');

  const handleAddComponent = useCallback((type: string) => {
    const defaults: Record<string, Record<string, unknown>> = {
      hero: { heading: 'Hero Section', description: 'Hero description goes here' },
      features: { heading: 'Features' },
      text: { content: 'Add your text here' },
      cta: { heading: 'Call to Action' },
      footer: { content: '© 2026 Your Company' },
    };
    const newComponent: BuilderComponent = {
      id: Date.now().toString(),
      type,
      props: defaults[type] || {},
    };
    setComponents((prev) => [...prev, newComponent]);
    setSelectedId(newComponent.id);
  }, []);

  const handleDrop = useCallback((type: string) => {
    handleAddComponent(type);
  }, [handleAddComponent]);

  const handleAI = useCallback((_prompt: string, _sectionType: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      const newComp: BuilderComponent = {
        id: Date.now().toString(),
        type: _sectionType,
        props: {
          heading: 'AI Generated Section',
          description: `Generated from prompt: ${_prompt.substring(0, 30)}...`,
        },
      };
      setComponents((prev) => [...prev, newComp]);
      setSelectedId(newComp.id);
      setIsGenerating(false);
    }, 2000);
  }, []);

  const handleUpdateProp = useCallback((key: string, value: string) => {
    setComponents((prev) =>
      prev.map((c) =>
        c.id === selectedId ? { ...c, props: { ...c.props, [key]: value } } : c
      )
    );
  }, [selectedId]);

  const selectedComponent = components.find((c) => c.id === selectedId) || null;

  return (
    <div className="flex flex-col h-screen bg-zinc-50 dark:bg-zinc-950">
      {/* Toolbar */}
      <BuilderToolbar
        viewport={viewport}
        onViewportChange={setViewport}
        rightSidebarTab={rightPanelTab}
        onRightTabChange={setRightPanelTab}
      />

      {/* Main builder area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left sidebar - Component panel */}
        <aside className="w-72 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0 hidden lg:block">
          <ComponentPanel onAddComponent={handleAddComponent} />
        </aside>

        {/* Canvas */}
        <Canvas
          components={components}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onDrop={handleDrop}
          viewport={viewport}
        />

        {/* Right sidebar - Properties / AI */}
        <aside className="w-80 border-l border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex-shrink-0 hidden xl:block">
          {rightPanelTab === 'ai' ? (
            <AIPanel onGenerate={handleAI} isGenerating={isGenerating} />
          ) : (
            <PropertiesPanel
              selectedComponent={selectedComponent}
              onUpdateProp={handleUpdateProp}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
