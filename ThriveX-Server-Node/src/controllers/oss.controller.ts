import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { getEnabledPlatforms, switchPlatform, getCurrentPlatform, testConnection, StorageConfig } from '../services/oss.service';
import { prisma } from '../utils/prisma';

class OssController {
  async getOssList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const ossConfigs = await prisma.oss.findMany();
      const safeConfigs = ossConfigs.map((cfg: any) => ({
        ...cfg,
        accessKey: cfg.accessKey ? '***' : '',
        secretKey: cfg.secretKey ? '***' : '',
      }));
      sendSuccess(res, safeConfigs);
    } catch (err) {
      console.error('getOssList error:', err);
      sendError(res, '获取OSS配置失败', 400);
    }
  }

  async getOssPlatforms(req: AuthRequest, res: Response): Promise<void> {
    try {
      const platforms = [
        { name: '本地存储', value: 'local' },
        { name: '七牛云', value: 'qiniu' },
      ];
      sendSuccess(res, platforms);
    } catch (err) {
      console.error('getOssPlatforms error:', err);
      sendError(res, '获取可用平台失败', 400);
    }
  }

  async getEnabledOss(req: AuthRequest, res: Response): Promise<void> {
    try {
      const enabledOss = await prisma.oss.findFirst({ where: { status: 1 } });
      if (enabledOss) {
        (enabledOss as any).accessKey = enabledOss.accessKey ? '***' : '';
        (enabledOss as any).secretKey = enabledOss.secretKey ? '***' : '';
      }
      sendSuccess(res, enabledOss);
    } catch (err) {
      console.error('getEnabledOss error:', err);
      sendError(res, '获取当前OSS配置失败', 400);
    }
  }

  async enableOss(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const oss = await prisma.oss.findUnique({ where: { id: parseInt(id) } });

      if (!oss) {
        sendError(res, 'OSS配置不存在', 400);
        return;
      }

      await prisma.$transaction([
        prisma.oss.updateMany({ data: { status: 0 } }),
        prisma.oss.update({ where: { id: parseInt(id) }, data: { status: 1 } }),
      ]);

      await switchPlatform(oss.type || 'local');

      sendSuccess(res);
    } catch (err) {
      console.error('enableOss error:', err);
      sendError(res, '启用OSS配置失败', 400);
    }
  }

  async addOss(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { platform, accessKey, secretKey, bucket, endPoint, domain, basePath } = req.body;

      const oss = await prisma.oss.create({
        data: {
          type: platform,
          accessKey: accessKey || '',
          secretKey: secretKey || '',
          bucket: bucket || '',
          endpoint: endPoint,
          domain,
          status: 0,
        },
      });
      sendSuccess(res, {
        ...oss,
        accessKey: oss.accessKey ? '***' : '',
        secretKey: oss.secretKey ? '***' : '',
      });
    } catch (err) {
      console.error('addOss error:', err);
      sendError(res, '添加OSS配置失败', 400);
    }
  }

  async deleteOss(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.oss.delete({ where: { id: parseInt(id) } });
      sendSuccess(res);
    } catch (err) {
      console.error('deleteOss error:', err);
      sendError(res, '删除OSS配置失败', 400);
    }
  }

  async editOss(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, platform, accessKey, secretKey, bucket, endPoint, domain, status } = req.body;

      const updateData: any = {
        type: platform,
        bucket: bucket || '',
        endpoint: endPoint,
        domain,
        status,
      };

      if (accessKey && accessKey !== '***') {
        updateData.accessKey = accessKey;
      }
      if (secretKey && secretKey !== '***') {
        updateData.secretKey = secretKey;
      }

      await prisma.oss.update({
        where: { id: parseInt(id) },
        data: updateData,
      });
      sendSuccess(res);
    } catch (err) {
      console.error('editOss error:', err);
      sendError(res, '编辑OSS配置失败', 400);
    }
  }

  async testOssConnection(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const oss = await prisma.oss.findUnique({ where: { id: parseInt(id) } });

      if (!oss) {
        sendError(res, 'OSS配置不存在', 400);
        return;
      }

      const config: StorageConfig = {
        platform: oss.type || 'local',
        accessKey: oss.accessKey || undefined,
        secretKey: oss.secretKey || undefined,
        bucketName: oss.bucket || undefined,
        endPoint: oss.endpoint || undefined,
        domain: oss.domain || undefined,
        basePath: (oss as any).basePath || undefined,
      };

      const result = await testConnection(config);
      sendSuccess(res, { connected: result.success, message: result.message });
    } catch (err: any) {
      console.error('testOssConnection error:', err);
      sendError(res, '测试连接失败', 400);
    }
  }
}

export default new OssController();
