const express = require('express')
const router = express.Router()
const emailController = require('../controllers/email.controller')
const authMiddleware = require('../middleware/auth')

router.post('/preferences', authMiddleware, emailController.updatePreferences)
router.get('/preferences', authMiddleware, emailController.getPreferences)
router.post('/reset-password', emailController.resetPasswordPost)
router.post('/verify-email', emailController.verifyEmailPost)
router.post('/forgot-password', emailController.requestPasswordReset)

module.exports = router
