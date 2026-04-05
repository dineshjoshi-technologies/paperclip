require('dotenv').config()
const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const cookieParser = require('cookie-parser')
const swaggerUi = require('swagger-ui-express')
const swaggerJsdoc = require('swagger-jsdoc')

const { errorHandler } = require('./middleware/errorHandler')
const { apiLimiter } = require('./middleware/rateLimiter')
const authRoutes = require('./routes/auth/authRoutes')

const app = express()
const PORT = process.env.PORT || 4000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Global rate limiter
app.use('/api', apiLimiter)

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// API info
app.get('/', (_req, res) => {
  res.json({ service: 'dj-technologies-api', version: '0.1.0' })
})

// Swagger configuration
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'DJ Technologies API',
      version: '0.1.0',
      description: 'API documentation for the no-code website development SaaS platform',
      contact: {
        name: 'DJ Technologies',
        url: 'https://djtechnologies.com',
      },
    },
    servers: [
      {
        url: process.env.API_URL || 'http://localhost:4000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/routes/**/*.js', './src/controllers/**/*.js'],
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec))

// Routes
app.use('/api/auth', authRoutes)

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.method} ${req.originalUrl} not found`,
  })
})

// Error handler (must be last)
app.use(errorHandler)

// Export app for testing
if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`Backend API running on port ${PORT}`)
    console.log(`API documentation available at http://localhost:${PORT}/api/docs`)
  })
}

module.exports = app
