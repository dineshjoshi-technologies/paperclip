const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const http = require('http');
const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

process.env.JWT_SECRET = 'test-secret-key';
// Use DATABASE_URL from environment (set in CI) or default for local testing
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/testdb';
}

const createApp = (mockPrisma) => {
  const app = express();
  app.use(express.json());

  const userController = proxyquire('../../src/controllers/user/userController', {
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

  const authorize = (role) => (req, res, next) => {
    if (req.user && req.user.role === role) {
      next();
    } else {
      res.status(403).json({ success: false, message: 'Forbidden' });
    }
  };

  const usersRouter = express.Router();
  usersRouter.use(authenticate);
  usersRouter.get('/profile', userController.getProfile);
  usersRouter.put('/profile', userController.updateProfile);
  usersRouter.get('/', authorize('ADMIN'), userController.list);
  usersRouter.get('/:id', authorize('ADMIN'), userController.getById);
  usersRouter.put('/:id/role', authorize('ADMIN'), userController.updateRole);
  usersRouter.delete('/:id', authorize('ADMIN'), userController.delete);

  app.use('/api/users', usersRouter);

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

describe('User Controller Integration', () => {
  let mockPrisma;
  let app;
  let server;
  let baseUrl;
  let adminToken;
  let userToken;

  beforeEach(() => {
    sinon.reset();

    mockPrisma = {
      user: {
        findUnique: sinon.stub(),
        findMany: sinon.stub(),
        update: sinon.stub(),
        delete: sinon.stub(),
        count: sinon.stub(),
      },
    };

    app = createApp(mockPrisma);
    server = createTestServer(app);
    server.listen(0);
    const address = server.address();
    baseUrl = `http://127.0.0.1:${address.port}`;
    adminToken = getToken({ userId: 'admin-1', role: 'ADMIN' });
    userToken = getToken({ userId: 'user-123', role: 'USER' });
  });

  afterEach(() => {
    if (server) {
      server.close();
    }
    sinon.restore();
  });

  describe('GET /api/users/profile', () => {
    it('should return user profile', async () => {
      mockPrisma.user.findUnique.resolves({
        id: 'user-123',
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const response = await fetch(`${baseUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.email, 'test@example.com');
    });

    it('should return 404 if user not found', async () => {
      mockPrisma.user.findUnique.resolves(null);

      const response = await fetch(`${baseUrl}/api/users/profile`, {
        headers: { Authorization: `Bearer ${userToken}` },
      });

      assert.strictEqual(response.status, 404);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      mockPrisma.user.findUnique.resolves({
        id: 'user-123',
        passwordHash: 'hashed',
      });
      mockPrisma.user.update.resolves({
        id: 'user-123',
        name: 'Updated Name',
        email: 'test@example.com',
        role: 'USER',
      });

      const response = await fetch(`${baseUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ name: 'Updated Name' }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.success, true);
    });

    it('should return 400 when changing password without current password', async () => {
      mockPrisma.user.findUnique.resolves({
        id: 'user-123',
        passwordHash: 'hashed',
      });

      const response = await fetch(`${baseUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({ newPassword: 'newpassword123' }),
      });

      assert.strictEqual(response.status, 400);
    });

    it('should return 401 when current password is incorrect', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      mockPrisma.user.findUnique.resolves({
        id: 'user-123',
        passwordHash: hashedPassword,
      });

      const response = await fetch(`${baseUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          currentPassword: 'wrongpassword',
          newPassword: 'newpassword123',
        }),
      });

      assert.strictEqual(response.status, 401);
    });

    it('should update password when current password is correct', async () => {
      const hashedPassword = await bcrypt.hash('correctpassword', 10);
      mockPrisma.user.findUnique.resolves({
        id: 'user-123',
        passwordHash: hashedPassword,
      });
      mockPrisma.user.update.resolves({
        id: 'user-123',
        email: 'test@example.com',
        role: 'USER',
      });

      const response = await fetch(`${baseUrl}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${userToken}`,
        },
        body: JSON.stringify({
          currentPassword: 'correctpassword',
          newPassword: 'newpassword123',
        }),
      });

      assert.strictEqual(response.status, 200);
    });
  });

  describe('GET /api/users (admin)', () => {
    it('should return paginated list of users', async () => {
      mockPrisma.user.findMany.resolves([
        { id: 'user-1', email: 'user1@example.com', name: 'User 1', role: 'USER' },
      ]);
      mockPrisma.user.count.resolves(1);

      const response = await fetch(`${baseUrl}/api/users`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.length, 1);
      assert.strictEqual(data.pagination.total, 1);
    });

    it('should filter users by role', async () => {
      mockPrisma.user.findMany.resolves([]);
      mockPrisma.user.count.resolves(0);

      const response = await fetch(`${baseUrl}/api/users?role=ADMIN`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.length, 0);
    });
  });

  describe('GET /api/users/:id (admin)', () => {
    it('should return user by id', async () => {
      mockPrisma.user.findUnique.resolves({
        id: 'user-1',
        email: 'user1@example.com',
        name: 'User 1',
        role: 'USER',
      });

      const response = await fetch(`${baseUrl}/api/users/user-1`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.email, 'user1@example.com');
    });

    it('should return 404 if user not found', async () => {
      mockPrisma.user.findUnique.resolves(null);

      const response = await fetch(`${baseUrl}/api/users/non-existent`, {
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.strictEqual(response.status, 404);
    });
  });

  describe('PUT /api/users/:id/role (admin)', () => {
    it('should update user role', async () => {
      mockPrisma.user.findUnique.resolves({
        id: 'user-1',
        role: 'USER',
      });
      mockPrisma.user.update.resolves({
        id: 'user-1',
        email: 'user1@example.com',
        name: 'User 1',
        role: 'ADMIN',
      });

      const response = await fetch(`${baseUrl}/api/users/user-1/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ role: 'ADMIN' }),
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert.strictEqual(data.data.role, 'ADMIN');
    });

    it('should return 400 if role is missing', async () => {
      const response = await fetch(`${baseUrl}/api/users/user-1/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({}),
      });

      assert.strictEqual(response.status, 400);
    });

    it('should return 400 if role is invalid', async () => {
      const response = await fetch(`${baseUrl}/api/users/user-1/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ role: 'INVALID_ROLE' }),
      });

      assert.strictEqual(response.status, 400);
    });

    it('should return 404 if user not found', async () => {
      mockPrisma.user.findUnique.resolves(null);

      const response = await fetch(`${baseUrl}/api/users/non-existent/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: JSON.stringify({ role: 'ADMIN' }),
      });

      assert.strictEqual(response.status, 404);
    });
  });

  describe('DELETE /api/users/:id (admin)', () => {
    it('should delete user', async () => {
      mockPrisma.user.findUnique.resolves({ id: 'user-1', role: 'USER' });
      mockPrisma.user.delete.resolves({});

      const response = await fetch(`${baseUrl}/api/users/user-1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 200);
      assert(mockPrisma.user.delete.calledOnce);
    });

    it('should return 400 when trying to delete own account', async () => {
      const selfToken = getToken({ userId: 'admin-1', role: 'ADMIN' });

      const response = await fetch(`${baseUrl}/api/users/admin-1`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${selfToken}` },
      });
      const data = await response.json();

      assert.strictEqual(response.status, 400);
    });

    it('should return 404 if user not found', async () => {
      mockPrisma.user.findUnique.resolves(null);

      const response = await fetch(`${baseUrl}/api/users/non-existent`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${adminToken}` },
      });

      assert.strictEqual(response.status, 404);
    });
  });
});
