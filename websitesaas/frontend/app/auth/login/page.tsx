'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/auth-context'

export default function LoginPage() {
  const { login } = useAuth()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col min-h-screen">
      <nav className="w-full border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center">
          <a href="/" className="font-bold text-xl">DJ Technologies</a>
        </div>
      </nav>
      <main className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl font-bold mb-6 text-zinc-900 dark:text-zinc-50">Sign In</h1>
          <form className="space-y-4" onSubmit={handleSubmit}>
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                placeholder="you@example.com"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900"
                placeholder="••••••••"
                required
              />
            </div>
            <div className="flex justify-end">
              <a href="/auth/forgot-password" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">
                Forgot password?
              </a>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          <p className="mt-4 text-sm text-center text-zinc-600 dark:text-zinc-400">
            Don't have an account? <a href="/auth/register" className="text-zinc-900 dark:text-zinc-100 font-medium">Register</a>
          </p>
        </div>
      </main>
    </div>
  );
}
