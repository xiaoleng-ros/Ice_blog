import { Router } from 'express';
import FileController from '../controllers/file.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/upload', authMiddleware, FileController.uploadFile);
router.delete('/:id', authMiddleware, FileController.deleteFile);
router.get('/', authMiddleware, FileController.getFileList);
router.get('/info/:id', FileController.getFileInfo);
router.get('/dir', FileController.getDirList);
router.get('/:id', authMiddleware, FileController.getFile);

export default router;
