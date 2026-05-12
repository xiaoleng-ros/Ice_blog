import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';
import { getEnabledPlatforms, switchPlatform, getCurrentPlatform, testConnection, StorageConfig } from '../services/oss.service';

const prisma = new PrismaClient();

class OssController {
  async getOssList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const ossConfigs = await prisma.oss.findMany();
      const safeConfigs = ossConfigs.map((cfg: any) => ({
        ...cfg,
        accessKey: cfg.accessKey ? '***' : '',
        secretKey: cfg.secretKey ? '***' : '',
      }));
      res.json(success(safeConfigs));
    } catch (err) {
      console.error('getOssList error:', err);
      res.json(error('获取OSS配置失败'));
    }
  }

  async getOssPlatforms(req: AuthRequest, res: Response): Promise<void> {
    try {
      const platforms = [
        { name: '本地存储', value: 'local' },
        { name: '七牛云', value: 'qiniu' },
      ];
      res.json(success(platforms));
    } catch (err) {
      console.error('getOssPlatforms error:', err);
      res.json(error('获取可用平台失败'));
    }
  }

  async getEnabledOss(req: AuthRequest, res: Response): Promise<void> {
    try {
      const enabledOss = await prisma.oss.findFirst({ where: { status: 1 } });
      if (enabledOss) {
        (enabledOss as any).accessKey = enabledOss.accessKey ? '***' : '';
        (enabledOss as any).secretKey = enabledOss.secretKey ? '***' : '';
      }
      res.json(success(enabledOss));
    } catch (err) {
      console.error('getEnabledOss error:', err);
      res.json(error('获取当前OSS配置失败'));
    }
  }

  async enableOss(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const oss = await prisma.oss.findUnique({ where: { id: parseInt(id) } });

      if (!oss) {
        res.json(error('OSS配置不存在'));
        return;
      }

      await prisma.oss.updateMany({
        data: { status: 0 },
      });

      await prisma.oss.update({
        where: { id: parseInt(id) },
        data: { status: 1 },
      });

      await switchPlatform(oss.type || 'local');

      res.json(success());
    } catch (err) {
      console.error('enableOss error:', err);
      res.json(error('启用OSS配置失败'));
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
      res.json(success(oss));
    } catch (err) {
      console.error('addOss error:', err);
      res.json(error('添加OSS配置失败'));
    }
  }

  async deleteOss(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.oss.delete({ where: { id: parseInt(id) } });
      res.json(success());
    } catch (err) {
      console.error('deleteOss error:', err);
      res.json(error('删除OSS配置失败'));
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
        where: { id },
        data: updateData,
      });
      res.json(success());
    } catch (err) {
      console.error('editOss error:', err);
      res.json(error('编辑OSS配置失败'));
    }
  }

  async testOssConnection(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const oss = await prisma.oss.findUnique({ where: { id: parseInt(id) } });

      if (!oss) {
        res.json(error('OSS配置不存在'));
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
      res.json(success({ connected: result.success, message: result.message }));
    } catch (err: any) {
      console.error('testOssConnection error:', err);
      res.json(error(`测试连接失败: ${err.message || '未知错误'}`));
    }
  }
}

export default new OssController();
