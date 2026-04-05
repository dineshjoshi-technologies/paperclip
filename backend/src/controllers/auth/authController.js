const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}
const JWT_EXPIRES_IN = '7d';

/**
 * Register a new user
 */
exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      return res.status(409).json({ 
        success: false, 
        message: 'User with this email already exists' 
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        role: 'USER'
      }
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Login user
 */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email and password are required' 
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({ 
        success: false, 
        message: 'Invalid credentials' 
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    // Remove password hash from response
    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        token
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Request password reset
 */
exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate input
    if (!email) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email is required' 
      });
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    // Always return same message to prevent email enumeration
    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, you will receive a reset link'
      });
    }

    // Generate reset token (in production, save to DB and send via email)
    const resetToken = jwt.sign(
      { userId: user.id, email: user.email, purpose: 'password_reset' },
      JWT_SECRET,
      { expiresIn: '1h' } // Token expires in 1 hour
    );

    // In a real application, you would send this token via email
    // For now, we'll return it in the response for demonstration purposes
    // REMOVE THIS LINE IN PRODUCTION AND SEND VIA EMAIL INSTEAD
    console.log(`Password reset token for ${email}: ${resetToken}`);

    res.status(200).json({
      success: true,
      message: 'If the email exists, you will receive a reset link'
      // In development, you might want to include the token:
      // resetToken: resetToken 
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Reset password with token
 */
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    // Validate input
    if (!token || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Token and password are required' 
      });
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if token is for password reset purpose
    if (decoded.purpose !== 'password_reset') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid token for password reset' 
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // Update user's password
    await prisma.user.update({
      where: { id: decoded.userId },
      data: { passwordHash }
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Password reset error:', error);
    
    if (error.name === 'TokenExpiredError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Reset token has expired' 
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(400).json({ 
        success: false, 
        message: 'Invalid reset token' 
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get current user profile
 */
exports.getProfile = async (req, res) => {
  try {
    // User ID should be attached to request by auth middleware
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        role: true,
        createdAt: true,
        updatedAt: true
      }
    });

    if (!user) {
      return res.status(404).json({ 
        success: false, 
        message: 'User not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: user
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};
