const { test, describe } = require('node:test');
const assert = require('node:assert');

describe('Rate Limiter Middleware', () => {
  test('should export all rate limiters', () => {
    const {
      authLimiter,
      loginLimiter,
      passwordResetLimiter,
      registerLimiter,
    } = require('../../src/middleware/rateLimiter');

    assert(authLimiter, 'authLimiter should be defined');
    assert(loginLimiter, 'loginLimiter should be defined');
    assert(passwordResetLimiter, 'passwordResetLimiter should be defined');
    assert(registerLimiter, 'registerLimiter should be defined');
  });

  test('authLimiter should be a function', () => {
    const { authLimiter } = require('../../src/middleware/rateLimiter');
    assert.strictEqual(typeof authLimiter, 'function');
  });

  test('loginLimiter should be a function', () => {
    const { loginLimiter } = require('../../src/middleware/rateLimiter');
    assert.strictEqual(typeof loginLimiter, 'function');
  });

  test('passwordResetLimiter should be a function', () => {
    const { passwordResetLimiter } = require('../../src/middleware/rateLimiter');
    assert.strictEqual(typeof passwordResetLimiter, 'function');
  });

  test('registerLimiter should be a function', () => {
    const { registerLimiter } = require('../../src/middleware/rateLimiter');
    assert.strictEqual(typeof registerLimiter, 'function');
  });
});
