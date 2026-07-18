import { Request } from '@/utils'
import { Record } from '@/types/app/record'

// 获取说说列表
export const getRecordListAPI = (data?: QueryData) => Request<Record[]>('GET', `/record/list`, {
    params: { ...data?.query },
})

// 分页获取说说列表
export const getRecordPagingAPI = (data?: QueryData) => Request<Paginate<Record[]>>('GET', `/record/paging`, {
    params: { page: data?.pagination?.page, size: data?.pagination?.size || 8 }
})