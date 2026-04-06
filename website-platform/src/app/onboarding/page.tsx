'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface OnboardingStep {
  id: number;
  title: string;
  description: string;
  icon: string;
}

const STEPS: OnboardingStep[] = [
  {
    id: 1,
    title: 'Set Up Your Profile',
    description: 'Tell us about yourself and choose your role',
    icon: '👤',
  },
  {
    id: 2,
    title: 'Create Your First Website',
    description: 'Give your website a name and domain',
    icon: '🌐',
  },
  {
    id: 3,
    title: 'Choose a Template',
    description: 'Select from our professionally designed templates',
    icon: '🎨',
  },
  {
    id: 4,
    title: 'Customize Your Site',
    description: 'Make it unique with colors, fonts, and content',
    icon: '✨',
  },
  {
    id: 5,
    title: 'Publish & Share',
    description: 'Launch your website and share with the world',
    icon: '🚀',
  },
];

export default function OnboardingWizard() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    role: '',
    websiteName: '',
    websiteSlug: '',
    templateId: '',
  });

  useEffect(() => {
    fetchOnboardingStatus();
  }, []);

  const fetchOnboardingStatus = async () => {
    try {
      const token = localStorage.getItem('accessToken');
      const res = await fetch('/api/auth/onboarding', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (data.success && data.data.step) {
        setCurrentStep(data.data.step);
      }
    } catch (error) {
      console.error('Failed to fetch onboarding status:', error);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('accessToken');
      const nextStep = currentStep + 1;

      const res = await fetch('/api/auth/onboarding/step', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ step: nextStep }),
      });

      const data = await res.json();
      if (data.success) {
        setCurrentStep(nextStep);
      }
    } catch (error) {
      console.error('Failed to update onboarding step:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSkip = async () => {
    if (currentStep < 5) {
      await handleNext();
    } else {
      router.push('/dashboard');
    }
  };

  const handleRoleSelect = (role: string) => {
    setFormData((prev) => ({ ...prev, role }));
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-semibold text-gray-900">DJ Technologies</h1>
          <button
            onClick={handleSkip}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip for now →
          </button>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="mb-8">
            <div className="flex items-center justify-between">
              {STEPS.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                      step.id <= currentStep
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-200 text-gray-500'
                    }`}
                  >
                    {step.id < currentStep ? '✓' : step.id}
                  </div>
                  {index < STEPS.length - 1 && (
                    <div
                      className={`w-16 h-1 mx-2 rounded ${
                        step.id < currentStep ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <div className="text-center mb-8">
              <span className="text-4xl mb-4 block">{STEPS[currentStep - 1]?.icon}</span>
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">
                {STEPS[currentStep - 1]?.title}
              </h2>
              <p className="text-gray-600">
                {STEPS[currentStep - 1]?.description}
              </p>
            </div>

            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      First Name
                    </label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="John"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                      }
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Doe"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select your role
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {['Designer', 'Developer', 'Business Owner', 'Marketer', 'Other'].map(
                      (role) => (
                        <button
                          key={role}
                          onClick={() => handleRoleSelect(role)}
                          className={`p-3 rounded-lg border-2 text-sm font-medium transition-colors ${
                            formData.role === role
                              ? 'border-blue-600 bg-blue-50 text-blue-700'
                              : 'border-gray-200 hover:border-gray-300 text-gray-700'
                          }`}
                        >
                          {role}
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website Name
                  </label>
                  <input
                    type="text"
                    value={formData.websiteName}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        websiteName: e.target.value,
                        websiteSlug: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                      }))
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="My Awesome Website"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Website URL
                  </label>
                  <div className="flex items-center">
                    <span className="px-3 py-2 bg-gray-100 border border-r-0 border-gray-300 rounded-l-lg text-gray-500 text-sm">
                      djtechnologies.com/
                    </span>
                    <input
                      type="text"
                      value={formData.websiteSlug}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, websiteSlug: e.target.value }))
                      }
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="my-website"
                    />
                  </div>
                </div>
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid grid-cols-2 gap-4">
                {['Business', 'Portfolio', 'Ecommerce', 'Blog', 'Landing Page'].map(
                  (category) => (
                    <button
                      key={category}
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, templateId: category }))
                      }
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        formData.templateId === category
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="text-2xl mb-2">
                        {category === 'Business' && '🏢'}
                        {category === 'Portfolio' && '🎨'}
                        {category === 'Ecommerce' && '🛒'}
                        {category === 'Blog' && '📝'}
                        {category === 'Landing Page' && '🚀'}
                      </div>
                      <div className="font-medium text-gray-900">{category}</div>
                    </button>
                  )
                )}
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-lg p-6 text-center">
                  <p className="text-gray-600 mb-4">
                    Preview your website and make your first edit!
                  </p>
                  <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                    Launch Builder
                  </button>
                </div>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4">
                <div className="bg-green-50 rounded-lg p-6 text-center">
                  <div className="text-4xl mb-4">🎉</div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    Congratulations!
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Your website is ready to publish
                  </p>
                  <button className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                    Publish Now
                  </button>
                </div>
              </div>
            )}

            <div className="mt-8 flex justify-between">
              {currentStep > 1 && (
                <button
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Back
                </button>
              )}
              <div className="flex-1" />
              <button
                onClick={currentStep === 5 ? handleSkip : handleNext}
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {loading
                  ? 'Saving...'
                  : currentStep === 5
                  ? 'Go to Dashboard'
                  : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
