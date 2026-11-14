import { Router } from 'express';
import { ResearchAgentController } from '../controllers/researchAgentController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.post('/start', ResearchAgentController.startResearch);
router.get('/tasks', ResearchAgentController.getTasks);

export default router;
