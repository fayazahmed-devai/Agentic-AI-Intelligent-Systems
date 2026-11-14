import { Router } from 'express';
import { PreferencesController } from '../controllers/preferencesController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', PreferencesController.getPreferences);
router.put('/', PreferencesController.updatePreferences);

export default router;
