import { params } from './url';

// 最新调整：在 .env 文件中配置项目后端 API 地址
const url = process.env.NEXT_PUBLIC_PROJECT_API
// 配置页面缓存时间
const cachingTime = +process.env.NEXT_PUBLIC_CACHING_TIME!

if (!url) {
    console.error('❌ 环境变量 NEXT_PUBLIC_PROJECT_API 未设置或为空');
    console.error('当前 NEXT_PUBLIC_PROJECT_API 值:', url);
    console.error('请检查 .env 或 .env.local 文件配置');
}

export const Request = async <T>(method: string, api: string, data?: any, caching = true) => {
    if (!url) {
        console.error('❌ 请求被阻止: NEXT_PUBLIC_PROJECT_API 未定义');
        console.error('请求路径:', api);
        return { code: 500, message: 'API URL not configured', data: {} as T };
    }

    const query = params(data?.params ?? {});

    try {
        const fullUrl = `${url}${api}${query}`;
        const res = await fetch(fullUrl, {
            method,
            headers: {
                'Content-Type': 'application/json'
            },
            [method === 'POST' ? 'body' : '']: JSON.stringify(data ? data : {}),
            next: { revalidate: caching ? cachingTime : 1 }
        })

        return res?.json() as Promise<ResponseData<T>>;
    } catch (error) {
        console.error('❌ 请求异常:', error);
        console.error('请求路径:', api);
        return { code: 500, message: 'Request failed', data: {} as T };
    }
}
