const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-key';
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';

const createApp = (mockPrisma, mockAuthMiddleware) => {
  const app = express();
  app.use(express.json());

  const websiteController = proxyquire('../../src/controllers/website/websiteController', {
    '../../config/prisma': mockPrisma,
  });

  const authRoutes = express.Router();
  const websitesRoutes = express.Router();

  const authenticate = (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
      } else if (mockAuthMiddleware.authenticate) {
        return mockAuthMiddleware.authenticate(req, res, next);
      }
      next();
    } catch (err) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  };

  const authorize = (role) => (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Forbidden' });
    }
  };

  const websitesRouter = express.Router();
  websitesRouter.use(authenticate);
  websitesRouter.get('/', websiteController.list);
  websitesRouter.post('/', websiteController.create);
  websitesRouter.get('/:id', websiteController.getById);
  websitesRouter.put('/:id', websiteController.update);
  websitesRouter.delete('/:id', websiteController.delete);
  websitesRouter.get('/:id/pages', websiteController.getPages);
  websitesRouter.post('/:id/pages', websiteController.createPage);
  websitesRouter.get('/:id/templates', websiteController.getTemplates);
  websitesRouter.post('/:id/publish', websiteController.publish);
  websitesRouter.post('/:id/archive', websiteController.archive);

  app.use('/api/websites', websitesRouter);

  app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  });

  return app;
};

const createTestServer = (app) => {
  const server = http.createServer(app);
  return server;
};

const getToken = (user = {}) => {
  return jwt.sign(
    { userId: user.userId || 'user-123', email: user.email || 'test@example.com', role: user.role || 'USER' },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );
};

