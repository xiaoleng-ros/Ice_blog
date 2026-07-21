import { Router } from 'express';
import AuthController from '../controllers/auth.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.post('/github/login', AuthController.githubLogin);
router.post('/github/bind', authMiddleware, AuthController.githubBind);

export default router;
