const { test, describe } = require('node:test');
const assert = require('node:assert');
const crypto = require('crypto');

describe('Crypto Utils', () => {
  test('JWT_SECRET is exported', () => {
    process.env.JWT_SECRET = 'test-secret';
    delete require.cache[require.resolve('../../src/utils/crypto')];
    const cryptoUtils = require('../../src/utils/crypto');
    assert.strictEqual(cryptoUtils.JWT_SECRET, 'test-secret');
  });

  test('JWT_EXPIRES_IN is 7d', () => {
    process.env.JWT_SECRET = 'test-secret';
    delete require.cache[require.resolve('../../src/utils/crypto')];
    const cryptoUtils = require('../../src/utils/crypto');
    assert.strictEqual(cryptoUtils.JWT_EXPIRES_IN, '7d');
  });

  test('REFRESH_TOKEN_EXPIRES_IN_DAYS is 30', () => {
    process.env.JWT_SECRET = 'test-secret';
    delete require.cache[require.resolve('../../src/utils/crypto')];
    const cryptoUtils = require('../../src/utils/crypto');
    assert.strictEqual(cryptoUtils.REFRESH_TOKEN_EXPIRES_IN_DAYS, 30);
  });

  test('PASSWORD_RESET_TOKEN_EXPIRES_IN_HOURS is 1', () => {
    process.env.JWT_SECRET = 'test-secret';
    delete require.cache[require.resolve('../../src/utils/crypto')];
    const cryptoUtils = require('../../src/utils/crypto');
    assert.strictEqual(cryptoUtils.PASSWORD_RESET_TOKEN_EXPIRES_IN_HOURS, 1);
  });

  test('API_KEY_PREFIX is dk_', () => {
    process.env.JWT_SECRET = 'test-secret';
    delete require.cache[require.resolve('../../src/utils/crypto')];
    const cryptoUtils = require('../../src/utils/crypto');
    assert.strictEqual(cryptoUtils.API_KEY_PREFIX, 'dk_');
  });

  test('generateSecureToken returns hex string', () => {
    process.env.JWT_SECRET = 'test-secret';
    delete require.cache[require.resolve('../../src/utils/crypto')];
    const { generateSecureToken } = require('../../src/utils/crypto');
    const token = generateSecureToken();
    assert.strictEqual(typeof token, 'string');
    assert.ok(/^[0-9a-f]+$/.test(token));
  });

  test('generateSecureToken returns different tokens', () => {
    process.env.JWT_SECRET = 'test-secret';
    delete require.cache[require.resolve('../../src/utils/crypto')];
    const { generateSecureToken } = require('../../src/utils/crypto');
    const token1 = generateSecureToken();
    const token2 = generateSecureToken();
    assert.notStrictEqual(token1, token2);
  });

  test('generateApiKey returns string with dk_ prefix', () => {
    process.env.JWT_SECRET = 'test-secret';
    delete require.cache[require.resolve('../../src/utils/crypto')];
    const { generateApiKey } = require('../../src/utils/crypto');
    const key = generateApiKey();
    assert.ok(key.startsWith('dk_'));
    assert.strictEqual(typeof key, 'string');
  });

  test('hashApiKey returns sha256 hex string', () => {
    process.env.JWT_SECRET = 'test-secret';
    delete require.cache[require.resolve('../../src/utils/crypto')];
    const { hashApiKey } = require('../../src/utils/crypto');
    const key = 'dk_test_key_123';
    const hash = hashApiKey(key);
    const expectedHash = crypto.createHash('sha256').update(key).digest('hex');
    assert.strictEqual(hash, expectedHash);
    assert.strictEqual(hash.length, 64);
  });

  test('Throws if JWT_SECRET is not set', () => {
    const originalSecret = process.env.JWT_SECRET;
    delete process.env.JWT_SECRET;
    delete require.cache[require.resolve('../../src/utils/crypto')];
    assert.throws(() => {
      require('../../src/utils/crypto');
    }, /JWT_SECRET/);
    process.env.JWT_SECRET = originalSecret;
  });
});
