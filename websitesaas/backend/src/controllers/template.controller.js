const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

exports.getAll = async (req, res) => {
  try {
    const { category, premium } = req.query
    const where = {}
    if (category) where.category = category
    if (premium !== undefined) where.isPremium = premium === 'true'

    const templates = await prisma.template.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })
    res.json(templates)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch templates' })
  }
}

exports.getById = async (req, res) => {
  try {
    const template = await prisma.template.findUnique({
      where: { id: req.params.id }
    })
    if (!template) {
      return res.status(404).json({ error: 'Template not found' })
    }
    res.json(template)
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch template' })
  }
}

exports.create = async (req, res) => {
  try {
    const { name, description, category, isPremium, config, thumbnailUrl } = req.body
    const template = await prisma.template.create({
      data: { name, description, category, isPremium, config, thumbnailUrl }
    })
    res.status(201).json(template)
  } catch (error) {
    res.status(500).json({ error: 'Failed to create template' })
  }
}

exports.update = async (req, res) => {
  try {
    const allowedFields = ['name', 'description', 'category', 'isPremium', 'config', 'thumbnailUrl']
    const data = {}
    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {
        data[field] = req.body[field]
      }
    }

    const template = await prisma.template.update({
      where: { id: req.params.id },
      data
    })
    res.json(template)
  } catch (error) {
    res.status(500).json({ error: 'Failed to update template' })
  }
}

exports.delete = async (req, res) => {
  try {
    await prisma.template.delete({ where: { id: req.params.id } })
    res.status(204).send()
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete template' })
  }
}