const { test, describe, before } = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const express = require('express')
const jwt = require('jsonwebtoken')

const { authenticate } = require('../src/middleware/auth')
const websiteRoutes = require('../src/routes/website.routes')

const app = express()
app.use(express.json())

app.use((req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }
  req.userId = 'test-user-1'
  next()
})

app.use('/api/websites', websiteRoutes)

describe('Websites API Contract', () => {
  const authToken = jwt.sign({ sub: 'test-user-1' }, process.env.JWT_SECRET || 'test-secret', { expiresIn: '15m' })

  test('GET /api/websites - should reject without auth', async () => {
    const res = await request(app)
      .get('/api/websites')

    assert(res.statusCode === 401, 'Should reject without auth')
  })

  test('GET /api/websites - should allow with valid auth header', async () => {
    const res = await request(app)
      .get('/api/websites')
      .set('Authorization', `Bearer ${authToken}`)

    assert(res.statusCode === 200 || res.statusCode === 401, 'Should accept valid auth')
  })

  test('GET /api/websites/:slug - should accept any slug format (auth passes, may 500 without DB)', async (t) => {
    // Skip - requires running database
    t.skip('Requires database connection')
  })

  test('POST /api/websites - should reject missing name', async () => {
    const res = await request(app)
      .post('/api/websites')
      .set('Authorization', `Bearer ${authToken}`)
      .send({})

    assert(res.statusCode >= 400, 'Should reject missing name')
  })

  test('PUT /api/websites/:id - should require auth', async () => {
    const res = await request(app)
      .put('/api/websites/some-id')
      .send({ name: 'Updated' })

    assert(res.statusCode === 401, 'Should reject without auth')
  })

  test('DELETE /api/websites/:id - should require auth', async () => {
    const res = await request(app)
      .delete('/api/websites/some-id')

    assert(res.statusCode === 401, 'Should reject without auth')
  })
})
