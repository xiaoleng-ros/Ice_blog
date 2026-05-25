import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { sendEmail, generateCommentEmailHtml, generateDismissEmailHtml, generateWallReplyEmailHtml } from '../utils/email';

class EmailController {
  async sendEmail(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { to, subject, articleTitle, commentContent, nickname } = req.body;

      const html = generateCommentEmailHtml(
        nickname || '用户',
        articleTitle || '文章',
        commentContent || ''
      );

      await sendEmail({
        to,
        subject: subject || `您在 ${nickname || '博客'} 的文章有新评论`,
        html,
      });

      sendSuccess(res);
    } catch (err) {
      console.error('sendEmail error:', err);
      sendError(res, '发送邮件失败', 400);
    }
  }

  async sendDismissEmail(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { to, subject, type, recipient, time, content, url } = req.body;

      if (!to) {
        sendError(res, '收件人不能为空', 400);
        return;
      }

      const html = generateDismissEmailHtml(
        type || '申请',
        recipient || '',
        time || new Date().toLocaleString('zh-CN'),
        content || '',
        url || '#'
      );

      await sendEmail({
        to,
        subject: subject || '您的申请已被驳回',
        html,
      });

      sendSuccess(res);
    } catch (err) {
      console.error('sendDismissEmail error:', err);
      sendError(res, '发送驳回通知邮件失败', 400);
    }
  }

  async sendWallReplyEmail(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { to, recipient, time, yourContent, replyContent, url } = req.body;

      if (!to) {
        sendError(res, '收件人不能为空', 400);
        return;
      }

      const html = generateWallReplyEmailHtml(
        recipient || '',
        time || new Date().toLocaleString('zh-CN'),
        yourContent || '',
        replyContent || '',
        url || '#'
      );

      await sendEmail({
        to,
        subject: '您有新的消息~',
        html,
      });

      sendSuccess(res);
    } catch (err) {
      console.error('sendWallReplyEmail error:', err);
      sendError(res, '发送留言回复邮件失败', 400);
    }
  }
}

export default new EmailController();
