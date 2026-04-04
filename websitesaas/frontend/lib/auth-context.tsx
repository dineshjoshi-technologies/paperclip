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
  register: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
  isLoading: boolean
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

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.message || `Login failed: ${res.status}`)
    }

    const data = await res.json()
    setToken(data.token)
    setUser({ id: data.user.id, email: data.user.email, name: data.user.name })
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user', JSON.stringify({ id: data.user.id, email: data.user.email, name: data.user.name }))
  }

  const register = async (email: string, password: string, name: string) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    })

    if (!res.ok) {
      const body = await res.json().catch(() => null)
      throw new Error(body?.message || `Registration failed: ${res.status}`)
    }

    const data = await res.json()
    setToken(data.token)
    setUser({ id: data.user.id, email: data.user.email, name: data.user.name })
    localStorage.setItem('auth_token', data.token)
    localStorage.setItem('auth_user', JSON.stringify({ id: data.user.id, email: data.user.email, name: data.user.name }))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, isLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
