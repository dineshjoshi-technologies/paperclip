const crypto = require('crypto')
const pino = require('pino')

const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: { colorize: true }
  } : undefined,
  base: { env: process.env.NODE_ENV || 'development' }
})

function httpLogger() {
  return (req, res, next) => {
    const start = Date.now()
    const id = req.headers['x-request-id'] || crypto.randomUUID()
    req.id = id
    req.log = logger.child({ reqId: id, method: req.method, url: req.url })

    res.on('finish', () => {
      const duration = Date.now() - start
      if (res.statusCode >= 500) {
        req.log.error({ statusCode: res.statusCode, duration }, 'Server error')
      } else if (res.statusCode >= 400) {
        req.log.warn({ statusCode: res.statusCode, duration }, 'Client error')
      } else {
        req.log.info({ statusCode: res.statusCode, duration }, 'Request completed')
      }
    })

    next()
  }
}

module.exports = { logger, httpLogger }
