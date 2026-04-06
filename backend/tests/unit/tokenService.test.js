const { describe, it, beforeEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Token Service', () => {
  let tokenService;
  let mockJwt, mockPrisma, mockCrypto;

  beforeEach(() => {
    sinon.reset();
    process.env.JWT_SECRET = 'test-secret-key';

    mockJwt = {
      sign: sinon.stub().returns('jwt-token'),
      verify: sinon.stub(),
    };

    mockPrisma = {
      refreshToken: {
        create: sinon.stub(),
        findUnique: sinon.stub(),
        update: sinon.stub(),
        updateMany: sinon.stub(),
      },
    };

    mockCrypto = {
      JWT_SECRET: 'test-secret-key',
      JWT_EXPIRES_IN: '7d',
      REFRESH_TOKEN_EXPIRES_IN_DAYS: 30,
      generateSecureToken: sinon.stub().returns('generated-refresh-token'),
    };

    tokenService = proxyquire('../../src/services/tokenService', {
      'jsonwebtoken': mockJwt,
      '../config/prisma': mockPrisma,
      '../utils/crypto': mockCrypto,
    });
  });

  describe('generateAccessToken', () => {
    it('should generate a JWT token for user', () => {
      const user = { id: 'user-id', email: 'test@example.com', role: 'USER' };
      const token = tokenService.generateAccessToken(user);

      assert(mockJwt.sign.calledOnceWithExactly(
        { userId: 'user-id', email: 'test@example.com', role: 'USER' },
        'test-secret-key',
        { expiresIn: '7d' },
      ));
      assert.strictEqual(token, 'jwt-token');
    });
  });

  describe('verifyAccessToken', () => {
    it('should verify a JWT token', () => {
      mockJwt.verify.returns({ userId: 'user-id' });

      const decoded = tokenService.verifyAccessToken('some-token');

      assert(mockJwt.verify.calledOnceWith('some-token', 'test-secret-key'));
      assert.deepStrictEqual(decoded, { userId: 'user-id' });
    });
  });

  describe('createRefreshToken', () => {
    it('should create a refresh token in the database', async () => {
      mockPrisma.refreshToken.create.resolves({
        id: 'rt-id',
        token: 'generated-refresh-token',
        userId: 'user-id',
        expiresAt: new Date(),
      });

      const result = await tokenService.createRefreshToken('user-id');

      assert(mockCrypto.generateSecureToken.calledOnceWith(48));
      assert(mockPrisma.refreshToken.create.calledOnce);
      const createCall = mockPrisma.refreshToken.create.getCall(0).args[0];
      assert.strictEqual(createCall.data.userId, 'user-id');
      assert.strictEqual(createCall.data.token, 'generated-refresh-token');
    });
  });

  describe('rotateRefreshToken', () => {
    it('should return null for non-existent token', async () => {
      mockPrisma.refreshToken.findUnique.resolves(null);

      const result = await tokenService.rotateRefreshToken('invalid-token');

      assert.strictEqual(result, null);
    });

    it('should return null for revoked token', async () => {
      mockPrisma.refreshToken.findUnique.resolves({
        id: 'rt-id',
        token: 'old-token',
        userId: 'user-id',
        revoked: true,
        expiresAt: new Date(Date.now() + 86400000),
        user: { id: 'user-id', email: 'test@example.com' },
      });

      const result = await tokenService.rotateRefreshToken('old-token');

      assert.strictEqual(result, null);
    });

    it('should return null for expired token', async () => {
      mockPrisma.refreshToken.findUnique.resolves({
        id: 'rt-id',
        token: 'expired-token',
        userId: 'user-id',
        revoked: false,
        expiresAt: new Date(Date.now() - 86400000),
        user: { id: 'user-id', email: 'test@example.com' },
      });

      const result = await tokenService.rotateRefreshToken('expired-token');

      assert.strictEqual(result, null);
    });

    it('should rotate token successfully', async () => {
      mockPrisma.refreshToken.findUnique.resolves({
        id: 'rt-id',
        token: 'valid-token',
        userId: 'user-id',
        revoked: false,
        expiresAt: new Date(Date.now() + 86400000),
        user: { id: 'user-id', email: 'test@example.com' },
      });
      mockPrisma.refreshToken.create.resolves({
        id: 'rt-new',
        token: 'new-token',
        userId: 'user-id',
        expiresAt: new Date(),
      });

      const result = await tokenService.rotateRefreshToken('valid-token');

      assert(mockPrisma.refreshToken.update.calledOnce);
      assert.strictEqual(result.refreshToken.token, 'new-token');
      assert.strictEqual(result.user.email, 'test@example.com');
    });
  });

  describe('revokeRefreshToken', () => {
    it('should revoke a single refresh token', async () => {
      await tokenService.revokeRefreshToken('some-token');

      assert(mockPrisma.refreshToken.updateMany.calledOnceWith({
        where: { token: 'some-token' },
        data: { revoked: true },
      }));
    });
  });

  describe('revokeAllUserTokens', () => {
    it('should revoke all tokens for a user', async () => {
      await tokenService.revokeAllUserTokens('user-id');

      assert(mockPrisma.refreshToken.updateMany.calledOnceWith({
        where: { userId: 'user-id' },
        data: { revoked: true },
      }));
    });
  });
});
