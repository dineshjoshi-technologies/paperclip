const { PrismaClient } = require('@prisma/client');
const { hashPassword, comparePassword, generateToken } = require('../utils/authUtils');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const zod = require('zod');

const prisma = new PrismaClient();

// Zod validation schemas
const registerSchema = zod.object({
  email: zod.string().email({ message: 'Invalid email address' }),
  password: zod.string().min(8, { message: 'Password must be at least 8 characters long' }),
  firstName: zod.string().optional(),
  lastName: zod.string().optional()
});

const loginSchema = zod.object({
  email: zod.string().email({ message: 'Invalid email address' }),
  password: zod.string().min(1, { message: 'Password is required' })
});

const resetPasswordSchema = zod.object({
  email: zod.string().email({ message: 'Invalid email address' })
});

const verifyEmailSchema = zod.object({
  token: zod.string().min(1, { message: 'Token is required' })
});

// Create nodemailer transporter (configure based on your email service)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: process.env.SMTP_PORT || 587,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || ''
  }
});

/**
 * Register a new user
 * POST /api/auth/register
 */
const register = async (req, res) => {
  try {
    // Validate input
    const parsedBody = registerSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: parsedBody.error.errors 
      });
    }

    const { email, password, firstName, lastName } = parsedBody.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        error: 'User with this email already exists' 
      });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        firstName,
        lastName,
        emailVerified: false // Will be verified via email
      }
    });

    // Generate email verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    await prisma.passwordResetToken.create({
      data: {
        token: verificationToken,
        userId: user.id,
        expiresAt
      }
    });

    // Send verification email (placeholder - in production, send actual email)
    console.log(`Verification email sent to ${email} with token: ${verificationToken}`);

    // Generate JWT tokens
    const accessToken = generateToken(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      process.env.JWT_EXPIRES_IN || '7d'
    );

    const refreshToken = generateToken(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret-change-in-production',
      process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'
    );

    // Remove sensitive data from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(201).json({
      message: 'User registered successfully. Please check your email to verify your account.',
      user: userWithoutPassword,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Login user
 * POST /api/auth/login
 */
const login = async (req, res) => {
  try {
    // Validate input
    const parsedBody = loginSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: parsedBody.error.errors 
      });
    }

    const { email, password } = parsedBody.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Don't reveal whether email exists for security
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Check password
    const isValidPassword = await comparePassword(password, user.passwordHash);
    if (!isValidPassword) {
      return res.status(401).json({ 
        error: 'Invalid email or password' 
      });
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // Generate JWT tokens
    const accessToken = generateToken(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || 'fallback-secret-change-in-production',
      process.env.JWT_EXPIRES_IN || '7d'
    );

    const refreshToken = generateToken(
      { id: user.id },
      process.env.REFRESH_TOKEN_SECRET || 'fallback-refresh-secret-change-in-production',
      process.env.REFRESH_TOKEN_EXPIRES_IN || '30d'
    );

    // Remove sensitive data from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(200).json({
      message: 'Login successful',
      user: userWithoutPassword,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Request password reset
 * POST /api/auth/reset-password
 */
const requestPasswordReset = async (req, res) => {
  try {
    // Validate input
    const parsedBody = resetPasswordSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: parsedBody.error.errors 
      });
    }

    const { email } = parsedBody.data;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Always return success to prevent email enumeration
    if (!user) {
      return res.status(200).json({ 
        message: 'If the email exists in our system, you will receive a password reset link.' 
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    // Invalidate any existing reset tokens for this user
    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true }
    });

    // Create new reset token
    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt
      }
    });

    // Send reset email (placeholder - in production, send actual email)
    console.log(`Password reset email sent to ${email} with token: ${resetToken}`);

    res.status(200).json({ 
      message: 'If the email exists in our system, you will receive a password reset link.' 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * Verify email
 * POST /api/auth/verify-email
 */
const verifyEmail = async (req, res) => {
  try {
    // Validate input
    const parsedBody = verifyEmailSchema.safeParse(req.body);
    if (!parsedBody.success) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: parsedBody.error.errors 
      });
    }

    const { token } = parsedBody.data;

    // Find valid token
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        token,
        used: false,
        expiresAt: { gt: new Date() }
      },
      include: { user: true }
    });

    if (!resetToken) {
      return res.status(400).json({ 
        error: 'Invalid or expired token' 
      });
    }

    // Mark user as email verified
    await prisma.user.update({
      where: { id: resetToken.userId },
      data: { emailVerified: true }
    });

    // Mark token as used
    await prisma.passwordResetToken.update({
      where: { id: resetToken.id },
      data: { used: true }
    });

    res.status(200).json({ 
      message: 'Email verified successfully' 
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  register,
  login,
  requestPasswordReset,
  verifyEmail
};