'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ViewportSwitcher, type ViewportSize } from './ViewportSwitcher';

function ToolbarIcon({ active, children, label, onClick }: { active?: boolean; children: React.ReactNode; label: string; onClick?: () => void }) {
  return (
    <button
      onClick={onClick}
      className={`p-2 rounded-lg transition-colors ${
        active
          ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400'
          : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
      }`}
      aria-label={label}
    >
      {children}
    </button>
  );
}

interface BuilderToolbarProps {
  viewport: ViewportSize;
  onViewportChange: (size: ViewportSize) => void;
  rightSidebarTab: string;
  onRightTabChange: (tab: string) => void;
}

export function BuilderToolbar({ viewport, onViewportChange, rightSidebarTab, onRightTabChange }: BuilderToolbarProps) {
  return (
    <header className="h-14 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between px-4">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xs">DJ</span>
          </div>
          <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-50 hidden sm:inline">Builder</span>
        </Link>
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
        <ViewportSwitcher value={viewport} onChange={onViewportChange} />
      </div>

      <div className="flex items-center gap-2">
        <ToolbarIcon label="Preview">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        </ToolbarIcon>
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
        <ToolbarIcon active={rightSidebarTab === 'ai'} label="AI Panel" onClick={() => onRightTabChange(rightSidebarTab === 'ai' ? 'properties' : 'ai')}>
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </ToolbarIcon>
        <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-700" />
        <button className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white text-sm font-medium rounded-lg hover:shadow-lg hover:shadow-blue-500/25 transition-all">
          Publish
        </button>
      </div>
    </header>
  );
}
