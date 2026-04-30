import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';

const prisma = new PrismaClient();

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
      res.json(success(record));
    } catch (err) {
      console.error('addRecord error:', err);
      res.json(error('添加记录失败'));
    }
  }

  async deleteRecord(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.record.delete({ where: { id: parseInt(id) } });
      res.json(success());
    } catch (err) {
      console.error('deleteRecord error:', err);
      res.json(error('删除记录失败'));
    }
  }

  async editRecord(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, title, content, images } = req.body;
      await prisma.record.update({
        where: { id },
        data: { title, content, images },
      });
      res.json(success());
    } catch (err) {
      console.error('editRecord error:', err);
      res.json(error('编辑记录失败'));
    }
  }

  async getRecordList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const records = await prisma.record.findMany({
        orderBy: { createdAt: 'desc' },
      });
      res.json(success(records));
    } catch (err) {
      console.error('getRecordList error:', err);
      res.json(error('获取记录列表失败'));
    }
  }

  async getRecordPaging(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, size } = req.body;
      const pageNum = parseInt(page as string) || 1;
      const sizeNum = parseInt(size as string) || 8;

      const [records, total] = await Promise.all([
        prisma.record.findMany({
          orderBy: { createdAt: 'desc' },
          skip: (pageNum - 1) * sizeNum,
          take: sizeNum,
        }),
        prisma.record.count(),
      ]);

      res.json(success({
        records,
        total,
        page: pageNum,
        size: sizeNum,
        totalPages: Math.ceil(total / sizeNum),
      }));
    } catch (err) {
      console.error('getRecordPaging error:', err);
      res.json(error('获取记录列表失败'));
    }
  }
}

export default new RecordController();
