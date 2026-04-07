// Middleware Tests
// Tests auth middleware, validation middleware, rate limiter

const { test, describe } = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')

require('dotenv').config()
const { authenticate } = require('../src/middleware/auth')
const { JWT_SECRET, generateTokens } = require('../src/utils/jwt')

describe('Authentication Middleware', () => {
  function createTestApp(handler) {
    const app = express()
    app.use(express.json())
    app.use('/protected', authenticate, handler)
    return app
  }

  const successHandler = (req, res) => {
    res.json({ userId: req.userId, message: 'Access granted' })
  }

  test('should reject requests without Authorization header', async () => {
    const app = createTestApp(successHandler)
    const res = await request(app).get('/protected')
    assert.strictEqual(res.statusCode, 401)
    assert.strictEqual(res.body.error, 'Authentication required')
  })

  test('should reject requests with malformed Authorization header', async () => {
    const app = createTestApp(successHandler)
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'InvalidFormat')
    assert.strictEqual(res.statusCode, 401)
    assert.strictEqual(res.body.error, 'Authentication required')
  })

  test('should reject requests with invalid token', async () => {
    const app = createTestApp(successHandler)
    const res = await request(app)
      .get('/protected')
      .set('Authorization', 'Bearer invalid-token-here')
    assert.strictEqual(res.statusCode, 401)
    assert.strictEqual(res.body.error, 'Invalid or expired token')
  })

  test('should accept requests with valid Bearer token', async () => {
    const token = jwt.sign({ userId: 'user-123' }, JWT_SECRET, { expiresIn: '15m' })
    const app = createTestApp(successHandler)
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(res.body.userId, 'user-123')
  })

  test('should reject expired tokens', async () => {
    const token = jwt.sign({ userId: 'user-123' }, JWT_SECRET, { expiresIn: '0s' })
    // Wait a tiny bit to ensure token is expired
    await new Promise(resolve => setTimeout(resolve, 100))
    const app = createTestApp(successHandler)
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
    assert.strictEqual(res.statusCode, 401)
  })

  test('should reject tokens signed with wrong secret', async () => {
    const token = jwt.sign({ userId: 'user-123' }, 'wrong-secret', { expiresIn: '15m' })
    const app = createTestApp(successHandler)
    const res = await request(app)
      .get('/protected')
      .set('Authorization', `Bearer ${token}`)
    assert.strictEqual(res.statusCode, 401)
  })
})

describe('Validation Middleware', () => {
  const { validateRegistration, validateLogin } = require('../src/middleware/validation')

  function createValidationApp(validator, handler) {
    const app = express()
    app.use(express.json())
    app.post('/test', validator, handler)
    return app
  }

  const passHandler = (req, res) => res.json({ valid: true })

  test('validateRegistration should reject empty body', async () => {
    const app = createValidationApp(validateRegistration, passHandler)
    const res = await request(app).post('/test').send({})
    assert.strictEqual(res.statusCode, 400)
    assert.strictEqual(res.body.error, 'Validation failed')
  })

  test('validateRegistration should reject invalid email', async () => {
    const app = createValidationApp(validateRegistration, passHandler)
    const res = await request(app)
      .post('/test')
      .send({ email: 'not-an-email', password: 'longenough123' })
    assert.strictEqual(res.statusCode, 400)
  })

  test('validateRegistration should reject short password', async () => {
    const app = createValidationApp(validateRegistration, passHandler)
    const res = await request(app)
      .post('/test')
      .send({ email: 'test@example.com', password: 'short' })
    assert.strictEqual(res.statusCode, 400)
  })

  test('validateRegistration should return detailed validation errors', async () => {
    const app = createValidationApp(validateRegistration, passHandler)
    const res = await request(app)
      .post('/test')
      .send({ email: 'bad', password: 'x' })
    assert.strictEqual(res.statusCode, 400)
    assert(res.body.details, 'Should include validation details')
    assert(Array.isArray(res.body.details), 'Details should be an array of errors')
    assert(res.body.details.length >= 2, 'Should have at least 2 validation errors')
  })

  test('validateRegistration should accept valid registration data', async () => {
    const app = createValidationApp(validateRegistration, passHandler)
    const res = await request(app)
      .post('/test')
      .send({ email: 'test@example.com', password: 'password123', name: 'Test User' })
    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(res.body.valid, true)
  })

  test('validateLogin should reject empty body', async () => {
    const app = createValidationApp(validateLogin, passHandler)
    const res = await request(app).post('/test').send({})
    assert.strictEqual(res.statusCode, 400)
  })

  test('validateLogin should reject missing password', async () => {
    const app = createValidationApp(validateLogin, passHandler)
    const res = await request(app)
      .post('/test')
      .send({ email: 'test@example.com' })
    assert.strictEqual(res.statusCode, 400)
  })

  test('validateLogin should reject missing email', async () => {
    const app = createValidationApp(validateLogin, passHandler)
    const res = await request(app)
      .post('/test')
      .send({ password: 'password123' })
    assert.strictEqual(res.statusCode, 400)
  })

  test('validateLogin should accept valid login data', async () => {
    const app = createValidationApp(validateLogin, passHandler)
    const res = await request(app)
      .post('/test')
      .send({ email: 'test@example.com', password: 'password123' })
    assert.strictEqual(res.statusCode, 200)
  })
})

describe('JWT Utility Functions', () => {
  const { generateTokens, verifyToken, verifyRefreshToken } = require('../src/utils/jwt')

  test('generateTokens should create valid access and refresh tokens', () => {
    const { accessToken, refreshToken } = generateTokens('user-123')
    assert(accessToken, 'Should generate access token')
    assert(refreshToken, 'Should generate refresh token')
    
    const decoded = jwt.decode(accessToken)
    assert.strictEqual(decoded.userId, 'user-123')
  })

  test('verifyToken should validate correct access token', () => {
    const { accessToken } = generateTokens('user-123')
    const userId = verifyToken(accessToken)
    assert.strictEqual(userId, 'user-123')
  })

  test('verifyToken should return null for invalid token', () => {
    const userId = verifyToken('garbage-token')
    assert.strictEqual(userId, null)
  })

  test('verifyToken should return null for expired token', () => {
    // Generate a token that expires immediately
    const token = jwt.sign({ userId: 'user-123' }, JWT_SECRET, { expiresIn: '0s' })
    setTimeout(() => {
      const userId = verifyToken(token)
      assert.strictEqual(userId, null)
    }, 100)
  })

  test('verifyRefreshToken should validate correct refresh token', () => {
    const { refreshToken } = generateTokens('user-456')
    const userId = verifyRefreshToken(refreshToken)
    assert.strictEqual(userId, 'user-456')
  })

  test('verifyRefreshToken should return null for invalid token', () => {
    const userId = verifyRefreshToken('invalid-refresh')
    assert.strictEqual(userId, null)
  })

  test('access and refresh tokens should be different', () => {
    const { accessToken, refreshToken } = generateTokens('user-123')
    assert.notStrictEqual(accessToken, refreshToken)
  })
})

describe('Rate Limiter Middleware', () => {
  const { authLimiter } = require('../src/middleware/rate-limiter')

  test('authLimiter should be defined', () => {
    assert(authLimiter, 'authLimiter should be exported')
  })

  test('should allow initial requests', async () => {
    const app = express()
    app.use('/login', authLimiter, (req, res) => res.json({ ok: true }))

    const res = await request(app).post('/login').send({})
    assert(res.statusCode === 200 || res.statusCode === 400, 'Should allow initial request')
  })
})
