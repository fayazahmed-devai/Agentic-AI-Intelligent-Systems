import { Router } from 'express';
import { AIController } from '../controllers/aiController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.post('/chat', AIController.chat);
router.post('/connected-intelligence', AIController.connectedIntelligence);
router.post('/generate-content', AIController.generateContent);
router.post('/generate-quiz', AIController.generateQuiz);
router.post('/generate-flashcards', AIController.generateFlashcards);

export default router;

