import { Router } from 'express';
import { getPublicWebsiteData } from '../controllers/publicController.js';

const router = Router();

// GET /api/public/data — single cached payload for live public website sync
router.get('/data', getPublicWebsiteData);

export default router;
