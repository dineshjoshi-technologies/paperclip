const express = require('express')
const router = express.Router()
const authController = require('../controllers/auth.controller')
const { validateRegistration, validateLogin } = require('../middleware/validation')
const { authLimiter } = require('../middleware/rate-limiter')

router.post('/register', authLimiter, validateRegistration, authController.register)
router.post('/login', authLimiter, validateLogin, authController.login)
router.post('/refresh-token', authController.refreshToken)
router.post('/logout', authController.logout)

module.exports = router