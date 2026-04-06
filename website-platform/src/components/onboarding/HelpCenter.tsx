'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface HelpArticle {
  id: string;
  title: string;
  category: string;
  icon: string;
}

const HELP_ARTICLES: HelpArticle[] = [
  { id: 'getting-started', title: 'Getting Started', category: 'Basics', icon: '🚀' },
  { id: 'choosing-template', title: 'Choosing a Template', category: 'Templates', icon: '🎨' },
  { id: 'adding-pages', title: 'Adding Pages', category: 'Pages', icon: '📄' },
  { id: 'customizing-colors', title: 'Customizing Colors', category: 'Design', icon: '🎭' },
  { id: 'adding-components', title: 'Adding Components', category: 'Components', icon: '🧩' },
  { id: 'publishing-site', title: 'Publishing Your Site', category: 'Publishing', icon: '🚀' },
  { id: 'custom-domain', title: 'Setting Up Custom Domain', category: 'Domain', icon: '🌐' },
  { id: 'seo-settings', title: 'SEO Best Practices', category: 'SEO', icon: '🔍' },
];

interface ContextualHelpProps {
  context?: string;
}

export function ContextualHelp({ context }: ContextualHelpProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filteredArticles = HELP_ARTICLES.filter(
    (article) =>
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleArticleClick = (articleId: string) => {
    router.push(`/help/${articleId}`);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-12 h-12 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-colors flex items-center justify-center text-xl z-40"
        aria-label="Help"
      >
        ?
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="fixed bottom-20 right-6 w-80 bg-white rounded-xl shadow-xl z-50 overflow-hidden">
            <div className="p-4 border-b border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3">Help Center</h3>
              <input
                type="text"
                placeholder="Search help articles..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="max-h-80 overflow-y-auto">
              {filteredArticles.map((article) => (
                <button
                  key={article.id}
                  onClick={() => handleArticleClick(article.id)}
                  className="w-full p-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-b-0"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{article.icon}</span>
                    <div>
                      <div className="font-medium text-gray-900 text-sm">
                        {article.title}
                      </div>
                      <div className="text-xs text-gray-500">
                        {article.category}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {filteredArticles.length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  No articles found
                </div>
              )}
            </div>
            <div className="p-3 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => {
                  router.push('/help');
                  setIsOpen(false);
                }}
                className="w-full text-center text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All Help Articles →
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export function HelpButton({
  articleId,
  children,
}: {
  articleId: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push(`/help/${articleId}`)}
      className="inline-flex items-center gap-1 text-blue-600 hover:text-blue-700 text-sm font-medium"
    >
      {children}
      <svg
        className="w-4 h-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.002 2.675-.126.127-.14.34-.034.51l2.158 1.34a.532.532 0 0 1 .034.511C16.3 19.347 14.834 20 13.193 20c-2.11 0-4.113-.88-5.417-2.384A4.002 4.002 0 0 1 3 12c0-2.21 1.79-4 4-4s4 1.79 4 4c0 1.164-.845 2.13-1.994 2.467a.53.53 0 0 1-.035-.01L8.228 9z"
        />
      </svg>
    </button>
  );
}
