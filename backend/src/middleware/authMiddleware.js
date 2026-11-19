import crypto from 'crypto';
import { verifyToken } from '../utils/tokenUtil.js';
import prisma from '../config/database.js';

/**
 * Middleware to protect admin routes.
 * Supports:
 *  1. Header: Authorization: Bearer <JWT_TOKEN>
 *  2. Cookie: admin_token
 *  3. Header: x-admin-key: <ADMIN_API_KEY> (Legacy / Service fallback)
 */
export async function requireAdminAuth(req, res, next) {
  try {
    let token = null;

    // 1. Check Authorization Bearer header
    if (req.headers.authorization) {
      const parts = req.headers.authorization.split(' ');
      if (parts.length === 2 && /^bearer$/i.test(parts[0])) {
        token = parts[1];
      }
    }

    // 2. Check cookies
    if (!token && req.cookies && req.cookies.admin_token) {
      token = req.cookies.admin_token;
    }

    // If JWT token found, verify it
    if (token) {
      const decoded = verifyToken(token);
      if (decoded && decoded.id) {
        // Fetch fresh admin status from database
        const admin = await prisma.admin.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            email: true,
            fullName: true,
            avatarUrl: true,
            role: true,
            isActive: true,
          },
        });

        if (!admin) {
          return res.status(401).json({
            success: false,
            message: 'Unauthorized: Administrator account not found.',
          });
        }

        if (!admin.isActive) {
          return res.status(403).json({
            success: false,
            message: 'Forbidden: Your administrator account has been deactivated.',
          });
        }

        req.admin = admin;
        return next();
      }
    }

    // 3. Fallback: x-admin-key comparison
    const configuredKey = process.env.ADMIN_API_KEY;
    const providedKey = req.headers['x-admin-key'] || (token ? null : null);

    if (configuredKey && providedKey) {
      const configuredBuffer = Buffer.from(configuredKey);
      const providedBuffer = Buffer.from(String(providedKey));

      if (
        configuredBuffer.length === providedBuffer.length &&
        crypto.timingSafeEqual(configuredBuffer, providedBuffer)
      ) {
        req.admin = {
          id: 'service-account',
          email: 'admin-service@miraxmedia.in',
          fullName: 'API Key Admin',
          role: 'SUPER_ADMIN',
          isActive: true,
        };
        return next();
      }
    }

    return res.status(401).json({
      success: false,
      message: 'Unauthorized: Authentication required. Please log in to access the Admin Panel.',
    });
  } catch (error) {
    console.error('[Auth Middleware Error]:', error);
    return res.status(500).json({
      success: false,
      message: 'Authentication error occurred.',
    });
  }
}

/**
 * Role-Based Access Control Middleware (RBAC)
 * @param {string[]} allowedRoles
 */
export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.admin) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!allowedRoles.includes(req.admin.role)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: This action requires one of the following roles: ${allowedRoles.join(', ')}.`,
      });
    }

    return next();
  };
}

export default requireAdminAuth;
