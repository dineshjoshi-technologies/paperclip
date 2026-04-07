const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function adminOnly(req, res, next) {
  try {
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

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'AGENCY')) {
      return res.status(403).json({ error: 'Admin access required' })
    }

    req.userId = userId
    req.userRole = user.role
    next()
  } catch (error) {
    res.status(500).json({ error: 'Internal server error' })
  }
}

module.exports = { adminOnly }
