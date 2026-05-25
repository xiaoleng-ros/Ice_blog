import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { prisma } from '../utils/prisma';

class LinkController {
  async addLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, url, logo, description, status, order, typeId } = req.body;
      const link = await prisma.link.create({
        data: { name, url, logo, description, status, order, typeId },
      });
      sendSuccess(res, link);
    } catch (err) {
      console.error('addLink error:', err);
      sendError(res, '添加链接失败', 400);
    }
  }

  async deleteLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.link.delete({ where: { id: parseInt(id) } });
      sendSuccess(res);
    } catch (err) {
      console.error('deleteLink error:', err);
      sendError(res, '删除链接失败', 400);
    }
  }

  async editLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, name, url, logo, description, status, order, typeId } = req.body;
      await prisma.link.update({
        where: { id: parseInt(id) },
        data: { name, url, logo, description, status, order, typeId },
      });
      sendSuccess(res);
    } catch (err) {
      console.error('editLink error:', err);
      sendError(res, '编辑链接失败', 400);
    }
  }

  async getLinkList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const links = await prisma.link.findMany({
        where: { status: 1 },
        include: { linkType: true },
        orderBy: { order: 'asc' },
      });
      sendSuccess(res, links);
    } catch (err) {
      console.error('getLinkList error:', err);
      sendError(res, '获取链接列表失败', 400);
    }
  }

  async getLinkType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const types = await prisma.linkType.findMany({ orderBy: { order: 'asc' } });
      sendSuccess(res, types);
    } catch (err) {
      console.error('getLinkType error:', err);
      sendError(res, '获取链接类型失败', 400);
    }
  }

  async addLinkType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, order } = req.body;
      const type = await prisma.linkType.create({ data: { name, order } });
      sendSuccess(res, type);
    } catch (err) {
      console.error('addLinkType error:', err);
      sendError(res, '添加链接类型失败', 400);
    }
  }

  async deleteLinkType(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.linkType.delete({ where: { id: parseInt(id) } });
      sendSuccess(res);
    } catch (err) {
      console.error('deleteLinkType error:', err);
      sendError(res, '删除链接类型失败', 400);
    }
  }

  async auditLink(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.link.update({
        where: { id: parseInt(id) },
        data: { status: 1 },
      });
      sendSuccess(res);
    } catch (err) {
      console.error('auditLink error:', err);
      sendError(res, '审核链接失败', 400);
    }
  }
}

export default new LinkController();
