import { Router } from 'express';
import { KnowledgeGraphController } from '../controllers/knowledgeGraphController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', KnowledgeGraphController.getGraph);
router.post('/explain-node', KnowledgeGraphController.explainNode);

export default router;
