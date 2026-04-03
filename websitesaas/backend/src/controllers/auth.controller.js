const jwt = require('jsonwebtoken')
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const { generateTokens, verifyRefreshToken } = require('../utils/jwt')

const prisma = new PrismaClient()

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body

    const existingUser = await prisma.user.findUnique({ where: { email } })
    if (existingUser) {
      return res.status(409).json({ error: 'Email already registered' })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const user = await prisma.user.create({
      data: { email, passwordHash, name }
    })

    const { accessToken, refreshToken } = generateTokens(user.id)

    res.status(201).json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken
    })
  } catch (error) {
    res.status(500).json({ error: 'Registration failed' })
  }
}

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const isValid = await bcrypt.compare(password, user.passwordHash)
    if (!isValid) {
      return res.status(401).json({ error: 'Invalid credentials' })
    }

    const { accessToken, refreshToken } = generateTokens(user.id)

    res.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
      accessToken,
      refreshToken
    })
  } catch (error) {
    res.status(500).json({ error: 'Login failed' })
  }
}

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body
    if (!refreshToken) {
      return res.status(401).json({ error: 'Refresh token required' })
    }

    const userId = verifyRefreshToken(refreshToken)
    if (!userId) {
      return res.status(401).json({ error: 'Invalid refresh token' })
    }

    const { accessToken, refreshToken: newRefreshToken } = generateTokens(userId)

    res.json({ accessToken, refreshToken: newRefreshToken })
  } catch (error) {
    res.status(500).json({ error: 'Token refresh failed' })
  }
}

exports.logout = async (req, res) => {
  res.json({ message: 'Logged out successfully' })
}