import { cache } from 'react'
import { Request } from '@/utils'
import type { Theme, Web } from '@/types/app/config'

/**
 * 获取网站配置
 * 使用 cache: 'no-store' 避免 Next.js 缓存旧数据
 * 管理后台修改配置后前端能立即获取最新值
 */
export const getWebConfig = cache(async (name: string) => {
  const response = await Request<{ value: Web }>('GET', `/config/web/${name}`, undefined, false)
  return response?.data?.value as Web | undefined
})

/**
 * 获取主题配置
 * 使用 cache: 'no-store' 避免 Next.js 缓存旧数据
 * 管理后台修改侧边栏/文章布局等配置后前端能立即获取最新值
 */
export const getThemeConfig = cache(async () => {
  const response = await Request<{ value: Theme }>('GET', '/config/web/theme', undefined, false)
  return response?.data?.value as Theme | undefined
})
