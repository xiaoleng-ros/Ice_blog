import { Router } from 'express';
import OssController from '../controllers/oss.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', authMiddleware, OssController.getOssList);
router.get('/platforms', OssController.getOssPlatforms);
router.get('/enabled', OssController.getEnabledOss);
router.post('/test/:id', authMiddleware, OssController.testOssConnection);
router.post('/enable/:id', authMiddleware, OssController.enableOss);
router.post('/', authMiddleware, OssController.addOss);
router.delete('/:id', authMiddleware, OssController.deleteOss);
router.patch('/', authMiddleware, OssController.editOss);

export default router;
