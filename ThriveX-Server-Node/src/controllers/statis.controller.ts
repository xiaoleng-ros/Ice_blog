import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { prisma } from '../utils/prisma';

class StatisController {
  async getVisitorStatis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await prisma.article.aggregate({
        _sum: { view: true },
      });
      const totalViews = result._sum.view || 0;

      sendSuccess(res, {
        totalViews,
        todayViews: totalViews,
        articleCount: await prisma.article.count(),
      });
    } catch (err) {
      console.error('getVisitorStatis error:', err);
      sendError(res, '获取访客统计失败', 400);
    }
  }

  async getArticleStatis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const [result, total] = await Promise.all([
        prisma.article.aggregate({
          where: {
            articleConfig: { isDel: false },
          },
          _sum: { view: true, comment: true },
        }),
        prisma.article.count({
          where: {
            articleConfig: { isDel: false },
          },
        }),
      ]);

      sendSuccess(res, {
        total,
        totalViews: result._sum.view || 0,
        totalComments: result._sum.comment || 0,
      });
    } catch (err) {
      console.error('getArticleStatis error:', err);
      sendError(res, '获取文章统计失败', 400);
    }
  }

  async getCateStatis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cates = await prisma.cate.findMany({
        include: {
          _count: {
            select: { articleCates: true },
          },
        },
      });

      const statis = cates.map(cate => ({
        id: cate.id,
        name: cate.name,
        count: cate._count.articleCates,
      }));

      sendSuccess(res, statis);
    } catch (err) {
      console.error('getCateStatis error:', err);
      sendError(res, '获取分类统计失败', 400);
    }
  }

  async getTagStatis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tags = await prisma.tag.findMany({
        include: {
          _count: {
            select: { articleTags: true },
          },
        },
      });

      const statis = tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        count: tag._count.articleTags,
      }));

      sendSuccess(res, statis);
    } catch (err) {
      console.error('getTagStatis error:', err);
      sendError(res, '获取标签统计失败', 400);
    }
  }

  async getCommentStatis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const comments = await prisma.comment.count();
      const auditedComments = await prisma.comment.count({ where: { auditStatus: 1 } });

      sendSuccess(res, {
        total: comments,
        audited: auditedComments,
        unaudited: comments - auditedComments,
      });
    } catch (err) {
      console.error('getCommentStatis error:', err);
      sendError(res, '获取评论统计失败', 400);
    }
  }
}

export default new StatisController();
