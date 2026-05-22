import { params } from './url';
import { logger } from '@/utils/logger';

// 最新调整：在 .env 文件中配置项目后端 API 地址
const url = process.env.NEXT_PUBLIC_PROJECT_API
// 配置页面缓存时间
const cachingTime = +process.env.NEXT_PUBLIC_CACHING_TIME!
// 请求超时时间（毫秒）
const REQUEST_TIMEOUT = 3000

if (!url) {
    logger.error('❌ 环境变量 NEXT_PUBLIC_PROJECT_API 未设置或为空');
    logger.error('当前 NEXT_PUBLIC_PROJECT_API 值:', url);
    logger.error('请检查 .env 或 .env.local 文件配置');
}

/**
 * 带超时的 fetch 请求
 * @param url - 请求地址
 * @param options - fetch 选项
 * @param timeout - 超时时间（毫秒）
 */
const fetchWithTimeout = async (url: string, options: RequestInit, timeout: number) => {
    const controller = new AbortController();
    const { signal } = controller;
    
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    
    try {
        const response = await fetch(url, { ...options, signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

export const Request = async <T>(method: string, api: string, data?: any, caching = true) => {
    if (!url) {
        logger.error(' 请求被阻止: NEXT_PUBLIC_PROJECT_API 未定义');
        logger.error('请求路径:', api);
        return { code: 500, message: 'API URL not configured', data: {} as T };
    }

    const query = params(data?.params ?? {});

    try {
        const fullUrl = `${url}${api}${query}`;
        const res = await fetchWithTimeout(fullUrl, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            [method === 'POST' ? 'body' : '']: JSON.stringify(data ? data : {}),
            next: { revalidate: caching ? cachingTime : 1 }
        }, REQUEST_TIMEOUT)

        return res?.json() as Promise<ResponseData<T>>;
    } catch (error) {
        // 区分超时和其他错误
        const errorMessage = error instanceof Error && error.name === 'AbortError' 
            ? '请求超时，请检查后端服务是否启动' 
            : '请求失败';
        logger.error(`❌ ${errorMessage}:`, error);
        logger.error('请求路径:', api);
        return { code: 500, message: errorMessage, data: {} as T };
    }
}
