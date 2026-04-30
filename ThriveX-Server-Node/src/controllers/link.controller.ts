import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';

const prisma = new PrismaClient();

class LinkController {
  async addLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, url, logo, description, status, order, typeId } = req.body;
      const link = await prisma.link.create({
        data: { name, url, logo, description, status, order, typeId },
      });
      res.json(success(link));
    } catch (err) {
      console.error('addLink error:', err);
      res.json(error('添加链接失败'));
    }
  }

  async deleteLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.link.delete({ where: { id: parseInt(id) } });
      res.json(success());
    } catch (err) {
      console.error('deleteLink error:', err);
      res.json(error('删除链接失败'));
    }
  }

  async editLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, name, url, logo, description, status, order, typeId } = req.body;
      await prisma.link.update({
        where: { id },
        data: { name, url, logo, description, status, order, typeId },
      });
      res.json(success());
    } catch (err) {
      console.error('editLink error:', err);
      res.json(error('编辑链接失败'));
    }
  }

  async getLinkList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const links = await prisma.link.findMany({
        where: { status: 1 },
        include: { linkType: true },
        orderBy: { order: 'asc' },
      });
      res.json(success(links));
    } catch (err) {
      console.error('getLinkList error:', err);
      res.json(error('获取链接列表失败'));
    }
  }

  async getLinkType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const types = await prisma.linkType.findMany({ orderBy: { order: 'asc' } });
      res.json(success(types));
    } catch (err) {
      console.error('getLinkType error:', err);
      res.json(error('获取链接类型失败'));
    }
  }

  async addLinkType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, order } = req.body;
      const type = await prisma.linkType.create({ data: { name, order } });
      res.json(success(type));
    } catch (err) {
      console.error('addLinkType error:', err);
      res.json(error('添加链接类型失败'));
    }
  }

  async deleteLinkType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.linkType.delete({ where: { id: parseInt(id) } });
      res.json(success());
    } catch (err) {
      console.error('deleteLinkType error:', err);
      res.json(error('删除链接类型失败'));
    }
  }

  async auditLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.link.update({
        where: { id: parseInt(id) },
        data: { status: 1 },
      });
      res.json(success());
    } catch (err) {
      console.error('auditLink error:', err);
      res.json(error('审核链接失败'));
    }
  }
}

export default new LinkController();
