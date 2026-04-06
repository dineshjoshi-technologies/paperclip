const { PrismaClient } = require('@prisma/client')
const { sendEmail } = require('../services/email.service')
const crypto = require('crypto')

const prisma = new PrismaClient()

exports.sendWelcomeEmail = async (user) => {
  const appName = process.env.APP_NAME || 'DJ Technologies'
  
  return sendEmail({
    to: user.email,
    templateName: 'welcome',
    subject: `Welcome to ${appName}!`,
    variables: {
      appName,
      name: user.name || 'there',
      activationUrl: process.env.FRONTEND_URL || 'http://localhost:3000',
      year: new Date().getFullYear()
    },
    userId: user.id
  })
}

exports.sendPasswordResetEmail = async (user, token) => {
  const appName = process.env.APP_NAME || 'DJ Technologies'
  const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${token}`
  
  await prisma.passwordReset.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000)
    }
  })

  return sendEmail({
    to: user.email,
    templateName: 'password-reset',
    subject: 'Reset Your Password',
    variables: {
      appName,
      name: user.name || 'there',
      resetUrl,
      expiryHours: 1,
      year: new Date().getFullYear()
    },
    userId: user.id
  })
}

exports.sendEmailVerificationEmail = async (user, token) => {
  const appName = process.env.APP_NAME || 'DJ Technologies'
  const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`
  
  await prisma.emailVerification.create({
    data: {
      userId: user.id,
      token,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  })

  return sendEmail({
    to: user.email,
    templateName: 'email-verification',
    subject: 'Verify Your Email',
    variables: {
      appName,
      name: user.name || 'there',
      verifyUrl,
      expiryHours: 24,
      year: new Date().getFullYear()
    },
    userId: user.id
  })
}

exports.sendWebsitePublishedEmail = async (user, website) => {
  const appName = process.env.APP_NAME || 'DJ Technologies'
  const websiteUrl = `${process.env.PUBLIC_URL || 'http://localhost:3000'}/${website.slug}`
  
  return sendEmail({
    to: user.email,
    templateName: 'website-published',
    subject: 'Your Website is Live!',
    variables: {
      appName,
      name: user.name || 'there',
      websiteName: website.name,
      websiteUrl,
      year: new Date().getFullYear()
    },
    userId: user.id
  })
}

exports.sendPaymentConfirmationEmail = async (user, payment) => {
  const appName = process.env.APP_NAME || 'DJ Technologies'
  
  return sendEmail({
    to: user.email,
    templateName: 'payment-confirmation',
    subject: 'Payment Confirmed',
    variables: {
      appName,
      name: user.name || 'there',
      amount: payment.amount,
      planName: payment.planName,
      transactionId: payment.transactionId,
      dashboardUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`,
      year: new Date().getFullYear()
    },
    userId: user.id
  })
}

exports.sendPaymentFailedEmail = async (user, payment) => {
  const appName = process.env.APP_NAME || 'DJ Technologies'
  
  return sendEmail({
    to: user.email,
    templateName: 'payment-failed',
    subject: 'Payment Failed',
    variables: {
      appName,
      name: user.name || 'there',
      amount: payment.amount,
      planName: payment.planName,
      billingUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing`,
      year: new Date().getFullYear()
    },
    userId: user.id
  })
}

exports.sendSubscriptionExpiredEmail = async (user, subscription) => {
  const appName = process.env.APP_NAME || 'DJ Technologies'
  
  return sendEmail({
    to: user.email,
    templateName: 'subscription-expired',
    subject: 'Subscription Expired',
    variables: {
      appName,
      name: user.name || 'there',
      planName: subscription.planName,
      renewUrl: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/billing`,
      year: new Date().getFullYear()
    },
    userId: user.id
  })
}

exports.sendAdminNewUserAlert = async (newUser) => {
  const appName = process.env.APP_NAME || 'DJ Technologies'
  const adminEmail = process.env.ADMIN_EMAIL
  
  if (!adminEmail) return { success: false, reason: 'No admin email configured' }

  return sendEmail({
    to: adminEmail,
    templateName: 'admin-new-user',
    subject: 'New User Registration',
    variables: {
      appName,
      email: newUser.email,
      name: newUser.name || 'N/A',
      createdAt: new Date().toISOString()
    }
  })
}

exports.updatePreferences = async (req, res) => {
  try {
    const userId = req.user.id
    const preferences = req.body.preferences
    
    await exports.updateEmailPreferences(userId, preferences)
    res.json({ message: 'Preferences updated' })
  } catch (error) {
    res.status(500).json({ error: 'Failed to update preferences' })
  }
}

exports.getPreferences = async (req, res) => {
  try {
    const userId = req.user.id
    const preferences = await exports.getEmailPreferences(userId)
    res.json({ preferences })
  } catch (error) {
    res.status(500).json({ error: 'Failed to get preferences' })
  }
}

exports.resetPasswordPost = async (req, res) => {
  try {
    const { token, newPassword } = req.body
    
    if (!token || !newPassword) {
      return res.status(400).json({ error: 'Token and new password required' })
    }
    
    const result = await exports.resetPassword(token, newPassword)
    
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }
    
    res.json({ message: 'Password reset successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Password reset failed' })
  }
}

exports.verifyEmailPost = async (req, res) => {
  try {
    const { token } = req.body
    
    if (!token) {
      return res.status(400).json({ error: 'Token required' })
    }
    
    const result = await exports.verifyEmail(token)
    
    if (!result.success) {
      return res.status(400).json({ error: result.error })
    }
    
    res.json({ message: 'Email verified successfully' })
  } catch (error) {
    res.status(500).json({ error: 'Email verification failed' })
  }
}

exports.requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body
    
    if (!email) {
      return res.status(400).json({ error: 'Email required' })
    }
    
    const user = await prisma.user.findUnique({ where: { email } })
    
    if (!user) {
      return res.json({ message: 'If the email exists, a reset link will be sent' })
    }
    
    const token = exports.generateResetToken()
    await exports.sendPasswordResetEmail(user, token)
    
    res.json({ message: 'If the email exists, a reset link will be sent' })
  } catch (error) {
    res.status(500).json({ error: 'Password reset request failed' })
  }
}

exports.updateEmailPreferences = async (userId, preferences) => {
  const updates = preferences.map(pref => 
    prisma.emailPreference.upsert({
      where: { userId_emailType: { userId, emailType: pref.emailType } },
      update: { isEnabled: pref.isEnabled },
      create: { userId, emailType: pref.emailType, isEnabled: pref.isEnabled }
    })
  )
  
  await prisma.$transaction(updates)
}

exports.getEmailPreferences = async (userId) => {
  return prisma.emailPreference.findMany({ where: { userId } })
}

exports.resetPassword = async (token, newPassword) => {
  const bcrypt = require('bcryptjs')
  
  const reset = await prisma.passwordReset.findUnique({ where: { token } })
  if (!reset) {
    return { success: false, error: 'Invalid token' }
  }
  
  if (reset.usedAt || new Date() > reset.expiresAt) {
    return { success: false, error: 'Token expired or already used' }
  }
  
  const passwordHash = await bcrypt.hash(newPassword, 12)
  
  await prisma.$transaction([
    prisma.user.update({ where: { id: reset.userId }, data: { passwordHash } }),
    prisma.passwordReset.update({ where: { id: reset.id }, data: { usedAt: new Date() } })
  ])
  
  return { success: true }
}

exports.verifyEmail = async (token) => {
  const verification = await prisma.emailVerification.findUnique({ where: { token } })
  if (!verification) {
    return { success: false, error: 'Invalid token' }
  }
  
  if (verification.verifiedAt || new Date() > verification.expiresAt) {
    return { success: false, error: 'Token expired or already verified' }
  }
  
  await prisma.emailVerification.update({ 
    where: { id: verification.id }, 
    data: { verifiedAt: new Date() } 
  })
  
  return { success: true }
}

exports.generateResetToken = () => {
  return crypto.randomBytes(32).toString('hex')
}

exports.generateVerificationToken = () => {
  return crypto.randomBytes(32).toString('hex')
}
