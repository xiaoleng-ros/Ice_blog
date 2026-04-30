import Request from '@/utils/request'
import { Record } from '@/types/app/record'

// 新增说说
export const addRecordDataAPI = (data: Record) => Request('POST', '/record', { data })

// 删除说说
export const delRecordDataAPI = (id: number) => Request('DELETE', `/record/${id}`)

// 修改说说
export const editRecordDataAPI = (data: Record) => Request('PATCH', '/record', { data })

// 获取说说
export const getRecordDataAPI = (id?: number) => Request<Record>('GET', `/record/${id}`)

// 获取说说列表
export const getRecordListAPI = (data?: QueryData) => Request<Record[]>('GET', `/record`, {
    params: { ...data?.query },
})

// 分页获取说说列表
export const getRecordPagingAPI = (data?: QueryData & { page?: number; size?: number }) => Request<Paginate<Record[]>>('GET', `/record`, {
    params: { ...data?.query, page: data?.page, size: data?.size }
})