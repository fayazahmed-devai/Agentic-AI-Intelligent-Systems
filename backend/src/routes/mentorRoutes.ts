import { Router } from 'express';
import { MentorController } from '../controllers/mentorController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.post('/explain', MentorController.explainConcept);
router.get('/progress', MentorController.getProgress);
router.post('/record-quiz', MentorController.recordQuizAttempt);

export default router;

