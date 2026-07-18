import { MetadataRoute } from 'next';
import { getArticleListAPI } from '@/api/article';
import { getWebConfigDataAPI } from '@/api/config';
import { Web } from '@/types/app/config';
import { Article } from '@/types/app/article';

// 网站配置依赖实时接口，强制动态渲染，避免构建时 DYNAMIC_SERVER_USAGE
export const dynamic = 'force-dynamic';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // 获取网站配置
  const webResponse = await getWebConfigDataAPI<{ value: Web }>('web');
  const webConfig = webResponse?.data?.value as Web;

  const baseUrl = webConfig?.url ?? 'https://liuyuyang.net';

  // 获取所有文章
  const res = await getArticleListAPI();
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
