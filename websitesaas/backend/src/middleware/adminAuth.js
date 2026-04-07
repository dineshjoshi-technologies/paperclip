function adminOnly(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Authentication required' })
  }

  const token = authHeader.split(' ')[1]
  const { verifyToken } = require('../utils/jwt')
  const userId = verifyToken(token)

  if (!userId) {
    return res.status(401).json({ error: 'Invalid or expired token' })
  }

  req.userId = userId
  req.checkAdminRole = true
  next()
}

module.exports = { adminOnly }
