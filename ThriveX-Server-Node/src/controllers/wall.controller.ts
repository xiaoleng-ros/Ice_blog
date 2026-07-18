import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { prisma } from '../utils/prisma';

class WallController {
  async addWall(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, cateId, color, content, avatar, email } = req.body;
      const wall = await prisma.wall.create({
        data: {
          name,
          cateId: cateId || 1,
          color,
          content,
          avatar,
          email,
          auditStatus: 0,
          isChoice: 0,
          createdAt: Date.now().toString(),
        },
      });
      sendSuccess(res, wall);
    } catch (err) {
      console.error('addWall error:', err);
      sendError(res, '添加留言失败', 400);
    }
  }

  async deleteWall(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.wall.delete({ where: { id: parseInt(id) } });
      sendSuccess(res);
    } catch (err) {
      console.error('deleteWall error:', err);
      sendError(res, '删除留言失败', 400);
    }
  }

  async batchDeleteWall(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ids } = req.body;
      await prisma.wall.deleteMany({ where: { id: { in: ids.map((i: any) => parseInt(i)) } } });
      sendSuccess(res);
    } catch (err) {
      console.error('batchDeleteWall error:', err);
      sendError(res, '批量删除留言失败', 400);
    }
  }

  async editWall(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, name, cateId, color, content, avatar, email } = req.body;
      await prisma.wall.update({
        where: { id: parseInt(id) },
        data: { name, cateId, color, content, avatar, email },
      });
      sendSuccess(res);
    } catch (err) {
      console.error('editWall error:', err);
      sendError(res, '编辑留言失败', 400);
    }
  }

  async getWall(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const wall = await prisma.wall.findUnique({ where: { id: parseInt(id) } });
      sendSuccess(res, wall);
    } catch (err) {
      console.error('getWall error:', err);
      sendError(res, '获取留言失败', 400);
    }
  }

  async getWallList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cateId, page, size } = req.query;
      const where: any = {};
      if (cateId) where.cateId = parseInt(cateId as string);

      if (page && size) {
        const pageNum = parseInt(page as string) || 1;
        const sizeNum = Math.min(parseInt(size as string) || 10, 100);
        const [walls, total] = await Promise.all([
          prisma.wall.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (pageNum - 1) * sizeNum,
            take: sizeNum,
          }),
          prisma.wall.count({ where }),
        ]);
        sendSuccess(res, {
          result: walls,
          total,
          page: pageNum,
          size: sizeNum,
          totalPages: Math.ceil(total / sizeNum),
        });
        return;
      }

      const walls = await prisma.wall.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      sendSuccess(res, walls);
    } catch (err) {
      console.error('getWallList error:', err);
      sendError(res, '获取留言列表失败', 400);
    }
  }

  async getWallCateWallList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cateId } = req.params;
      const { page, size } = req.query;
      const where: any = {};

      if (cateId === '7') {
        where.isChoice = 1;
      } else {
        where.cateId = parseInt(cateId as string);
      }

      const pageNum = parseInt(page as string) || 1;
      const sizeNum = Math.min(parseInt(size as string) || 10, 100);

      const [walls, total] = await Promise.all([
        prisma.wall.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * sizeNum,
          take: sizeNum,
        }),
        prisma.wall.count({ where }),
      ]);

      sendSuccess(res, {
        result: walls,
        total,
        page: pageNum,
        size: sizeNum,
        totalPages: Math.ceil(total / sizeNum),
      });
    } catch (err) {
      console.error('getWallCateWallList error:', err);
      sendError(res, '获取分类留言失败', 400);
    }
  }

  async getWallCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cates = await prisma.wallCate.findMany({ orderBy: { order: 'asc' } });
      sendSuccess(res, cates);
    } catch (err) {
      console.error('getWallCate error:', err);
      sendError(res, '获取留言分类失败', 400);
    }
  }

  async addWallCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, icon, order } = req.body;
      const cate = await prisma.wallCate.create({ data: { name, icon, order } });
      sendSuccess(res, cate);
    } catch (err) {
      console.error('addWallCate error:', err);
      sendError(res, '添加留言分类失败', 400);
    }
  }

  async deleteWallCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.wallCate.delete({ where: { id: parseInt(id) } });
      sendSuccess(res);
    } catch (err) {
      console.error('deleteWallCate error:', err);
      sendError(res, '删除留言分类失败', 400);
    }
  }

  async auditWall(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.wall.update({
        where: { id: parseInt(id) },
        data: { auditStatus: 1 },
      });
      sendSuccess(res);
    } catch (err) {
      console.error('auditWall error:', err);
      sendError(res, '审核留言失败', 400);
    }
  }

  async updateChoice(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const wall = await prisma.wall.findUnique({ where: { id: parseInt(id) } });
      if (!wall) {
        sendError(res, '留言不存在', 400);
        return;
      }
      const newIsChoice = wall.isChoice === 1 ? 0 : 1;
      await prisma.wall.update({
        where: { id: parseInt(id) },
        data: { isChoice: newIsChoice },
      });
      sendSuccess(res);
    } catch (err) {
      console.error('updateChoice error:', err);
      sendError(res, '更新精选状态失败', 400);
    }
  }
}

export default new WallController();
