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
  aiGenerated?: boolean;
}

const defaultComponents: BuilderComponent[] = [
  { id: '1', type: 'hero', props: { heading: 'Build Something Amazing', description: 'Create stunning websites without writing a single line of code.' } },
  { id: '2', type: 'features', props: { heading: 'Why Choose Us' } },
];

const AI_PROP_MAP: Record<string, string[]> = {
  hero: ['heading', 'subheading', 'description', 'ctaText'],
  features: ['heading', 'item1Title', 'item1Desc', 'item2Title', 'item2Desc', 'item3Title', 'item3Desc'],
  testimonials: ['heading', 'testimonial1Text', 'testimonial1Author', 'testimonial2Text', 'testimonial2Author'],
  pricing: ['heading', 'plan1Name', 'plan1Price', 'plan1Features', 'plan2Name', 'plan2Price', 'plan2Features'],
  cta: ['heading', 'description', 'buttonText'],
  faq: ['heading', 'qaPairs'],
};

export default function BuilderPage() {
  const [viewport, setViewport] = useState<ViewportSize>('desktop');
  const [components, setComponents] = useState<BuilderComponent[]>(defaultComponents);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [rightPanelTab, setRightPanelTab] = useState<string>('properties');

  const handleAddComponent = useCallback((type: string, props?: Record<string, unknown>) => {
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
      props: props || defaults[type] || {},
      aiGenerated: !!props,
    };
    setComponents((prev) => [...prev, newComponent]);
    setSelectedId(newComponent.id);
  }, []);

  const handleDrop = useCallback((type: string) => {
    handleAddComponent(type);
  }, [handleAddComponent]);

  const handleAIInsert = useCallback((generated: { sectionType: string; content: Record<string, unknown> }) => {
    const type = generated.sectionType;
    const props = generated.content;

    handleAddComponent(type, props);
  }, [handleAddComponent]);

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
            <AIPanel onInsert={handleAIInsert} />
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
