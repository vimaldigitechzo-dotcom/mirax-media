import crypto from 'crypto';

/**
 * Middleware to protect admin routes using an admin API key.
 * Accepts either:
 *  - Header: Authorization: Bearer <ADMIN_API_KEY>
 *  - Header: x-admin-key: <ADMIN_API_KEY>
 */
export function requireAdminAuth(req, res, next) {
  const configuredKey = process.env.ADMIN_API_KEY;

  if (!configuredKey) {
    return res.status(500).json({
      success: false,
      message: 'Server error: ADMIN_API_KEY is not configured on the backend.',
    });
  }

  // Extract key from Authorization header or custom header
  let providedKey = req.headers['x-admin-key'];

  if (!providedKey && req.headers.authorization) {
    const parts = req.headers.authorization.split(' ');
    if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
      providedKey = parts[1];
    }
  }

  if (!providedKey) {
    return res.status(401).json({
      success: false,
      message:
        'Unauthorized: Missing admin authentication credentials. Provide a valid Bearer token or x-admin-key header.',
    });
  }

  // Timing-safe comparison to prevent side-channel timing attacks
  const configuredBuffer = Buffer.from(configuredKey);
  const providedBuffer = Buffer.from(String(providedKey));

  if (
    configuredBuffer.length !== providedBuffer.length ||
    !crypto.timingSafeEqual(configuredBuffer, providedBuffer)
  ) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Invalid admin credentials.',
    });
  }

  return next();
}

export default requireAdminAuth;
