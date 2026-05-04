'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { OnboardingWizard } from '@/components/onboarding-wizard'
import { apiFetch } from '@/lib/utils'

interface User {
  id: string
  email: string
  name: string
  onboardingCompleted: boolean
  onboardingStep: number
}

export default function OnboardingPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    
    if (!token || !storedUser) {
      router.push('/auth/login')
      return
    }

    setUser(JSON.parse(storedUser))
    setLoading(false)
  }, [router])

  const handleComplete = async () => {
    try {
      await apiFetch('/api/auth/onboarding-complete', {
        method: 'POST',
        body: JSON.stringify({
          role: 'selected_role',
          onboardingStep: 5,
          onboardingCompleted: true
        })
      })
      router.push('/dashboard')
    } catch (err) {
      console.error('Failed to complete onboarding:', err)
      router.push('/dashboard')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-zinc-500">Loading...</div>
      </div>
    )
  }

  return (
    <OnboardingWizard
      initialStep={user?.onboardingStep || 1}
      onComplete={handleComplete}
    />
  )
}
