const { z } = require('zod');

const validate = (schema) => (req, res, next) => {
  try {
    schema.parse(req.body);
    next();
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: error.errors.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
};

const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().max(100, 'Name too long').optional(),
  role: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

const passwordResetRequestSchema = z.object({
  email: z.string().email('Invalid email format'),
});

const passwordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Token is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

const createApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  expiresAt: z.string().datetime().optional(),
});

const updateUserSchema = z.object({
  name: z.string().max(100, 'Name too long').optional(),
  avatar: z.string().url('Invalid avatar URL').optional(),
});

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email format'),
});

module.exports = {
  validate,
  registerSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
  refreshTokenSchema,
  createApiKeySchema,
  updateUserSchema,
  resendVerificationSchema,
};