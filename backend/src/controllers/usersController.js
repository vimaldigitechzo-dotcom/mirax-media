import bcrypt from 'bcryptjs';
import prisma from '../config/database.js';

/**
 * List all Admin Users
 * Route: GET /api/admin/users
 */
export async function getAllUsers(req, res, next) {
  try {
    const users = await prisma.admin.findMany({
      select: {
        id: true,
        email: true,
        fullName: true,
        avatarUrl: true,
        role: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
    return res.status(200).json({ success: true, data: users });
  } catch (err) {
    return next(err);
  }
}

/**
 * Create a new Administrator
 * Route: POST /api/admin/users
 */
export async function createUser(req, res, next) {
  try {
    const { email, password, fullName, role } = req.body;

    if (!email || !password || !fullName) {
      return res.status(400).json({
        success: false,
        message: 'Email, password, and full name are required.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const existing = await prisma.admin.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return res.status(400).json({
        success: false,
        message: 'An administrator with this email already exists.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const newUser = await prisma.admin.create({
      data: {
        email: normalizedEmail,
        fullName: String(fullName).trim(),
        passwordHash,
        role: role || 'ADMIN',
        isActive: true,
      },
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Admin account created successfully.',
      data: newUser,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Update Admin User (Role, Active Status, Name)
 * Route: PATCH /api/admin/users/:id
 */
export async function updateUser(req, res, next) {
  try {
    const { id } = req.params;
    const { fullName, role, isActive, password } = req.body;

    // Prevent deactivating own account
    if (req.admin.id === id && isActive === false) {
      return res.status(400).json({
        success: false,
        message: 'You cannot deactivate your own account.',
      });
    }

    const data = {};
    if (fullName) data.fullName = String(fullName).trim();
    if (role) data.role = role;
    if (isActive !== undefined) data.isActive = Boolean(isActive);
    if (password && String(password).length >= 8) {
      data.passwordHash = await bcrypt.hash(password, 12);
    }

    const updated = await prisma.admin.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        fullName: true,
        role: true,
        isActive: true,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Admin user updated.',
      data: updated,
    });
  } catch (err) {
    return next(err);
  }
}

/**
 * Delete Admin User
 * Route: DELETE /api/admin/users/:id
 */
export async function deleteUser(req, res, next) {
  try {
    const { id } = req.params;

    if (req.admin.id === id) {
      return res.status(400).json({
        success: false,
        message: 'You cannot delete your own account.',
      });
    }

    await prisma.admin.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Admin user deleted.' });
  } catch (err) {
    return next(err);
  }
}
