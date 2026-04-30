import { Router } from 'express';
import StatisController from '../controllers/statis.controller';

const router = Router();

router.get('/visitor', StatisController.getVisitorStatis);
router.get('/article', StatisController.getArticleStatis);
router.get('/cate', StatisController.getCateStatis);
router.get('/tag', StatisController.getTagStatis);
router.get('/comment', StatisController.getCommentStatis);

export default router;
