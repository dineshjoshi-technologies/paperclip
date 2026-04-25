'use client'

import { createContext, useContext, useState, useEffect, type ReactNode } from 'react'
import { API_BASE } from '@/lib/utils'

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<void>
  logout: () => void
  isLoading: boolean
  forgotPassword: (email: string) => Promise<void>
  resetPassword: (token: string, newPassword: string) => Promise<void>
  verifyEmail: (token: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    if (stored && storedUser) {
      setToken(stored)
      setUser(JSON.parse(storedUser))
    }
    setIsLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })

    const body = await res.json().catch(() => null)

    if (!res.ok) {
      throw new Error(body?.error || body?.message || `Login failed: ${res.status}`)
    }

    const accessToken = body?.accessToken || body?.token
    if (!accessToken || !body?.user) {
      throw new Error('Login response is missing required authentication data')
    }

    setToken(accessToken)
    setUser({ id: body.user.id, email: body.user.email, name: body.user.name })
    localStorage.setItem('auth_token', accessToken)
    localStorage.setItem('auth_user', JSON.stringify({ id: body.user.id, email: body.user.email, name: body.user.name }))
  }

  const register = async (name: string, email: string, password: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    const body = await res.json().catch(() => null)

    if (!res.ok) {
      throw new Error(body?.error || body?.message || `Registration failed: ${res.status}`)
    }

    setToken(null)
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  const forgotPassword = async (email: string) => {
    const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.error || `Failed to send reset email`)
    }
  }

  const resetPassword = async (token: string, newPassword: string) => {
    const res = await fetch(`${API_BASE}/api/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    })

    const body = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(body?.error || `Password reset failed`)
    }
  }

  const verifyEmail = async (token: string) => {
    const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
    })

    const body = await res.json().catch(() => null)
    if (!res.ok) {
      throw new Error(body?.error || `Email verification failed`)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading, forgotPassword, resetPassword, verifyEmail }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
