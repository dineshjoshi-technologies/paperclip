const express = require('express');
const router = express.Router();
const authController = require('../../controllers/auth/authController');
const { authenticate, authorize } = require('../../middleware/authMiddleware');
const { loginLimiter, passwordResetLimiter, registerLimiter, authLimiter } = require('../../middleware/rateLimiter');
const { validate, registerSchema, loginSchema, passwordResetRequestSchema, passwordResetConfirmSchema, refreshTokenSchema, createApiKeySchema, resendVerificationSchema } = require('../../middleware/validation');

router.post('/register', registerLimiter, validate(registerSchema), authController.register);
router.post('/login', loginLimiter, validate(loginSchema), authController.login);
router.post('/refresh', authLimiter, validate(refreshTokenSchema), authController.refreshToken);
router.post('/logout', authenticate, authController.logout);
router.post('/reset', passwordResetLimiter, validate(passwordResetRequestSchema), authController.requestPasswordReset);
router.post('/reset/confirm', authLimiter, validate(passwordResetConfirmSchema), authController.resetPassword);

router.get('/profile', authenticate, authController.getProfile);
router.patch('/profile', authenticate, authController.updateProfile);

router.get('/onboarding', authenticate, authController.getOnboardingStatus);
router.patch('/onboarding/step', authenticate, authController.updateOnboardingStep);

router.post('/verify-email', authController.verifyEmail);
router.post('/resend-verification', authLimiter, validate(resendVerificationSchema), authController.resendVerification);

router.post('/api-keys', authenticate, validate(createApiKeySchema), authController.createApiKey);
router.get('/api-keys', authenticate, authController.listApiKeys);
router.delete('/api-keys/:id', authenticate, authController.revokeApiKey);

module.exports = router;
