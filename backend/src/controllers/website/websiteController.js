const prisma = require('../../config/prisma');

exports.list = async (req, res) => {
  try {
    const websites = await prisma.website.findMany({
      where: { userId: req.user.userId },
      include: {
        template: true,
        pages: { take: 5 },
        _count: { select: { pages: true } },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: websites,
    });
  } catch (error) {
    console.error('List websites error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { name, slug, templateId, config } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required',
      });
    }

    const existing = await prisma.website.findUnique({ where: { slug } });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'Slug already exists',
      });
    }

    const website = await prisma.website.create({
      data: {
        name,
        slug,
        userId: req.user.userId,
        templateId: templateId || null,
        config: config || {},
      },
      include: { template: true },
    });

    res.status(201).json({
      success: true,
      data: website,
    });
  } catch (error) {
    console.error('Create website error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const website = await prisma.website.findFirst({
      where: { id, userId: req.user.userId },
      include: {
        template: true,
        pages: {
          orderBy: { position: 'asc' },
          include: { components: { orderBy: { position: 'asc' } } },
        },
      },
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    res.json({
      success: true,
      data: website,
    });
  } catch (error) {
    console.error('Get website error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, templateId, config, status } = req.body;

    const existing = await prisma.website.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    const website = await prisma.website.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(templateId !== undefined && { templateId }),
        ...(config && { config }),
        ...(status && { status }),
      },
      include: { template: true },
    });

    res.json({
      success: true,
      data: website,
    });
  } catch (error) {
    console.error('Update website error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const existing = await prisma.website.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!existing) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    await prisma.website.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Website deleted',
    });
  } catch (error) {
    console.error('Delete website error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getPages = async (req, res) => {
  try {
    const { id } = req.params;

    const website = await prisma.website.findFirst({
      where: { id, userId: req.user.userId },
      include: { pages: { orderBy: { position: 'asc' } } },
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    res.json({
      success: true,
      data: website.pages,
    });
  } catch (error) {
    console.error('Get pages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.createPage = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, content } = req.body;

    if (!name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Name and slug are required',
      });
    }

    const website = await prisma.website.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    const existingPage = await prisma.page.findFirst({
      where: { websiteId: id, slug },
    });

    if (existingPage) {
      return res.status(409).json({
        success: false,
        message: 'Page with this slug already exists',
      });
    }

    const page = await prisma.page.create({
      data: {
        name,
        slug,
        content: content || {},
        websiteId: id,
      },
    });

    res.status(201).json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error('Create page error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getTemplates = async (req, res) => {
  try {
    const templates = await prisma.template.findMany({
      orderBy: { createdAt: 'desc' },
    });

    res.json({
      success: true,
      data: templates,
    });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.publish = async (req, res) => {
  try {
    const { id } = req.params;

    const website = await prisma.website.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    const updated = await prisma.website.update({
      where: { id },
      data: { status: 'PUBLISHED' },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Publish website error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.archive = async (req, res) => {
  try {
    const { id } = req.params;

    const website = await prisma.website.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    const updated = await prisma.website.update({
      where: { id },
      data: { status: 'ARCHIVED' },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Archive website error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};