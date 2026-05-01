import Request from '@/utils/request';
import { Config, EnvConfigName, WebConfigType } from '@/types/app/config';

// 获取网站配置
export const getWebConfigDataAPI = <T>(name: WebConfigType) => Request<T>('GET', `/config/web/${name}`);

// 修改网站配置
export const editWebConfigDataAPI = (name: WebConfigType, data: object) => Request<Config>('PATCH', `/config/web`, { data: { [name]: data } });

// 获取环境配置
export const getEnvConfigDataAPI = (name: EnvConfigName) => Request<Config>('GET', `/config/env/${name}`);

// 获取环境配置列表
export const getEnvConfigListAPI = () => Request<Config[]>('GET', `/config/env`);

// 更新环境配置
export const updateEnvConfigDataAPI = (data: Config) => Request('PATCH', `/config/env`, { data });

// 根据id获取页面配置
export const getPageConfigDataAPI = (id: number) => Request<Config>('GET', `/config/page/${id}`);

// 根据名称获取页面配置
export const getPageConfigDataByNameAPI = (name: string) => Request<Config>('GET', `/config/page?name=${name}`);

// 获取页面配置列表
export const getPageConfigListAPI = () => Request<Config[]>('GET', `/config/page`);

// 更新页面配置
export const updatePageConfigDataAPI = (pageName: string, config: object) => Request('PATCH', `/config/page`, { data: { pageName, config } });
