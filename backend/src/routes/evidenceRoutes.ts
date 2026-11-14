import { Router } from 'express';
import { EvidenceController } from '../controllers/evidenceController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.post('/verify', EvidenceController.verifyClaim);
router.get('/summary', EvidenceController.getTrustSummary);

export default router;

