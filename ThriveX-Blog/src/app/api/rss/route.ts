import { Feed } from 'feed';
import { NextResponse } from 'next/server';

import { Web } from '@/types/app/config';

import { getArticlePagingAPI } from '@/api/article';
import { getWebConfigDataAPI } from '@/api/config';
import { getAuthorDataAPI } from '@/api/user';
import { getRecordPagingAPI } from '@/api/record';

export async function GET() {
  const webResponse = await getWebConfigDataAPI<{ value: Web }>('web');
  const web = webResponse?.data?.value || {} as Web;
  const { data: user } = await getAuthorDataAPI();
  const { data: article } = await getArticlePagingAPI({ page: 1, size: 8 });
  const { data: record } = await getRecordPagingAPI({ pagination: { page: 1, size: 8 } });

  const articleList = article?.result ?? [];
  const recordList = record?.result ?? [];

  // 合并文章和说说，并根据时间排序
  const list = [...articleList, ...recordList].sort((a: any, b: any) => {
    const timeA = a.createTime ? +a.createTime : 0;
    const timeB = b.createTime ? +b.createTime : 0;
    return timeB - timeA;
  });

  const siteTitle = [web?.title, web?.subhead].filter(Boolean).join(' - ') || 'ThriveX';
  const siteUrl = web?.url || '';

  const feed = new Feed({
    title: siteTitle,
    description: web?.description || '',
    id: siteUrl,
    link: siteUrl,
    language: 'zh-CN',
    copyright: 'ThriveX 现代化博客管理系统',
    updated: new Date(),
    generator: '为爱发电',
    docs: 'https://github.com/LiuYuYang01/ThriveX-Blog',
    author: {
      name: user?.name || '',
      email: user?.email || '',
      link: siteUrl,
    },
    image: user?.avatar || undefined,
    feed: siteUrl + '/api/rss',
  });

  list.forEach((item: any) => {
    feed.addItem({
      id: String(item.id || ''),
      title: item?.title || truncateContent(item?.content) || '',
      link: item?.title ? `${siteUrl}/article/${item?.id}` : `${siteUrl}/record`,
      description: item?.description || item?.content || '',
      content: item?.content || '',
      author: user?.name
        ? [
            {
              name: user.name,
              email: user.email || '',
              link: siteUrl,
            },
          ]
        : [],
      copyright: 'ThriveX 现代化博客管理系统',
      date: item?.createTime ? new Date(+item.createTime) : new Date(),
    });
  });

  const xml = feed.rss2();

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'application/xml',
    },
  });
}

// 截取说说内容
function truncateContent(content: string) {
  const maxLength = 20;

  if (content.length > maxLength) {
    return content.substring(0, maxLength) + '...';
  } else {
    return content;
  }
}
