import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { prisma } from '../utils/prisma';

class ConfigController {
  async getWebConfig(req: AuthRequest, res: Response): Promise<void> {
    try {
      const configs = await prisma.webConfig.findMany();
      const configMap: Record<string, any> = {};
      configs.forEach((cfg: { name: string; value: any }) => {
        configMap[cfg.name] = cfg.value;
      });
      sendSuccess(res, configMap);
    } catch (err) {
      console.error('getWebConfig error:', err);
      sendError(res, '获取网站配置失败', 400);
    }
  }

  async getWebConfigByName(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const config = await prisma.webConfig.findUnique({
        where: { name },
      });
      
      // 如果配置不存在，返回空数据而不是报错
      if (!config) {
        sendSuccess(res, { name, value: null });
        return;
      }
      
      sendSuccess(res, config);
    } catch (err) {
      console.error('getWebConfigByName error:', err);
      sendError(res, '获取网站配置失败', 400);
    }
  }

  async editWebConfig(req: AuthRequest, res: Response): Promise<void> {
    try {
      const configData = req.body;

      for (const [name, value] of Object.entries(configData)) {
        await prisma.webConfig.upsert({
          where: { name },
          update: { value: value as any },
          create: { name, value: value as any },
        });
      }

      sendSuccess(res);
    } catch (err) {
      console.error('editWebConfig error:', err);
      sendError(res, '编辑网站配置失败', 400);
    }
  }

  async getPageConfig(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { pageName } = req.query;
      
      // 如果没有提供 pageName，返回所有页面配置列表
      if (!pageName) {
        const configs = await prisma.pageConfig.findMany();
        sendSuccess(res, configs);
        return;
      }

      const config = await prisma.pageConfig.findUnique({
        where: { pageName: pageName as string },
      });
      sendSuccess(res, config);
    } catch (err) {
      console.error('getPageConfig error:', err);
      sendError(res, '获取页面配置失败', 400);
    }
  }

  async editPageConfig(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { pageName, config } = req.body;

      await prisma.pageConfig.upsert({
        where: { pageName },
        update: { config },
        create: { pageName, config },
      });

      sendSuccess(res);
    } catch (err) {
      console.error('editPageConfig error:', err);
      sendError(res, '编辑页面配置失败', 400);
    }
  }

  async getEnvConfig(req: AuthRequest, res: Response): Promise<void> {
    try {
      const configs = await prisma.envConfig.findMany();
      sendSuccess(res, configs);
    } catch (err) {
      console.error('getEnvConfig error:', err);
      sendError(res, '获取环境配置失败', 400);
    }
  }

  async getEnvConfigByName(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const config = await prisma.envConfig.findUnique({
        where: { name },
      });
      if (!config) {
        sendSuccess(res, null);
        return;
      }
      sendSuccess(res, config);
    } catch (err) {
      console.error('getEnvConfigByName error:', err);
      sendError(res, '获取环境配置失败', 400);
    }
  }

  async addEnvConfig(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, value, notes } = req.body;
      const config = await prisma.envConfig.create({
        data: { name, value, notes },
      });
      sendSuccess(res, config);
    } catch (err) {
      console.error('addEnvConfig error:', err);
      sendError(res, '添加环境配置失败', 400);
    }
  }

  async deleteEnvConfig(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.envConfig.delete({ where: { id: parseInt(id) } });
      sendSuccess(res);
    } catch (err) {
      console.error('deleteEnvConfig error:', err);
      sendError(res, '删除环境配置失败', 400);
    }
  }

  async editEnvConfig(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, name, value, notes } = req.body;
      await prisma.envConfig.update({
        where: { id: parseInt(id) },
        data: { name, value, notes },
      });
      sendSuccess(res);
    } catch (err) {
      console.error('editEnvConfig error:', err);
      sendError(res, '编辑环境配置失败', 400);
    }
  }
}

export default new ConfigController();
