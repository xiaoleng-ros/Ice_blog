import Request from '@/utils/request';
import { CommentEmail } from '@/types/app/email';

// 发送评论邮件
export const sendCommentEmailAPI = async (data: CommentEmail) => {
    return await Request<string>('POST', `/email/comment`, data);
}