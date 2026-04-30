import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';

const prisma = new PrismaClient();

class CommentController {
  async addComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, avatar, content, email, url, articleId, commentId } = req.body;
      const comment = await prisma.comment.create({
        data: {
          name,
          avatar,
          content,
          email,
          url,
          articleId,
          commentId: commentId || 0,
          auditStatus: 0,
          createTime: Date.now().toString(),
        },
      });
      res.json(success(comment));
    } catch (err) {
      console.error('addComment error:', err);
      res.json(error('添加评论失败'));
    }
  }

  async deleteComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.comment.delete({ where: { id: parseInt(id) } });
      res.json(success());
    } catch (err) {
      console.error('deleteComment error:', err);
      res.json(error('删除评论失败'));
    }
  }

  async auditComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { auditStatus } = req.body;
      await prisma.comment.update({
        where: { id: parseInt(id) },
        data: { auditStatus },
      });
      res.json(success());
    } catch (err) {
      console.error('auditComment error:', err);
      res.json(error('审核评论失败'));
    }
  }

  async getComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const comment = await prisma.comment.findUnique({ where: { id: parseInt(id) } });
      res.json(success(comment));
    } catch (err) {
      console.error('getComment error:', err);
      res.json(error('获取评论失败'));
    }
  }

  async getArticleComments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { article_id } = req.params;
      const comments = await prisma.comment.findMany({
        where: { articleId: parseInt(article_id), auditStatus: 1 },
        orderBy: { createTime: 'desc' },
      });
      res.json(success(comments));
    } catch (err) {
      console.error('getArticleComments error:', err);
      res.json(error('获取文章评论失败'));
    }
  }

  async getCommentList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, size, name } = req.query;
      const where: any = {};
      if (name) where.name = { contains: name as string, mode: 'insensitive' };

      const pageNum = parseInt(page as string) || 1;
      const sizeNum = parseInt(size as string) || 10;

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where,
          orderBy: { createTime: 'desc' },
          skip: (pageNum - 1) * sizeNum,
          take: sizeNum,
        }),
        prisma.comment.count({ where }),
      ]);

      res.json(success({
        records: comments,
        total,
        page: pageNum,
        size: sizeNum,
        totalPages: Math.ceil(total / sizeNum),
      }));
    } catch (err) {
      console.error('getCommentList error:', err);
      res.json(error('获取评论列表失败'));
    }
  }
}

export default new CommentController();
