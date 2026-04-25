'use client'

import { useState, useEffect, Suspense } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { API_BASE } from '@/lib/utils'

function VerifyEmailContent() {
  const searchParams = useSearchParams()
  const [token, setToken] = useState('')
  const [status, setStatus] = useState<'idle' | 'verifying' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [resending, setResending] = useState(false)
  const [resent, setResent] = useState(false)

  useEffect(() => {
    const queryToken = searchParams.get('token')
    if (queryToken) {
      setToken(queryToken)
      verifyEmail(queryToken)
    }
  }, [searchParams])

  const verifyEmail = async (t: string) => {
    setStatus('verifying')
    try {
      const res = await fetch(`${API_BASE}/api/auth/verify-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: t }),
      })
      const data = await res.json()
      if (!res.ok) {
        setStatus('error')
        setMessage(data.error || 'Verification failed')
        return
      }
      setStatus('success')
      setMessage('Your email has been verified successfully!')
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  const handleResend = async () => {
    setResending(true)
    try {
      const user = localStorage.getItem('auth_user')
      if (!user) {
        setResending(false)
        return
      }
      const { id } = JSON.parse(user)
      const token = localStorage.getItem('auth_token')
      const res = await fetch(`${API_BASE}/api/auth/resend-verification`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ userId: id }),
      })
      if (res.ok) {
        setResent(true)
      }
    } catch {
      // Silent fail for resend
    } finally {
      setResending(false)
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
          {status === 'idle' && (
            <>
              <div className="text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-zinc-600 dark:text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                </div>
                <h1 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">Verify Your Email</h1>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
                  We sent a verification link to your email. Click the link or paste the token here.
                </p>
                <form onSubmit={(e) => { e.preventDefault(); verifyEmail(token) }} className="space-y-4">
                  <input
                    type="text"
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-100 focus:ring-offset-2 dark:focus:ring-offset-zinc-950"
                    placeholder="Paste verification token"
                    autoFocus
                  />
                  <button
                    type="submit"
                    className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
                  >
                    Verify Email
                  </button>
                </form>
                <p className="mt-4 text-sm text-center text-zinc-600 dark:text-zinc-400">
                  Already verified? <Link href="/auth/login" className="text-zinc-900 dark:text-zinc-100 font-medium">Sign in</Link>
                </p>
              </div>
            </>
          )}

          {status === 'verifying' && (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">Verifying...</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Checking your verification link.</p>
            </div>
          )}

          {status === 'success' && (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">Email Verified</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{message}</p>
              <Link
                href="/dashboard"
                className="inline-block w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
              >
                Go to Dashboard
              </Link>
            </div>
          )}

          {status === 'error' && (
            <div className="text-center">
              <div className="mx-auto w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">Verification Failed</h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">{message}</p>
              {!resent ? (
                <button
                  onClick={handleResend}
                  disabled={resending}
                  className="w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-lg font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors disabled:opacity-50 mb-4"
                >
                  {resending ? 'Resending...' : 'Resend Verification Email'}
                </button>
              ) : (
                <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm mb-4" role="alert">
                  Verification email resent! Check your inbox.
                </div>
              )}
              <Link
                href="/auth/login"
                className="inline-block w-full bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-50 py-3 rounded-lg font-medium hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
              >
                Back to Sign In
              </Link>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  )
}
