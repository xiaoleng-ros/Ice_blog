import Request from '@/utils/request'
import { Web, WebType } from '@/types/app/web'

// 新增网站
export const addLinkDataAPI = (data: Web) => Request('POST', '/link', { data })

// 删除网站
export const delLinkDataAPI = (id: number) => Request('DELETE', `/link/${id}`)

// 修改网站
export const editLinkDataAPI = (data: Web) => Request('PATCH', '/link', { data })

// 获取网站
export const getLinkDataAPI = (id?: number) => Request<Web>('GET', `/link/${id}`)

// 获取网站列表
export const getLinkListAPI = (data?: QueryData) => Request<Web[]>('GET', `/link`, {
    params: { ...data?.query },
})

// 分页获取网站列表
export const getLinkPagingAPI = (data?: QueryData & { page?: number; size?: number }) => Request<Paginate<Web[]>>('GET', `/link`, {
    params: { ...data?.query, page: data?.page, size: data?.size }
})

// 获取网站类型列表
export const getWebTypeListAPI = () => {
    return Request<WebType[]>('GET', `/link/type`);
};

// 审核网站
export const auditWebDataAPI = (id: number) => Request<Web>('PATCH', `/link/audit/${id}`)
