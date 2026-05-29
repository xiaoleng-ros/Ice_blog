import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { prisma } from '../utils/prisma';
import cache from '../utils/cache';

class SwiperController {
  async addSwiper(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, cover, url, order, status } = req.body;
      const swiper = await prisma.swiper.create({
        data: { title, cover, url, order, status },
      });
      // 清除轮播图缓存，下次请求会重新查询
      cache.del('swiper_list');
      sendSuccess(res, swiper);
    } catch (err) {
      console.error('addSwiper error:', err);
      sendError(res, '添加轮播图失败', 400);
    }
  }

  async deleteSwiper(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.swiper.delete({ where: { id: parseInt(id) } });
      cache.del('swiper_list');
      sendSuccess(res);
    } catch (err) {
      console.error('deleteSwiper error:', err);
      sendError(res, '删除轮播图失败', 400);
    }
  }

  async editSwiper(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, title, cover, url, order, status } = req.body;
      await prisma.swiper.update({
        where: { id: parseInt(id) },
        data: { title, cover, url, order, status },
      });
      cache.del('swiper_list');
      sendSuccess(res);
    } catch (err) {
      console.error('editSwiper error:', err);
      sendError(res, '编辑轮播图失败', 400);
    }
  }

  async getSwiperList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const CACHE_KEY = 'swiper_list';
      const cached = cache.get(CACHE_KEY);
      if (cached) {
        sendSuccess(res, cached);
        return;
      }

      const swipers = await prisma.swiper.findMany({
        where: { status: 1 },
        orderBy: { order: 'asc' },
      });
      cache.set(CACHE_KEY, swipers);
      sendSuccess(res, swipers);
    } catch (err) {
      console.error('getSwiperList error:', err);
      sendError(res, '获取轮播图列表失败', 400);
    }
  }
}

export default new SwiperController();
