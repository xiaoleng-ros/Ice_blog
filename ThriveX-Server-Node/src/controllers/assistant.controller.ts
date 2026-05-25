import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { prisma } from '../utils/prisma';

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
      sendSuccess(res, safeAssistants);
    } catch (err) {
      console.error('getAssistantList error:', err);
      sendError(res, '获取助手列表失败', 400);
    }
  }

  async addAssistant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, key, url, model, isDefault } = req.body;
      const assistant = await prisma.assistant.create({
        data: { name, key, url, model, isDefault },
      });
      sendSuccess(res, assistant);
    } catch (err) {
      console.error('addAssistant error:', err);
      sendError(res, '添加助手失败', 400);
    }
  }

  async deleteAssistant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.assistant.delete({ where: { id: parseInt(id) } });
      sendSuccess(res);
    } catch (err) {
      console.error('deleteAssistant error:', err);
      sendError(res, '删除助手失败', 400);
    }
  }

  async editAssistant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, name, key, url, model, isDefault } = req.body;
      await prisma.assistant.update({
        where: { id: parseInt(id) },
        data: { name, key, url, model, isDefault },
      });
      sendSuccess(res);
    } catch (err) {
      console.error('editAssistant error:', err);
      sendError(res, '编辑助手失败', 400);
    }
  }

  async chat(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { message, assistantId } = req.body;

      const assistant = assistantId
        ? await prisma.assistant.findUnique({ where: { id: assistantId } })
        : await prisma.assistant.findFirst({ where: { isDefault: true } });

      if (!assistant) {
        sendError(res, '未配置AI助手', 400);
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

      sendSuccess(res, { reply });
    } catch (err) {
      console.error('chat error:', err);
      sendError(res, 'AI对话失败', 400);
    }
  }

  async getDefaultAssistant(req: AuthRequest, res: Response): Promise<void> {
    try {
      const assistant = await prisma.assistant.findFirst({ where: { isDefault: true } });
      if (!assistant) {
        sendSuccess(res, null);
        return;
      }
      sendSuccess(res, { name: assistant.name, model: assistant.model });
    } catch (err) {
      console.error('getDefaultAssistant error:', err);
      sendError(res, '获取默认助手失败', 400);
    }
  }

  async setDefault(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.$transaction([
        prisma.assistant.updateMany({ data: { isDefault: false } }),
        prisma.assistant.update({ where: { id: parseInt(id) }, data: { isDefault: true } }),
      ]);

      sendSuccess(res);
    } catch (err) {
      console.error('setDefault error:', err);
      sendError(res, '设置默认助手失败', 400);
    }
  }
}

export default new AssistantController();
