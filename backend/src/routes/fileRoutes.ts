import { Router } from 'express';
import { FileController } from '../controllers/fileController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = Router();

// Stream file supports optional auth (accessible by new browser tabs, media players, and demo files)
router.get('/:id/stream', optionalAuth, FileController.streamFile);

// All other file operations require strict authentication
router.use(requireAuth);

router.post('/upload', uploadMiddleware.array('files', 10), FileController.uploadFiles);
router.get('/', FileController.listFiles);
router.get('/:id', FileController.getFile);
router.delete('/:id', FileController.deleteFile);
router.post('/:id/process', FileController.retryProcessing);

export default router;

