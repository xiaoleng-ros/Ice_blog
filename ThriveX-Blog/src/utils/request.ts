import { params } from './url';
import { logger } from '@/utils/logger';

const baseUrl = process.env.NEXT_PUBLIC_PROJECT_API
const rawCachingTime = process.env.NEXT_PUBLIC_CACHING_TIME;
const cachingTime = rawCachingTime ? +rawCachingTime : 60;
const REQUEST_TIMEOUT = 15000

if (!baseUrl) {
    logger.error('❌ 环境变量 NEXT_PUBLIC_PROJECT_API 未设置或为空');
    logger.error('当前 NEXT_PUBLIC_PROJECT_API 值:', baseUrl);
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
 * @param requestUrl - 请求地址
 * @param options - fetch 选项
 * @param timeout - 超时时间（毫秒）
 */
const fetchWithTimeout = async (requestUrl: string, options: RequestInit, timeout: number) => {
    const controller = new AbortController();
    const { signal } = controller;

    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
        const response = await fetch(requestUrl, { ...options, signal });
        clearTimeout(timeoutId);
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
};

/**
 * 安全解析响应 JSON
 * 检查 Content-Type 和响应内容，防止将 HTML 响应误当 JSON 解析
 * 检测到 HTML 响应时抛出明确错误，避免 Next.js 缓存错误响应
 * @param res - fetch Response 对象
 * @param fullUrl - 完整请求 URL（用于日志）
 */
const safeParseJSON = async <T>(res: Response, fullUrl: string): Promise<ResponseData<T>> => {
    const contentType = res.headers.get('content-type') || '';

    if (!contentType.includes('application/json')) {
        const bodyText = await res.text().catch(() => '');
        const trimmed = bodyText.trimStart();

        if (trimmed.startsWith('<!DOCTYPE') || trimmed.startsWith('<html') || trimmed.startsWith('<HTML')) {
            logger.error(`❌ 接口返回了 HTML 而非 JSON，可能后端服务异常或地址配置错误`);
            logger.error('请求地址:', fullUrl);
            logger.error('响应状态:', res.status);
            logger.error('响应 Content-Type:', contentType);
            throw new Error(`接口返回 HTML 而非 JSON (${res.status}, Content-Type: ${contentType})`);
        }

        try {
            return JSON.parse(bodyText) as ResponseData<T>;
        } catch {
            logger.error(`❌ 无法解析响应为 JSON，Content-Type: ${contentType}`);
            logger.error('请求地址:', fullUrl);
            logger.error('响应前100字符:', bodyText.substring(0, 100));
            throw new Error(`无法解析响应为 JSON (Content-Type: ${contentType})`);
        }
    }

    return res.json() as Promise<ResponseData<T>>;
};

export const Request = async <T>(method: string, api: string, data?: any, caching = true) => {
    if (!baseUrl) {
        logger.error(' 请求被阻止: NEXT_PUBLIC_PROJECT_API 未定义');
        logger.error('请求路径:', api);
        return { code: 500, message: 'API URL not configured', data: {} as T };
    }

    const query = params(data?.params ?? {});

    try {
        const fullUrl = `${baseUrl}${api}${query}`;

        /**
         * 缓存策略：
         * - caching=true: 使用 Next.js 数据缓存，revalidate 为配置的缓存时间
         * - caching=false: 不缓存，每次请求都获取最新数据
         *   使用 cache: 'no-store' 而非 revalidate: 1，
         *   避免短时间缓存过期后重新验证时缓存了错误响应
         */
        const fetchOptions: RequestInit & { next?: { revalidate: number }; cache?: string } = {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
        };

        if (caching) {
            fetchOptions.next = { revalidate: cachingTime };
        } else {
            fetchOptions.cache = 'no-store';
        }

        if (method === 'POST' && data) {
            fetchOptions.body = JSON.stringify(data);
        }

        // GET 请求去重：同一个渲染周期内相同 URL 只发一次网络请求
        // 缓存已解析的 JSON 结果，防止多个组件共享同一个 Response 时
        // 出现 "Body has already been read" 错误
        if (method === 'GET') {
            if (inflightRequests.has(fullUrl)) {
                return inflightRequests.get(fullUrl)!;
            } else {
                const promise = (async () => {
                    const res = await fetchWithTimeout(fullUrl, fetchOptions, REQUEST_TIMEOUT);
                    return safeParseJSON<T>(res, fullUrl);
                })();
                inflightRequests.set(fullUrl, promise);
                try {
                    return await promise;
                } finally {
                    inflightRequests.delete(fullUrl);
                }
            }
        } else {
            const res = await fetchWithTimeout(fullUrl, fetchOptions, REQUEST_TIMEOUT);
            return safeParseJSON<T>(res, fullUrl);
        }
    } catch (error) {
        const errorMessage = error instanceof Error && error.name === 'AbortError'
            ? '请求超时，请检查后端服务是否启动'
            : '请求失败';
        logger.error(`❌ ${errorMessage}:`, error);
        logger.error('请求路径:', api);
        return { code: 500, message: errorMessage, data: {} as T };
    }
}
