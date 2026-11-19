import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';
import { generateToken } from '../utils/tokenUtil.js';

/**
 * Admin Login
 * Route: POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Find admin by email
    const admin = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    if (!admin.isActive) {
      return res.status(403).json({
        success: false,
        message: 'Your administrator account has been deactivated. Contact Super Admin.',
      });
    }

    // Compare password hash
    const isMatch = await bcrypt.compare(password, admin.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Update lastLoginAt
    await prisma.admin.update({
      where: { id: admin.id },
      data: { lastLoginAt: new Date() },
    });

    // Record login activity log
    try {
      await prisma.adminActivityLog.create({
        data: {
          adminId: admin.id,
          action: 'LOGIN',
          resource: 'auth',
          details: 'Admin logged into portal',
          ipAddress: req.ip || req.headers['x-forwarded-for'] || null,
        },
      });
    } catch (err) {
      console.warn('[Activity Log Warning]:', err.message);
    }

    // Generate JWT token
    const token = generateToken(admin);

    // Set secure HttpOnly cookie
    const isProduction = process.env.NODE_ENV === 'production';
    res.cookie('admin_token', token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: isProduction ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful.',
      data: {
        token,
        admin: {
          id: admin.id,
          email: admin.email,
          fullName: admin.fullName,
          avatarUrl: admin.avatarUrl,
          role: admin.role,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Get Current Logged In Admin Profile
 * Route: GET /api/auth/me
 */
export async function getMe(req, res) {
  return res.status(200).json({
    success: true,
    data: req.admin,
  });
}

/**
 * Update Admin Profile
 * Route: PATCH /api/auth/profile
 */
export async function updateProfile(req, res, next) {
  try {
    const { fullName, avatarUrl } = req.body;

    const updated = await prisma.admin.update({
      where: { id: req.admin.id },
      data: {
        ...(fullName ? { fullName: String(fullName).trim() } : {}),
        ...(avatarUrl !== undefined ? { avatarUrl: avatarUrl || null } : {}),
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      data: updated,
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Change Admin Password
 * Route: POST /api/auth/change-password
 */
export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Current password and new password are required.',
      });
    }

    if (String(newPassword).length < 8) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 8 characters long.',
      });
    }

    const admin = await prisma.admin.findUnique({
      where: { id: req.admin.id },
    });

    const isMatch = await bcrypt.compare(currentPassword, admin.passwordHash);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect.',
      });
    }

    const newHash = await bcrypt.hash(newPassword, 12);

    await prisma.admin.update({
      where: { id: admin.id },
      data: { passwordHash: newHash },
    });

    return res.status(200).json({
      success: true,
      message: 'Password changed successfully. Please keep your new password safe.',
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * Admin Logout
 * Route: POST /api/auth/logout
 */
export function logout(req, res) {
  const isProduction = process.env.NODE_ENV === 'production';
  res.clearCookie('admin_token', {
    httpOnly: true,
    secure: isProduction,
    sameSite: isProduction ? 'none' : 'lax',
  });

  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
}
