const prisma = require('../../config/prisma');

exports.list = async (req, res) => {
  try {
    const { category, isPremium } = req.query;

    const where = {};
    if (category) where.category = category;
    if (isPremium !== undefined) where.isPremium = isPremium === 'true';

    const templates = await prisma.template.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('List templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const template = await prisma.template.findUnique({
      where: { id },
    });

    if (!template) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, description, category, previewUrl, config, isPremium } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Name is required',
      });
    }

    const template = await prisma.template.create({
      data: {
        name,
        description: description || null,
        category: category || null,
        previewUrl: previewUrl || null,
        config: config || {},
        isPremium: isPremium || false,
      },
    });

    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, category, previewUrl, config, isPremium } = req.body;

    const existing = await prisma.template.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    const template = await prisma.template.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
        ...(category !== undefined && { category }),
        ...(previewUrl !== undefined && { previewUrl }),
        ...(config && { config }),
        ...(isPremium !== undefined && { isPremium }),
      },
    });

    res.json({
      success: true,
      data: template,
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.template.findUnique({
      where: { id },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Template not found',
      });
    }

    await prisma.template.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Template deleted',
    });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};