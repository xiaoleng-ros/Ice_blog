import { Router } from 'express';
import LinkController from '../controllers/link.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.post('/', authMiddleware, LinkController.addLink);
router.delete('/:id', authMiddleware, LinkController.deleteLink);
router.patch('/', authMiddleware, LinkController.editLink);
router.patch('/audit/:id', authMiddleware, LinkController.auditLink);
router.get('/', LinkController.getLinkList);
router.get('/type', LinkController.getLinkType);
router.post('/type', authMiddleware, LinkController.addLinkType);
router.delete('/type/:id', authMiddleware, LinkController.deleteLinkType);

export default router;
