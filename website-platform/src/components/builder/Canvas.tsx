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

function FeatureItem({ title, description, index }: { title?: string; description?: string; index: number }) {
  const colors = ['bg-blue-100 dark:bg-blue-900/30', 'bg-purple-100 dark:bg-purple-900/30', 'bg-green-100 dark:bg-green-900/30'];
  return (
    <div className="p-4 bg-white dark:bg-zinc-900 rounded-lg text-center">
      <div className={`w-10 h-10 mx-auto mb-3 rounded-lg ${colors[index % colors.length]} flex items-center justify-center`}>
        <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">{index + 1}</span>
      </div>
      {title && <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">{title}</p>}
      {description && <p className="text-xs text-zinc-500 dark:text-zinc-400">{description}</p>}
    </div>
  );
}

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
            <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">
              {(component.props.heading as string) || 'Hero Section'}
            </h1>
            {!!component.props.subheading && (
              <p className="text-lg text-purple-600 dark:text-purple-400 mb-3 max-w-xl mx-auto">
                {component.props.subheading as string}
              </p>
            )}
            <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto mb-6">
              {(component.props.description as string) || 'Description goes here'}
            </p>
            {!!component.props.ctaText && (
              <button className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-blue-500/25 transition-all">
                {component.props.ctaText as string}
              </button>
            )}
          </div>
        );
      case 'features':
        return (
          <div className="py-12 px-8 bg-zinc-50 dark:bg-zinc-800">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 text-center mb-8">
              {(component.props.heading as string) || 'Features'}
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <FeatureItem
                title={component.props.item1Title as string | undefined}
                description={component.props.item1Desc as string | undefined}
                index={0}
              />
              <FeatureItem
                title={component.props.item2Title as string | undefined}
                description={component.props.item2Desc as string | undefined}
                index={1}
              />
              <FeatureItem
                title={component.props.item3Title as string | undefined}
                description={component.props.item3Desc as string | undefined}
                index={2}
              />
            </div>
          </div>
        );
      case 'testimonials':
        return (
          <div className="py-12 px-8 bg-white dark:bg-zinc-900">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 text-center mb-8">
              {(component.props.heading as string) || 'What Our Clients Say'}
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {!!component.props.testimonial1Text && (
                <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 italic mb-3">
            &ldquo;{component.props.testimonial1Text as string}&rdquo;
                  </p>
                  {!!component.props.testimonial1Author && (
                    <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      — {component.props.testimonial1Author as string}
                    </p>
                  )}
                </div>
              )}
              {!!component.props.testimonial2Text && (
                <div className="p-5 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <p className="text-sm text-zinc-600 dark:text-zinc-300 italic mb-3">
            &ldquo;{component.props.testimonial2Text as string}&rdquo;
                  </p>
                  {!!component.props.testimonial2Author && (
                    <p className="text-xs font-medium text-zinc-800 dark:text-zinc-200">
                      — {component.props.testimonial2Author as string}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        );
      case 'pricing':
        return (
          <div className="py-12 px-8 bg-zinc-50 dark:bg-zinc-800">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 text-center mb-8">
              {(component.props.heading as string) || 'Choose Your Plan'}
            </h2>
            <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700">
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  {(component.props.plan1Name as string) || 'Basic'}
                </h3>
                {!!component.props.plan1Price && (
                  <p className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                    {component.props.plan1Price as string}
                  </p>
                )}
                {Array.isArray(component.props.plan1Features) && (
                  <ul className="space-y-2">
                    {(component.props.plan1Features as string[]).map((f: string, i: number) => (
                      <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                <button className="w-full mt-5 px-4 py-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-lg text-sm font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors">
                  Get Started
                </button>
              </div>
              <div className="p-6 bg-white dark:bg-zinc-900 rounded-lg border-2 border-purple-500 relative">
                <span className="absolute -top-3 left-4 px-2 py-0.5 bg-purple-600 text-white text-xs font-medium rounded-full">Popular</span>
                <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-2">
                  {(component.props.plan2Name as string) || 'Pro'}
                </h3>
                {!!component.props.plan2Price && (
                  <p className="text-3xl font-bold text-purple-600 dark:text-purple-400 mb-4">
                    {component.props.plan2Price as string}
                  </p>
                )}
                {Array.isArray(component.props.plan2Features) && (
                  <ul className="space-y-2">
                    {(component.props.plan2Features as string[]).map((f: string, i: number) => (
                      <li key={i} className="text-sm text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                        <svg className="w-4 h-4 text-green-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {f}
                      </li>
                    ))}
                  </ul>
                )}
                <button className="w-full mt-5 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg text-sm font-medium hover:shadow-lg hover:shadow-purple-500/25 transition-all">
                  Get Started
                </button>
              </div>
            </div>
          </div>
        );
      case 'cta':
        return (
          <div className="py-12 px-8 bg-gradient-to-r from-blue-600 to-purple-600 text-center">
            <h3 className="text-2xl font-bold text-white mb-3">
              {(component.props.heading as string) || 'Call to Action'}
            </h3>
            {!!component.props.description && (
              <p className="text-white/80 mb-6 max-w-md mx-auto">
                {component.props.description as string}
              </p>
            )}
            <button className="px-6 py-2.5 bg-white text-purple-600 rounded-lg text-sm font-medium hover:shadow-lg transition-all">
              {(component.props.buttonText as string) || 'Get Started'}
            </button>
          </div>
        );
      case 'faq':
        return (
          <div className="py-12 px-8 bg-white dark:bg-zinc-900">
            <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 text-center mb-8">
              {(component.props.heading as string) || 'Frequently Asked Questions'}
            </h2>
            <div className="space-y-4 max-w-lg mx-auto">
              {Array.isArray(component.props.qaPairs) && (component.props.qaPairs as Array<{ question: string; answer: string }>).map((pair, i) => (
                <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-zinc-50 mb-1">{pair.question}</h4>
                  <p className="text-xs text-zinc-600 dark:text-zinc-400">{pair.answer}</p>
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
      case 'footer':
        return (
          <div className="py-8 px-8 bg-zinc-100 dark:bg-zinc-800 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">{(component.props.content as string) || '© 2026 Your Company'}</p>
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
