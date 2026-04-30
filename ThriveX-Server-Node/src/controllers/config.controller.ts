import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';

const prisma = new PrismaClient();

class ConfigController {
  async getWebConfig(req: AuthRequest, res: Response): Promise<void> {
    try {
      const configs = await prisma.webConfig.findMany();
      const configMap: Record<string, any> = {};
      configs.forEach((cfg: { name: string; value: any }) => {
        configMap[cfg.name] = cfg.value;
      });
      res.json(success(configMap));
    } catch (err) {
      console.error('getWebConfig error:', err);
      res.json(error('获取网站配置失败'));
    }
  }

  async getWebConfigByName(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const config = await prisma.webConfig.findUnique({
        where: { name },
      });
      res.json(success(config));
    } catch (err) {
      console.error('getWebConfigByName error:', err);
      res.json(error('获取网站配置失败'));
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

      res.json(success());
    } catch (err) {
      console.error('editWebConfig error:', err);
      res.json(error('编辑网站配置失败'));
    }
  }

  async getPageConfig(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { pageName } = req.query;
      if (!pageName) {
        res.json(error('请提供页面名称'));
        return;
      }

      const config = await prisma.pageConfig.findUnique({
        where: { pageName: pageName as string },
      });
      res.json(success(config));
    } catch (err) {
      console.error('getPageConfig error:', err);
      res.json(error('获取页面配置失败'));
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

      res.json(success());
    } catch (err) {
      console.error('editPageConfig error:', err);
      res.json(error('编辑页面配置失败'));
    }
  }

  async getEnvConfig(req: AuthRequest, res: Response): Promise<void> {
    try {
      const configs = await prisma.envConfig.findMany();
      res.json(success(configs));
    } catch (err) {
      console.error('getEnvConfig error:', err);
      res.json(error('获取环境配置失败'));
    }
  }

  async getEnvConfigByName(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name } = req.params;
      const config = await prisma.envConfig.findUnique({
        where: { name },
      });
      if (!config) {
        res.json(error('获取环境配置失败'));
        return;
      }
      res.json(success(config));
    } catch (err) {
      console.error('getEnvConfigByName error:', err);
      res.json(error('获取环境配置失败'));
    }
  }

  async addEnvConfig(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, value, notes } = req.body;
      const config = await prisma.envConfig.create({
        data: { name, value, notes },
      });
      res.json(success(config));
    } catch (err) {
      console.error('addEnvConfig error:', err);
      res.json(error('添加环境配置失败'));
    }
  }

  async deleteEnvConfig(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.envConfig.delete({ where: { id: parseInt(id) } });
      res.json(success());
    } catch (err) {
      console.error('deleteEnvConfig error:', err);
      res.json(error('删除环境配置失败'));
    }
  }

  async editEnvConfig(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, name, value, notes } = req.body;
      await prisma.envConfig.update({
        where: { id },
        data: { name, value, notes },
      });
      res.json(success());
    } catch (err) {
      console.error('editEnvConfig error:', err);
      res.json(error('编辑环境配置失败'));
    }
  }
}

export default new ConfigController();