describe('Website Controller Integration', () => {
  let mockPrisma;
  let app;
  let server;
  let baseUrl;
  let authToken;

  beforeEach(() => {
    sinon.reset();

    mockPrisma = {
      website: {
        findMany: sinon.stub(),
        findUnique: sinon.stub(),
        findFirst: sinon.stub(),
        create: sinon.stub(),
        update: sinon.stub(),
        delete: sinon.stub(),
      },
      page: {
        findMany: sinon.stub(),
        findFirst: sinon.stub(),
        create: sinon.stub(),
        update: sinon.stub(),
        delete: sinon.stub(),
      },
      template: {
        findMany: sinon.stub(),
      },
    };

    app = createApp(mockPrisma, {});
    server = createTestServer(app);
    server.listen(0);
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
    authToken = getToken();
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
    sinon.restore();
  });

  describe('GET /api/websites', () => {
    it('should return list of websites', async () => {
      mockPrisma.website.findMany.resolves([
        {
          id: 'site-1',
          name: 'Test Site',
          slug: 'test-site',
          userId: 'user-123',
        },
      ]);

      const response = await fetch(`${baseUrl}/api/websites`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.length, 1);
      assert(mockPrisma.website.findMany.calledOnce);
    });

    it('should return 500 on database error', async () => {
      mockPrisma.website.findMany.rejects(new Error('Database error'));

      const response = await fetch(`${baseUrl}/api/websites`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 500);
      assert.strictEqual(data.success, false);
    });
  });

  describe('POST /api/websites', () => {
    it('should create a website successfully', async () => {
      mockPrisma.website.findUnique.resolves(null);
      mockPrisma.website.create.resolves({
        id: 'site-1',
        name: 'New Site',
        slug: 'new-site',
        userId: 'user-123',
        config: {},
      });

      const response = await fetch(`${baseUrl}/api/websites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          name: 'New Site',
          slug: 'new-site',
          config: { theme: 'dark' },
        }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 201);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.name, 'New Site');
      assert(mockPrisma.website.create.calledOnce);
    });

    it('should return 400 if name is missing', async () => {
      const response = await fetch(`${baseUrl}/api/websites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ slug: 'new-site' }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 400);
      assert.strictEqual(data.success, false);
    });

    it('should return 409 if slug already exists', async () => {
      mockPrisma.website.findUnique.resolves({ id: 'existing' });

      const response = await fetch(`${baseUrl}/api/websites`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: 'New Site', slug: 'existing' }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 409);
    });
  });

  describe('GET /api/websites/:id', () => {
    it('should return website by id', async () => {
      mockPrisma.website.findFirst.resolves({
        id: 'site-1',
        name: 'Test Site',
        pages: [],
      });

      const response = await fetch(`${baseUrl}/api/websites/site-1`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.id, 'site-1');
    });

    it('should return 404 if website not found', async () => {
      mockPrisma.website.findFirst.resolves(null);

      const response = await fetch(`${baseUrl}/api/websites/non-existent`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 404);
    });
  });

  describe('PUT /api/websites/:id', () => {
    it('should update website', async () => {
      mockPrisma.website.findFirst.resolves({ id: 'site-1', userId: 'user-123' });
      mockPrisma.website.update.resolves({
        id: 'site-1',
        name: 'Updated Site',
      });

      const response = await fetch(`${baseUrl}/api/websites/site-1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: 'Updated Site' }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.name, 'Updated Site');
    });

    it('should return 404 if website not found', async () => {
      mockPrisma.website.findFirst.resolves(null);

      const response = await fetch(`${baseUrl}/api/websites/non-existent`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: 'Updated' }),
      });

      assert.strictEqual(response.status, 404);
    });
  });

  describe('DELETE /api/websites/:id', () => {
    it('should delete website', async () => {
      mockPrisma.website.findFirst.resolves({ id: 'site-1', userId: 'user-123' });
      mockPrisma.website.delete.resolves({});

      const response = await fetch(`${baseUrl}/api/websites/site-1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.success, true);
      assert(mockPrisma.website.delete.calledOnce);
    });

    it('should return 404 if website not found', async () => {
      mockPrisma.website.findFirst.resolves(null);

      const response = await fetch(`${baseUrl}/api/websites/non-existent`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      assert.strictEqual(response.status, 404);
    });
  });

  describe('POST /api/websites/:id/pages', () => {
    it('should create a page for the website', async () => {
      mockPrisma.website.findFirst.resolves({ id: 'site-1', userId: 'user-123' });
      mockPrisma.page.findFirst.resolves(null);
      mockPrisma.page.create.resolves({
        id: 'page-1',
        name: 'Test Page',
        slug: 'test-page',
        websiteId: 'site-1',
      });

      const response = await fetch(`${baseUrl}/api/websites/site-1/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: 'Test Page', slug: 'test-page' }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 201);
      assert.strictEqual(data.data.name, 'Test Page');
    });

    it('should return 409 if page slug exists', async () => {
      mockPrisma.website.findFirst.resolves({ id: 'site-1', userId: 'user-123' });
      mockPrisma.page.findFirst.resolves({ id: 'page-1' });

      const response = await fetch(`${baseUrl}/api/websites/site-1/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: 'Test', slug: 'existing' }),
      });

      assert.strictEqual(response.status, 409);
    });

    it('should return 400 if name or slug missing', async () => {
      const response = await fetch(`${baseUrl}/api/websites/site-1/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: 'Test' }),
      });

      assert.strictEqual(response.status, 400);
    });
  });

  describe('POST /api/websites/:id/publish', () => {
    it('should publish website', async () => {
      mockPrisma.website.findFirst.resolves({ id: 'site-1', userId: 'user-123' });
      mockPrisma.website.update.resolves({ id: 'site-1', status: 'PUBLISHED' });

      const response = await fetch(`${baseUrl}/api/websites/site-1/publish`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.status, 'PUBLISHED');
    });
  });

  describe('POST /api/websites/:id/archive', () => {
    it('should archive website', async () => {
      mockPrisma.website.findFirst.resolves({ id: 'site-1', userId: 'user-123' });
      mockPrisma.website.update.resolves({ id: 'site-1', status: 'ARCHIVED' });

      const response = await fetch(`${baseUrl}/api/websites/site-1/archive`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.status, 'ARCHIVED');
    });
  });
});
