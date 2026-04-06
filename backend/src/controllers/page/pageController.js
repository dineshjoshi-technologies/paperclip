const prisma = require('../../config/prisma');

exports.list = async (req, res) => {
  try {
    const { websiteId } = req.query;

    if (!websiteId) {
      return res.status(400).json({
        success: false,
        message: 'Website ID is required',
      });
    }

    const website = await prisma.website.findFirst({
      where: { id: websiteId, userId: req.user.userId },
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    const pages = await prisma.page.findMany({
      where: { websiteId },
      include: { components: { orderBy: { position: 'asc' } } },
      orderBy: { position: 'asc' },
    });

    res.json({
      success: true,
      data: pages,
    });
  } catch (error) {
    console.error('List pages error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.create = async (req, res) => {
  try {
    const { websiteId, name, slug, content } = req.body;

    if (!websiteId || !name || !slug) {
      return res.status(400).json({
        success: false,
        message: 'Website ID, name, and slug are required',
      });
    }

    const website = await prisma.website.findFirst({
      where: { id: websiteId, userId: req.user.userId },
    });

    if (!website) {
      return res.status(404).json({
        success: false,
        message: 'Website not found',
      });
    }

    const existingPage = await prisma.page.findFirst({
      where: { websiteId, slug },
    });

    if (existingPage) {
      return res.status(409).json({
        success: false,
        message: 'Page with this slug already exists',
      });
    }

    const maxPosition = await prisma.page.aggregate({
      where: { websiteId },
      _max: { position: true },
    });

    const page = await prisma.page.create({
      data: {
        name,
        slug,
        content: content || {},
        websiteId,
        position: (maxPosition._max.position || 0) + 1,
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

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await prisma.page.findFirst({
      where: { id },
      include: {
        website: { include: { user: false } },
        components: { orderBy: { position: 'asc' } },
      },
    });

    if (!page || page.website.userId !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    res.json({
      success: true,
      data: page,
    });
  } catch (error) {
    console.error('Get page error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, content, isPublished, position } = req.body;

    const page = await prisma.page.findFirst({
      where: { id },
      include: { website: true },
    });

    if (!page || page.website.userId !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    const updated = await prisma.page.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(slug !== undefined && { slug }),
        ...(content && { content }),
        ...(isPublished !== undefined && { isPublished }),
        ...(position !== undefined && { position }),
      },
    });

    res.json({
      success: true,
      data: updated,
    });
  } catch (error) {
    console.error('Update page error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await prisma.page.findFirst({
      where: { id },
      include: { website: true },
    });

    if (!page || page.website.userId !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    await prisma.page.delete({ where: { id } });

    res.json({
      success: true,
      message: 'Page deleted',
    });
  } catch (error) {
    console.error('Delete page error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getComponents = async (req, res) => {
  try {
    const { id } = req.params;

    const page = await prisma.page.findFirst({
      where: { id },
      include: { website: true },
    });

    if (!page || page.website.userId !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    const components = await prisma.component.findMany({
      where: { pageId: id },
      orderBy: { position: 'asc' },
    });

    res.json({
      success: true,
      data: components,
    });
  } catch (error) {
    console.error('Get components error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.createComponent = async (req, res) => {
  try {
    const { id } = req.params;
    const { type, config, position } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        message: 'Component type is required',
      });
    }

    const page = await prisma.page.findFirst({
      where: { id },
      include: { website: true },
    });

    if (!page || page.website.userId !== req.user.userId) {
      return res.status(404).json({
        success: false,
        message: 'Page not found',
      });
    }

    const maxPosition = await prisma.component.aggregate({
      where: { pageId: id },
      _max: { position: true },
    });

    const component = await prisma.component.create({
      data: {
        type,
        config: config || {},
        position: position ?? ((maxPosition._max.position || 0) + 1),
        pageId: id,
      },
    });

    res.status(201).json({
      success: true,
      data: component,
    });
  } catch (error) {
    console.error('Create component error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};