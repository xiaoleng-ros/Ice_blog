import { Router } from 'express';
import FootprintController from '../controllers/footprint.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, FootprintController.addFootprint);
router.delete('/:id', authMiddleware, FootprintController.deleteFootprint);
router.patch('/', authMiddleware, FootprintController.editFootprint);
router.get('/', FootprintController.getFootprintList);

export default router;
