import { Router } from 'express';
import { DetectiveController } from '../controllers/detectiveController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.post('/investigate', DetectiveController.investigate);
router.get('/history', DetectiveController.getHistory);

export default router;

