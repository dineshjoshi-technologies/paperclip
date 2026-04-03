export default function DashboardPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <nav className="w-full border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="font-bold text-xl">DJ Technologies</a>
          <div className="flex items-center gap-6">
            <a href="/dashboard" className="text-sm text-zinc-600 dark:text-zinc-400">My Websites</a>
            <a href="/dashboard/templates" className="text-sm text-zinc-600 dark:text-zinc-400">Templates</a>
            <button className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-full text-sm font-medium">
              New Website
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        <h1 className="text-3xl font-bold mb-8 text-zinc-900 dark:text-zinc-50">My Websites</h1>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-dashed border-zinc-300 dark:border-zinc-700 flex flex-col items-center justify-center min-h-[200px] cursor-pointer hover:border-zinc-900 dark:hover:border-zinc-100 transition-colors">
            <span className="text-4xl mb-2">+</span>
            <p className="text-zinc-600 dark:text-zinc-400">Create New Website</p>
          </div>
        </div>
      </main>
    </div>
  );
}