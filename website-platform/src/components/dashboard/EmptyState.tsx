'use client';

import { useRouter } from 'next/navigation';

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: string;
}

export function DashboardEmptyState({
  title,
  description,
  actionLabel = 'Create Website',
  onAction,
  icon = '🌐',
}: EmptyStateProps) {
  const router = useRouter();

  const handleAction = () => {
    if (onAction) {
      onAction();
    } else {
      router.push('/websites/new');
    }
  };

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 text-center max-w-md mb-6">{description}</p>
      <button
        onClick={handleAction}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        {actionLabel}
      </button>
    </div>
  );
}

export function OnboardingEmptyState() {
  const router = useRouter();

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl">
      <div className="text-6xl mb-4">🎯</div>
      <h3 className="text-xl font-semibold text-gray-900 mb-2">
        Complete Your Onboarding
      </h3>
      <p className="text-gray-600 text-center max-w-md mb-6">
        Finish setting up your account to unlock all features and start building
        your website.
      </p>
      <button
        onClick={() => router.push('/onboarding')}
        className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
      >
        Start Onboarding
      </button>
    </div>
  );
}

export function FirstWebsiteMilestone() {
  return (
    <div className="bg-gradient-to-r from-amber-400 to-orange-500 rounded-xl p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl mb-1">🏆</div>
          <h4 className="font-semibold text-lg">First Website Created!</h4>
          <p className="text-white/80 text-sm">
            You&apos;ve started your journey. Keep going!
          </p>
        </div>
        <div className="text-4xl">🌟</div>
      </div>
    </div>
  );
}

export function QuickStartCard({
  title,
  description,
  icon,
  href,
}: {
  title: string;
  description: string;
  icon: string;
  href: string;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(href)}
      className="w-full p-4 bg-white border border-gray-200 rounded-xl hover:border-blue-300 hover:shadow-md transition-all text-left"
    >
      <div className="text-2xl mb-2">{icon}</div>
      <h4 className="font-medium text-gray-900">{title}</h4>
      <p className="text-sm text-gray-600">{description}</p>
    </button>
  );
}
