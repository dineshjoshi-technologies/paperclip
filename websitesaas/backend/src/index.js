require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')

const authRoutes = require('./routes/auth.routes')
const websiteRoutes = require('./routes/website.routes')
const templateRoutes = require('./routes/template.routes')
const pageRoutes = require('./routes/page.routes')
const publicRoutes = require('./routes/public.routes')
const emailRoutes = require('./routes/email.routes')

const { initEmailService } = require('./services/email.service')

const app = express()
const PORT = process.env.PORT || 4000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
})
app.use('/api/', limiter)

// Body parsing
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API routes
app.use('/api/auth', authRoutes)
app.use('/api/websites', websiteRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/websites', pageRoutes)
app.use('/api', publicRoutes)
app.use('/api/email', emailRoutes)

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' })
})

// Error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack)
  res.status(500).json({ error: 'Internal server error' })
})

initEmailService()

app.listen(PORT, () => {
  console.log(`Backend API running on port ${PORT}`)
})

module.exports = app