import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';

const prisma = new PrismaClient();

class AssistantController {
  async getAssistantList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const assistants = await prisma.assistant.findMany();
      const safeAssistants = assistants.map((a: any) => ({
        id: a.id,
        name: a.name,
        url: a.url,
        model: a.model,
        isDefault: a.isDefault,
      }));
      res.json(success(safeAssistants));
    } catch (err) {
      console.error('getAssistantList error:', err);
      res.json(error('获取助手列表失败'));
    }
  }

  async addAssistant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, key, url, model, isDefault } = req.body;
      const assistant = await prisma.assistant.create({
        data: { name, key, url, model, isDefault },
      });
      res.json(success(assistant));
    } catch (err) {
      console.error('addAssistant error:', err);
      res.json(error('添加助手失败'));
    }
  }

  async deleteAssistant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.assistant.delete({ where: { id: parseInt(id) } });
      res.json(success());
    } catch (err) {
      console.error('deleteAssistant error:', err);
      res.json(error('删除助手失败'));
    }
  }

  async editAssistant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, name, key, url, model, isDefault } = req.body;
      await prisma.assistant.update({
        where: { id: parseInt(id) },
        data: { name, key, url, model, isDefault },
      });
      res.json(success());
    } catch (err) {
      console.error('editAssistant error:', err);
      res.json(error('编辑助手失败'));
    }
  }

  async chat(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { message, assistantId } = req.body;

      const assistant = assistantId
        ? await prisma.assistant.findUnique({ where: { id: assistantId } })
        : await prisma.assistant.findFirst({ where: { isDefault: true } });

      if (!assistant) {
        res.json(error('未配置AI助手'));
        return;
      }

      const response = await fetch(assistant.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${assistant.key}`,
        },
        body: JSON.stringify({
          model: assistant.model,
          messages: [{ role: 'user', content: message }],
        }),
      });

      const data: any = await response.json();
      const reply = data.choices?.[0]?.message?.content || '抱歉，我现在无法回答您的问题。';

      res.json(success({ reply }));
    } catch (err) {
      console.error('chat error:', err);
      res.json(error('AI对话失败'));
    }
  }

  async getDefaultAssistant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const assistant = await prisma.assistant.findFirst({ where: { isDefault: true } });
      if (!assistant) {
        res.json(success(null));
        return;
      }
      res.json(success({ name: assistant.name, model: assistant.model }));
    } catch (err) {
      console.error('getDefaultAssistant error:', err);
      res.json(error('获取默认助手失败'));
    }
  }

  async setDefault(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.$transaction([
        prisma.assistant.updateMany({ data: { isDefault: false } }),
        prisma.assistant.update({ where: { id: parseInt(id) }, data: { isDefault: true } }),
      ]);

      res.json(success());
    } catch (err) {
      console.error('setDefault error:', err);
      res.json(error('设置默认助手失败'));
    }
  }
}

export default new AssistantController();
