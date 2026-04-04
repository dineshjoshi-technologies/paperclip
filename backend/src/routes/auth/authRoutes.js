const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');
const { authenticate } = require('../../middleware/authMiddleware');

// Public routes
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/reset', authController.requestPasswordReset);

// Protected routes (require authentication)
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;