import { Router } from 'express';
import TagController from '../controllers/tag.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, TagController.addTag);
router.delete('/:id', authMiddleware, TagController.deleteTag);
router.patch('/', authMiddleware, TagController.editTag);
router.get('/article/count', TagController.getTagArticleCount);
router.get('/:id', TagController.getTag);
router.get('/', TagController.getTagList);

export default router;
