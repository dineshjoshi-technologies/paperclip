// Website API Integration Tests
// Tests CRUD operations, auth requirements, and edge cases

const { test, describe } = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key'

const testUser = { id: 'user-001', email: 'test@example.com', role: 'USER' }
const otherUser = { id: 'user-002', email: 'other@example.com', role: 'USER' }

const mockPrisma = {
  website: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async (data) => ({ id: 'website-new-001', ...data.data }),
    update: async (data) => ({ ...(data.where || {}), ...(data.data || {}) }),
    delete: async () => ({}),
  },
  $transaction: async (fn) => fn(mockPrisma),
}

// Mock email controller
const mockEmailController = {
  sendWebsitePublishedEmail: async () => ({ success: true }),
  sendWelcomeEmail: async () => ({ success: true }),
}

// Prisma mock
const Module = require('module')
const originalRequire = Module.prototype.require
Module.prototype.require = function(id) {
  if (id === '@prisma/client') {
    return { PrismaClient: class { 
      website = mockPrisma.website
      $transaction = mockPrisma.$transaction
    }}
  }
  if (id.includes('email.controller')) {
    return mockEmailController
  }
  return originalRequire.apply(this, arguments)
}

function authHeader(user = testUser) {
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' })
  return { Authorization: `Bearer ${token}` }
}

function createApp(routes) {
  const app = express()
  app.use(express.json())
  app.use('/api/websites', routes)
  return app
}

describe('Website API - GET /api/websites', () => {
  test('should reject without authentication', async () => {
    const routes = require('../src/routes/website.routes')
    const app = createApp(routes)
    
    const res = await request(app).get('/api/websites')
    assert.strictEqual(res.statusCode, 401)
  })

  test('should return websites for authenticated user', async () => {
    mockPrisma.website.findMany = async () => [
      { id: 'w1', name: 'Site 1', slug: 'site-1', userId: testUser.id },
      { id: 'w2', name: 'Site 2', slug: 'site-2', userId: testUser.id },
    ]
    const routes = require('../src/routes/website.routes')
    const app = createApp(routes)
    
    const res = await request(app)
      .get('/api/websites')
      .set(authHeader())
    
    assert.strictEqual(res.statusCode, 200)
    assert(Array.isArray(res.body))
  })
})

describe('Website API - POST /api/websites', () => {
  test('should reject without authentication', async () => {
    const routes = require('../src/routes/website.routes')
    const app = createApp(routes)
    
    const res = await request(app)
      .post('/api/websites')
      .send({ name: 'Test', slug: 'test' })
    
    assert.strictEqual(res.statusCode, 401)
  })

  test('should create website with valid data', async () => {
    mockPrisma.website.create = async (data) => ({
      id: 'website-new',
      ...data.data,
      createdAt: new Date(),
      updatedAt: new Date(),
    })
    const routes = require('../src/routes/website.routes')
    const app = createApp(routes)
    
    const res = await request(app)
      .post('/api/websites')
      .set(authHeader())
      .send({ name: 'My Site', slug: 'my-site', templateId: 'tpl-1' })
    
    assert.strictEqual(res.statusCode, 201)
    assert.strictEqual(res.body.name, 'My Site')
    assert.strictEqual(res.body.slug, 'my-site')
  })
})

describe('Website API - PUT /api/websites/:id', () => {
  test('should reject without authentication', async () => {
    const routes = require('../src/routes/website.routes')
    const app = createApp(routes)
    
    const res = await request(app)
      .put('/api/websites/site-1')
      .send({ name: 'Updated' })
    
    assert.strictEqual(res.statusCode, 401)
  })

  test('should return 404 for website not found', async () => {
    mockPrisma.website.findUnique = async () => null
    const routes = require('../src/routes/website.routes')
    const app = createApp(routes)
    
    const res = await request(app)
      .put('/api/websites/nonexistent')
      .set(authHeader())
      .send({ name: 'Updated' })
    
    assert.strictEqual(res.statusCode, 404)
  })

  test('should return 404 when trying to update another user website', async () => {
    mockPrisma.website.findUnique = async () => ({
      id: 'w1',
      name: 'Other Site',
      userId: otherUser.id,
    })
    const routes = require('../src/routes/website.routes')
    const app = createApp(routes)
    
    const res = await request(app)
      .put('/api/websites/w1')
      .set(authHeader())
      .send({ name: 'Hacked' })
    
    assert.strictEqual(res.statusCode, 404, 'Should not expose existence of other users websites')
  })

  test('should update own website', async () => {
    mockPrisma.website.findUnique = async () => ({
      id: 'w1',
      name: 'Old Name',
      slug: 'old-slug',
      userId: testUser.id,
    })
    mockPrisma.website.update = async (data) => ({
      id: 'w1',
      ...data.data,
      updatedAt: new Date(),
    })
    const routes = require('../src/routes/website.routes')
    const app = createApp(routes)
    
    const res = await request(app)
      .put('/api/websites/w1')
      .set(authHeader())
      .send({ name: 'New Name' })
    
    assert.strictEqual(res.statusCode, 200)
  })
})

describe('Website API - DELETE /api/websites/:id', () => {
  test('should reject without authentication', async () => {
    const routes = require('../src/routes/website.routes')
    const app = createApp(routes)
    
    const res = await request(app).delete('/api/websites/w1')
    assert.strictEqual(res.statusCode, 401)
  })

  test('should delete own website', async () => {
    mockPrisma.website.findUnique = async () => ({
      id: 'w1',
      userId: testUser.id,
    })
    mockPrisma.website.delete = async () => ({})
    const routes = require('../src/routes/website.routes')
    const app = createApp(routes)
    
    const res = await request(app)
      .delete('/api/websites/w1')
      .set(authHeader())
    
    assert.strictEqual(res.statusCode, 204)
  })

  test('should return 404 when deleting another user website', async () => {
    mockPrisma.website.findUnique = async () => ({
      id: 'w1',
      userId: otherUser.id,
    })
    const routes = require('../src/routes/website.routes')
    const app = createApp(routes)
    
    const res = await request(app)
      .delete('/api/websites/w1')
      .set(authHeader())
    
    assert.strictEqual(res.statusCode, 404)
  })
})

describe('Website API - POST /api/websites/:id/publish', () => {
  test('should reject without authentication', async () => {
    const routes = require('../src/routes/website.routes')
    const app = createApp(routes)
    
    const res = await request(app).post('/api/websites/w1/publish')
    assert.strictEqual(res.statusCode, 401)
  })

  test('should publish own website', async () => {
    mockPrisma.website.findUnique = async () => ({
      id: 'w1',
      userId: testUser.id,
      user: { id: testUser.id, email: testUser.email, name: testUser.name },
    })
    mockPrisma.website.update = async (data) => ({
      id: 'w1',
      ...data.data,
      status: 'PUBLISHED',
    })
    const routes = require('../src/routes/website.routes')
    const app = createApp(routes)
    
    const res = await request(app)
      .post('/api/websites/w1/publish')
      .set(authHeader())
    
    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(res.body.status, 'PUBLISHED')
  })
})
