const express = require('express')
const { PrismaClient } = require('@prisma/client')
const { authMiddleware } = require('../middleware/auth')

const router = express.Router()
const prisma = new PrismaClient()

// GET /api/websites/:websiteId/pages - Get all pages for a website
router.get('/:websiteId/pages', authMiddleware, async (req, res) => {
  try {
    const website = await prisma.website.findUnique({
      where: { id: req.params.websiteId },
    })

    if (!website || website.userId !== req.user.id) {
      return res.status(404).json({ message: 'Website not found' })
    }

    const pages = await prisma.page.findMany({
      where: { websiteId: req.params.websiteId },
      orderBy: { createdAt: 'asc' },
    })

    res.json(pages)
  } catch (error) {
    console.error('Error fetching pages:', error)
    res.status(500).json({ message: 'Failed to fetch pages' })
  }
})

// GET /api/websites/:websiteId/pages/:pageId - Get a specific page
router.get('/:websiteId/pages/:pageId', authMiddleware, async (req, res) => {
  try {
    const page = await prisma.page.findUnique({
      where: { id: req.params.pageId },
      include: { components: { orderBy: { position: 'asc' } } },
    })

    if (!page) {
      return res.status(404).json({ message: 'Page not found' })
    }

    const website = await prisma.website.findUnique({
      where: { id: req.params.websiteId },
    })

    if (!website || website.userId !== req.user.id) {
      return res.status(404).json({ message: 'Website not found' })
    }

    res.json({
      ...page,
      content: page.components.map((c) => ({
        id: c.id,
        type: c.type,
        config: c.config,
        position: c.position,
      })),
    })
  } catch (error) {
    console.error('Error fetching page:', error)
    res.status(500).json({ message: 'Failed to fetch page' })
  }
})

// POST /api/websites/:websiteId/pages - Create a new page
router.post('/:websiteId/pages', authMiddleware, async (req, res) => {
  try {
    const { name, slug, content = [] } = req.body

    if (!name || !slug) {
      return res.status(400).json({ message: 'Name and slug are required' })
    }

    const website = await prisma.website.findUnique({
      where: { id: req.params.websiteId },
    })

    if (!website || website.userId !== req.user.id) {
      return res.status(404).json({ message: 'Website not found' })
    }

    const page = await prisma.page.create({
      data: {
        websiteId: req.params.websiteId,
        name,
        slug,
        components: {
          create: content.map((c, i) => ({
            type: c.type,
            config: c.config || {},
            position: i,
          })),
        },
      },
      include: { components: { orderBy: { position: 'asc' } } },
    })

    res.status(201).json(page)
  } catch (error) {
    console.error('Error creating page:', error)
    if (error.code === 'P2002') {
      return res.status(409).json({ message: 'A page with this slug already exists' })
    }
    res.status(500).json({ message: 'Failed to create page' })
  }
})

// PUT /api/websites/:websiteId/pages/:pageId - Update page content
router.put('/:websiteId/pages/:pageId', authMiddleware, async (req, res) => {
  try {
    const { name, slug, isPublished, content } = req.body

    const page = await prisma.page.findUnique({
      where: { id: req.params.pageId },
    })

    if (!page) {
      return res.status(404).json({ message: 'Page not found' })
    }

    const website = await prisma.website.findUnique({
      where: { id: req.params.websiteId },
    })

    if (!website || website.userId !== req.user.id) {
      return res.status(404).json({ message: 'Website not found' })
    }

    const updatedPage = await prisma.$transaction(async (tx) => {
      await tx.component.deleteMany({ where: { pageId: req.params.pageId } })

      const pageUpdate = await tx.page.update({
        where: { id: req.params.pageId },
        data: {
          ...(name && { name }),
          ...(slug && { slug }),
          ...(typeof isPublished === 'boolean' && { isPublished }),
        },
      })

      if (Array.isArray(content)) {
        await tx.component.createMany({
          data: content.map((c, i) => ({
            pageId: req.params.pageId,
            type: c.type,
            config: c.config || {},
            position: i,
          })),
        })
      }

      return tx.page.findUnique({
        where: { id: req.params.pageId },
        include: { components: { orderBy: { position: 'asc' } } },
      })
    })

    res.json(updatedPage)
  } catch (error) {
    console.error('Error updating page:', error)
    res.status(500).json({ message: 'Failed to update page' })
  }
})

// DELETE /api/websites/:websiteId/pages/:pageId - Delete a page
router.delete('/:websiteId/pages/:pageId', authMiddleware, async (req, res) => {
  try {
    const page = await prisma.page.findUnique({
      where: { id: req.params.pageId },
    })

    if (!page) {
      return res.status(404).json({ message: 'Page not found' })
    }

    const website = await prisma.website.findUnique({
      where: { id: req.params.websiteId },
    })

    if (!website || website.userId !== req.user.id) {
      return res.status(404).json({ message: 'Website not found' })
    }

    await prisma.page.delete({ where: { id: req.params.pageId } })

    res.json({ message: 'Page deleted successfully' })
  } catch (error) {
    console.error('Error deleting page:', error)
    res.status(500).json({ message: 'Failed to delete page' })
  }
})

module.exports = router
