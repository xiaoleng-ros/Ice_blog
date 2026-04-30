import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';

const prisma = new PrismaClient();

class CateController {
  async addCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, icon, url, mark, level, order, type } = req.body;
      const cate = await prisma.cate.create({
        data: { name, icon, url, mark, level, order, type },
      });
      res.json(success(cate));
    } catch (err) {
      console.error('addCate error:', err);
      res.json(error('创建分类失败'));
    }
  }

  async deleteCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.cate.delete({ where: { id: parseInt(id) } });
      res.json(success());
    } catch (err) {
      console.error('deleteCate error:', err);
      res.json(error('删除分类失败'));
    }
  }

  async batchDeleteCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ids } = req.body;
      if (!ids || ids.length === 0) {
        res.json(error('请提供要删除的分类ID'));
        return;
      }
      await prisma.cate.deleteMany({ where: { id: { in: ids } } });
      res.json(success());
    } catch (err) {
      console.error('batchDeleteCate error:', err);
      res.json(error('批量删除分类失败'));
    }
  }

  async editCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, name, icon, url, mark, level, order, type } = req.body;
      await prisma.cate.update({
        where: { id },
        data: { name, icon, url, mark, level, order, type },
      });
      res.json(success());
    } catch (err) {
      console.error('editCate error:', err);
      res.json(error('编辑分类失败'));
    }
  }

  async getCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const cate = await prisma.cate.findUnique({ where: { id: parseInt(id) } });
      res.json(success(cate));
    } catch (err) {
      console.error('getCate error:', err);
      res.json(error('获取分类失败'));
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
        res.json(success(tree));
        return;
      }

      if (page && size) {
        const pageNum = parseInt(page as string) || 1;
        const sizeNum = parseInt(size as string) || 10;
        const [cates, total] = await Promise.all([
          prisma.cate.findMany({
            orderBy: { order: 'asc' },
            skip: (pageNum - 1) * sizeNum,
            take: sizeNum,
          }),
          prisma.cate.count(),
        ]);
        res.json(success({
          records: cates,
          total,
          page: pageNum,
          size: sizeNum,
          totalPages: Math.ceil(total / sizeNum),
        }));
        return;
      }

      const cates = await prisma.cate.findMany({ orderBy: { order: 'asc' } });
      res.json(success(cates));
    } catch (err) {
      console.error('getCateList error:', err);
      res.json(error('获取分类列表失败'));
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

      res.json(success(result));
    } catch (err) {
      console.error('getCateArticleCount error:', err);
      res.json(error('获取分类文章数量失败'));
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
