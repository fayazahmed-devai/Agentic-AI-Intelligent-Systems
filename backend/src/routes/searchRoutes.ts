import { Router } from 'express';
import { SearchController } from '../controllers/searchController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', SearchController.search);

export default router;

