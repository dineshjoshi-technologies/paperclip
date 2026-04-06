const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_TOKEN_EXPIRES_IN_DAYS, generateSecureToken } = require('../utils/crypto');

class TokenService {
  generateAccessToken(user) {
    return jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );
  }

  verifyAccessToken(token) {
    return jwt.verify(token, JWT_SECRET);
  }

  async createRefreshToken(userId) {
    const token = generateSecureToken(48);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);

    const refreshToken = await prisma.refreshToken.create({
      data: {
        token,
        userId,
        expiresAt,
      },
    });

    return refreshToken;
  }

  async rotateRefreshToken(token) {
    const existing = await prisma.refreshToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!existing || existing.revoked || existing.expiresAt < new Date()) {
      return null;
    }

    const newToken = generateSecureToken(48);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + REFRESH_TOKEN_EXPIRES_IN_DAYS);

    const created = await prisma.refreshToken.create({
      data: {
        token: newToken,
        userId: existing.userId,
        expiresAt,
      },
    });

    await prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revoked: true, replacedBy: created.id },
    });

    return { refreshToken: created, user: existing.user };
  }

  async revokeRefreshToken(token) {
    await prisma.refreshToken.updateMany({
      where: { token },
      data: { revoked: true },
    });
  }

  async revokeAllUserTokens(userId) {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revoked: true },
    });
  }
}

module.exports = new TokenService();
