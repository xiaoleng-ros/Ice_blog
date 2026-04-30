import { Router } from 'express';
import { body } from 'express-validator';
import ArticleController from '../controllers/article.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validateRequest } from '../middlewares/validator.middleware';
import { apiLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

router.post(
  '/',
  authMiddleware,
  [
    body('title').notEmpty().withMessage('标题不能为空'),
    body('content').notEmpty().withMessage('内容不能为空'),
  ],
  validateRequest,
  ArticleController.addArticle
);

router.delete(
  '/:id/:is_del',
  authMiddleware,
  ArticleController.deleteArticle
);

router.patch(
  '/reduction/:id',
  authMiddleware,
  ArticleController.reductionArticle
);

router.delete(
  '/batch',
  authMiddleware,
  ArticleController.batchDeleteArticle
);

router.patch(
  '/',
  authMiddleware,
  ArticleController.editArticle
);

router.get(
  '/:id',
  apiLimiter,
  ArticleController.getArticle
);

router.get(
  '/',
  apiLimiter,
  ArticleController.getArticleList
);

router.get(
  '/cate/:cate_id',
  apiLimiter,
  ArticleController.getArticleByCate
);

router.get(
  '/tag/:tag_id',
  apiLimiter,
  ArticleController.getArticleByTag
);

router.get(
  '/hot',
  apiLimiter,
  ArticleController.getHotArticles
);

router.get(
  '/random',
  apiLimiter,
  ArticleController.getRandomArticles
);

router.get(
  '/view/:id',
  ArticleController.incrementView
);

router.get(
  '/archives',
  apiLimiter,
  ArticleController.getArchives
);

router.post(
  '/import',
  authMiddleware,
  ArticleController.importArticle
);

router.post(
  '/export',
  authMiddleware,
  ArticleController.exportArticle
);

export default router;
