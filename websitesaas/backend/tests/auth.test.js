const { test, describe, before, after } = require('node:test')
const assert = require('node:assert')
const request = require('supertest')
const express = require('express')

const authRoutes = require('../src/routes/auth.routes')

const app = express()
app.use(express.json())
app.use('/api/auth', authRoutes)

describe('Auth API Contract', () => {
  test('POST /api/auth/register - should reject missing fields', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({})
      .expect(400)
    
    assert(res.body.error, 'Should return validation error')
  })

  test('POST /api/auth/register - should reject invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'invalid', password: 'password123', name: 'Test' })
      .expect(400)
    
    assert(res.body.error, 'Should return validation error')
  })

  test('POST /api/auth/login - should reject missing credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({})
      .expect(400)
    
    assert(res.body.error, 'Should return validation error')
  })

  test('POST /api/auth/login - should reject missing password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'test@example.com' })
      .expect(400)
    
    assert(res.body.error, 'Should return validation error')
  })

  test('POST /api/auth/refresh-token - should reject missing token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({})
      .expect(401)
    
    assert(res.body.error, 'Should return error for missing token')
  })

  test('POST /api/auth/refresh-token - should reject invalid token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh-token')
      .send({ refreshToken: 'invalid' })
      .expect(401)
    
    assert(res.body.error, 'Should return error for invalid token')
  })

  test('GET /api/auth/unknown - should return 404', async () => {
    const res = await request(app)
      .get('/api/auth/unknown')
      .expect(404)
  })
})
