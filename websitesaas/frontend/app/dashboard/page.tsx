'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { DashboardHeader, DashboardSidebar } from '@/components/layout'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Input } from '@/components/ui/input'
import { apiFetch, formatDate, slugify } from '@/lib/utils'

interface Website {
  id: string
  name: string
  slug: string
  status: string
  createdAt: string
  updatedAt: string
}

export default function DashboardPage() {
  const [websites, setWebsites] = useState<Website[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newName, setNewName] = useState('')
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    loadWebsites()
  }, [])

  async function loadWebsites() {
    try {
      const data = await apiFetch<Website[]>('/api/websites')
      setWebsites(data)
    } catch {
      setWebsites([])
    } finally {
      setLoading(false)
    }
  }

  async function handleCreate() {
    if (!newName.trim()) return
    setCreating(true)
    try {
      const website = await apiFetch<Website>('/api/websites', {
        method: 'POST',
        body: JSON.stringify({ name: newName.trim(), slug: slugify(newName) }),
      })
      setWebsites((prev) => [...prev, website])
      setNewName('')
      setShowCreateModal(false)
    } catch (err) {
      console.error('Failed to create website:', err)
    } finally {
      setCreating(false)
    }
  }

  async function handleDelete(id: string) {
    try {
      await apiFetch(`/api/websites/${id}`, { method: 'DELETE' })
      setWebsites((prev) => prev.filter((w) => w.id !== id))
    } catch (err) {
      console.error('Failed to delete website:', err)
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <DashboardHeader />
      <div className="flex">
        <DashboardSidebar />
        <main className="flex-1 p-6">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">My Websites</h1>
              <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
                Manage and build your websites
              </p>
            </div>
            <Button variant="primary" size="md" onClick={() => setShowCreateModal(true)}>
              + New Website
            </Button>
          </div>

          {loading ? (
            <div className="text-center py-12 text-zinc-400">Loading...</div>
          ) : websites.length === 0 ? (
            <div className="text-center py-12">
              <span className="text-4xl">🌐</span>
              <p className="text-zinc-500 dark:text-zinc-400 mt-3">
                No websites yet. Create your first one to get started.
              </p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {websites.map((site) => (
                <Card key={site.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <CardTitle className="text-base truncate">{site.name}</CardTitle>
                    <CardDescription>
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        site.status === 'PUBLISHED'
                          ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                          : site.status === 'ARCHIVED'
                          ? 'bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400'
                          : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                      }`}>
                        {site.status.toLowerCase()}
                      </span>
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">
                      Updated {formatDate(site.updatedAt)}
                    </p>
                  </CardContent>
                  <CardFooter className="flex gap-2">
                    <Button variant="primary" size="sm" className="flex-1" asChild>
                      <Link href={`/builder?websiteId=${site.id}`}>
                        Edit
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(site.id)}>
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>

      <Modal open={showCreateModal} onClose={() => setShowCreateModal(false)}>
        <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50 mb-4">
          Create New Website
        </h2>
        <Input
          placeholder="Website name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreate() }}
          autoFocus
        />
        <div className="flex gap-2 mt-4 justify-end">
          <Button variant="ghost" onClick={() => setShowCreateModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleCreate} disabled={creating || !newName.trim()}>
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </div>
      </Modal>
    </div>
  )
}
