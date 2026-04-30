import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';

const prisma = new PrismaClient();

class SwiperController {
  async addSwiper(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, cover, url, order, status } = req.body;
      const swiper = await prisma.swiper.create({
        data: { title, cover, url, order, status },
      });
      res.json(success(swiper));
    } catch (err) {
      console.error('addSwiper error:', err);
      res.json(error('添加轮播图失败'));
    }
  }

  async deleteSwiper(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.swiper.delete({ where: { id: parseInt(id) } });
      res.json(success());
    } catch (err) {
      console.error('deleteSwiper error:', err);
      res.json(error('删除轮播图失败'));
    }
  }

  async editSwiper(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, title, cover, url, order, status } = req.body;
      await prisma.swiper.update({
        where: { id },
        data: { title, cover, url, order, status },
      });
      res.json(success());
    } catch (err) {
      console.error('editSwiper error:', err);
      res.json(error('编辑轮播图失败'));
    }
  }

  async getSwiperList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const swipers = await prisma.swiper.findMany({
        where: { status: 1 },
        orderBy: { order: 'asc' },
      });
      res.json(success(swipers));
    } catch (err) {
      console.error('getSwiperList error:', err);
      res.json(error('获取轮播图列表失败'));
    }
  }
}

export default new SwiperController();
