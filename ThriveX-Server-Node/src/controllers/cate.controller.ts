import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { prisma } from '../utils/prisma';

class CateController {
  async addCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, icon, url, mark, level, order, type } = req.body;
      const cate = await prisma.cate.create({
        data: {
          name,
          icon,
          url,
          mark,
          level: level != null ? Number(level) : null,
          order: order != null ? Number(order) : 0,
          type,
        },
      });
      sendSuccess(res, cate);
    } catch (err: any) {
      console.error('addCate error:', err);
      const message = err?.code === 'P2002'
        ? '分类名称或标识已存在，请更换后重试'
        : '创建分类失败';
      sendError(res, message, 400);
    }
  }

  async deleteCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.cate.delete({ where: { id: parseInt(id) } });
      sendSuccess(res);
    } catch (err) {
      console.error('deleteCate error:', err);
      sendError(res, '删除分类失败', 400);
    }
  }

  async batchDeleteCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ids } = req.body;
      if (!ids || ids.length === 0) {
        sendError(res, '请提供要删除的分类ID', 400);
        return;
      }
      await prisma.cate.deleteMany({ where: { id: { in: ids.map((i: any) => parseInt(i)) } } });
      sendSuccess(res);
    } catch (err) {
      console.error('batchDeleteCate error:', err);
      sendError(res, '批量删除分类失败', 400);
    }
  }

  async editCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, name, icon, url, mark, level, order, type } = req.body;
      await prisma.cate.update({
        where: { id: parseInt(id) },
        data: {
          name,
          icon,
          url,
          mark,
          level: level != null ? Number(level) : null,
          order: order != null ? Number(order) : 0,
          type,
        },
      });
      sendSuccess(res);
    } catch (err: any) {
      console.error('editCate error:', err);
      const message = err?.code === 'P2002'
        ? '分类名称或标识已存在，请更换后重试'
        : '编辑分类失败';
      sendError(res, message, 400);
    }
  }

  async getCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cate = await prisma.cate.findUnique({ where: { id: parseInt(id) } });
      sendSuccess(res, cate);
    } catch (err) {
      console.error('getCate error:', err);
      sendError(res, '获取分类失败', 400);
    }
  }

  async getCateList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { pattern, page, size } = req.query;

      if (pattern === 'tree') {
        const cates = await prisma.cate.findMany({
          orderBy: { order: 'asc' },
        });
        const tree = buildCateTree(cates);
        sendSuccess(res, tree);
        return;
      }

      if (page && size) {
        const pageNum = parseInt(page as string) || 1;
        const sizeNum = Math.min(parseInt(size as string) || 10, 100);
        const [cates, total] = await Promise.all([
          prisma.cate.findMany({
            orderBy: { order: 'asc' },
            skip: (pageNum - 1) * sizeNum,
            take: sizeNum,
          }),
          prisma.cate.count(),
        ]);
        sendSuccess(res, {
          records: cates,
          total,
          page: pageNum,
          size: sizeNum,
          totalPages: Math.ceil(total / sizeNum),
        });
        return;
      }

      const cates = await prisma.cate.findMany({ orderBy: { order: 'asc' } });
      sendSuccess(res, cates);
    } catch (err) {
      console.error('getCateList error:', err);
      sendError(res, '获取分类列表失败', 400);
    }
  }

  async getCateArticleCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cates = await prisma.cate.findMany({
        include: {
          _count: {
            select: { articleCates: true },
          },
        },
      });

      const result = cates.map(cate => ({
        id: cate.id,
        name: cate.name,
        count: cate._count.articleCates,
      }));

      sendSuccess(res, result);
    } catch (err) {
      console.error('getCateArticleCount error:', err);
      sendError(res, '获取分类文章数量失败', 400);
    }
  }
}

function buildCateTree(cates: any[]): any[] {
  const map = new Map<number, any>();
  const roots: any[] = [];

  cates.forEach(cate => {
    map.set(cate.id, { ...cate, children: [] });
  });

  cates.forEach(cate => {
    const node = map.get(cate.id)!;
    if (cate.level && cate.level > 0) {
      const parent = map.get(cate.level);
      if (parent) {
        parent.children.push(node);
      } else {
        roots.push(node);
      }
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export default new CateController();
