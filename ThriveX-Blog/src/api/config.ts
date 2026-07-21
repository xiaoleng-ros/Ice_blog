import { Request } from '@/utils';
import { Config } from '@/types/app/config';

// 获取网站配置
// options.revalidate: 自定义缓存时间（秒），用于 SEO 路由等长缓存场景
export const getWebConfigDataAPI = <T>(name: string, options?: { revalidate?: number }) =>
    Request<T>('GET', `/config/web/${name}`, undefined, options?.revalidate !== undefined, options?.revalidate)

// 修改网站配置
export const editWebConfigDataAPI = (name: string, data: object) => Request<Config>('PATCH', `/config/web`, { [name]: data })


// 获取高德地图配置
export const getGaodeMapConfigDataAPI = () => Request('GET', `/config/env/gaode_map`)

// 根据名称获取页面配置
export const getPageConfigDataByNameAPI = (name: string) => Request<Config>('GET', `/config/page?pageName=${name}`)