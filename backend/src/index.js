require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const { PrismaClient } = require('@prisma/client')

const app = express()
const PORT = process.env.PORT || 4000
const prisma = new PrismaClient()

app.use(helmet())
app.use(cors())
app.use(express.json())

// Auth routes
const authRoutes = require('./routes/authRoutes')
app.use('/api/auth', authRoutes)

app.get('/health', async (_req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    database: 'unknown'
  }

  try {
    await prisma.$queryRaw`SELECT 1`
    health.database = 'connected'
  } catch (error) {
    health.database = 'disconnected'
    health.status = 'degraded'
  }

  const statusCode = health.status === 'ok' ? 200 : 503
  res.status(statusCode).json(health)
})

app.get('/', (_req, res) => {
  res.json({ service: 'dj-technologies-api', version: '0.1.0' })
})

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`)
})

process.on('SIGINT', async () => {
  await prisma.$disconnect()
  process.exit(0)
})

process.on('SIGTERM', async () => {
  await prisma.$disconnect()
  process.exit(0)
})
