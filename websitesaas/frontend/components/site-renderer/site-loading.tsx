export function SiteLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-zinc-900 border-r-transparent" />
        <p className="mt-4 text-zinc-500">Loading site...</p>
      </div>
    </div>
  )
}
