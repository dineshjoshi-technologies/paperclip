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
  process.env.DATABASE_URL = 'postgresql://postgres:postgres@localhost:5432/dj_tech_test';
}

const createApp = (mockPrisma, mockAuthMiddleware) => {
  const app = express();
  app.use(express.json());

  const templateController = proxyquire('../../src/controllers/template/templateController', {
    '../../config/prisma': mockPrisma,
  });

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

  const templatesRouter = express.Router();
  templatesRouter.get('/', templateController.list);
  templatesRouter.get('/:id', templateController.getById);
  templatesRouter.post('/', authenticate, templateController.create);
  templatesRouter.put('/:id', authenticate, templateController.update);
  templatesRouter.delete('/:id', authenticate, templateController.delete);

  app.use('/api/templates', templatesRouter);

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

describe('Template Controller Integration', () => {
  let mockPrisma;
  let app;
  let server;
  let baseUrl;
  let authToken;

  beforeEach(() => {
    sinon.reset();

    mockPrisma = {
      template: {
        findMany: sinon.stub(),
        findUnique: sinon.stub(),
        create: sinon.stub(),
        update: sinon.stub(),
        delete: sinon.stub(),
      },
    };

    app = createApp(mockPrisma, {});
    server = createTestServer(app);
    server.listen(0);
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
    authToken = getToken({ role: 'ADMIN' });
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
    sinon.restore();
  });

  describe('GET /api/templates', () => {
    it('should return list of templates', async () => {
      mockPrisma.template.findMany.resolves([
        { id: 'tpl-1', name: 'Business Template', category: 'business', isPremium: false },
      ]);

      const response = await fetch(`${baseUrl}/api/templates`);
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.success, true);
      assert.strictEqual(data.data.length, 1);
    });

    it('should filter templates by category', async () => {
      mockPrisma.template.findMany.resolves([
        { id: 'tpl-1', name: 'Business Template', category: 'business' },
      ]);

      const response = await fetch(`${baseUrl}/api/templates?category=business`);
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert(mockPrisma.template.findMany.calledOnce);
      const whereArg = mockPrisma.template.findMany.firstCall.args[0].where;
      assert.strictEqual(whereArg.category, 'business');
    });

    it('should return 500 on database error', async () => {
      mockPrisma.template.findMany.rejects(new Error('Database error'));

      const response = await fetch(`${baseUrl}/api/templates`);
      const data = await response.json();

      assert.strictEqual(response.status, 500);
    });
  });

  describe('GET /api/templates/:id', () => {
    it('should return template by id', async () => {
      mockPrisma.template.findUnique.resolves({
        id: 'tpl-1',
        name: 'Business Template',
      });

      const response = await fetch(`${baseUrl}/api/templates/tpl-1`);
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.name, 'Business Template');
    });

    it('should return 404 if template not found', async () => {
      mockPrisma.template.findUnique.resolves(null);

      const response = await fetch(`${baseUrl}/api/templates/non-existent`);
      const data = await response.json();

      assert.strictEqual(response.status, 404);
    });
  });

  describe('POST /api/templates', () => {
    it('should create template when authenticated', async () => {
      mockPrisma.template.create.resolves({
        id: 'tpl-new',
        name: 'New Template',
        config: {},
      });

      const response = await fetch(`${baseUrl}/api/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: 'New Template', category: 'portfolio' }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 201);
      assert.strictEqual(data.data.name, 'New Template');
    });

    it('should return 400 if name missing', async () => {
      const response = await fetch(`${baseUrl}/api/templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ category: 'portfolio' }),
      });

      assert.strictEqual(response.status, 400);
    });
  });

  describe('PUT /api/templates/:id', () => {
    it('should update template', async () => {
      mockPrisma.template.findUnique.resolves({ id: 'tpl-1' });
      mockPrisma.template.update.resolves({
        id: 'tpl-1',
        name: 'Updated Template',
      });

      const response = await fetch(`${baseUrl}/api/templates/tpl-1`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ name: 'Updated Template' }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.name, 'Updated Template');
    });

    it('should return 404 if template not found', async () => {
      mockPrisma.template.findUnique.resolves(null);

      const response = await fetch(`${baseUrl}/api/templates/non-existent`, {
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

  describe('DELETE /api/templates/:id', () => {
    it('should delete template', async () => {
      mockPrisma.template.findUnique.resolves({ id: 'tpl-1' });
      mockPrisma.template.delete.resolves({});

      const response = await fetch(`${baseUrl}/api/templates/tpl-1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert(mockPrisma.template.delete.calledOnce);
    });

    it('should return 404 if template not found', async () => {
      mockPrisma.template.findUnique.resolves(null);

      const response = await fetch(`${baseUrl}/api/templates/non-existent`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${authToken}` },
      });

      assert.strictEqual(response.status, 404);
    });
  });
});
