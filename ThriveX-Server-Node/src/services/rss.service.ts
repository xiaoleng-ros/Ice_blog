import Parser from 'rss-parser';
import NodeCache from 'node-cache';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const parser = new Parser();
const rssCache = new NodeCache({ stdTTL: 3600, checkperiod: 600 });

interface RssItem {
  image: string | null;
  email: string | null;
  type: string | null;
  author: string | null;
  title: string | null;
  description: string | null;
  url: string | null;
  createTime: string;
}

async function processFeedWithTimeout(rssUrl: string): Promise<RssItem[]> {
  const items: RssItem[] = [];
  try {
    const feed = await parser.parseURL(rssUrl);

    const limitedItems = (feed.items || []).slice(0, 5).map((data) => ({
      image: null,
      email: null,
      type: null,
      author: data.creator || data.author || '',
      title: data.title || '',
      description: data.contentSnippet || data.content || '',
      url: data.link || '',
      createTime: data.pubDate ? new Date(data.pubDate).getTime().toString() : Date.now().toString(),
    }));

    items.push(...limitedItems);
  } catch (e: any) {
    if (e.name === 'AbortError' || e.message?.includes('timeout')) {
      console.error(`RSS 抓取超时: ${rssUrl}`);
    } else if (e.message?.includes('Invalid RSS')) {
      console.error(`无效的 RSS 源: ${rssUrl}`);
    } else {
      console.error(`解析 RSS 失败: ${rssUrl} - ${e.message}`);
    }
  }
  return items;
}

export async function listRssFeeds(): Promise<RssItem[]> {
  const cacheKey = 'allFeeds';
  const cached = rssCache.get<RssItem[]>(cacheKey);
  if (cached) {
    return cached;
  }

  const rssRecords = await prisma.rss.findMany();

  const futures = rssRecords.map((rss: { url: string }) =>
    processFeedWithTimeout(rss.url)
  );

  const results = await Promise.all(futures);
  const rssList = results.flat();

  rssList.sort((a, b) => parseInt(b.createTime) - parseInt(a.createTime));

  rssCache.set(cacheKey, rssList);
  return rssList;
}

export function evictRssCache(): void {
  rssCache.del('allFeeds');
}

export function getRssCacheStats() {
  return rssCache.getStats();
}