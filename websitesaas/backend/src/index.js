require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const rateLimit = require('express-rate-limit')
const { initEmailService } = require('./services/email.service')
const { logger, httpLogger } = require('./services/logger')

const aiRoutes = require('./routes/ai.routes')
const authRoutes = require('./routes/auth.routes')
const websiteRoutes = require('./routes/website.routes')
const templateRoutes = require('./routes/template.routes')
const pageRoutes = require('./routes/page.routes')
const publicRoutes = require('./routes/public.routes')
const emailRoutes = require('./routes/email.routes')
const paymentRoutes = require('./routes/payments.routes')
const adminRoutes = require('./routes/admin.routes')

const app = express()
const PORT = process.env.PORT || 4000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// HTTP request logging
app.use(httpLogger)

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
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
app.use('/api/ai', aiRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/websites', websiteRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/websites', pageRoutes)
app.use('/api', publicRoutes)
app.use('/api/email', emailRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/admin', adminRoutes)

// 404 handler
app.use((req, _res, next) => {
  logger.warn({ url: req.url, method: req.method }, 'Route not found')
  next({ status: 404, message: 'Route not found' })
})

// Error handler
app.use((err, _req, res, _next) => {
  const status = err.status || err.statusCode || 500
  const message = err.message || 'Internal server error'

  if (status >= 500) {
    logger.error({ err, status }, message)
  } else {
    logger.warn({ err, status }, message)
  }

  res.status(status).json({
    error: status === 500 ? 'Internal server error' : message,
    ...(status !== 500 && process.env.NODE_ENV !== 'production' && { stack: err.stack })
  })
})

initEmailService()

app.listen(PORT, () => {
  logger.info(`Backend API running on port ${PORT}`)
})

module.exports = app