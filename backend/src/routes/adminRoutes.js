import { Router } from 'express';
import {
  getAllContacts,
  getContactById,
  updateContactStatus,
  deleteContact,
} from '../controllers/adminController.js';
import { requireAdminAuth } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateMiddleware.js';
import {
  contactIdParamSchema,
  updateStatusSchema,
  adminQuerySchema,
} from '../validators/contactValidator.js';

const router = Router();

// Protect ALL admin routes with timing-safe API key verification
router.use(requireAdminAuth);

// GET /api/admin/contacts - List all enquiries with pagination & filtering
router.get(
  '/contacts',
  validate(adminQuerySchema, 'query'),
  getAllContacts
);

// GET /api/admin/contacts/:id - Retrieve single enquiry by UUID
router.get(
  '/contacts/:id',
  validate(contactIdParamSchema, 'params'),
  getContactById
);

// PATCH /api/admin/contacts/:id/status - Update enquiry status
router.patch(
  '/contacts/:id/status',
  validate(contactIdParamSchema, 'params'),
  validate(updateStatusSchema, 'body'),
  updateContactStatus
);

// DELETE /api/admin/contacts/:id - Delete enquiry permanently
router.delete(
  '/contacts/:id',
  validate(contactIdParamSchema, 'params'),
  deleteContact
);

export default router;
