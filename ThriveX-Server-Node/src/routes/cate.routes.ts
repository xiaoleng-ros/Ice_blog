import { Router } from 'express';
import CateController from '../controllers/cate.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, CateController.addCate);
router.delete('/batch', authMiddleware, CateController.batchDeleteCate);
router.delete('/:id', authMiddleware, CateController.deleteCate);
router.patch('/', authMiddleware, CateController.editCate);
router.get('/:id', CateController.getCate);
router.get('/article/count', CateController.getCateArticleCount);
router.get('/', CateController.getCateList);

export default router;
