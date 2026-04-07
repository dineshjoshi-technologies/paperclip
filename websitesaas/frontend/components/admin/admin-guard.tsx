'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'
import { API_BASE } from '@/lib/utils'

const ADMIN_ROLES = ['SUPER_ADMIN', 'ADMIN']

export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { user, token, isLoading, logout } = useAuth()
  const router = useRouter()
  const [checkingRole, setCheckingRole] = useState(true)
  const [hasAccess, setHasAccess] = useState(false)

  useEffect(() => {
    if (isLoading || !user) {
      if (!isLoading && !user) {
        router.push('/auth/login?redirect=/admin')
      }
      return
    }

    async function checkRole() {
      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        })

        if (!res.ok) {
          logout()
          router.push('/auth/login?redirect=/admin')
          return
        }

        const data = await res.json()
        const userRole = data.user?.role

        if (ADMIN_ROLES.includes(userRole)) {
          setHasAccess(true)
        } else {
          setHasAccess(false)
          router.push('/dashboard')
        }
      } catch {
        setHasAccess(false)
        router.push('/dashboard')
      } finally {
        setCheckingRole(false)
      }
    }

    checkRole()
  }, [user, isLoading, token, router, logout])

  if (isLoading || checkingRole) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="text-zinc-500 dark:text-zinc-400">Verifying access...</div>
      </div>
    )
  }

  if (!hasAccess) {
    return null
  }

  return <>{children}</>
}
