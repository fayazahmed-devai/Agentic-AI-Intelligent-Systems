import { Router } from 'express';
import { DashboardController } from '../controllers/dashboardController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/stats', DashboardController.getStats);
router.get('/activity', DashboardController.getActivity);

export default router;
