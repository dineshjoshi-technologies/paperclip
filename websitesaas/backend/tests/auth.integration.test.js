// Auth API Integration Tests
// Tests all authentication endpoints with mocked database

const { test, describe, mock } = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')

// Mock dependencies before requiring route modules
const mockPrisma = {
  user: {
    findUnique: async () => null,
    create: async (data) => ({ 
      id: 'user-test-001', 
      email: data.data.email, 
      passwordHash: data.data.passwordHash,
      name: data.data.name || null,
      role: data.data.role || 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
  },
  passwordResetToken: {
    create: async (data) => ({ id: 'token-001', ...data.data }),
    findFirst: async () => null,
    deleteMany: async () => ({ count: 0 }),
  },
  emailLog: {
    create: async (data) => ({ id: 'email-log-001', ...data.data }),
    update: async (data) => ({ id: 'email-log-001', ...data.data }),
  },
  emailTemplate: {
    findUnique: async () => null,
  },
  emailPreference: {
    findUnique: async () => null,
  },
  refreshToken: {
    create: async (data) => ({ id: 'refresh-token-001', ...data.data }),
    findFirst: async () => null,
    deleteMany: async () => ({ count: 0 }),
  },
  emailVerification: {
    findFirst: async () => null,
  },
  $transaction: async (fn) => fn(mockPrisma),
}

// Mock email controller before any auth routes are loaded
const mockEmailController = {
  sendWelcomeEmail: async () => ({ success: true }),
  sendAdminNewUserAlert: async () => ({ success: true }),
  sendPasswordResetEmail: async () => ({ success: true }),
  sendEmailVerificationEmail: async () => ({ success: true }),
  generateResetToken: () => 'test-reset-token-001',
  generateVerificationToken: () => 'test-verification-token-001',
  sendWebsitePublishedEmail: async () => ({ success: true }),
  requestPasswordReset: async (req, res) => res.json({ message: 'If the email exists, a reset link will be sent' }),
  resetPasswordPost: async (req, res) => res.json({ message: 'Password reset successfully' }),
  verifyEmailPost: async (req, res) => res.json({ message: 'Email verified successfully' }),
  resendVerificationPost: async (req, res) => res.json({ message: 'If the account exists, a verification email will be sent' }),
}

// Single module override for both Prisma and email controller
const moduleModule = require('module')
const originalRequire = moduleModule.prototype.require
moduleModule.prototype.require = function(id) {
  if (id === '@prisma/client' || id.includes('@prisma/client')) {
    return { PrismaClient: function() { return mockPrisma } }
  }
  if (id.includes('email.controller')) {
    return mockEmailController
  }
  return originalRequire.apply(this, arguments)
}

// Build test app with the actual auth routes
function createTestApp() {
  const app = express()
  app.use(express.json())
  
  // Reset mock before each test
  mockPrisma.user.findUnique = async () => null
  mockPrisma.user.create = async (data) => ({ 
    id: 'user-test-001', 
    email: data.data.email, 
    passwordHash: data.data.passwordHash,
    name: data.data.name || null,
    role: 'USER',
  })
  mockPrisma.emailVerification.findFirst = async () => null

  return app
}

describe('POST /api/auth/register', () => {
  test('should reject empty body', async () => {
    const app = createTestApp()
    // Need to import routes fresh - but Express routes are stateless enough
    const authRoutes = require('../src/routes/auth.routes')
    app.use('/api/auth', authRoutes)

    const res = await request(app)
      .post('/api/auth/register')
      .send({})
    
    assert.strictEqual(res.statusCode, 400)
    assert(res.body.error, 'Should return error message')
  })

  test('should reject invalid email format', async () => {
    const app = createTestApp()
    const authRoutes = require('../src/routes/auth.routes')
    app.use('/api/auth', authRoutes)

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'notanemail', password: 'password123' })
    
    assert.strictEqual(res.statusCode, 400)
  })

  test('should reject password shorter than 8 characters', async () => {
    const app = createTestApp()
    const authRoutes = require('../src/routes/auth.routes')
    app.use('/api/auth', authRoutes)

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'short' })
    
    assert.strictEqual(res.statusCode, 400)
  })

  test('should reject duplicate email', async () => {
    const app = createTestApp()
    mockPrisma.user.findUnique = async () => ({ 
      id: 'existing-user', 
      email: 'test@example.com',
      passwordHash: 'hashed',
      name: 'Existing',
      role: 'USER',
    })
    const authRoutes = require('../src/routes/auth.routes')
    app.use('/api/auth', authRoutes)

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'test@example.com', password: 'password123', name: 'Test' })
    
    assert.strictEqual(res.statusCode, 409)
    assert.strictEqual(res.body.error, 'Email already registered')
  })

  test('should register new user successfully', async () => {
    const app = createTestApp()
    mockPrisma.user.findUnique = async () => null
    mockPrisma.user.create = async (data) => ({ 
      id: 'user-new-001', 
      email: data.data.email, 
      passwordHash: data.data.passwordHash,
      name: data.data.name,
      role: 'USER',
    })
    const authRoutes = require('../src/routes/auth.routes')
    app.use('/api/auth', authRoutes)

    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'new@example.com', password: 'securepassword123', name: 'New User' })
    
    assert.strictEqual(res.statusCode, 201)
    assert(res.body.user, 'Should return user object')
    assert.strictEqual(res.body.user.email, 'new@example.com')
    assert(res.body.accessToken, 'Should return access token')
    assert(res.body.refreshToken, 'Should return refresh token')
    // Should not return password hash
    assert.strictEqual(res.body.user.passwordHash, undefined, 'Should not expose password hash')
  })
})

