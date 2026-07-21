import { Router } from 'express';
import AssistantController from '../controllers/assistant.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router: Router = Router();

router.get('/', authMiddleware, AssistantController.getAssistantList);
router.get('/default', AssistantController.getDefaultAssistant);
router.post('/', authMiddleware, AssistantController.addAssistant);
router.delete('/:id', authMiddleware, AssistantController.deleteAssistant);
router.patch('/', authMiddleware, AssistantController.editAssistant);
router.patch('/default/:id', authMiddleware, AssistantController.setDefault);
router.post('/chat', authMiddleware, AssistantController.chat);

export default router;
