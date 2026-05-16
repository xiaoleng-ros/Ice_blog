import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fs from 'fs';
import config from '../config';
import { uploadFile as ossUploadFile, deleteFile as ossDeleteFile } from '../services/oss.service';

const prisma = new PrismaClient();

class FileController {
  async uploadFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const files = req.files;
      if (!files || files.length === 0) {
        res.json(error('请选择文件'));
        return;
      }

      const uploadResults = [];

      for (const file of files as Express.Multer.File[]) {
        const fileId = uuidv4().replace(/-/g, '');
        const ext = path.extname(file.originalname);
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
      res.json(success(urls));
    } catch (err: any) {
      console.error('uploadFile error:', err);
      const errorMessage = err?.message || '未知错误';
      res.json(error(`上传文件失败: ${errorMessage}`));
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

      res.json(success());
    } catch (err) {
      console.error('deleteFile error:', err);
      res.json(error('删除文件失败'));
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

      res.json(success({
        records: files,
        total,
        page: pageNum,
        size: sizeNum,
        totalPages: Math.ceil(total / sizeNum),
      }));
    } catch (err) {
      console.error('getFileList error:', err);
      res.json(error('获取文件列表失败'));
    }
  }

  async getFile(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const file = await prisma.fileDetail.findUnique({ where: { id } });
      res.json(success(file));
    } catch (err) {
      console.error('getFile error:', err);
      res.json(error('获取文件失败'));
    }
  }

  async getFileInfo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const file = await prisma.fileDetail.findUnique({ where: { id } });
      res.json(success(file));
    } catch (err) {
      console.error('getFileInfo error:', err);
      res.json(error('获取文件信息失败'));
    }
  }

  async getDirList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const uploadDir = config.file.uploadDir;

      if (!fs.existsSync(uploadDir)) {
        res.json(success([]));
        return;
      }

      const items = fs.readdirSync(uploadDir, { withFileTypes: true });
      const dirList = items
        .filter(item => item.isDirectory())
        .map(item => ({
          name: item.name,
          path: path.join(uploadDir, item.name),
        }));

      res.json(success(dirList));
    } catch (err) {
      console.error('getDirList error:', err);
      res.json(error('获取目录列表失败'));
    }
  }
}

export default new FileController();
