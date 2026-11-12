import { Router } from 'express';
import rateLimit from 'express-rate-limit';
import {
  createContact,
  getHealth,
} from '../controllers/contactController.js';
import { validate } from '../middleware/validateMiddleware.js';
import { createContactSchema } from '../validators/contactValidator.js';

const router = Router();

// Dedicated rate limiter for public contact submissions (prevent spam & abuse)
const contactSubmissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Max 10 submissions per IP per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message:
      'Too many enquiries submitted from this IP address. Please wait a few minutes before trying again.',
  },
});

// POST /api/contact - Submit new client enquiry
router.post(
  '/contact',
  contactSubmissionLimiter,
  validate(createContactSchema, 'body'),
  createContact
);

// GET /api/health - Health check endpoint
router.get('/health', getHealth);

export default router;
