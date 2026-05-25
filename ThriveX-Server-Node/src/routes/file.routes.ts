import { Router } from 'express';
import multer from 'multer';
import FileController from '../controllers/file.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import config from '../config';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: config.file.maxSize,
  },
});

const router = Router();

router.post('/upload', authMiddleware, upload.any(), FileController.uploadFile);
router.delete('/:id', authMiddleware, FileController.deleteFile);
router.get('/', authMiddleware, FileController.getFileList);
router.get('/info/:id', FileController.getFileInfo);
router.get('/dir', FileController.getDirList);
router.get('/:id', authMiddleware, FileController.getFile);

export default router;
