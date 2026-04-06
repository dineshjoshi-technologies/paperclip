const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const createMockReq = (overrides = {}) => ({
  headers: overrides.headers || {},
  user: overrides.user || null,
});

const createMockRes = () => {
  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.stub(),
  };
  return res;
};

describe('Auth Middleware', () => {
  let authMiddleware;
  let req, res, next;
  let mockJwt, mockPrisma, mockCrypto;

  beforeEach(() => {
    sinon.reset();
    process.env.JWT_SECRET = 'test-secret-key';
    process.env.API_KEY_PREFIX = 'dk_';

    Object.keys(require.cache).forEach((key) => {
      if (key.includes('authMiddleware') || key.includes('utils/crypto') || key.includes('config/prisma')) {
        delete require.cache[key];
      }
    });

    mockJwt = {
      verify: sinon.stub(),
    };

    mockPrisma = {
      apiKey: {
        findFirst: sinon.stub(),
        update: sinon.stub(),
      },
      user: {
        findUnique: sinon.stub(),
      },
    };

    mockCrypto = {
      JWT_SECRET: 'test-secret-key',
      hashApiKey: sinon.stub().returns('hashed-api-key'),
    };

    const MockPrismaClient = function () { return mockPrisma; };

    authMiddleware = proxyquire('../../src/middleware/authMiddleware', {
      'jsonwebtoken': mockJwt,
      '@prisma/client': { PrismaClient: MockPrismaClient },
      '../utils/crypto': mockCrypto,
      '../config/prisma': mockPrisma,
    });

    req = createMockReq();
    res = createMockRes();
    next = sinon.stub();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
    delete process.env.API_KEY_PREFIX;
  });

  describe('authenticate', () => {
    it('should return 401 if no authorization header', async () => {
      req.headers = {};

      await authMiddleware.authenticate(req, res, next);

      assert(res.status.calledOnceWithExactly(401));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Access denied. No token provided.',
      }));
    });

    it('should return 401 if header does not start with Bearer', async () => {
      req.headers = { authorization: 'Token abc123' };

      await authMiddleware.authenticate(req, res, next);

      assert(res.status.calledOnceWithExactly(401));
    });

    it('should authenticate with valid JWT token', async () => {
      req.headers = { authorization: 'Bearer valid-jwt-token' };
      mockJwt.verify.returns({ userId: 'user-id', email: 'test@example.com', role: 'USER' });

      await authMiddleware.authenticate(req, res, next);

      assert(mockJwt.verify.calledOnceWith('valid-jwt-token', 'test-secret-key'));
      assert.deepStrictEqual(req.user, {
        userId: 'user-id',
        email: 'test@example.com',
        role: 'USER',
      });
      assert(next.calledOnce);
    });

    it('should return 401 for expired JWT token', async () => {
      req.headers = { authorization: 'Bearer expired-token' };
      const expiredError = new Error('Token expired');
      expiredError.name = 'TokenExpiredError';
      mockJwt.verify.throws(expiredError);

      await authMiddleware.authenticate(req, res, next);

      assert(res.status.calledOnceWithExactly(401));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Token expired',
      }));
    });

    it('should return 401 for invalid JWT token', async () => {
      req.headers = { authorization: 'Bearer invalid-token' };
      mockJwt.verify.throws(new Error('Invalid token'));

      await authMiddleware.authenticate(req, res, next);

      assert(res.status.calledOnceWithExactly(401));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Invalid token',
      }));
    });

    it('should authenticate with valid API key', async () => {
      req.headers = { authorization: 'Bearer dk_test-api-key' };

      mockPrisma.apiKey.findFirst.resolves({
        id: 'api-key-id',
        userId: 'user-id',
        user: { id: 'user-id', email: 'test@example.com', role: 'USER' },
      });

      await authMiddleware.authenticate(req, res, next);

      assert(mockCrypto.hashApiKey.calledOnceWith('dk_test-api-key'));
      assert(mockPrisma.apiKey.findFirst.calledOnce);
      assert(mockPrisma.apiKey.update.calledOnce);
      assert.deepStrictEqual(req.user, {
        userId: 'user-id',
        email: 'test@example.com',
        role: 'USER',
        apiKeyId: 'api-key-id',
      });
      assert(next.calledOnce);
    });

    it('should return 401 for invalid API key', async () => {
      req.headers = { authorization: 'Bearer dk_invalid-key' };
      mockPrisma.apiKey.findFirst.resolves(null);

      await authMiddleware.authenticate(req, res, next);

      assert(res.status.calledOnceWithExactly(401));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Invalid or expired API key',
      }));
    });
  });

  describe('authorize', () => {
    it('should return 401 if user not attached to request', async () => {
      req.user = null;
      const middleware = authMiddleware.authorize('ADMIN');

      await middleware(req, res, next);

      assert(res.status.calledOnceWithExactly(401));
    });

    it('should return 403 if user role not in allowed roles', async () => {
      req.user = { userId: 'user-id' };
      mockPrisma.user.findUnique.resolves({ role: 'USER' });

      const middleware = authMiddleware.authorize('ADMIN');
      await middleware(req, res, next);

      assert(res.status.calledOnceWithExactly(403));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Access denied. Insufficient permissions.',
      }));
    });

    it('should call next if user role is allowed', async () => {
      req.user = { userId: 'user-id' };
      mockPrisma.user.findUnique.resolves({ role: 'ADMIN' });

      const middleware = authMiddleware.authorize('ADMIN');
      await middleware(req, res, next);

      assert(next.calledOnce);
    });

    it('should allow multiple roles', async () => {
      req.user = { userId: 'user-id' };
      mockPrisma.user.findUnique.resolves({ role: 'DEVELOPER' });

      const middleware = authMiddleware.authorize('ADMIN', 'DEVELOPER', 'DESIGNER');
      await middleware(req, res, next);

      assert(next.calledOnce);
    });

    it('should return 404 if user not found in database', async () => {
      req.user = { userId: 'nonexistent-id' };
      mockPrisma.user.findUnique.resolves(null);

      const middleware = authMiddleware.authorize('ADMIN');
      await middleware(req, res, next);

      assert(res.status.calledOnceWithExactly(404));
    });
  });
});
