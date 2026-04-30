import { Router } from 'express';
import RssController from '../controllers/rss.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.get('/', RssController.getRssList);
router.get('/paging', RssController.getRssPaging);
router.post('/refresh', authMiddleware, RssController.refreshRssCache);
router.post('/', authMiddleware, RssController.addRss);
router.delete('/:id', authMiddleware, RssController.deleteRss);
router.patch('/', authMiddleware, RssController.editRss);
router.get('/:id', RssController.getRssContent);

export default router;
