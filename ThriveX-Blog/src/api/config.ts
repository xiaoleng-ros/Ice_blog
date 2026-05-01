import { Request } from '@/utils';
import { Config } from '@/types/app/config';

// 获取网站配置
export const getWebConfigDataAPI = <T>(name: string) => Request<T>('GET', `/config/web/${name}`, undefined, false)

// 修改网站配置
export const editWebConfigDataAPI = (name: string, data: object) => Request<Config>('PATCH', `/config/web`, { [name]: data })


// 获取高德地图配置
export const getGaodeMapConfigDataAPI = () => Request('GET', `/config/env/gaode_map`)

// 根据名称获取页面配置
export const getPageConfigDataByNameAPI = (name: string) => Request<Config>('GET', `/config/page?pageName=${name}`)