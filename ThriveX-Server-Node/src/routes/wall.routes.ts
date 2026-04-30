import { Router } from 'express';
import WallController from '../controllers/wall.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', WallController.addWall);
router.delete('/:id', authMiddleware, WallController.deleteWall);
router.delete('/batch', authMiddleware, WallController.batchDeleteWall);
router.patch('/', authMiddleware, WallController.editWall);
router.patch('/audit/:id', authMiddleware, WallController.auditWall);
router.patch('/choice/:id', authMiddleware, WallController.updateChoice);
router.get('/:id', WallController.getWall);
router.get('/', WallController.getWallList);
router.get('/cate/:cateId', WallController.getWallCateWallList);
router.get('/cate', WallController.getWallCate);
router.post('/cate', authMiddleware, WallController.addWallCate);
router.delete('/cate/:id', authMiddleware, WallController.deleteWallCate);

export default router;
