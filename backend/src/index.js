require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const rateLimit = require('express-rate-limit')
const https = require('https')
const fs = require('fs')

const app = express()
const PORT = process.env.PORT || 4000

app.set('trust proxy', process.env.NODE_ENV === 'production' ? 1 : 0)

app.use(helmet({
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true,
  },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
  crossOriginEmbedderPolicy: false,
}))

app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))
app.use('/api/payments/webhook', express.json({ limit: '10mb', verify: function captureRawBody(req, res, buf) { req.rawBody = buf } }))
app.use(express.json({ limit: '10mb' }))
app.use(cookieParser())
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many requests, please try again later.' },
})

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many authentication attempts, please try again later.' },
})

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many password reset attempts, please try again later.' },
})

app.use('/api/', generalLimiter)
app.use('/api/auth/login', authLimiter)
app.use('/api/auth/register', authLimiter)
app.use('/api/auth/refresh', authLimiter)
app.use('/api/auth/reset', strictLimiter)

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

app.get('/', (_req, res) => {
  res.json({ service: 'dj-technologies-api', version: '0.1.0' })
})

const authRoutes = require('./routes/auth/authRoutes')
const websiteRoutes = require('./routes/websites')
const pageRoutes = require('./routes/pages')
const templateRoutes = require('./routes/templates')
const userRoutes = require('./routes/users')
const paymentRoutes = require('./routes/payments')
const invoiceRoutes = require('./routes/invoices')
const subscriptionRoutes = require('./routes/subscriptions')

app.use('/api/auth', authRoutes)
app.use('/api/websites', websiteRoutes)
app.use('/api/pages', pageRoutes)
app.use('/api/templates', templateRoutes)
app.use('/api/users', userRoutes)
app.use('/api/payments', paymentRoutes)
app.use('/api/invoices', invoiceRoutes)
app.use('/api/subscriptions', subscriptionRoutes)

app.use((_req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  })
})

app.use((err, _req, res, _next) => {
  console.error('Unhandled error:', err)
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

const httpsOptions = process.env.NODE_ENV === 'production' && process.env.SSL_KEY && process.env.SSL_CERT
  ? {
      key: fs.readFileSync(process.env.SSL_KEY),
      cert: fs.readFileSync(process.env.SSL_CERT),
    }
  : null

if (httpsOptions) {
  https.createServer(httpsOptions, app).listen(PORT, () => {
    console.log(`Backend API running on HTTPS port ${PORT}`)
  })
} else {
  app.listen(PORT, () => {
    console.log(`Backend API running on port ${PORT} (HTTP)`)
  })
}
