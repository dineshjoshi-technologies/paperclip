const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()
const emailService = require('./email.controller')

exports.getAll = async (req, res) => {
  try {
    const websites = await prisma.website.findMany({
      where: { userId: req.userId },
      include: { template: true, pages: true },
      orderBy: { updatedAt: 'desc' }
    })
    res.json(websites)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch websites' })
  }
}

exports.create = async (req, res) => {
  try {
    const { name, slug, templateId, config } = req.body
    const website = await prisma.website.create({
      data: {
        name,
        slug,
        userId: req.userId,
        templateId,
        config
      }
    })
    res.status(201).json(website)
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ error: 'Slug already exists' })
    }
    res.status(500).json({ error: 'Failed to create website' })
  }
}

exports.getBySlug = async (req, res) => {
  try {
    const website = await prisma.website.findUnique({
      where: { slug: req.params.slug },
      include: {
        pages: {
          include: {
            components: { orderBy: { position: 'asc' } }
          }
        },
        template: true
      }
    })
    if (!website) {
      return res.status(404).json({ error: 'Website not found' })
    }
    res.json(website)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch website' })
  }
}

exports.update = async (req, res) => {
  try {
    const website = await prisma.website.findUnique({
      where: { id: req.params.id }
    })
    if (!website || website.userId !== req.userId) {
      return res.status(404).json({ error: 'Website not found' })
    }

    const allowedFields = ['name', 'slug', 'templateId', 'config']
    const data = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field]
      }
    }

    const updated = await prisma.website.update({
      where: { id: req.params.id },
      data
    })
    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update website' })
  }
}

exports.delete = async (req, res) => {
  try {
    const website = await prisma.website.findUnique({
      where: { id: req.params.id }
    })
    if (!website || website.userId !== req.userId) {
      return res.status(404).json({ error: 'Website not found' })
    }

    await prisma.website.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete website' })
  }
}

exports.publish = async (req, res) => {
  try {
    const website = await prisma.website.findUnique({
      where: { id: req.params.id },
      include: { user: true }
    })
    if (!website || website.userId !== req.userId) {
      return res.status(404).json({ error: 'Website not found' })
    }

    const updated = await prisma.website.update({
      where: { id: req.params.id },
      data: { status: 'PUBLISHED' }
    })

    emailService.sendWebsitePublishedEmail(website.user, website)

    res.json(updated)
  } catch (error) {
    res.status(500).json({ error: 'Failed to publish website' })
  }
}