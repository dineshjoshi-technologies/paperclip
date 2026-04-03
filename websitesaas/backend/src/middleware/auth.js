const jwt = require('jsonwebtoken')
const { verifyToken } = require('../utils/jwt')

function authenticate(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const token = authHeader.split(' ')[1]
  const userId = verifyToken(token)

  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  req.userId = userId
  next()
}

module.exports = { authenticate }