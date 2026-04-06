import Link from 'next/link'

export default function SiteNotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center px-4">
        <h1 className="text-6xl font-bold text-zinc-900 mb-4">404</h1>
        <p className="text-xl text-zinc-600 mb-8">
          This site could not be found or is not published.
        </p>
        <Link
          href="/"
          className="inline-flex items-center px-6 py-3 bg-zinc-900 text-white rounded-lg font-medium hover:bg-zinc-800 transition-colors"
        >
          Go to Homepage
        </Link>
      </div>
    </div>
  )
}
