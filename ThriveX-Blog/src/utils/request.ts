import { params } from './url';
import { logger } from '@/utils/logger';

// 最新调整：在 .env 文件中配置项目后端 API 地址
const url = process.env.NEXT_PUBLIC_PROJECT_API
// 配置页面缓存时间
const rawCachingTime = process.env.NEXT_PUBLIC_CACHING_TIME;
const cachingTime = rawCachingTime ? +rawCachingTime : 60;
// 请求超时时间（毫秒）
const REQUEST_TIMEOUT = 15000

if (!url) {
    logger.error('❌ 环境变量 NEXT_PUBLIC_PROJECT_API 未设置或为空');
    logger.error('当前 NEXT_PUBLIC_PROJECT_API 值:', url);
    logger.error('请检查 .env 或 .env.local 文件配置');
}

/**
 * 进行中的 GET 请求缓存 Map
 * key: 完整请求 URL, value: Promise<ResponseData<T>>
 * 同一个渲染周期内，相同 URL 的 GET 请求会合并为一次实际网络请求
 * 缓存已解析的 JSON 结果而非 Response 对象，避免 "Body has already been read" 报错
 */
const inflightRequests = new Map<string, Promise<any>>();

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
        const fetchOptions: RequestInit & { next?: { revalidate: number } } = {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            next: { revalidate: caching ? cachingTime : 1 }
        };
        if (method === 'POST' && data) {
            fetchOptions.body = JSON.stringify(data);
        }

        let res: Response;
        
        // GET 请求去重：同一个渲染周期内相同 URL 只发一次网络请求
        // 缓存已解析的 JSON 结果，防止多个组件共享同一个 Response 时
        // 出现 "Body has already been read" 错误
        if (method === 'GET') {
            if (inflightRequests.has(fullUrl)) {
                // 复用正在进行的请求（已解析的 JSON）
                return inflightRequests.get(fullUrl)!;
            } else {
                // 首次请求：执行 fetch → 解析 JSON → 存入 Map
                const promise = (async () => {
                    const res = await fetchWithTimeout(fullUrl, fetchOptions, REQUEST_TIMEOUT);
                    return res.json() as Promise<ResponseData<T>>;
                })();
                inflightRequests.set(fullUrl, promise);
                try {
                    return await promise;
                } finally {
                    // 请求完成后清除（无论成功还是失败）
                    inflightRequests.delete(fullUrl);
                }
            }
        } else {
            res = await fetchWithTimeout(fullUrl, fetchOptions, REQUEST_TIMEOUT);
        }

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
