const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');
const { authenticate } = require('../../middleware/authMiddleware');
const { authLimiter, passwordResetLimiter } = require('../../middleware/rateLimiter');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication endpoints
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *               name:
 *                 type: string
 *     responses:
 *       '201':
 *         description: User registered successfully
 *       '400':
 *         description: Validation error
 *       '409':
 *         description: User already exists
 *       '500':
 *         description: Internal server error
 */
router.post('/register', authLimiter, authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 format: password
 *     responses:
 *       '200':
 *         description: Login successful
 *       '400':
 *         description: Validation error
 *       '401':
 *         description: Invalid credentials
 *       '500':
 *         description: Internal server error
 */
router.post('/login', authLimiter, authController.login);

/**
 * @swagger
 * /api/auth/reset:
 *   post:
 *     summary: Request password reset
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *     responses:
 *       '200':
 *         description: Password reset request processed
 *       '400':
 *         description: Validation error
 *       '429':
 *         description: Too many requests
 *       '500':
 *         description: Internal server error
 */
router.post('/reset', passwordResetLimiter, authController.requestPasswordReset);

/**
 * @swagger
 * /api/auth/profile:
 *   get:
 *     summary: Get current user profile
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       '200':
 *         description: User profile retrieved successfully
 *       '401':
 *         description: Unauthorized
 *       '404':
 *         description: User not found
 *       '500':
 *         description: Internal server error
 */
router.get('/profile', authenticate, authController.getProfile);

module.exports = router;