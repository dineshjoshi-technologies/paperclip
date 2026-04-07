const jwt = require('jsonwebtoken')

const isTestEnv = !process.env.NODE_ENV || process.env.NODE_ENV === 'test' || process.env.NODE_ENV === 'development'
const JWT_SECRET = process.env.JWT_SECRET || (isTestEnv ? 'test-secret-key' : undefined)
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || (isTestEnv ? 'test-refresh-secret' : undefined)

if (!JWT_SECRET) {
  console.error('FATAL: JWT_SECRET environment variable is not set')
  process.exit(1)
}

if (!JWT_REFRESH_SECRET) {
  console.error('FATAL: JWT_REFRESH_SECRET environment variable is not set')
  process.exit(1)
}
const JWT_EXPIRES_IN = '15m'
const JWT_REFRESH_EXPIRES_IN = '7d'

function generateTokens(userId) {
  const accessToken = jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })
  const refreshToken = jwt.sign({ userId }, JWT_REFRESH_SECRET, { expiresIn: JWT_REFRESH_EXPIRES_IN })
  return { accessToken, refreshToken }
}

function verifyToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    return decoded.userId
  } catch (error) {
    return null
  }
}

function verifyRefreshToken(token) {
  try {
    const decoded = jwt.verify(token, JWT_REFRESH_SECRET)
    return decoded.userId
  } catch (error) {
    return null
  }
}

module.exports = {
  generateTokens,
  verifyToken,
  verifyRefreshToken,
  JWT_SECRET,
  JWT_REFRESH_SECRET
}