import { Router } from 'express';
import HomeController from '../controllers/home.controller';

const router = Router();

router.get('/', HomeController.getHomeData);

export default router;
