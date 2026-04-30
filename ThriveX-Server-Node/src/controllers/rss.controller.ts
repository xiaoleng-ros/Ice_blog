import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import Parser from 'rss-parser';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';
import { listRssFeeds, evictRssCache } from '../services/rss.service';
import { getClientIp } from '../utils/auth';

const prisma = new PrismaClient();
const parser = new Parser();

class RssController {
  async getRssList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const rssFeeds = await listRssFeeds();
      res.json(success(rssFeeds));
    } catch (err) {
      console.error('getRssList error:', err);
      res.json(error('获取RSS订阅列表失败'));
    }
  }

  async getRssPaging(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, size } = req.query;
      const pageNum = parseInt(page as string) || 1;
      const sizeNum = parseInt(size as string) || 10;

      const rssFeeds = await listRssFeeds();
      const total = rssFeeds.length;
      const start = (pageNum - 1) * sizeNum;
      const end = start + sizeNum;
      const records = rssFeeds.slice(start, end);

      res.json(success({
        records,
        total,
        page: pageNum,
        size: sizeNum,
        totalPages: Math.ceil(total / sizeNum),
      }));
    } catch (err) {
      console.error('getRssPaging error:', err);
      res.json(error('分页获取RSS订阅列表失败'));
    }
  }

  async refreshRssCache(req: AuthRequest, res: Response): Promise<void> {
    try {
      evictRssCache();
      const rssFeeds = await listRssFeeds();
      res.json(success(rssFeeds, 'RSS缓存已刷新'));
    } catch (err) {
      console.error('refreshRssCache error:', err);
      res.json(error('刷新RSS缓存失败'));
    }
  }

  async addRss(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, url, rule } = req.body;
      const rss = await prisma.rss.create({
        data: { name, url, rule, created: Date.now().toString() },
      });
      res.json(success(rss));
    } catch (err) {
      console.error('addRss error:', err);
      res.json(error('添加RSS订阅失败'));
    }
  }

  async deleteRss(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.rss.delete({ where: { id: parseInt(id) } });
      res.json(success());
    } catch (err) {
      console.error('deleteRss error:', err);
      res.json(error('删除RSS订阅失败'));
    }
  }

  async editRss(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, name, url, rule } = req.body;
      await prisma.rss.update({
        where: { id },
        data: { name, url, rule },
      });
      res.json(success());
    } catch (err) {
      console.error('editRss error:', err);
      res.json(error('编辑RSS订阅失败'));
    }
  }

  async getRssContent(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const rss = await prisma.rss.findUnique({ where: { id: parseInt(id) } });

      if (!rss) {
        res.json(error('RSS订阅不存在'));
        return;
      }

      const feed = await parser.parseURL(rss.url);

      const items = feed.items.map(item => ({
        title: item.title,
        link: item.link,
        content: item.contentSnippet || item.content,
        pubDate: item.pubDate,
      }));

      res.json(success(items));
    } catch (err) {
      console.error('getRssContent error:', err);
      res.json(error('获取RSS内容失败'));
    }
  }
}

export default new RssController();
