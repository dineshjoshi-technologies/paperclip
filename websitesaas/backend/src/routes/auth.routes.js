const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const emailController = require('../controllers/email.controller')
const { validateRegistration, validateLogin } = require('../middleware/validation')
const { authLimiter } = require('../middleware/rate-limiter')
const { authenticate } = require('../middleware/auth')

router.post('/register', authLimiter, validateRegistration, authController.register)
router.post('/login', authLimiter, validateLogin, authController.login)
router.post('/refresh-token', authController.refreshToken)
router.post('/logout', authController.logout)
router.post('/forgot-password', authLimiter, emailController.requestPasswordReset)
router.post('/reset-password', authLimiter, emailController.resetPasswordPost)
router.post('/verify-email', emailController.verifyEmailPost)
router.post('/resend-verification', authLimiter, emailController.resendVerificationPost)
router.post('/onboarding-complete', authenticate, authController.completeOnboarding)

module.exports = router
