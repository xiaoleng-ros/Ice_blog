import { MetadataRoute } from 'next';
import { getArticleListAPI } from '@/api/article';
import { getWebConfigDataAPI } from '@/api/config';
import { Web } from '@/types/app/config';
import { Article } from '@/types/app/article';

// SEO 路由 ISR 策略：1 小时重新生成一次，兼顾性能与内容更新及时性
// - 首次访问：请求后端生成并缓存
// - 后续访问：直接返回缓存，后台到点自动重新生成
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 获取网站配置，使用与路由一致的 1 小时缓存，避免每次请求都打后端
  const webResponse = await getWebConfigDataAPI<{ value: Web }>('web', { revalidate: 3600 });
  const webConfig = webResponse?.data?.value as Web;

  const baseUrl = webConfig?.url ?? 'https://liuyuyang.net';

  // 获取所有文章，同样使用 1 小时缓存
  const res = await getArticleListAPI({ revalidate: 3600 });
  // 防御式处理：后端异常时 result 可能不是数组
  const articles = Array.isArray((res?.data as { result?: Article[] })?.result)
    ? (res?.data as { result: Article[] }).result
    : [];

  // 静态页面
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/tags`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/friend`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/wall`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/record`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.6,
    },
  ];

  // 文章页面
  const articlePages: MetadataRoute.Sitemap = articles
    .filter((article) => article.id && article.createTime)
    .map((article) => ({
      url: `${baseUrl}/article/${article.id}`,
      lastModified: new Date(+article.createTime),
      changeFrequency: 'weekly' as const,
      priority: 0.9,
    }));

  return [...staticPages, ...articlePages];
}
