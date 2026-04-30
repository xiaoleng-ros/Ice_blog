import { Rss } from '@/types/app/rss';
import Request from '@/utils/request';

// 获取订阅数据列表
export const getRssListAPI = (data?: QueryData) => Request<Rss[]>('GET', `/rss`, {
    params: { ...data?.query },
})

// 分页获取订阅列表
export const getRssPagingAPI = (data?: QueryData & { page?: number; size?: number }) => Request<Paginate<Rss[]>>('GET', `/rss`, {
    params: { ...data?.query, page: data?.page, size: data?.size }
})