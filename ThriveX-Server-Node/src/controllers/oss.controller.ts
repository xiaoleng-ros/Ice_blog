import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';
import { getEnabledPlatforms, switchPlatform, getCurrentPlatform } from '../services/oss.service';

const prisma = new PrismaClient();

class OssController {
  async getOssList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const ossConfigs = await prisma.oss.findMany({ where: { status: 1 } });
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
      const platforms = await getEnabledPlatforms();
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
      const { platform, accessKey, secretKey, bucket, endPoint, domain } = req.body;

      const oss = await prisma.oss.create({
        data: {
          type: platform,
          accessKey,
          secretKey,
          bucket,
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
      await prisma.oss.update({
        where: { id },
        data: {
          type: platform,
          accessKey,
          secretKey,
          bucket,
          endpoint: endPoint,
          domain,
          status
        },
      });
      res.json(success());
    } catch (err) {
      console.error('editOss error:', err);
      res.json(error('编辑OSS配置失败'));
    }
  }
}

export default new OssController();