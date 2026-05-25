import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { prisma } from '../utils/prisma';

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
      sendSuccess(res, footprint);
    } catch (err) {
      console.error('addFootprint error:', err);
      sendError(res, '添加足迹失败', 400);
    }
  }

  async deleteFootprint(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.footprint.delete({ where: { id: parseInt(id) } });
      sendSuccess(res);
    } catch (err) {
      console.error('deleteFootprint error:', err);
      sendError(res, '删除足迹失败', 400);
    }
  }

  async editFootprint(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, title, content, address, position, images } = req.body;
      await prisma.footprint.update({
        where: { id: parseInt(id) },
        data: { title, content, address, position, images },
      });
      sendSuccess(res);
    } catch (err) {
      console.error('editFootprint error:', err);
      sendError(res, '编辑足迹失败', 400);
    }
  }

  async getFootprintList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const footprints = await prisma.footprint.findMany({
        orderBy: { createTime: 'desc' },
      });
      sendSuccess(res, footprints);
    } catch (err) {
      console.error('getFootprintList error:', err);
      sendError(res, '获取足迹列表失败', 400);
    }
  }
}

export default new FootprintController();
