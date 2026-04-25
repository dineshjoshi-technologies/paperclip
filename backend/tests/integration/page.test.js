const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-key';
// Use DATABASE_URL from environment (set in CI) or default for local testing
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
}

const createApp = (mockPrisma) => {
  const app = express();
  app.use(express.json());

  const pageController = proxyquire('../../src/controllers/page/pageController', {
    '../../config/prisma': mockPrisma,
  });

  const authenticate = (req, res, next) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (token) {
        req.user = jwt.verify(token, process.env.JWT_SECRET);
      }
      next();
    } catch (err) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
    }
  };

  const pagesRouter = express.Router();
  pagesRouter.use(authenticate);
  pagesRouter.get('/', pageController.list);
  pagesRouter.post('/', pageController.create);
  pagesRouter.get('/:id', pageController.getById);
  pagesRouter.put('/:id', pageController.update);
  pagesRouter.delete('/:id', pageController.delete);
  pagesRouter.get('/:id/components', pageController.getComponents);
  pagesRouter.post('/:id/components', pageController.createComponent);

  app.use('/api/pages', pagesRouter);

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

describe('Page Controller Integration', () => {
  let mockPrisma;
  let app;
  let server;
  let baseUrl;
  let authToken;

  beforeEach(() => {
    sinon.reset();

    mockPrisma = {
      page: {
        findMany: sinon.stub(),
        findFirst: sinon.stub(),
        create: sinon.stub(),
        update: sinon.stub(),
        delete: sinon.stub(),
        aggregate: sinon.stub(),
      },
      website: {
        findFirst: sinon.stub(),
      },
      component: {
        findMany: sinon.stub(),
        create: sinon.stub(),
        aggregate: sinon.stub(),
      },
    };

    app = createApp(mockPrisma);
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

  describe('GET /api/pages', () => {
    it('should return list of pages for a website', async () => {
      mockPrisma.website.findFirst.resolves({ id: 'site-1', userId: 'user-123' });
      mockPrisma.page.findMany.resolves([
        { id: 'page-1', name: 'Home', slug: 'home', websiteId: 'site-1', components: [] },
      ]);

      const response = await fetch(`${baseUrl}/api/pages?websiteId=site-1`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.length, 1);
    });

    it('should return 400 if websiteId is missing', async () => {
      const response = await fetch(`${baseUrl}/api/pages`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 400);
    });

    it('should return 404 if website not found', async () => {
      mockPrisma.website.findFirst.resolves(null);

      const response = await fetch(`${baseUrl}/api/pages?websiteId=nonexistent`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      assert.strictEqual(response.status, 404);
    });
  });

  describe('POST /api/pages', () => {
    it('should create a page successfully', async () => {
      mockPrisma.website.findFirst.resolves({ id: 'site-1', userId: 'user-123' });
      mockPrisma.page.findFirst.resolves(null);
      mockPrisma.page.aggregate.resolves({ _max: { position: 2 } });
      mockPrisma.page.create.resolves({
        id: 'page-1',
        name: 'About',
        slug: 'about',
        websiteId: 'site-1',
        position: 3,
      });

      const response = await fetch(`${baseUrl}/api/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          websiteId: 'site-1',
          name: 'About',
          slug: 'about',
        }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 201);
      assert.strictEqual(data.data.name, 'About');
    });

    it('should return 400 if required fields are missing', async () => {
      const response = await fetch(`${baseUrl}/api/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ websiteId: 'site-1' }),
      });

      assert.strictEqual(response.status, 400);
    });

    it('should return 409 if page slug already exists', async () => {
      mockPrisma.website.findFirst.resolves({ id: 'site-1', userId: 'user-123' });
      mockPrisma.page.findFirst.resolves({ id: 'page-1' });

      const response = await fetch(`${baseUrl}/api/pages`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          websiteId: 'site-1',
          name: 'About',
          slug: 'about',
        }),
      });

      assert.strictEqual(response.status, 409);
    });
  });

  describe('GET /api/pages/:id', () => {
    it('should return page by id', async () => {
      mockPrisma.page.findFirst.resolves({
        id: 'page-1',
        name: 'Home',
        website: { userId: 'user-123' },
        components: [],
      });

      const response = await fetch(`${baseUrl}/api/pages/page-1`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.id, 'page-1');
    });

    it('should return 404 if page not found or unauthorized', async () => {
      mockPrisma.page.findFirst.resolves({
        id: 'page-1',
        website: { userId: 'other-user' },
      });

      const response = await fetch(`${baseUrl}/api/pages/page-1`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      assert.strictEqual(response.status, 404);
    });
  });

  describe('PUT /api/pages/:id', () => {
    it('should update page', async () => {
      mockPrisma.page.findFirst.resolves({
        id: 'page-1',
        website: { userId: 'user-123' },
      });
      mockPrisma.page.update.resolves({
        id: 'page-1',
        name: 'Updated Name',
      });

      const response = await fetch(`${baseUrl}/api/pages/page-1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: 'Updated Name' }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.name, 'Updated Name');
    });

    it('should return 404 if page not found', async () => {
      mockPrisma.page.findFirst.resolves(null);

      const response = await fetch(`${baseUrl}/api/pages/page-1`, {
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

  describe('DELETE /api/pages/:id', () => {
    it('should delete page', async () => {
      mockPrisma.page.findFirst.resolves({
        id: 'page-1',
        website: { userId: 'user-123' },
      });
      mockPrisma.page.delete.resolves({});

      const response = await fetch(`${baseUrl}/api/pages/page-1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert(mockPrisma.page.delete.calledOnce);
    });

    it('should return 404 if page not found', async () => {
      mockPrisma.page.findFirst.resolves(null);

      const response = await fetch(`${baseUrl}/api/pages/page-1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      assert.strictEqual(response.status, 404);
    });
  });

  describe('GET /api/pages/:id/components', () => {
    it('should return components for a page', async () => {
      mockPrisma.page.findFirst.resolves({
        id: 'page-1',
        website: { userId: 'user-123' },
      });
      mockPrisma.component.findMany.resolves([
        { id: 'comp-1', type: 'hero', position: 1 },
      ]);

      const response = await fetch(`${baseUrl}/api/pages/page-1/components`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.length, 1);
    });

    it('should return 404 if page not found', async () => {
      mockPrisma.page.findFirst.resolves(null);

      const response = await fetch(`${baseUrl}/api/pages/page-1/components`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      assert.strictEqual(response.status, 404);
    });
  });

  describe('POST /api/pages/:id/components', () => {
    it('should create a component for a page', async () => {
      mockPrisma.page.findFirst.resolves({
        id: 'page-1',
        website: { userId: 'user-123' },
      });
      mockPrisma.component.aggregate.resolves({ _max: { position: 1 } });
      mockPrisma.component.create.resolves({
        id: 'comp-1',
        type: 'hero',
        position: 2,
      });

      const response = await fetch(`${baseUrl}/api/pages/page-1/components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ type: 'hero', config: { title: 'Hello' } }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 201);
      assert.strictEqual(data.data.type, 'hero');
    });

    it('should return 400 if type is missing', async () => {
      const response = await fetch(`${baseUrl}/api/pages/page-1/components`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ config: {} }),
      });

      assert.strictEqual(response.status, 400);
    });
  });
});
