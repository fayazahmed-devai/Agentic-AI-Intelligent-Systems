import { Router } from 'express';
import { FileController } from '../controllers/fileController.js';
import { requireAuth } from '../middleware/auth.js';
import { uploadMiddleware } from '../middleware/upload.js';

const router = Router();

router.use(requireAuth);

router.post('/upload', uploadMiddleware.array('files', 10), FileController.uploadFiles);
router.get('/', FileController.listFiles);
router.get('/:id', FileController.getFile);
router.delete('/:id', FileController.deleteFile);
router.post('/:id/process', FileController.retryProcessing);
router.get('/:id/stream', FileController.streamFile);

export default router;
