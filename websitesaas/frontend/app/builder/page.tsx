'use client'

import { Suspense, useEffect, useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { PageBuilder, type BuilderComponent } from '@/components/builder'
import { DashboardHeader } from '@/components/layout/dashboard-header'
import { apiFetch } from '@/lib/utils'

interface WebsiteData {
  id: string
  name: string
  slug: string
  status: string
  config: Record<string, unknown> | null
}

function BuilderContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const websiteId = searchParams.get('websiteId')
  const pageId = searchParams.get('pageId')
  const [website, setWebsite] = useState<WebsiteData | null>(null)
  const [pageComponents, setPageComponents] = useState<BuilderComponent[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!websiteId) {
      router.push('/dashboard')
      return
    }

    async function loadData() {
      try {
        const site = await apiFetch<WebsiteData>(`/api/websites/${websiteId}`)
        setWebsite(site)

        if (pageId) {
          const pageData = await apiFetch<{ content: BuilderComponent[] | null }>(
            `/api/websites/${websiteId}/pages/${pageId}`
          )
          if (pageData.content) {
            setPageComponents(pageData.content)
          }
        }
      } catch {
        router.push('/dashboard')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [websiteId, pageId, router])

  const handleSave = useCallback(
    async (components: BuilderComponent[]) => {
      if (!websiteId || !pageId) return

      try {
        await apiFetch(`/api/websites/${websiteId}/pages/${pageId}`, {
          method: 'PUT',
          body: JSON.stringify({ content: components }),
        })
      } catch (err) {
        console.error('Failed to save page:', err)
      }
    },
    [websiteId, pageId]
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <p className="text-zinc-500 dark:text-zinc-400">Loading builder...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950">
      <DashboardHeader userName={website?.name} />
      <PageBuilder initialComponents={pageComponents} onSave={handleSave} />
    </div>
  )
}

function BuilderLoading() {
  return (
    <div className="flex items-center justify-center h-screen">
      <p className="text-zinc-500 dark:text-zinc-400">Loading builder...</p>
    </div>
  )
}

export default function BuilderPage() {
  return (
    <Suspense fallback={<BuilderLoading />}>
      <BuilderContent />
    </Suspense>
  )
}
