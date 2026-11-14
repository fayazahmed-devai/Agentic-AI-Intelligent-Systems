import { Router } from 'express';
import { ConversationController } from '../controllers/conversationController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', ConversationController.listConversations);
router.get('/:id', ConversationController.getConversation);
router.delete('/:id', ConversationController.deleteConversation);

export default router;

