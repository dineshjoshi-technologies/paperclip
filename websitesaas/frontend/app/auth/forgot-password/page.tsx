'use client'

import { useState, type FormEvent } from 'react'
import Link from 'next/link'
import { API_BASE } from '@/lib/utils'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      // Always show success to prevent email enumeration
      if (res.ok || res.status === 200) {
        setSubmitted(true)
      } else {
        setSubmitted(true)
      }
    } catch {
      // On network error, still show success to avoid leaking info
      setSubmitted(true)
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
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-[100] focus:top-2 focus:left-2 focus:px-4 focus:py-2 focus:bg-zinc-900 focus:text-white focus:rounded-md"
      >
        Skip to main content
      </a>
      <main id="main-content" className="flex-1 flex items-center justify-center px-6 py-24">
        <div className="w-full max-w-md p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          {!submitted ? (
            <>
              <h1 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">Reset Password</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                Enter your email and we'll send you a link to reset your password.
              </p>
              <form className="space-y-4" onSubmit={handleSubmit}>
                {error && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm" role="alert">
                    {error}
                  </div>
                )}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2 text-zinc-700 dark:text-zinc-300">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
                    placeholder="you@example.com"
                    required
                    autoFocus
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50"
                >
                  {loading ? 'Sending...' : 'Send Reset Link'}
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">Check your email</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                  If an account exists for <strong>{email}</strong>, we've sent a password reset link.
                </p>
              </div>
            </>
          )}
          <p className="mt-4 text-sm text-center text-zinc-600 dark:text-zinc-400">
            Remember your password? <Link href="/auth/login" className="text-zinc-900 dark:text-zinc-100 font-medium">Sign in</Link>
          </p>
        </div>
      </main>
    </div>
  )
}
