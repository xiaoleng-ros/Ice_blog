import { Router } from 'express';
import SwiperController from '../controllers/swiper.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, SwiperController.addSwiper);
router.delete('/:id', authMiddleware, SwiperController.deleteSwiper);
router.patch('/', authMiddleware, SwiperController.editSwiper);
router.get('/', SwiperController.getSwiperList);

export default router;
