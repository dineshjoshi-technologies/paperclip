'use client';

import { ViewportSwitcher, type ViewportSize } from './ViewportSwitcher';

interface CanvasProps {
  components: Array<{ id: string; type: string; props: Record<string, unknown> }>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onDrop: (type: string, index?: number) => void;
  viewport: ViewportSize;
}

const viewportWidths: Record<ViewportSize, string> = {
  desktop: 'w-full max-w-none',
  tablet: 'w-[768px]',
  mobile: 'w-[375px]',
};

function ComponentPreview({ component, isSelected, onClick }: {
  component: CanvasProps['components'][number];
  isSelected: boolean;
  onClick: () => void;
}) {
  const renderComponent = () => {
    switch (component.type) {
      case 'hero':
        return (
          <div className="py-16 px-8 text-center bg-gradient-to-b from-blue-50 to-white dark:from-blue-950/20 dark:to-zinc-900">
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4">
              {(component.props.heading as string) || 'Hero Section'}
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto">
              {(component.props.description as string) || 'Description goes here'}
            </p>
          </div>
        );
      case 'features':
        return (
          <div className="py-12 px-8 bg-zinc-50 dark:bg-zinc-800">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 text-center mb-8">
              {(component.props.heading as string) || 'Features'}
            </h2>
            <div className="grid grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="p-4 bg-white dark:bg-zinc-900 rounded-lg text-center">
                  <div className="w-10 h-10 mx-auto mb-3 rounded-lg bg-blue-100 dark:bg-blue-900/30" />
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300">Feature {i}</p>
                </div>
              ))}
            </div>
          </div>
        );
      case 'text':
        return (
          <div className="py-8 px-8">
            <p className="text-zinc-700 dark:text-zinc-300">{(component.props.content as string) || 'Text block content'}</p>
          </div>
        );
      case 'cta':
        return (
          <div className="py-12 px-8 bg-zinc-900 dark:bg-zinc-800 text-center">
            <h3 className="text-xl font-semibold text-white mb-3">{(component.props.heading as string) || 'Call to Action'}</h3>
            <button className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium">Get Started</button>
          </div>
        );
      case 'footer':
        return (
          <div className="py-8 px-8 bg-zinc-100 dark:bg-zinc-800 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">&copy; 2026 Your Company</p>
          </div>
        );
      default:
        return (
          <div className="p-8 text-center text-zinc-500 border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg">
            {component.type} component
          </div>
        );
    }
  };

  return (
    <div
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      className={`relative cursor-pointer transition-all ${
        isSelected
          ? 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-zinc-900'
          : 'hover:ring-2 hover:ring-blue-300 dark:hover:ring-blue-700'
      }`}
    >
      {renderComponent()}
      {isSelected && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-blue-500 text-white text-xs rounded">
          {component.type}
        </div>
      )}
    </div>
  );
}

export function Canvas({ components, selectedId, onSelect, onDrop, viewport }: CanvasProps) {
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const type = e.dataTransfer.getData('component-type');
    if (type) onDrop(type);
  };

  return (
    <div className="flex-1 overflow-auto bg-zinc-100 dark:bg-zinc-950 p-4 lg:p-8">
      <div
        className={`mx-auto bg-white dark:bg-zinc-900 min-h-[600px] shadow-xl rounded-lg overflow-hidden transition-all duration-300 ${viewportWidths[viewport]}`}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => onSelect(null)}
      >
        {components.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-96 text-zinc-500 dark:text-zinc-400">
            <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            <p className="text-lg font-medium">Drag components here</p>
            <p className="text-sm mt-1">or use AI to generate sections automatically</p>
          </div>
        ) : (
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {components.map((comp) => (
              <ComponentPreview
                key={comp.id}
                component={comp}
                isSelected={comp.id === selectedId}
                onClick={() => onSelect(comp.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
