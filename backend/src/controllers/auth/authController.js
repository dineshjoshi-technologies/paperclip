const bcrypt = require('bcryptjs');
const prisma = require('../../config/prisma');
const tokenService = require('../../services/tokenService');
const emailService = require('../../services/emailService');
const { generateSecureToken, PASSWORD_RESET_TOKEN_EXPIRES_IN_HOURS, generateApiKey, hashApiKey } = require('../../utils/crypto');

const ONBOARDING_STEPS = {
  0: 'Account Created',
  1: 'Profile Setup',
  2: 'First Website',
  3: 'Template Selection',
  4: 'Customization',
  5: 'Published',
};

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);
    const verificationToken = generateSecureToken(32);

    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name: name || null,
        role: 'USER',
        verificationToken,
        onboardingStep: 1,
        onboardingStartedAt: new Date(),
      },
    });

    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = await tokenService.createRefreshToken(user.id);

    await emailService.sendWelcomeEmail(user.email, user.name, verificationToken).catch((err) => {
      console.error('Failed to send welcome email:', err.message);
    });

    const { passwordHash: _, verificationToken: __, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please verify your email.',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken: refreshToken.token,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    if (!user.emailVerified && user.verificationToken) {
      const verificationToken = generateSecureToken(32);
      await prisma.user.update({
        where: { id: user.id },
        data: { verificationToken },
      });
      await emailService.sendWelcomeEmail(user.email, user.name, verificationToken).catch((err) => {
        console.error('Failed to send verification email:', err.message);
      });
      return res.status(403).json({
        success: false,
        message: 'Email not verified. A new verification email has been sent.',
      });
    }

    const accessToken = tokenService.generateAccessToken(user);
    const refreshToken = await tokenService.createRefreshToken(user.id);

    const { passwordHash: _, ...userWithoutPassword } = user;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userWithoutPassword,
        accessToken,
        refreshToken: refreshToken.token,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({
        success: false,
        message: 'Refresh token is required',
      });
    }

    const result = await tokenService.rotateRefreshToken(refreshToken);

    if (!result) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired refresh token',
      });
    }

    const { refreshToken: newRefreshToken, user } = result;
    const newAccessToken = tokenService.generateAccessToken(user);

    res.status(200).json({
      success: true,
      data: {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken.token,
      },
    });
  } catch (error) {
    console.error('Refresh token error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      await tokenService.revokeRefreshToken(refreshToken);
    }

    if (req.user) {
      await tokenService.revokeAllUserTokens(req.user.userId);
    }

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    console.error('Logout error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, you will receive a reset link',
      });
    }

    await prisma.passwordResetToken.updateMany({
      where: { userId: user.id, used: false },
      data: { used: true },
    });

    const resetToken = generateSecureToken(32);
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + PASSWORD_RESET_TOKEN_EXPIRES_IN_HOURS);

    await prisma.passwordResetToken.create({
      data: {
        token: resetToken,
        userId: user.id,
        expiresAt,
      },
    });

    await emailService.sendPasswordResetEmail(user.email, user.name, resetToken).catch((err) => {
      console.error('Failed to send password reset email:', err.message);
    });

    res.status(200).json({
      success: true,
      message: 'If the email exists, you will receive a reset link',
    });
  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({
        success: false,
        message: 'Token and password are required',
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters',
      });
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token',
      });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true },
      }),
    ]);

    await tokenService.revokeAllUserTokens(resetToken.userId);

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully',
    });
  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getProfile = async (req, res) => {
  try {
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
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.createApiKey = async (req, res) => {
  try {
    const { name, expiresAt } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'API key name is required',
      });
    }

    const rawKey = generateApiKey();
    const keyHash = hashApiKey(rawKey);

    const apiKey = await prisma.apiKey.create({
      data: {
        keyHash,
        name,
        userId: req.user.userId,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    res.status(201).json({
      success: true,
      message: 'API key created successfully',
      data: {
        id: apiKey.id,
        name: apiKey.name,
        key: rawKey,
        expiresAt: apiKey.expiresAt,
        createdAt: apiKey.createdAt,
      },
    });
  } catch (error) {
    console.error('Create API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.listApiKeys = async (req, res) => {
  try {
    const apiKeys = await prisma.apiKey.findMany({
      where: { userId: req.user.userId },
      select: {
        id: true,
        name: true,
        expiresAt: true,
        lastUsedAt: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: apiKeys,
    });
  } catch (error) {
    console.error('List API keys error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.revokeApiKey = async (req, res) => {
  try {
    const { id } = req.params;

    const apiKey = await prisma.apiKey.findFirst({
      where: { id, userId: req.user.userId },
    });

    if (!apiKey) {
      return res.status(404).json({
        success: false,
        message: 'API key not found',
      });
    }

    await prisma.apiKey.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'API key revoked successfully',
    });
  } catch (error) {
    console.error('Revoke API key error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        success: false,
        message: 'Verification token is required',
      });
    }

    const user = await prisma.user.findFirst({
      where: { verificationToken: token, emailVerified: false },
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification token',
      });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, verificationToken: null },
    });

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
    });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.resendVerification = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required',
      });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(200).json({
        success: true,
        message: 'If the email exists, you will receive a verification link',
      });
    }

    if (user.emailVerified) {
      return res.status(400).json({
        success: false,
        message: 'Email is already verified',
      });
    }

    const verificationToken = generateSecureToken(32);
    await prisma.user.update({
      where: { id: user.id },
      data: { verificationToken },
    });

    await emailService.sendWelcomeEmail(user.email, user.name, verificationToken).catch((err) => {
      console.error('Failed to send verification email:', err.message);
    });

    res.status(200).json({
      success: true,
      message: 'Verification email sent',
    });
  } catch (error) {
    console.error('Resend verification error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.getOnboardingStatus = async (req, res) => {
  try {
    const userId = req.user.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        onboardingStep: true,
        onboardingStartedAt: true,
        onboardingCompletedAt: true,
      },
    });

    const milestones = await prisma.userOnboardingMilestone.findMany({
      where: { userId },
      orderBy: { awardedAt: 'desc' },
    });

    res.status(200).json({
      success: true,
      data: {
        step: user.onboardingStep,
        stepName: ONBOARDING_STEPS[user.onboardingStep] || 'Unknown',
        startedAt: user.onboardingStartedAt,
        completedAt: user.onboardingCompletedAt,
        milestones: milestones.map(m => ({
          milestone: m.milestone,
          awardedAt: m.awardedAt,
        })),
      },
    });
  } catch (error) {
    console.error('Get onboarding status error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.updateOnboardingStep = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { step } = req.body;

    if (step === undefined || typeof step !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'Valid step number is required',
      });
    }

    if (step < 1 || step > 5) {
      return res.status(400).json({
        success: false,
        message: 'Step must be between 1 and 5',
      });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    const updateData = { onboardingStep: step };

    if (step === 5 && !user.onboardingCompletedAt) {
      updateData.onboardingCompletedAt = new Date();

      await prisma.userOnboardingMilestone.upsert({
        where: { userId_milestone: { userId, milestone: 'first_website' } },
        update: {},
        create: { userId, milestone: 'first_website' },
      });
    }

    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    if (step < 5) {
      const stepNames = ['', 'Profile Setup', 'First Website', 'Template Selection', 'Customization', 'Published'];
      await emailService.sendOnboardingStepEmail(user.email, user.name, step, stepNames[step]).catch((err) => {
        console.error('Failed to send onboarding step email:', err.message);
      });
    }

    res.status(200).json({
      success: true,
      message: 'Onboarding step updated',
      data: {
        step,
        stepName: ONBOARDING_STEPS[step],
      },
    });
  } catch (error) {
    console.error('Update onboarding step error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, avatar } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name || null;
    if (avatar !== undefined) updateData.avatar = avatar || null;

    const user = await prisma.user.update({
      where: { id: req.user.userId },
      data: updateData,
      select: {
        id: true,
        email: true,
        name: true,
        avatar: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};
