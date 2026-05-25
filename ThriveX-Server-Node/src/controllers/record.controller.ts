import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { prisma } from '../utils/prisma';

class RecordController {
  async addRecord(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, content, images } = req.body;
      const record = await prisma.record.create({
        data: {
          title,
          content,
          images,
          createdAt: Date.now().toString(),
        },
      });
      sendSuccess(res, record);
    } catch (err) {
      console.error('addRecord error:', err);
      sendError(res, '添加记录失败', 400);
    }
  }

  async deleteRecord(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.record.delete({ where: { id: parseInt(id) } });
      sendSuccess(res);
    } catch (err) {
      console.error('deleteRecord error:', err);
      sendError(res, '删除记录失败', 400);
    }
  }

  async editRecord(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, title, content, images } = req.body;
      await prisma.record.update({
        where: { id: parseInt(id) },
        data: { title, content, images },
      });
      sendSuccess(res);
    } catch (err) {
      console.error('editRecord error:', err);
      sendError(res, '编辑记录失败', 400);
    }
  }

  async getRecordList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const records = await prisma.record.findMany({
        orderBy: { createdAt: 'desc' },
      });
      sendSuccess(res, records);
    } catch (err) {
      console.error('getRecordList error:', err);
      sendError(res, '获取记录列表失败', 400);
    }
  }

  async getRecordPaging(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, size } = req.body;
      const pageNum = parseInt(page as string) || 1;
      const sizeNum = Math.min(parseInt(size as string) || 8, 100);

      const [records, total] = await Promise.all([
        prisma.record.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * sizeNum,
          take: sizeNum,
        }),
        prisma.record.count(),
      ]);

      sendSuccess(res, {
        records,
        total,
        page: pageNum,
        size: sizeNum,
        totalPages: Math.ceil(total / sizeNum),
      });
    } catch (err) {
      console.error('getRecordPaging error:', err);
      sendError(res, '获取记录列表失败', 400);
    }
  }
}

export default new RecordController();
