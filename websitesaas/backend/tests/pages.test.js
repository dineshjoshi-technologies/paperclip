// Page API Integration Tests
// Tests page CRUD operations with website ownership checks

const { test, describe } = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')

require('dotenv').config()
const { JWT_SECRET } = require('../src/utils/jwt')

const testUser = { id: 'user-001', email: 'test@example.com', role: 'USER' }
const otherUser = { id: 'user-002', email: 'other@example.com', role: 'USER' }

const mockPrisma = {
  website: {
    findUnique: async () => null,
  },
  page: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async (data) => ({ 
      id: 'page-new-001', 
      websiteId: data.data.websiteId, 
      name: data.data.name,
      slug: data.data.slug,
      components: [],
    }),
    update: async (data) => ({ 
      id: data.where.id, 
      ...data.data, 
    }),
    delete: async () => ({}),
  },
  component: {
    deleteMany: async () => ({ count: 0 }),
    createMany: async () => ({ count: 0 }),
  },
  $transaction: async (fn) => fn(mockPrisma),
}

const Module = require('module')
const originalRequire = Module.prototype.require
Module.prototype.require = function(id) {
  if (id === '@prisma/client') {
    return { PrismaClient: class { 
      website = mockPrisma.website
      page = mockPrisma.page
      component = mockPrisma.component
      $transaction = mockPrisma.$transaction
    }}
  }
  return originalRequire.apply(this, arguments)
}

function authHeader(user = testUser) {
  const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET || JWT_SECRET, { expiresIn: '15m' })
  return { Authorization: `Bearer ${token}` }
}

function createApp() {
  const app = express()
  app.use(express.json())
  const routes = require('../src/routes/page.routes')
  app.use('/api/websites', routes)
  return app
}

function clearCache() {
  Object.keys(require.cache)
    .filter(k => k.includes('page.routes'))
    .forEach(k => delete require.cache[k])
}

describe('Page API - GET /api/websites/:websiteId/pages', () => {
  test('should reject without auth', async () => {
    clearCache()
    const app = createApp()
    const res = await request(app).get('/api/websites/w1/pages')
    assert.strictEqual(res.statusCode, 401)
  })

  test('should return 404 for nonexistent website', async () => {
    mockPrisma.website.findUnique = async () => null
    clearCache()
    const app = createApp()
    const res = await request(app)
      .get('/api/websites/nonexistent/pages')
      .set(authHeader())
    assert.strictEqual(res.statusCode, 404)
  })

  test('should return 404 for another users website', async () => {
    mockPrisma.website.findUnique = async () => ({
      id: 'w1',
      userId: otherUser.id,
    })
    clearCache()
    const app = createApp()
    const res = await request(app)
      .get('/api/websites/w1/pages')
      .set(authHeader())
    assert.strictEqual(res.statusCode, 404)
  })

  test('should return pages for own website', async () => {
    mockPrisma.website.findUnique = async () => ({ id: 'w1', userId: testUser.id })
    mockPrisma.page.findMany = async () => [
      { id: 'p1', name: 'Home', slug: 'home', websiteId: 'w1' },
      { id: 'p2', name: 'About', slug: 'about', websiteId: 'w1' },
    ]
    clearCache()
    const app = createApp()
    const res = await request(app)
      .get('/api/websites/w1/pages')
      .set(authHeader())
    assert.strictEqual(res.statusCode, 200)
    assert(Array.isArray(res.body))
    assert.strictEqual(res.body.length, 2)
  })
})

describe('Page API - POST /api/websites/:websiteId/pages', () => {
  test('should reject without auth', async () => {
    clearCache()
    const app = createApp()
    const res = await request(app)
      .post('/api/websites/w1/pages')
      .send({ name: 'New Page', slug: 'new-page' })
    assert.strictEqual(res.statusCode, 401)
  })

  test('should reject missing name', async () => {
    clearCache()
    const app = createApp()
    const res = await request(app)
      .post('/api/websites/w1/pages')
      .set(authHeader())
      .send({ slug: 'new-page' })
    assert.strictEqual(res.statusCode, 400)
  })

  test('should reject missing slug', async () => {
    clearCache()
    const app = createApp()
    const res = await request(app)
      .post('/api/websites/w1/pages')
      .set(authHeader())
      .send({ name: 'New Page' })
    assert.strictEqual(res.statusCode, 400)
  })

  test('should reject for another users website', async () => {
    mockPrisma.website.findUnique = async () => ({ id: 'w1', userId: otherUser.id })
    clearCache()
    const app = createApp()
    const res = await request(app)
      .post('/api/websites/w1/pages')
      .set(authHeader())
      .send({ name: 'New Page', slug: 'new-page' })
    assert.strictEqual(res.statusCode, 404)
  })

  test('should create page for own website', async () => {
    mockPrisma.website.findUnique = async () => ({ id: 'w1', userId: testUser.id })
    mockPrisma.page.create = async (data) => ({
      id: 'page-new',
      ...data.data,
      components: [],
    })
    clearCache()
    const app = createApp()
    const res = await request(app)
      .post('/api/websites/w1/pages')
      .set(authHeader())
      .send({ name: 'New Page', slug: 'new-page', content: [] })
    assert.strictEqual(res.statusCode, 201)
    assert.strictEqual(res.body.name, 'New Page')
  })
})

describe('Page API - DELETE /api/websites/:websiteId/pages/:pageId', () => {
  test('should reject without auth', async () => {
    clearCache()
    const app = createApp()
    const res = await request(app).delete('/api/websites/w1/pages/p1')
    assert.strictEqual(res.statusCode, 401)
  })

  test('should delete page from own website', async () => {
    mockPrisma.page.findUnique = async () => ({ id: 'p1', websiteId: 'w1' })
    mockPrisma.website.findUnique = async () => ({ id: 'w1', userId: testUser.id })
    mockPrisma.page.delete = async () => ({})
    clearCache()
    const app = createApp()
    const res = await request(app)
      .delete('/api/websites/w1/pages/p1')
      .set(authHeader())
    assert.strictEqual(res.statusCode, 200)
  })
})
