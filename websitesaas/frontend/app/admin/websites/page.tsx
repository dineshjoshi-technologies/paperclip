'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import {
  Search,
  Globe,
  Eye,
  EyeOff,
  Power,
  Trash2,
  ExternalLink,
} from 'lucide-react'

interface Website {
  id: string
  name: string
  slug: string
  owner: string
  ownerEmail: string
  status: 'published' | 'draft' | 'suspended'
  plan: string
  createdAt: string
  lastPublished: string
}

const mockWebsites: Website[] = [
  { id: '1', name: 'Tech Startup', slug: 'tech-startup', owner: 'John Doe', ownerEmail: 'john@example.com', status: 'published', plan: 'Pro', createdAt: '2024-01-15', lastPublished: '2024-11-20' },
  { id: '2', name: 'Portfolio Site', slug: 'portfolio-site', owner: 'Jane Smith', ownerEmail: 'jane@example.com', status: 'published', plan: 'Starter', createdAt: '2024-02-20', lastPublished: '2024-11-18' },
  { id: '3', name: 'E-commerce Store', slug: 'ecommerce-store', owner: 'Bob Wilson', ownerEmail: 'bob@example.com', status: 'suspended', plan: 'Pro', createdAt: '2024-03-10', lastPublished: '2024-10-05' },
  { id: '4', name: 'Blog Platform', slug: 'blog-platform', owner: 'Alice Brown', ownerEmail: 'alice@example.com', status: 'published', plan: 'Enterprise', createdAt: '2024-01-05', lastPublished: '2024-11-22' },
  { id: '5', name: 'Restaurant Menu', slug: 'restaurant-menu', owner: 'Charlie Davis', ownerEmail: 'charlie@example.com', status: 'draft', plan: 'Free', createdAt: '2024-04-18', lastPublished: '2024-09-12' },
  { id: '6', name: 'Agency Landing Page', slug: 'agency-landing', owner: 'Diana Evans', ownerEmail: 'diana@example.com', status: 'published', plan: 'Starter', createdAt: '2024-05-22', lastPublished: '2024-11-15' },
  { id: '7', name: 'Personal Blog', slug: 'personal-blog', owner: 'Eve Foster', ownerEmail: 'eve@example.com', status: 'published', plan: 'Free', createdAt: '2024-06-30', lastPublished: '2024-11-10' },
  { id: '8', name: 'SaaS Dashboard', slug: 'saas-dashboard', owner: 'Frank Green', ownerEmail: 'frank@example.com', status: 'published', plan: 'Enterprise', createdAt: '2024-02-14', lastPublished: '2024-11-21' },
]

export default function AdminWebsitesPage() {
  const [websites, setWebsites] = useState<Website[]>(mockWebsites)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [planFilter, setPlanFilter] = useState('')

  const filteredWebsites = websites.filter((site) => {
    const matchesSearch = site.name.toLowerCase().includes(search.toLowerCase()) ||
      site.owner.toLowerCase().includes(search.toLowerCase()) ||
      site.slug.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = !statusFilter || site.status === statusFilter
    const matchesPlan = !planFilter || site.plan === planFilter
    return matchesSearch && matchesStatus && matchesPlan
  })

  const handleTogglePublish = (site: Website) => {
    setWebsites((prev) =>
      prev.map((w) =>
        w.id === site.id
          ? { ...w, status: w.status === 'published' ? 'draft' : 'published' }
          : w
      )
    )
  }

  const handleSuspend = (site: Website) => {
    setWebsites((prev) =>
      prev.map((w) =>
        w.id === site.id
          ? { ...w, status: w.status === 'suspended' ? 'draft' : 'suspended' }
          : w
      )
    )
  }

  const handleDelete = (id: string) => {
    setWebsites((prev) => prev.filter((w) => w.id !== id))
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Website Management</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          View, publish, unpublish, and manage all websites on the platform
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Search websites..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'published', label: 'Published' },
                { value: 'draft', label: 'Draft' },
                { value: 'suspended', label: 'Suspended' },
              ]}
            />
            <Select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              options={[
                { value: '', label: 'All Plans' },
                { value: 'Free', label: 'Free' },
                { value: 'Starter', label: 'Starter' },
                { value: 'Pro', label: 'Pro' },
                { value: 'Enterprise', label: 'Enterprise' },
              ]}
            />
          </div>
        </CardContent>
      </Card>

      {/* Websites Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-50 dark:bg-zinc-900/50 border-b border-zinc-200 dark:border-zinc-800">
                <tr>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Website</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden md:table-cell">Owner</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Plan</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider hidden lg:table-cell">Created</th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filteredWebsites.map((site) => (
                  <tr key={site.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green-500 to-blue-500 flex items-center justify-center">
                          <Globe className="h-4 w-4 text-white" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50">{site.name}</p>
                          <p className="text-xs text-zinc-500 dark:text-zinc-400">{site.slug}.djtech.app</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <p className="text-sm text-zinc-900 dark:text-zinc-50">{site.owner}</p>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">{site.ownerEmail}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        site.status === 'published'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : site.status === 'suspended'
                          ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
                          : 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                      }`}>
                        {site.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-zinc-600 dark:text-zinc-400 hidden lg:table-cell">{site.plan}</td>
                    <td className="px-4 py-3 text-sm text-zinc-500 dark:text-zinc-400 hidden lg:table-cell">{site.createdAt}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleTogglePublish(site)}
                          className={site.status === 'published' ? 'text-amber-600' : 'text-green-600'}
                        >
                          {site.status === 'published' ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSuspend(site)}
                          className={site.status === 'suspended' ? 'text-green-600' : 'text-red-600'}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => handleDelete(site.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {filteredWebsites.length === 0 && (
            <div className="text-center py-12 text-zinc-500 dark:text-zinc-400">
              No websites found matching your filters
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
