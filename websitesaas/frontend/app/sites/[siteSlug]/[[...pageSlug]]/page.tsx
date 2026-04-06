import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { SiteRenderer } from '@/components/site-renderer'
import type { BuilderComponent } from '@/components/builder/types'
import { API_BASE } from '@/lib/utils'

interface SiteData {
  website: {
    id: string
    name: string
    slug: string
    config: Record<string, unknown>
  }
  page: {
    id: string
    name: string
    slug: string
    content: Record<string, unknown>
  }
  components: BuilderComponent[]
  pages: Array<{ id: string; name: string; slug: string }>
}

async function fetchSite(siteSlug: string, pageSlug?: string): Promise<SiteData | null> {
  const path = pageSlug && pageSlug !== 'home'
    ? `/api/sites/${siteSlug}/${pageSlug}`
    : `/api/sites/${siteSlug}`

  try {
    const res = await fetch(`${API_BASE}${path}`, {
      next: { revalidate: 60 },
    })

    if (!res.ok) return null
    return res.json()
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ siteSlug: string; pageSlug?: string[] }>
}): Promise<Metadata> {
  const resolvedParams = await params
  const siteSlug = resolvedParams.siteSlug
  const pageSlug = resolvedParams.pageSlug?.join('/') || 'home'

  const data = await fetchSite(siteSlug, pageSlug)

  if (!data) {
    return {
      title: 'Page Not Found',
      robots: 'noindex, nofollow',
    }
  }

  const pageContent = data.page.content as { title?: string; description?: string; ogImage?: string }

  return {
    title: pageContent?.title || `${data.page.name} | ${data.website.name}`,
    description: pageContent?.description || data.website.name,
    openGraph: pageContent?.ogImage
      ? { images: [{ url: pageContent.ogImage }] }
      : undefined,
  }
}

export default async function SitePage({
  params,
}: {
  params: Promise<{ siteSlug: string; pageSlug?: string[] }>
}) {
  const resolvedParams = await params
  const siteSlug = resolvedParams.siteSlug
  const pageSlug = resolvedParams.pageSlug?.join('/') || 'home'

  const data = await fetchSite(siteSlug, pageSlug)

  if (!data) {
    notFound()
  }

  return (
    <main className="min-h-screen">
      <SiteRenderer components={data.components} />
    </main>
  )
}
