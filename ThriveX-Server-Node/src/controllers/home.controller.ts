import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { prisma } from '../utils/prisma';

class HomeController {
  async getHomeData(req: AuthRequest, res: Response): Promise<void> {
    try {
      const [articles, swipers, cates, tags, webConfig] = await Promise.all([
        prisma.article.findMany({
          where: {
            articleConfig: {
              isDel: false,
              status: 'default',
            },
          },
          include: {
            articleCates: { include: { cate: true } },
            articleTags: { include: { tag: true } },
          },
          orderBy: { createTime: 'desc' },
          take: 10,
        }),
        prisma.swiper.findMany({
          where: { status: 1 },
          orderBy: { order: 'asc' },
        }),
        prisma.cate.findMany({
          where: { type: 'nav' },
          orderBy: { order: 'asc' },
        }),
        prisma.tag.findMany(),
        prisma.webConfig.findMany(),
      ]);

      const configMap: Record<string, any> = {};
      webConfig.forEach(cfg => {
        configMap[cfg.name] = cfg.value;
      });

      sendSuccess(res, {
        articles,
        swipers,
        cates,
        tags,
        config: configMap,
      });
    } catch (err) {
      console.error('getHomeData error:', err);
      sendError(res, '获取首页数据失败', 400);
    }
  }
}

export default new HomeController();
