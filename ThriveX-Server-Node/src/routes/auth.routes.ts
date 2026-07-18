import { Router } from 'express';
import AuthController from '../controllers/auth.controller';

const router: Router = Router();

router.post('/github/login', AuthController.githubLogin);
router.post('/github/bind', AuthController.githubBind);

export default router;
