import Request from '@/utils/request'
import { Comment } from '@/types/app/comment'

// 新增评论
export const addCommentDataAPI = (data: Comment) => Request('POST', '/comment', { data })

// 删除评论
export const delCommentDataAPI = (id: number) => Request('DELETE', `/comment/${id}`)

// 审核评论
export const auditCommentDataAPI = (id: number) => Request('PATCH', `/comment/audit/${id}`)

// 修改评论
export const editCommentDataAPI = (data: Comment) => Request('PATCH', '/comment', { data })

// 获取评论
export const getCommentDataAPI = (id?: number) => Request<Paginate<Comment>>('GET', `/comment/${id}`)

// 获取评论列表
export const getCommentListAPI = (data?: QueryData) => Request<Paginate<Comment[]>>('GET', `/comment`, {
    params: { ...data?.query },
})

// 分页获取评论列表
export const getCommentPagingAPI = (data?: QueryData & { page?: number; size?: number }) => Request<Paginate<Comment[]>>('GET', `/comment`, {
    params: { ...data?.query, page: data?.page, size: data?.size }
})