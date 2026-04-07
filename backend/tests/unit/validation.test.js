const { describe, it, beforeEach, afterEach } = require('node:test');
const assert = require('node:assert');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Validation Middleware', () => {
  describe('validate', () => {
    let validate;
    let mockZodSchema;
    let req;
    let res;
    let next;

    beforeEach(() => {
      const z = require('zod');
      const module = require('../../src/middleware/validation');
      validate = module.validate;
      mockZodSchema = {
        parse: sinon.stub(),
      };
      req = { body: { field: 'value' } };
      res = {
        status: sinon.stub().returnsThis(),
        json: sinon.stub(),
      };
      next = sinon.stub();
    });

    it('should call next when validation passes', () => {
      mockZodSchema.parse.returns({ field: 'value' });
      const middleware = validate(mockZodSchema);

      middleware(req, res, next);

      assert(next.calledOnce);
      assert(res.status.notCalled);
    });

    it('should return 400 on validation error', () => {
      const { z } = require('zod');
      const mockSchema = z.object({
        email: z.string().email(),
      });
      const middleware = validate(mockSchema);
      middleware({ body: { email: 'bad' } }, res, next);

      assert.strictEqual(res.status.firstCall.args[0], 400);
      assert(res.json.calledOnceWithMatch({
        success: false,
        message: 'Validation failed',
      }));
    });
  });

  describe('schemas', () => {
    it('should have all required schemas exported', () => {
      const {
        registerSchema,
        loginSchema,
        passwordResetRequestSchema,
        passwordResetConfirmSchema,
        refreshTokenSchema,
        createApiKeySchema,
        updateUserSchema,
        resendVerificationSchema,
      } = require('../../src/middleware/validation');

      assert(registerSchema);
      assert(loginSchema);
      assert(passwordResetRequestSchema);
      assert(passwordResetConfirmSchema);
      assert(refreshTokenSchema);
      assert(createApiKeySchema);
      assert(updateUserSchema);
      assert(resendVerificationSchema);
    });

    it('should registerSchema validate valid input', () => {
      const { registerSchema } = require('../../src/middleware/validation');
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
      });
      assert(result.success);
    });

    it('should registerSchema reject invalid email', () => {
      const { registerSchema } = require('../../src/middleware/validation');
      const result = registerSchema.safeParse({
        email: 'not-an-email',
        password: 'password123',
      });
      assert(!result.success);
    });

    it('should registerSchema reject short password', () => {
      const { registerSchema } = require('../../src/middleware/validation');
      const result = registerSchema.safeParse({
        email: 'test@example.com',
        password: 'short',
      });
      assert(!result.success);
    });

    it('should loginSchema validate valid input', () => {
      const { loginSchema } = require('../../src/middleware/validation');
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: 'password123',
      });
      assert(result.success);
    });

    it('should loginSchema reject empty password', () => {
      const { loginSchema } = require('../../src/middleware/validation');
      const result = loginSchema.safeParse({
        email: 'test@example.com',
        password: '',
      });
      assert(!result.success);
    });

    it('should passwordResetRequestSchema validate valid email', () => {
      const { passwordResetRequestSchema } = require('../../src/middleware/validation');
      const result = passwordResetRequestSchema.safeParse({
        email: 'test@example.com',
      });
      assert(result.success);
    });

    it('should passwordResetConfirmSchema reject short password', () => {
      const { passwordResetConfirmSchema } = require('../../src/middleware/validation');
      const result = passwordResetConfirmSchema.safeParse({
        token: 'some-token',
        password: 'short',
      });
      assert(!result.success);
    });

    it('should refreshTokenSchema reject empty token', () => {
      const { refreshTokenSchema } = require('../../src/middleware/validation');
      const result = refreshTokenSchema.safeParse({ refreshToken: '' });
      assert(!result.success);
    });

    it('should createApiKeySchema reject empty name', () => {
      const { createApiKeySchema } = require('../../src/middleware/validation');
      const result = createApiKeySchema.safeParse({ name: '' });
      assert(!result.success);
    });

    it('should resendVerificationSchema reject invalid email', () => {
      const { resendVerificationSchema } = require('../../src/middleware/validation');
      const result = resendVerificationSchema.safeParse({ email: 'bad-email' });
      assert(!result.success);
    });
  });
});
