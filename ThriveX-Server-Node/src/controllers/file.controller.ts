import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import config from '../config';
import { uploadFile as ossUploadFile, deleteFile as ossDeleteFile } from '../services/oss.service';
import { prisma } from '../utils/prisma';

/** 允许上传的文件扩展名白名单 */
const ALLOWED_EXTENSIONS = new Set([
  // 图片
  '.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.ico', '.bmp',
  // 文档
  '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
  // 压缩包
  '.zip', '.rar', '.7z', '.tar', '.gz',
  // 音视频
  '.mp3', '.mp4', '.wav', '.avi', '.mov', '.flv',
  // 代码/文本
  '.txt', '.md', '.json', '.xml', '.csv',
]);

/** 允许上传的 MIME 类型白名单 */
const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'image/x-icon', 'image/bmp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
  'application/gzip', 'application/x-tar',
  'audio/mpeg', 'audio/wav', 'video/mp4', 'video/quicktime', 'video/x-msvideo',
  'text/plain', 'text/markdown', 'text/csv',
  'application/json', 'application/xml',
]);

class FileController {
  async uploadFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const files = req.files;
      if (!files || files.length === 0) {
        sendError(res, '请选择文件', 400);
        return;
      }

      const uploadResults = [];

      for (const file of files as Express.Multer.File[]) {
        const ext = path.extname(file.originalname).toLowerCase();
        const mimetype = file.mimetype?.toLowerCase() || '';

        // 扩展名白名单校验
        if (!ALLOWED_EXTENSIONS.has(ext)) {
          sendError(res, `不支持的文件类型: ${ext}，仅允许图片、文档、压缩包、音视频等常见格式`, 400);
          return;
        }

        // MIME 类型白名单校验
        if (!ALLOWED_MIME_TYPES.has(mimetype)) {
          sendError(res, `不支持的 MIME 类型: ${mimetype}`, 400);
          return;
        }

        const fileId = uuidv4().replace(/-/g, '');
        const filename = `${fileId}${ext}`;

        const uploadResult = await ossUploadFile(file.buffer, filename, file.mimetype);

        const fileDetail = await prisma.fileDetail.create({
          data: {
            id: fileId,
            url: uploadResult.url,
            size: uploadResult.size,
            filename,
            originalFilename: file.originalname,
            ext,
            contentType: file.mimetype,
            platform: uploadResult.platform,
            createTime: new Date(),
          },
        });

        uploadResults.push(fileDetail);
      }

      // 返回 URL 字符串数组（前端编辑器需要的格式）
      const urls = uploadResults.map((item: { url: string }) => item.url);
      sendSuccess(res, urls);
    } catch (err: any) {
      console.error('uploadFile error:', err);
      const errorMessage = err?.message || '未知错误';
      sendError(res, `上传文件失败: ${errorMessage}`, 400);
    }
  }

  async deleteFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const file = await prisma.fileDetail.findUnique({ where: { id } });

      if (file) {
        if (file.platform === 'local') {
          const filePath = path.join(config.file.uploadDir, file.filename || '');
          if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
          }
        } else {
          await ossDeleteFile(file.filename || '');
        }
        await prisma.fileDetail.delete({ where: { id } });
      }

      sendSuccess(res);
    } catch (err) {
      console.error('deleteFile error:', err);
      sendError(res, '删除文件失败', 400);
    }
  }

  async getFileList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, size } = req.query;
      const pageNum = parseInt(page as string) || 1;
      const sizeNum = parseInt(size as string) || 10;

      const [files, total] = await Promise.all([
        prisma.fileDetail.findMany({
          orderBy: { createTime: 'desc' },
          skip: (pageNum - 1) * sizeNum,
          take: sizeNum,
        }),
        prisma.fileDetail.count(),
      ]);

      sendSuccess(res, {
        records: files,
        total,
        page: pageNum,
        size: sizeNum,
        totalPages: Math.ceil(total / sizeNum),
      });
    } catch (err) {
      console.error('getFileList error:', err);
      sendError(res, '获取文件列表失败', 400);
    }
  }

  async getFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const file = await prisma.fileDetail.findUnique({ where: { id } });
      sendSuccess(res, file);
    } catch (err) {
      console.error('getFile error:', err);
      sendError(res, '获取文件失败', 400);
    }
  }

  async getFileInfo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const file = await prisma.fileDetail.findUnique({ where: { id } });
      sendSuccess(res, file);
    } catch (err) {
      console.error('getFileInfo error:', err);
      sendError(res, '获取文件信息失败', 400);
    }
  }

  async getDirList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const uploadDir = config.file.uploadDir;

      if (!fs.existsSync(uploadDir)) {
        sendSuccess(res, []);
        return;
      }

      const items = fs.readdirSync(uploadDir, { withFileTypes: true });
      const dirList = items
        .filter(item => item.isDirectory())
        .map(item => ({
          name: item.name,
          path: path.join(uploadDir, item.name),
        }));

      sendSuccess(res, dirList);
    } catch (err) {
      console.error('getDirList error:', err);
      sendError(res, '获取目录列表失败', 400);
    }
  }
}

export default new FileController();
