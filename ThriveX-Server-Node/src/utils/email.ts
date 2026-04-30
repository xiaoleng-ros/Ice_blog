import nodemailer from 'nodemailer';
import config from '../config';

const transporter = nodemailer.createTransport({
  host: config.smtp.host,
  port: config.smtp.port,
  secure: true,
  auth: {
    user: config.smtp.user,
    pass: config.smtp.pass,
  },
});

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
}

export async function sendEmail(options: EmailOptions): Promise<void> {
  try {
    await transporter.sendMail({
      from: config.smtp.user,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  } catch (error) {
    console.error('发送邮件失败:', error);
    throw error;
  }
}

export function generateCommentEmailHtml(
  nickname: string,
  articleTitle: string,
  commentContent: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">您在 ${nickname} 的博客有新评论</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>文章：</strong>${articleTitle}</p>
        <p><strong>评论内容：</strong></p>
        <p style="color: #666;">${commentContent}</p>
      </div>
      <p style="color: #999; font-size: 12px;">请前往博客管理后台审核评论</p>
    </div>
  `;
}

export function generateDismissEmailHtml(
  type: string,
  recipient: string,
  time: string,
  content: string,
  url: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">您的${type}申请已被驳回</h2>
      <div style="background: #fff4f4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b;">
        <p><strong>接收方：</strong>${recipient}</p>
        <p><strong>驳回时间：</strong>${time}</p>
        <p><strong>驳回原因：</strong></p>
        <p style="color: #666;">${content}</p>
        <p style="margin-top: 15px;"><a href="${url}" style="display: inline-block; background: #007bff; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">查看详情</a></p>
      </div>
      <p style="color: #999; font-size: 12px;">请前往博客管理后台修改后重新提交申请</p>
    </div>
  `;
}

export function generateWallReplyEmailHtml(
  recipient: string,
  time: string,
  yourContent: string,
  replyContent: string,
  url: string
): string {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #333;">您有新的留言回复</h2>
      <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <p><strong>接收方：</strong>${recipient}</p>
        <p><strong>回复时间：</strong>${time}</p>
        <p style="margin: 15px 0; padding: 15px; background: #fff; border-radius: 4px;">
          <strong style="color: #666;">您的留言：</strong><br/>
          <span style="color: #333;">${yourContent}</span>
        </p>
        <p style="margin: 15px 0; padding: 15px; background: #e8f4ff; border-radius: 4px;">
          <strong style="color: #007bff;">博主回复：</strong><br/>
          <span style="color: #333;">${replyContent}</span>
        </p>
        <p style="margin-top: 15px;"><a href="${url}" style="display: inline-block; background: #28a745; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 4px;">查看详情</a></p>
      </div>
      <p style="color: #999; font-size: 12px;">感谢您的留言！</p>
    </div>
  `;
}
