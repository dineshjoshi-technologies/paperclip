'use client';

import { useState, useEffect, useRef } from 'react';

interface TourStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
}

interface GuidedTourProps {
  steps: TourStep[];
  onComplete?: () => void;
  onSkip?: () => void;
  enabled?: boolean;
}

const DEFAULT_STEPS: TourStep[] = [
  {
    target: '[data-tour="toolbar"]',
    title: 'Toolbar',
    content: 'Use the toolbar to add components, change text, and modify your design elements.',
    position: 'right',
  },
  {
    target: '[data-tour="components"]',
    title: 'Component Library',
    content: 'Browse our library of pre-built components like headers, footers, features, and more.',
    position: 'right',
  },
  {
    target: '[data-tour="properties"]',
    title: 'Properties Panel',
    content: 'Fine-tune any element\'s colors, spacing, typography, and more.',
    position: 'left',
  },
  {
    target: '[data-tour="preview"]',
    title: 'Preview Mode',
    content: 'Click here to preview how your site looks on different devices.',
    position: 'bottom',
  },
  {
    target: '[data-tour="publish"]',
    title: 'Publish',
    content: 'Ready to go live? Click here to publish your website.',
    position: 'bottom',
  },
];

export function GuidedTour({
  steps = DEFAULT_STEPS,
  onComplete,
  onSkip,
  enabled = true,
}: GuidedTourProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!enabled || steps.length === 0) return;

    const completedTour = localStorage.getItem('onboarding_tour_completed');
    if (completedTour) return;

    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 2000);

    return () => clearTimeout(timer);
  }, [enabled, steps.length]);

  useEffect(() => {
    if (!isVisible || steps.length === 0) return;

    const updatePosition = () => {
      const targetElement = document.querySelector(steps[currentStep].target);
      if (!targetElement || !tooltipRef.current) return;

      const rect = targetElement.getBoundingClientRect();
      const position = steps[currentStep].position || 'bottom';

      let top = 0;
      let left = 0;

      switch (position) {
        case 'top':
          top = rect.top - tooltipRef.current.offsetHeight - 10;
          left = rect.left + rect.width / 2 - 100;
          break;
        case 'bottom':
          top = rect.bottom + 10;
          left = rect.left + rect.width / 2 - 100;
          break;
        case 'left':
          top = rect.top + rect.height / 2 - 50;
          left = rect.left - 220;
          break;
        case 'right':
          top = rect.top + rect.height / 2 - 50;
          left = rect.right + 10;
          break;
      }

      setTooltipPosition({ top: top + window.scrollY, left });
    };

    updatePosition();
    window.addEventListener('scroll', updatePosition);
    window.addEventListener('resize', updatePosition);

    return () => {
      window.removeEventListener('scroll', updatePosition);
      window.removeEventListener('resize', updatePosition);
    };
  }, [isVisible, currentStep, steps]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('onboarding_tour_completed', 'true');
    setIsVisible(false);
    onComplete?.();
  };

  const handleSkip = () => {
    localStorage.setItem('onboarding_tour_completed', 'true');
    setIsVisible(false);
    onSkip?.();
  };

  if (!isVisible || steps.length === 0) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/30 z-40" />
      <div
        ref={tooltipRef}
        className="fixed z-50 bg-white rounded-lg shadow-xl p-4 w-80 animate-fade-in"
        style={{ top: tooltipPosition.top, left: tooltipPosition.left }}
      >
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-semibold text-gray-900">
            {steps[currentStep].title}
          </h4>
          <button
            onClick={handleSkip}
            className="text-gray-400 hover:text-gray-600 text-sm"
          >
            ×
          </button>
        </div>
        <p className="text-gray-600 text-sm mb-4">
          {steps[currentStep].content}
        </p>
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-400">
            {currentStep + 1} / {steps.length}
          </span>
          <div className="flex gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-900"
              >
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {currentStep === steps.length - 1 ? 'Done' : 'Next'}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

interface TooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 500,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout>();

  const showTooltip = () => {
    timeoutRef.current = setTimeout(() => setIsVisible(true), delay);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocus={showTooltip}
      onBlur={hideTooltip}
    >
      {children}
      {isVisible && (
        <div
          className={`absolute z-50 px-3 py-2 bg-gray-900 text-white text-sm rounded-lg whitespace-nowrap ${positionClasses[position]}`}
        >
          {content}
          <div
            className={`absolute w-2 h-2 bg-gray-900 rotate-45 ${
              position === 'top'
                ? 'top-full left-1/2 -translate-x-1/2 -mt-1'
                : position === 'bottom'
                ? 'bottom-full left-1/2 -translate-x-1/2 -mb-1'
                : position === 'left'
                ? 'left-full top-1/2 -translate-y-1/2 -ml-1'
                : 'right-full top-1/2 -translate-y-1/2 -mr-1'
            }`}
          />
        </div>
      )}
    </div>
  );
}
