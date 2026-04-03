const { z } = require('zod')

const registrationSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  name: z.string().min(2, 'Name must be at least 2 characters').optional()
})

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

function validateRegistration(req, res, next) {
  const result = registrationSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors })
  }
  next()
}

function validateLogin(req, res, next) {
  const result = loginSchema.safeParse(req.body)
  if (!result.success) {
    return res.status(400).json({ error: 'Validation failed', details: result.error.errors })
  }
  next()
}

module.exports = { validateRegistration, validateLogin }