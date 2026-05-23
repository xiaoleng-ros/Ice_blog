import { Request } from '@/utils';

// 获取默认助手信息
export const getAssistantDefaultAPI = () => Request<{ name: string; model: string }>('GET', '/assistant/default', undefined, false);
