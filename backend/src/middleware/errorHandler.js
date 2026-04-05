/**
 * Error handler middleware
 * Catches all errors and returns standardized JSON responses
 */

class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

const errorHandler = (err, req, res, _next) => {
  // If it's an AppError, use its status code
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';

  // Prisma specific errors
  if (err.code === 'P2002') {
    statusCode = 409;
    message = `Duplicate field value: ${err.meta?.target?.join(', ')}`;
  } else if (err.code === 'P2025') {
    statusCode = 404;
    message = 'Record not found';
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
  }

  // Zod validation errors
  if (err.name === 'ZodError') {
    statusCode = 400;
    message = err.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ');
  }

  // Log error details in development
  if (process.env.NODE_ENV === 'development') {
    console.error('Error:', {
      message: err.message,
      stack: err.stack,
      url: req.originalUrl,
      method: req.method,
    });
  }

  // Don't leak error details in production
  const responseMessage = process.env.NODE_ENV === 'production' && statusCode === 500
    ? 'Internal server error'
    : message;

  res.status(statusCode).json({
    success: false,
    message: responseMessage,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = { errorHandler, AppError };
