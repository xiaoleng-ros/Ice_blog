import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';

const prisma = new PrismaClient();

class FootprintController {
  async addFootprint(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, content, address, position, images } = req.body;
      const footprint = await prisma.footprint.create({
        data: {
          title,
          content,
          address,
          position,
          images,
          createTime: Date.now().toString(),
        },
      });
      res.json(success(footprint));
    } catch (err) {
      console.error('addFootprint error:', err);
      res.json(error('添加足迹失败'));
    }
  }

  async deleteFootprint(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.footprint.delete({ where: { id: parseInt(id) } });
      res.json(success());
    } catch (err) {
      console.error('deleteFootprint error:', err);
      res.json(error('删除足迹失败'));
    }
  }

  async editFootprint(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, title, content, address, position, images } = req.body;
      await prisma.footprint.update({
        where: { id },
        data: { title, content, address, position, images },
      });
      res.json(success());
    } catch (err) {
      console.error('editFootprint error:', err);
      res.json(error('编辑足迹失败'));
    }
  }

  async getFootprintList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const footprints = await prisma.footprint.findMany({
        orderBy: { createTime: 'desc' },
      });
      res.json(success(footprints));
    } catch (err) {
      console.error('getFootprintList error:', err);
      res.json(error('获取足迹列表失败'));
    }
  }
}

export default new FootprintController();
