// Template API Integration Tests
// Tests CRUD operations, public access for reading, admin access for writing

const { test, describe } = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')

const JWT_SECRET = process.env.JWT_SECRET || 'test-secret-key'

const testUser = { id: 'user-001', email: 'test@example.com', role: 'USER' }
const testAdmin = { id: 'admin-001', email: 'admin@example.com', role: 'ADMIN' }

const mockPrisma = {
  template: {
    findMany: async () => [],
    findUnique: async () => null,
    create: async (data) => ({ id: 'tpl-new', ...data.data }),
    update: async (data) => ({ ...data.where, ...data.data }),
    delete: async () => ({}),
  },
}

const Module = require('module')
const originalRequire = Module.prototype.require
Module.prototype.require = function(id) {
  if (id === '@prisma/client') {
    return { PrismaClient: class { template = mockPrisma.template }}
  }
  return originalRequire.apply(this, arguments)
}

function authHeader(user = testUser) {
  const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '15m' })
  return { Authorization: `Bearer ${token}` }
}

function adminAuthHeader() {
  const token = jwt.sign({ userId: testAdmin.id }, JWT_SECRET, { expiresIn: '15m' })
  return { Authorization: `Bearer ${token}` }
}

function createApp(routes) {
  const app = express()
  app.use(express.json())
  app.use('/api/templates', routes)
  return app
}

// Need to clear require cache for routes that import Prisma
function clearRouteCache() {
  const cacheKeys = Object.keys(require.cache).filter(k => 
    k.includes('routes/template') || k.includes('controllers/template') || k.includes('middleware/auth')
  )
  cacheKeys.forEach(k => delete require.cache[k])
}

describe('Template API - Public Read Access', () => {
  test('GET /api/templates - should return list without auth', async () => {
    mockPrisma.template.findMany = async () => [
      { id: 't1', name: 'Template 1', category: 'Business' },
      { id: 't2', name: 'Template 2', category: 'Portfolio' },
    ]
    clearRouteCache()
    const routes = require('../src/routes/template.routes')
    const app = createApp(routes)
    
    const res = await request(app).get('/api/templates')
    assert.strictEqual(res.statusCode, 200)
    assert(Array.isArray(res.body))
  })

  test('GET /api/templates - should filter by category', async () => {
    mockPrisma.template.findMany = async ({ where }) => [
      { id: 't1', name: 'Business Template', category: 'Business' },
    ]
    clearRouteCache()
    const routes = require('../src/routes/template.routes')
    const app = createApp(routes)
    
    const res = await request(app).get('/api/templates?category=Business')
    assert.strictEqual(res.statusCode, 200)
  })

  test('GET /api/templates - should filter by premium flag', async () => {
    mockPrisma.template.findMany = async () => []
    clearRouteCache()
    const routes = require('../src/routes/template.routes')
    const app = createApp(routes)
    
    const res = await request(app).get('/api/templates?premium=true')
    assert.strictEqual(res.statusCode, 200)
  })

  test('GET /api/templates/:id - should return single template', async () => {
    mockPrisma.template.findUnique = async () => ({
      id: 't1',
      name: 'Business Template',
      description: 'A business template',
      category: 'Business',
    })
    clearRouteCache()
    const routes = require('../src/routes/template.routes')
    const app = createApp(routes)
    
    const res = await request(app).get('/api/templates/t1')
    assert.strictEqual(res.statusCode, 200)
    assert.strictEqual(res.body.name, 'Business Template')
  })

  test('GET /api/templates/:id - should return 404 for nonexistent template', async () => {
    mockPrisma.template.findUnique = async () => null
    clearRouteCache()
    const routes = require('../src/routes/template.routes')
    const app = createApp(routes)
    
    const res = await request(app).get('/api/templates/nonexistent')
    assert.strictEqual(res.statusCode, 404)
  })
})

describe('Template API - Admin Write Access', () => {
  test('POST /api/templates - should reject without auth', async () => {
    clearRouteCache()
    const routes = require('../src/routes/template.routes')
    const app = createApp(routes)
    
    const res = await request(app)
      .post('/api/templates')
      .send({ name: 'New Template' })
    
    assert.strictEqual(res.statusCode, 401)
  })

  test('POST /api/templates - should create template as admin', async () => {
    mockPrisma.template.create = async (data) => ({
      id: 'tpl-new',
      ...data.data,
      createdAt: new Date(),
    })
    clearRouteCache()
    const routes = require('../src/routes/template.routes')
    const app = createApp(routes)
    
    const res = await request(app)
      .post('/api/templates')
      .set(adminAuthHeader())
      .send({ name: 'New Template', category: 'Business', description: 'A new template' })
    
    assert.strictEqual(res.statusCode, 201)
    assert.strictEqual(res.body.name, 'New Template')
  })

  test('PUT /api/templates/:id - should require auth', async () => {
    clearRouteCache()
    const routes = require('../src/routes/template.routes')
    const app = createApp(routes)
    
    const res = await request(app)
      .put('/api/templates/t1')
      .send({ name: 'Updated' })
    
    assert.strictEqual(res.statusCode, 401)
  })

  test('DELETE /api/templates/:id - should require auth', async () => {
    clearRouteCache()
    const routes = require('../src/routes/template.routes')
    const app = createApp(routes)
    
    const res = await request(app).delete('/api/templates/t1')
    assert.strictEqual(res.statusCode, 401)
  })
})
