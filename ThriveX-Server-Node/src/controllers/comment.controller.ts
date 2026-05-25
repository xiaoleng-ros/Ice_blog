import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { prisma } from '../utils/prisma';

/**
 * HTML 实体转义，防止 XSS 攻击
 * @param str 需要转义的字符串
 * @returns 转义后的安全字符串
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
}

class CommentController {
  async addComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, avatar, content, email, url, articleId, commentId } = req.body;

      // 对用户输入进行 XSS 过滤
      const safeName = escapeHtml(String(name || ''));
      const safeContent = escapeHtml(String(content || ''));
      const safeEmail = email ? escapeHtml(String(email)) : null;
      const safeUrl = url ? escapeHtml(String(url)) : null;

      const comment = await prisma.comment.create({
        data: {
          name: safeName,
          avatar,
          content: safeContent,
          email: safeEmail,
          url: safeUrl,
          articleId,
          commentId: commentId || 0,
          auditStatus: 0,
          createTime: Date.now().toString(),
        },
      });
      sendSuccess(res, comment);
    } catch (err) {
      console.error('addComment error:', err);
      sendError(res, '添加评论失败', 400);
    }
  }

  async deleteComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.comment.delete({ where: { id: parseInt(id) } });
      sendSuccess(res);
    } catch (err) {
      console.error('deleteComment error:', err);
      sendError(res, '删除评论失败', 400);
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
      sendSuccess(res);
    } catch (err) {
      console.error('auditComment error:', err);
      sendError(res, '审核评论失败', 400);
    }
  }

  async getComment(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const comment = await prisma.comment.findUnique({ where: { id: parseInt(id) } });
      sendSuccess(res, comment);
    } catch (err) {
      console.error('getComment error:', err);
      sendError(res, '获取评论失败', 400);
    }
  }

  async getArticleComments(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { article_id } = req.params;
      const { page, size, pageSize } = req.query;
      const pageNum = parseInt(page as string) || 1;
      const sizeNum = parseInt((size || pageSize) as string) || 8;

      const where = { articleId: parseInt(article_id), auditStatus: 1 };

      const [comments, total] = await Promise.all([
        prisma.comment.findMany({
          where,
          orderBy: { createTime: 'desc' },
          skip: (pageNum - 1) * sizeNum,
          take: sizeNum,
        }),
        prisma.comment.count({ where }),
      ]);

      const totalPages = Math.ceil(total / sizeNum);

      sendSuccess(res, {
        result: comments,
        total,
        page: pageNum,
        size: sizeNum,
        pages: totalPages,
        next: pageNum < totalPages,
        prev: pageNum > 1,
      });
    } catch (err) {
      console.error('getArticleComments error:', err);
      sendError(res, '获取文章评论失败', 400);
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

      sendSuccess(res, {
        records: comments,
        total,
        page: pageNum,
        size: sizeNum,
        totalPages: Math.ceil(total / sizeNum),
      });
    } catch (err) {
      console.error('getCommentList error:', err);
      sendError(res, '获取评论列表失败', 400);
    }
  }
}

export default new CommentController();
