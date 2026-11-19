import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  login,
  getMe,
  updateProfile,
  changePassword,
  logout,
} from '../controllers/authController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Strict Rate Limiting on Login to prevent brute force
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 mins
  max: 10, // Max 10 attempts
  message: {
    success: false,
    message: 'Too many login attempts. Please wait 15 minutes before trying again.',
  },
});

router.post('/login', loginLimiter, login);
router.post('/logout', logout);

// Protected Auth Routes
router.use(requireAdminAuth);
router.get('/me', getMe);
router.patch('/profile', updateProfile);
router.post('/change-password', changePassword);

export default router;
