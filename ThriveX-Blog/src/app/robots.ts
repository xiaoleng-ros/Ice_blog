import { MetadataRoute } from 'next';
import { getWebConfigDataAPI } from '@/api/config';
import { Web } from '@/types/app/config';

// SEO 路由 ISR 策略：1 小时重新生成一次，兼顾性能与配置更新及时性
// - 首次访问：请求后端生成并缓存
// - 后续访问：直接返回缓存，后台到点自动重新生成
export const revalidate = 3600;

export default async function robots(): Promise<MetadataRoute.Robots> {
  // 获取网站配置，使用与路由一致的 1 小时缓存，避免每次请求都打后端
  const webResponse = await getWebConfigDataAPI<{ value: Web }>('web', { revalidate: 3600 });
  const webConfig = webResponse?.data?.value as Web;

  const baseUrl = webConfig?.url || 'https://liuyuyang.net';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/admin/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
