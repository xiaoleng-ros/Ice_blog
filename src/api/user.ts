import { User } from '@/types/app/user'
import Request from '@/utils/request'

// 获取作者信息
export const getAuthorDataAPI = async () => {
    return await Request<User>('GET', '/user/author')
}