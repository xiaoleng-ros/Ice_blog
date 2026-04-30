import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';

const prisma = new PrismaClient();

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
      res.json(success(wall));
    } catch (err) {
      console.error('addWall error:', err);
      res.json(error('添加留言失败'));
    }
  }

  async deleteWall(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.wall.delete({ where: { id: parseInt(id) } });
      res.json(success());
    } catch (err) {
      console.error('deleteWall error:', err);
      res.json(error('删除留言失败'));
    }
  }

  async batchDeleteWall(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ids } = req.body;
      await prisma.wall.deleteMany({ where: { id: { in: ids } } });
      res.json(success());
    } catch (err) {
      console.error('batchDeleteWall error:', err);
      res.json(error('批量删除留言失败'));
    }
  }

  async editWall(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, name, cateId, color, content, avatar, email } = req.body;
      await prisma.wall.update({
        where: { id },
        data: { name, cateId, color, content, avatar, email },
      });
      res.json(success());
    } catch (err) {
      console.error('editWall error:', err);
      res.json(error('编辑留言失败'));
    }
  }

  async getWall(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const wall = await prisma.wall.findUnique({ where: { id: parseInt(id) } });
      res.json(success(wall));
    } catch (err) {
      console.error('getWall error:', err);
      res.json(error('获取留言失败'));
    }
  }

  async getWallList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cateId, page, size } = req.query;
      const where: any = {};
      if (cateId) where.cateId = parseInt(cateId as string);

      if (page && size) {
        const pageNum = parseInt(page as string) || 1;
        const sizeNum = parseInt(size as string) || 10;
        const [walls, total] = await Promise.all([
          prisma.wall.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            skip: (pageNum - 1) * sizeNum,
            take: sizeNum,
          }),
          prisma.wall.count({ where }),
        ]);
        res.json(success({
          records: walls,
          total,
          page: pageNum,
          size: sizeNum,
          totalPages: Math.ceil(total / sizeNum),
        }));
        return;
      }

      const walls = await prisma.wall.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
      res.json(success(walls));
    } catch (err) {
      console.error('getWallList error:', err);
      res.json(error('获取留言列表失败'));
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
      const sizeNum = parseInt(size as string) || 10;

      const [walls, total] = await Promise.all([
        prisma.wall.findMany({
          where,
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * sizeNum,
          take: sizeNum,
        }),
        prisma.wall.count({ where }),
      ]);

      res.json(success({
        records: walls,
        total,
        page: pageNum,
        size: sizeNum,
        totalPages: Math.ceil(total / sizeNum),
      }));
    } catch (err) {
      console.error('getWallCateWallList error:', err);
      res.json(error('获取分类留言失败'));
    }
  }

  async getWallCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const cates = await prisma.wallCate.findMany({ orderBy: { order: 'asc' } });
      res.json(success(cates));
    } catch (err) {
      console.error('getWallCate error:', err);
      res.json(error('获取留言分类失败'));
    }
  }

  async addWallCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, icon, order } = req.body;
      const cate = await prisma.wallCate.create({ data: { name, icon, order } });
      res.json(success(cate));
    } catch (err) {
      console.error('addWallCate error:', err);
      res.json(error('添加留言分类失败'));
    }
  }

  async deleteWallCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.wallCate.delete({ where: { id: parseInt(id) } });
      res.json(success());
    } catch (err) {
      console.error('deleteWallCate error:', err);
      res.json(error('删除留言分类失败'));
    }
  }

  async auditWall(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.wall.update({
        where: { id: parseInt(id) },
        data: { auditStatus: 1 },
      });
      res.json(success());
    } catch (err) {
      console.error('auditWall error:', err);
      res.json(error('审核留言失败'));
    }
  }

  async updateChoice(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const wall = await prisma.wall.findUnique({ where: { id: parseInt(id) } });
      if (!wall) {
        res.json(error('留言不存在'));
        return;
      }
      const newIsChoice = wall.isChoice === 1 ? 0 : 1;
      await prisma.wall.update({
        where: { id: parseInt(id) },
        data: { isChoice: newIsChoice },
      });
      res.json(success());
    } catch (err) {
      console.error('updateChoice error:', err);
      res.json(error('更新精选状态失败'));
    }
  }
}

export default new WallController();
