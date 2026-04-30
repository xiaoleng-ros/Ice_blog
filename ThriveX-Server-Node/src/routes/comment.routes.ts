import { Router } from 'express';
import CommentController from '../controllers/comment.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', CommentController.addComment);
router.delete('/:id', authMiddleware, CommentController.deleteComment);
router.patch('/audit/:id', authMiddleware, CommentController.auditComment);
router.get('/:id', CommentController.getComment);
router.get('/', CommentController.getCommentList);
router.get('/article/:article_id', CommentController.getArticleComments);

export default router;
