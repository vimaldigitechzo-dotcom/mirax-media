/**
 * 404 Not Found Middleware
 */
export function notFoundHandler(req, res) {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl}`,
  });
}

/**
 * Global Centralized Error Handling Middleware
 */
export function errorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  // Log error in console for debugging (server-side only)
  console.error('[Error Occurred]:', err.message || err);

  // Prisma Specific Errors
  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      message: 'Record not found in database.',
    });
  }

  if (err.code === 'P2002') {
    return res.status(409).json({
      success: false,
      message: 'A record with this unique identifier already exists.',
    });
  }

  // Handle Invalid JSON Body
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Malformed JSON payload in request body.',
    });
  }

  // Custom Status Code if set on Error object
  const statusCode = err.statusCode || err.status || 500;

  // Mask internal error details in production
  const isProduction = process.env.NODE_ENV === 'production';
  const clientMessage =
    statusCode === 500 && isProduction
      ? 'An unexpected internal server error occurred. Please try again later.'
      : err.message || 'Internal server error.';

  return res.status(statusCode).json({
    success: false,
    message: clientMessage,
    ...(isProduction ? {} : { stack: err.stack }),
  });
}
