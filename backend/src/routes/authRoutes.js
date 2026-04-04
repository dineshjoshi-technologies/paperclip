const express = require('express');
const router = express.Router();
const { authLimiter } = require('../middleware/authMiddleware');
const { 
  register, 
  login, 
  requestPasswordReset, 
  verifyEmail 
} = require('../controllers/authController');

// Apply rate limiting to all auth endpoints
router.use(authLimiter);

// POST /api/auth/register
router.post('/register', register);

// POST /api/auth/login
router.post('/login', login);

// POST /api/auth/reset-password
router.post('/reset-password', requestPasswordReset);

// POST /api/auth/verify-email
router.post('/verify-email', verifyEmail);

module.exports = router;