'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'

interface OnboardingWizardProps {
  initialStep?: number
  onComplete?: () => void
}

const steps = [
  { id: 1, title: 'Welcome', description: 'Tell us about yourself' },
  { id: 2, title: 'Create Website', description: 'Start your first project' },
  { id: 3, title: 'Choose Template', description: 'Pick a starting point' },
  { id: 4, title: 'Customize', description: 'Make it yours' },
  { id: 5, title: 'Publish', description: 'Go live!' },
]

export function OnboardingWizard({ initialStep = 1, onComplete }: OnboardingWizardProps) {
  const [currentStep, setCurrentStep] = useState(initialStep)
  const [role, setRole] = useState('')
  const [websiteName, setWebsiteName] = useState('')
  const [selectedTemplate, setSelectedTemplate] = useState('')

  const nextStep = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1)
    } else {
      onComplete?.()
    }
  }

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    }
  }

  const canProceed = () => {
    switch (currentStep) {
      case 1: return role.length > 0
      case 2: return websiteName.length > 0
      case 3: return selectedTemplate.length > 0
      default: return true
    }
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center p-6">
      <div className="w-full max-w-2xl">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <div className={`flex items-center justify-center w-10 h-10 rounded-full font-medium text-sm transition-colors ${
                  currentStep >= step.id
                    ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900'
                    : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400'
                }`}>
                  {currentStep > step.id ? '✓' : step.id}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    currentStep > step.id
                      ? 'bg-zinc-900 dark:bg-zinc-100'
                      : 'bg-zinc-200 dark:bg-zinc-800'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Step {currentStep}: {steps[currentStep - 1]?.title}
            </p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{steps[currentStep - 1]?.title}</CardTitle>
            <CardDescription>{steps[currentStep - 1]?.description}</CardDescription>
          </CardHeader>
          <CardContent>
            {currentStep === 1 && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  How will you use DJ Technologies?
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {['Personal', 'Business', 'Agency'].map((r) => (
                    <button
                      key={r}
                      onClick={() => setRole(r)}
                      className={`p-4 rounded-lg border-2 text-left transition-colors ${
                        role === r
                          ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{r}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-4">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  What do you want to call your website?
                </label>
                <Input
                  value={websiteName}
                  onChange={(e) => setWebsiteName(e.target.value)}
                  placeholder="My Awesome Website"
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-4">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4">
                  Choose a template to get started quickly
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {['Business', 'Portfolio', 'Blog', 'E-commerce'].map((template) => (
                    <button
                      key={template}
                      onClick={() => setSelectedTemplate(template)}
                      className={`p-4 rounded-lg border-2 text-center transition-colors ${
                        selectedTemplate === template
                          ? 'border-zinc-900 dark:border-zinc-100 bg-zinc-50 dark:bg-zinc-900'
                          : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                      }`}
                    >
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">{template}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-4 text-center py-8">
                <span className="text-4xl">🎨</span>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Your website is ready to customize. Click "Continue" to open the builder and make it yours!
                </p>
              </div>
            )}

            {currentStep === 5 && (
              <div className="space-y-4 text-center py-8">
                <span className="text-4xl">🚀</span>
                <p className="text-zinc-600 dark:text-zinc-400">
                  Ready to publish your website to the world?
                </p>
                <p className="text-sm text-zinc-500">
                  You can always publish later from the dashboard.
                </p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <Button variant="primary" onClick={nextStep} disabled={!canProceed()}>
              {currentStep === 5 ? 'Publish Now' : 'Continue'}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
