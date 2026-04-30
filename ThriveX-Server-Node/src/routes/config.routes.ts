import { Router } from 'express';
import ConfigController from '../controllers/config.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/web', ConfigController.getWebConfig);
router.get('/web/:name', ConfigController.getWebConfigByName);
router.patch('/web', authMiddleware, ConfigController.editWebConfig);
router.get('/page', ConfigController.getPageConfig);
router.patch('/page', authMiddleware, ConfigController.editPageConfig);
router.get('/env', authMiddleware, ConfigController.getEnvConfig);
router.get('/env/:name', authMiddleware, ConfigController.getEnvConfigByName);
router.post('/env', authMiddleware, ConfigController.addEnvConfig);
router.delete('/env/:id', authMiddleware, ConfigController.deleteEnvConfig);
router.patch('/env', authMiddleware, ConfigController.editEnvConfig);

export default router;
