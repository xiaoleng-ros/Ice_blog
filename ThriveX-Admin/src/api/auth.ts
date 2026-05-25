import { LoginReturn } from '@/types/app/user'
import Request from '@/utils/request'

// 授权 github 登录
export const authGitHubLoginAPI = (code: string) => Request<LoginReturn>('POST', `/auth/github/login?code=${encodeURIComponent(code)}`)

// 绑定 github 登录
export const bindGitHubLoginAPI = (code: string, userId: string) => Request('POST', `/auth/github/bind?code=${encodeURIComponent(code)}&userId=${encodeURIComponent(userId)}`)