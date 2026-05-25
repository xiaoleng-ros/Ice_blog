import { Response } from 'express';
import Parser from 'rss-parser';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { listRssFeeds, evictRssCache } from '../services/rss.service';
import { getClientIp } from '../utils/auth';
import { prisma } from '../utils/prisma';
const parser = new Parser();

class RssController {
  async getRssList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const rssFeeds = await listRssFeeds();
      sendSuccess(res, rssFeeds);
    } catch (err) {
      console.error('getRssList error:', err);
      sendError(res, '获取RSS订阅列表失败', 400);
    }
  }

  async getRssPaging(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, size } = req.query;
      const pageNum = parseInt(page as string) || 1;
      const sizeNum = Math.min(parseInt(size as string) || 10, 100);

      const rssFeeds = await listRssFeeds();
      const total = rssFeeds.length;
      const start = (pageNum - 1) * sizeNum;
      const end = start + sizeNum;
      const records = rssFeeds.slice(start, end);

      sendSuccess(res, {
        records,
        total,
        page: pageNum,
        size: sizeNum,
        totalPages: Math.ceil(total / sizeNum),
      });
    } catch (err) {
      console.error('getRssPaging error:', err);
      sendError(res, '分页获取RSS订阅列表失败', 400);
    }
  }

  async refreshRssCache(req: AuthRequest, res: Response): Promise<void> {
    try {
      evictRssCache();
      const rssFeeds = await listRssFeeds();
      sendSuccess(res, rssFeeds, 'RSS缓存已刷新');
    } catch (err) {
      console.error('refreshRssCache error:', err);
      sendError(res, '刷新RSS缓存失败', 400);
    }
  }

  async addRss(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, url, rule } = req.body;
      const rss = await prisma.rss.create({
        data: { name, url, rule, created: Date.now().toString() },
      });
      sendSuccess(res, rss);
    } catch (err) {
      console.error('addRss error:', err);
      sendError(res, '添加RSS订阅失败', 400);
    }
  }

  async deleteRss(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.rss.delete({ where: { id: parseInt(id) } });
      sendSuccess(res);
    } catch (err) {
      console.error('deleteRss error:', err);
      sendError(res, '删除RSS订阅失败', 400);
    }
  }

  async editRss(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, name, url, rule } = req.body;
      await prisma.rss.update({
        where: { id: parseInt(id) },
        data: { name, url, rule },
      });
      sendSuccess(res);
    } catch (err) {
      console.error('editRss error:', err);
      sendError(res, '编辑RSS订阅失败', 400);
    }
  }

  async getRssContent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const rss = await prisma.rss.findUnique({ where: { id: parseInt(id) } });

      if (!rss) {
        sendError(res, 'RSS订阅不存在', 400);
        return;
      }

      const feed = await parser.parseURL(rss.url);

      const items = feed.items.map(item => ({
        title: item.title,
        link: item.link,
        content: item.contentSnippet || item.content,
        pubDate: item.pubDate,
      }));

      sendSuccess(res, items);
    } catch (err) {
      console.error('getRssContent error:', err);
      sendError(res, '获取RSS内容失败', 400);
    }
  }
}

export default new RssController();
