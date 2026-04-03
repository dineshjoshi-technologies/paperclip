export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      <nav className="w-full border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="font-bold text-xl">DJ Technologies</div>
          <div className="flex items-center gap-6">
            <a href="#features" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">Features</a>
            <a href="#pricing" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">Pricing</a>
            <a href="/auth/login" className="text-sm text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100">Login</a>
            <a href="/auth/register" className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 rounded-full text-sm font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
              Get Started
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-6 py-24 text-center">
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50 mb-6">
            Build Websites with AI
          </h1>
          <p className="text-xl text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-10">
            Create, manage, and scale digital experiences using simple prompts and intuitive interfaces. No code required.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a href="/auth/register" className="bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-8 py-3 rounded-full font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors text-center">
              Start Building Free
            </a>
            <button className="border border-zinc-300 dark:border-zinc-700 px-8 py-3 rounded-full font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
              View Demo
            </button>
          </div>
        </section>

        <section id="features" className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-center mb-16 text-zinc-900 dark:text-zinc-50">
            Everything You Need
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🤖</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">AI Website Generation</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Generate fully functional websites from simple text prompts with AI-assisted design decisions.</p>
            </div>
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">✍️</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">Natural Language Editing</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Modify anything using text prompts. Make sections modern, add pricing, change themes instantly.</p>
            </div>
            <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🚀</span>
              </div>
              <h3 className="text-xl font-semibold mb-2 text-zinc-900 dark:text-zinc-50">Instant Deployment</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Deploy instantly with built-in hosting, domain connection, SSL, CDN, and zero-config setup.</p>
            </div>
          </div>
        </section>

        <section id="pricing" className="max-w-6xl mx-auto px-6 py-24">
          <h2 className="text-3xl font-bold text-center mb-16 text-zinc-900 dark:text-zinc-50">
            Simple Pricing
          </h2>
          <div className="max-w-md mx-auto p-8 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-center">
            <h3 className="text-2xl font-bold mb-2 text-zinc-900 dark:text-zinc-50">Starter</h3>
            <div className="text-4xl font-bold mb-4 text-zinc-900 dark:text-zinc-50">₹199<span className="text-lg font-normal text-zinc-600 dark:text-zinc-400">/month</span></div>
            <ul className="text-left space-y-3 mb-8">
              <li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <span className="text-green-500">✓</span> AI-powered website builder
              </li>
              <li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <span className="text-green-500">✓</span> Built-in hosting & SSL
              </li>
              <li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <span className="text-green-500">✓</span> Custom domain support
              </li>
              <li className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
                <span className="text-green-500">✓</span> Basic templates
              </li>
            </ul>
            <a href="/auth/register" className="block w-full bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 py-3 rounded-full font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors">
              Get Started
            </a>
          </div>
        </section>
      </main>

      <footer id="contact" className="border-t border-zinc-200 dark:border-zinc-800 py-12">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-8 mb-8">
            <div>
              <h4 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-50">DJ Technologies</h4>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">AI Automation, Software Development, Hosting & Infrastructure, Digital Systems</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-50">Product</h4>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Features</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Pricing</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Templates</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4 text-zinc-900 dark:text-zinc-50">Company</h4>
              <ul className="space-y-2 text-sm text-zinc-600 dark:text-zinc-400">
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">About</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Contact</a></li>
                <li><a href="#" className="hover:text-zinc-900 dark:hover:text-zinc-100">Support</a></li>
              </ul>
            </div>
          </div>
          <div className="text-sm text-zinc-500 dark:text-zinc-500 text-center pt-8 border-t border-zinc-200 dark:border-zinc-800">
            © 2026 DJ Technologies. Building the future of digital creation.
          </div>
        </div>
      </footer>
    </div>
  );
}