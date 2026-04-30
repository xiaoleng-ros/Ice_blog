import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';

const prisma = new PrismaClient();

class StatisController {
  async getVisitorStatis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const articles = await prisma.article.findMany({
        select: { view: true },
      });
      const totalViews = articles.reduce((sum, a) => sum + a.view, 0);

      const visitors = {
        totalViews,
        todayViews: totalViews,
        articleCount: articles.length,
      };

      res.json(success(visitors));
    } catch (err) {
      console.error('getVisitorStatis error:', err);
      res.json(error('获取访客统计失败'));
    }
  }

  async getArticleStatis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const articles = await prisma.article.findMany({
        where: {
          articleConfig: {
            isDel: false,
          },
        },
        select: {
          id: true,
          view: true,
          comment: true,
          createTime: true,
        },
      });

      const statis = {
        total: articles.length,
        totalViews: articles.reduce((sum, a) => sum + a.view, 0),
        totalComments: articles.reduce((sum, a) => sum + a.comment, 0),
      };

      res.json(success(statis));
    } catch (err) {
      console.error('getArticleStatis error:', err);
      res.json(error('获取文章统计失败'));
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

      res.json(success(statis));
    } catch (err) {
      console.error('getCateStatis error:', err);
      res.json(error('获取分类统计失败'));
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

      res.json(success(statis));
    } catch (err) {
      console.error('getTagStatis error:', err);
      res.json(error('获取标签统计失败'));
    }
  }

  async getCommentStatis(req: AuthRequest, res: Response): Promise<void> {
    try {
      const comments = await prisma.comment.count();
      const auditedComments = await prisma.comment.count({ where: { auditStatus: 1 } });

      res.json(success({
        total: comments,
        audited: auditedComments,
        unaudited: comments - auditedComments,
      }));
    } catch (err) {
      console.error('getCommentStatis error:', err);
      res.json(error('获取评论统计失败'));
    }
  }
}

export default new StatisController();
