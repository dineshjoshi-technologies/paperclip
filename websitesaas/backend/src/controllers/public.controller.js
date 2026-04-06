const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.getPublishedSite = async (req, res) => {
  try {
    const { siteSlug } = req.params
    const pageSlug = req.params.pageSlug || 'home'

    const website = await prisma.website.findUnique({
      where: { slug: siteSlug },
      include: {
        pages: {
          where: { isPublished: true },
          include: {
            components: { orderBy: { position: 'asc' } }
          },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!website || website.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'Site not found' })
    }

    const page = website.pages.find(p => p.slug === pageSlug)

    if (!page) {
      return res.status(404).json({ error: 'Page not found' })
    }

    const components = page.components.map(c => ({
      id: c.id,
      type: c.type,
      config: c.config || {},
      style: c.style || {},
      position: c.position,
    }))

    res.json({
      website: {
        id: website.id,
        name: website.name,
        slug: website.slug,
        config: website.config || {},
      },
      page: {
        id: page.id,
        name: page.name,
        slug: page.slug,
        content: page.content || {},
      },
      components,
      pages: website.pages.map(p => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
      })),
    })
  } catch (error) {
    console.error('Error fetching published site:', error)
    res.status(500).json({ error: 'Failed to fetch site' })
  }
}

exports.getPublishedSiteNav = async (req, res) => {
  try {
    const { siteSlug } = req.params

    const website = await prisma.website.findUnique({
      where: { slug: siteSlug },
      select: {
        id: true,
        name: true,
        slug: true,
        status: true,
        pages: {
          where: { isPublished: true },
          select: { id: true, name: true, slug: true },
          orderBy: { createdAt: 'asc' }
        }
      }
    })

    if (!website || website.status !== 'PUBLISHED') {
      return res.status(404).json({ error: 'Site not found' })
    }

    res.json({
      website: {
        id: website.id,
        name: website.name,
        slug: website.slug,
      },
      pages: website.pages,
    })
  } catch (error) {
    console.error('Error fetching site nav:', error)
    res.status(500).json({ error: 'Failed to fetch site navigation' })
  }
}
