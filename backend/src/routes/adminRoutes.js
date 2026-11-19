import { Router } from 'express';
import multer from 'multer';
import { requireAdminAuth, requireRole } from '../middleware/authMiddleware.js';

import { getDashboardStats } from '../controllers/dashboardController.js';
import {
  getAllContent,
  updateContent,
  getAllBanners,
  createBanner,
  updateBanner,
  deleteBanner,
} from '../controllers/contentController.js';
import {
  getAllServices,
  createService,
  updateService,
  deleteService,
} from '../controllers/servicesController.js';
import {
  getAllProjects,
  createProject,
  updateProject,
  deleteProject,
  getAllTestimonials,
  createTestimonial,
  updateTestimonial,
  deleteTestimonial,
} from '../controllers/projectsController.js';
import {
  getAllInquiries,
  updateInquiry,
  deleteInquiry,
  exportInquiriesCsv,
} from '../controllers/inquiriesController.js';
import {
  getAllBlogs,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogsController.js';
import {
  getAllSeoSettings,
  updateSeoSetting,
} from '../controllers/seoController.js';
import {
  getAllSettings,
  updateBulkSettings,
} from '../controllers/settingsController.js';
import {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} from '../controllers/usersController.js';
import {
  getAllMedia,
  uploadMedia,
  deleteMedia,
} from '../controllers/mediaController.js';

const router = Router();

// Configure multer memory storage with 50MB limit for media
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
});

// Protect ALL admin routes with requireAdminAuth
router.use(requireAdminAuth);

// 1. Dashboard
router.get('/dashboard/stats', getDashboardStats);

// 2. Content CMS
router.get('/content', getAllContent);
router.patch('/content/:sectionKey', updateContent);

// 3. Banners
router.get('/banners', getAllBanners);
router.post('/banners', createBanner);
router.patch('/banners/:id', updateBanner);
router.delete('/banners/:id', deleteBanner);

// 4. Services
router.get('/services', getAllServices);
router.post('/services', createService);
router.patch('/services/:id', updateService);
router.delete('/services/:id', deleteService);

// 5. Projects / Portfolio
router.get('/projects', getAllProjects);
router.post('/projects', createProject);
router.patch('/projects/:id', updateProject);
router.delete('/projects/:id', deleteProject);

// 6. Testimonials
router.get('/testimonials', getAllTestimonials);
router.post('/testimonials', createTestimonial);
router.patch('/testimonials/:id', updateTestimonial);
router.delete('/testimonials/:id', deleteTestimonial);

// 7. Inquiries / Leads
router.get('/inquiries/export/csv', exportInquiriesCsv);
router.get('/inquiries', getAllInquiries);
router.patch('/inquiries/:id', updateInquiry);
router.delete('/inquiries/:id', deleteInquiry);

// 8. Blogs
router.get('/blogs', getAllBlogs);
router.post('/blogs', createBlog);
router.patch('/blogs/:id', updateBlog);
router.delete('/blogs/:id', deleteBlog);

// 9. Media Library
router.get('/media', getAllMedia);
router.post('/media/upload', upload.array('files', 10), uploadMedia);
router.delete('/media/:id', deleteMedia);

// 10. SEO Settings
router.get('/seo', getAllSeoSettings);
router.post('/seo', updateSeoSetting);

// 11. Website Settings
router.get('/settings', getAllSettings);
router.post('/settings', updateBulkSettings);

// 12. Admin User Management (Super Admin & Admin only)
router.get('/users', requireRole(['SUPER_ADMIN', 'ADMIN']), getAllUsers);
router.post('/users', requireRole(['SUPER_ADMIN']), createUser);
router.patch('/users/:id', requireRole(['SUPER_ADMIN', 'ADMIN']), updateUser);
router.delete('/users/:id', requireRole(['SUPER_ADMIN']), deleteUser);

export default router;