describe('POST /api/auth/login', () => {
  test('should reject empty body', async () => {
    const app = createTestApp()
    const authRoutes = require('../src/routes/auth.routes')
    app.use('/api/auth', authRoutes)

    const res = await request(app)
      .post('/api/auth/login')
      .send({})
    
    assert.strictEqual(res.statusCode, 400)
  })

  test('should reject missing password', async () => {
    const app = createTestApp()
    const authRoutes = require('../src/routes/auth.routes')
    app.use('/api/auth', authRoutes)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' })
    
    assert.strictEqual(res.statusCode, 400)
  })

  test('should reject nonexistent user', async () => {
    const app = createTestApp()
    mockPrisma.user.findUnique = async () => null
    const authRoutes = require('../src/routes/auth.routes')
    app.use('/api/auth', authRoutes)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: 'password123' })
    
    assert.strictEqual(res.statusCode, 401)
    assert.strictEqual(res.body.error, 'Invalid credentials')
  })

  test('should reject wrong password', async () => {
    const app = createTestApp()
    const hashedPassword = await bcrypt.hash('correctpassword', 12)
    mockPrisma.user.findUnique = async () => ({
      id: 'user-001',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      name: 'Test',
      role: 'USER',
    })
    const authRoutes = require('../src/routes/auth.routes')
    app.use('/api/auth', authRoutes)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })
    
    assert.strictEqual(res.statusCode, 401)
    assert.strictEqual(res.body.error, 'Invalid credentials')
  })

  test('should login successfully with correct credentials', async () => {
    const app = createTestApp()
    const password = 'correctpassword'
    const hashedPassword = await bcrypt.hash(password, 12)
    mockPrisma.user.findUnique = async () => ({
      id: 'user-001',
      email: 'test@example.com',
      passwordHash: hashedPassword,
      name: 'Test User',
      role: 'USER',
    })
    const authRoutes = require('../src/routes/auth.routes')
    app.use('/api/auth', authRoutes)

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com', password })
    
    assert.strictEqual(res.statusCode, 200)
    assert(res.body.user, 'Should return user object')
    assert.strictEqual(res.body.user.email, 'test@example.com')
    assert(res.body.accessToken, 'Should return access token')
    assert(res.body.refreshToken, 'Should return refresh token')
    assert.strictEqual(res.body.user.passwordHash, undefined, 'Should not expose password hash')
  })
})

describe('POST /api/auth/refresh-token', () => {
  test('should reject missing token', async () => {
    const app = createTestApp()
    const authRoutes = require('../src/routes/auth.routes')
    app.use('/api/auth', authRoutes)

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({})
    
    assert.strictEqual(res.statusCode, 401)
    assert.strictEqual(res.body.error, 'Refresh token required')
  })

  test('should reject invalid token', async () => {
    const app = createTestApp()
    const authRoutes = require('../src/routes/auth.routes')
    app.use('/api/auth', authRoutes)

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: 'not-a-real-token' })
    
    assert.strictEqual(res.statusCode, 401)
    assert.strictEqual(res.body.error, 'Invalid refresh token')
  })

  test('should return new tokens with valid refresh token', async () => {
    const app = createTestApp()
    const validRefreshToken = jwt.sign({ userId: 'user-001' }, process.env.JWT_REFRESH_SECRET || 'test-refresh-secret', { expiresIn: '7d' })
    const authRoutes = require('../src/routes/auth.routes')
    app.use('/api/auth', authRoutes)

    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: validRefreshToken })
    
    assert.strictEqual(res.statusCode, 200)
    assert(res.body.accessToken, 'Should return new access token')
    assert(res.body.refreshToken, 'Should return new refresh token')
  })
})

describe('POST /api/auth/logout', () => {
  test('should return success message', async () => {
    const app = createTestApp()
    const authRoutes = require('../src/routes/auth.routes')
    app.use('/api/auth', authRoutes)

    const res = await request(app)
      .post('/api/auth/logout')
    
    assert.strictEqual(res.statusCode, 200)
    assert(res.body.message, 'Should return logout message')
  })
})
