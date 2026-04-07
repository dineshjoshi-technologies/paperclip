const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const createMockReq = (body = {}, overrides = {}) => ({
  body,
  user: overrides.user || null,
  params: overrides.params || {},
});

const createMockRes = () => {
  const res = {
    status: sinon.stub().returnsThis(),
    json: sinon.stub(),
  };
  return res;
};

describe('Auth Controller', () => {
  let authController;
  let req, res, next;
  let mockPrisma, mockBcrypt, mockJwt, mockTokenService, mockEmailService, mockCrypto;

  beforeEach(() => {
    sinon.reset();
    process.env.JWT_SECRET = 'test-secret-key';

    Object.keys(require.cache).forEach((key) => {
      if (key.includes('prisma') || key.includes('tokenService') || key.includes('emailService') || key.includes('authController')) {
        delete require.cache[key];
      }
    });

    mockPrisma = {
      user: {
        findUnique: sinon.stub(),
        create: sinon.stub(),
        update: sinon.stub(),
      },
      refreshToken: {
        create: sinon.stub(),
        findUnique: sinon.stub(),
        update: sinon.stub(),
        updateMany: sinon.stub(),
      },
      passwordResetToken: {
        create: sinon.stub(),
        findUnique: sinon.stub(),
        update: sinon.stub(),
        updateMany: sinon.stub(),
      },
      apiKey: {
        create: sinon.stub(),
        findMany: sinon.stub(),
        findFirst: sinon.stub(),
        delete: sinon.stub(),
        update: sinon.stub(),
      },
      $transaction: sinon.stub(),
    };

    mockBcrypt = {
      genSalt: sinon.stub().resolves('salt'),
      hash: sinon.stub().resolves('hashedPassword'),
      compare: sinon.stub(),
    };

    mockJwt = {
      sign: sinon.stub().returns('fake-jwt-token'),
    };

    mockTokenService = {
      generateAccessToken: sinon.stub().returns('fake-access-token'),
      createRefreshToken: sinon.stub(),
      rotateRefreshToken: sinon.stub(),
      revokeRefreshToken: sinon.stub(),
      revokeAllUserTokens: sinon.stub(),
    };

    mockEmailService = {
      sendPasswordResetEmail: sinon.stub().resolves(),
      sendWelcomeEmail: sinon.stub().resolves(),
    };

    mockCrypto = {
      generateSecureToken: sinon.stub().returns('secure-reset-token'),
      generateApiKey: sinon.stub().returns('dk_test-api-key-123'),
      hashApiKey: sinon.stub().returns('hashed-api-key'),
      PASSWORD_RESET_TOKEN_EXPIRES_IN_HOURS: 1,
    };

    authController = proxyquire('../../src/controllers/auth/authController', {
      '../../config/prisma': mockPrisma,
      '@prisma/client': { PrismaClient: function () { return mockPrisma; } },
      'bcryptjs': mockBcrypt,
      'jsonwebtoken': mockJwt,
      '../../services/tokenService': mockTokenService,
      '../../services/emailService': mockEmailService,
      '../../utils/crypto': mockCrypto,
    }, { noCallThru: true });

    req = createMockReq();
    res = createMockRes();
    next = sinon.stub();
  });

  afterEach(() => {
    delete process.env.JWT_SECRET;
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      req.body = { email: 'test@example.com', password: 'password123', name: 'Test User' };

      mockPrisma.user.findUnique.resolves(null);
      mockPrisma.user.create.resolves({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        name: 'Test User',
        role: 'USER',
      });
      mockTokenService.createRefreshToken.resolves({ token: 'refresh-token-123' });

      await authController.register(req, res);

      assert(mockPrisma.user.create.calledOnce);
      assert(mockTokenService.generateAccessToken.calledOnce);
      assert(mockTokenService.createRefreshToken.calledOnce);
      assert(mockEmailService.sendWelcomeEmail.calledOnce);
      assert(res.status.calledOnceWithExactly(201));
      const response = res.json.firstCall.args[0];
      assert.strictEqual(response.success, true);
      assert(response.message.includes('User registered successfully'));
    });

    it('should return 400 if email or password missing', async () => {
      req.body = { email: 'test@example.com' };

      await authController.register(req, res);

      assert(res.status.calledOnceWithExactly(400));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Email and password are required',
      }));
    });

    it('should return 400 if password is too short', async () => {
      req.body = { email: 'test@example.com', password: 'short' };

      await authController.register(req, res);

      assert(res.status.calledOnceWithExactly(400));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Password must be at least 8 characters',
      }));
    });

    it('should return 409 if user already exists', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };
      mockPrisma.user.findUnique.resolves({ id: 'existing-user-id' });

      await authController.register(req, res);

      assert(res.status.calledOnceWithExactly(409));
      assert(mockBcrypt.genSalt.notCalled);
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      req.body = { email: 'test@example.com', password: 'password123' };

      mockPrisma.user.findUnique.resolves({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
        name: 'Test User',
        role: 'USER',
      });
      mockBcrypt.compare.resolves(true);
      mockTokenService.createRefreshToken.resolves({ token: 'refresh-token-123' });

      await authController.login(req, res);

      assert(mockBcrypt.compare.calledOnce);
      assert(mockTokenService.generateAccessToken.calledOnce);
      assert(mockTokenService.createRefreshToken.calledOnce);
      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
        message: 'Login successful',
      }));
    });

    it('should return 401 for invalid credentials', async () => {
      req.body = { email: 'test@example.com', password: 'wrongpassword' };

      mockPrisma.user.findUnique.resolves({
        id: 'user-id',
        email: 'test@example.com',
        passwordHash: 'hashedPassword',
      });
      mockBcrypt.compare.resolves(false);

      await authController.login(req, res);

      assert(res.status.calledOnceWithExactly(401));
      assert(mockTokenService.generateAccessToken.notCalled);
    });

    it('should return 400 if email or password missing', async () => {
      req.body = { email: 'test@example.com' };

      await authController.login(req, res);

      assert(res.status.calledOnceWithExactly(400));
    });
  });

  describe('refreshToken', () => {
    it('should rotate refresh token successfully', async () => {
      req.body = { refreshToken: 'old-refresh-token' };

      mockTokenService.rotateRefreshToken.resolves({
        refreshToken: { token: 'new-refresh-token' },
        user: { id: 'user-id', email: 'test@example.com', role: 'USER' },
      });

      await authController.refreshToken(req, res);

      assert(mockTokenService.rotateRefreshToken.calledOnceWith('old-refresh-token'));
      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
        data: {
          accessToken: 'fake-access-token',
          refreshToken: 'new-refresh-token',
        },
      }));
    });

    it('should return 400 if refresh token missing', async () => {
      req.body = {};

      await authController.refreshToken(req, res);

      assert(res.status.calledOnceWithExactly(400));
    });

    it('should return 401 for invalid refresh token', async () => {
      req.body = { refreshToken: 'invalid-token' };
      mockTokenService.rotateRefreshToken.resolves(null);

      await authController.refreshToken(req, res);

      assert(res.status.calledOnceWithExactly(401));
    });
  });

  describe('logout', () => {
    it('should revoke refresh token and return success', async () => {
      req.body = { refreshToken: 'some-refresh-token' };

      await authController.logout(req, res);

      assert(mockTokenService.revokeRefreshToken.calledOnceWith('some-refresh-token'));
      assert(res.status.calledOnceWithExactly(200));
    });

    it('should revoke all tokens if user is authenticated', async () => {
      req.body = {};
      req.user = { userId: 'user-id' };

      await authController.logout(req, res);

      assert(mockTokenService.revokeAllUserTokens.calledOnceWith('user-id'));
      assert(res.status.calledOnceWithExactly(200));
    });
  });

  describe('requestPasswordReset', () => {
    it('should return 400 if email is missing', async () => {
      req.body = {};

      await authController.requestPasswordReset(req, res);

      assert(res.status.calledOnceWithExactly(400));
    });

    it('should return success when email does not exist (email enumeration safe)', async () => {
      req.body = { email: 'nonexistent@example.com' };
      mockPrisma.user.findUnique.resolves(null);

      await authController.requestPasswordReset(req, res);

      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
        message: 'If the email exists, you will receive a reset link',
      }));
    });

    it('should create reset token and send email when user exists', async () => {
      req.body = { email: 'test@example.com' };

      mockPrisma.user.findUnique.resolves({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
      });

      await authController.requestPasswordReset(req, res);

      assert(mockPrisma.passwordResetToken.updateMany.calledOnce);
      assert(mockPrisma.passwordResetToken.create.calledOnce);
      assert(mockEmailService.sendPasswordResetEmail.calledOnceWith(
        'test@example.com',
        'Test User',
        'secure-reset-token',
      ));
      assert(res.status.calledOnceWithExactly(200));
    });
  });

  describe('resetPassword', () => {
    it('should return 400 if token or password is missing', async () => {
      req.body = { token: 'valid-token' };

      await authController.resetPassword(req, res);

      assert(res.status.calledOnceWithExactly(400));
    });

    it('should return 400 if password is too short', async () => {
      req.body = { token: 'valid-token', password: 'short' };

      await authController.resetPassword(req, res);

      assert(res.status.calledOnceWithExactly(400));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Password must be at least 8 characters',
      }));
    });

    it('should return 400 for invalid or expired token', async () => {
      req.body = { token: 'invalid-token', password: 'newpassword123' };
      mockPrisma.passwordResetToken.findUnique.resolves(null);

      await authController.resetPassword(req, res);

      assert(res.status.calledOnceWithExactly(400));
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Invalid or expired reset token',
      }));
    });

    it('should return 400 for used token', async () => {
      req.body = { token: 'used-token', password: 'newpassword123' };
      mockPrisma.passwordResetToken.findUnique.resolves({
        id: 'token-id',
        token: 'used-token',
        userId: 'user-id',
        used: true,
        expiresAt: new Date(Date.now() + 3600000),
        user: { id: 'user-id', email: 'test@example.com' },
      });

      await authController.resetPassword(req, res);

      assert(res.status.calledOnceWithExactly(400));
    });

    it('should return 400 for expired token', async () => {
      req.body = { token: 'expired-token', password: 'newpassword123' };
      mockPrisma.passwordResetToken.findUnique.resolves({
        id: 'token-id',
        token: 'expired-token',
        userId: 'user-id',
        used: false,
        expiresAt: new Date(Date.now() - 3600000),
        user: { id: 'user-id', email: 'test@example.com' },
      });

      await authController.resetPassword(req, res);

      assert(res.status.calledOnceWithExactly(400));
    });

    it('should reset password successfully with valid token', async () => {
      req.body = { token: 'valid-token', password: 'newpassword123' };

      mockPrisma.passwordResetToken.findUnique.resolves({
        id: 'token-id',
        token: 'valid-token',
        userId: 'user-id',
        used: false,
        expiresAt: new Date(Date.now() + 3600000),
        user: { id: 'user-id', email: 'test@example.com' },
      });
      mockPrisma.$transaction.resolves();

      await authController.resetPassword(req, res);

      assert(mockBcrypt.genSalt.calledOnce);
      assert(mockBcrypt.hash.calledOnce);
      assert(mockPrisma.$transaction.calledOnce);
      assert(mockTokenService.revokeAllUserTokens.calledOnceWith('user-id'));
      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
        message: 'Password has been reset successfully',
      }));
    });
  });

  describe('getProfile', () => {
    it('should return user profile when authenticated', async () => {
      req.user = { userId: 'user-id', email: 'test@example.com' };

      mockPrisma.user.findUnique.resolves({
        id: 'user-id',
        email: 'test@example.com',
        name: 'Test User',
        avatar: 'avatar-url',
        role: 'USER',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      await authController.getProfile(req, res);

      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
      }));
    });

    it('should return 404 if user not found', async () => {
      req.user = { userId: 'nonexistent-id' };
      mockPrisma.user.findUnique.resolves(null);

      await authController.getProfile(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });
  });

  describe('createApiKey', () => {
    it('should create an API key successfully', async () => {
      req.user = { userId: 'user-id' };
      req.body = { name: 'my-api-key' };

      mockPrisma.apiKey.create.resolves({
        id: 'api-key-id',
        name: 'my-api-key',
        expiresAt: null,
        createdAt: new Date(),
      });

      await authController.createApiKey(req, res);

      assert(mockCrypto.generateApiKey.calledOnce);
      assert(mockCrypto.hashApiKey.calledOnce);
      assert(mockPrisma.apiKey.create.calledOnce);
      assert(res.status.calledOnceWithExactly(201));
      assert(res.json.calledOnceWithMatch({
        success: true,
        message: 'API key created successfully',
      }));
    });

    it('should return 400 if name is missing', async () => {
      req.user = { userId: 'user-id' };
      req.body = {};

      await authController.createApiKey(req, res);

      assert(res.status.calledOnceWithExactly(400));
    });
  });

  describe('listApiKeys', () => {
    it('should list all API keys for the user', async () => {
      req.user = { userId: 'user-id' };

      mockPrisma.apiKey.findMany.resolves([
        { id: 'key-1', name: 'key-one', expiresAt: null, lastUsedAt: null, createdAt: new Date() },
        { id: 'key-2', name: 'key-two', expiresAt: null, lastUsedAt: null, createdAt: new Date() },
      ]);

      await authController.listApiKeys(req, res);

      assert(mockPrisma.apiKey.findMany.calledOnce);
      assert(res.status.calledOnceWithExactly(200));
      assert(res.json.calledOnceWithMatch({
        success: true,
      }));
    });
  });

  describe('revokeApiKey', () => {
    it('should revoke an API key successfully', async () => {
      req.user = { userId: 'user-id' };
      req.params = { id: 'api-key-id' };

      mockPrisma.apiKey.findFirst.resolves({ id: 'api-key-id', userId: 'user-id' });

      await authController.revokeApiKey(req, res);

      assert(mockPrisma.apiKey.delete.calledOnceWith({ where: { id: 'api-key-id' } }));
      assert(res.status.calledOnceWithExactly(200));
    });

    it('should return 404 if API key not found', async () => {
      req.user = { userId: 'user-id' };
      req.params = { id: 'nonexistent-key' };

      mockPrisma.apiKey.findFirst.resolves(null);

      await authController.revokeApiKey(req, res);

      assert(res.status.calledOnceWithExactly(404));
    });
  });

  describe('error handling', () => {
    it('should handle bcrypt errors during registration', async () => {
      req.body = { email: 'test@example.com', password: 'password123', name: 'Test User' };
      mockPrisma.user.findUnique.resolves(null);
      mockBcrypt.genSalt.rejects(new Error('bcrypt error'));

      await authController.register(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });

    it('should handle prisma errors during getProfile', async () => {
      req.user = { userId: 'user-id' };
      mockPrisma.user.findUnique.rejects(new Error('prisma error'));

      await authController.getProfile(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });

    it('should handle errors in refreshToken', async () => {
      req.body = { refreshToken: 'some-token' };
      mockTokenService.rotateRefreshToken.rejects(new Error('db error'));

      await authController.refreshToken(req, res);

      assert(res.status.calledOnceWithExactly(500));
    });
  });
});
