import { Response } from 'express';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { prisma } from '../utils/prisma';

class TagController {
  /**
   * 新增标签
   * @description 如果未提供 mark，则自动从 name 生成（转小写、空格替换为连字符、去除非字母数字中文的字符）
   */
  async addTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { name, icon, mark } = req.body;
      // 未提供 mark 时自动从 name 生成标识符
      const tagMark = mark || name.replace(/\s+/g, '-').toLowerCase();
      const tag = await prisma.tag.create({ data: { name, icon, mark: tagMark } });
      sendSuccess(res, tag);
    } catch (err: any) {
      console.error('addTag error:', err);
      // 处理唯一约束冲突（mark 重复）
      const message = err?.code === 'P2002'
        ? '标签名称或标识已存在，请更换后重试'
        : '创建标签失败';
      sendError(res, message, 400);
    }
  }

  async deleteTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      await prisma.tag.delete({ where: { id: parseInt(id) } });
      sendSuccess(res);
    } catch (err) {
      console.error('deleteTag error:', err);
      sendError(res, '删除标签失败', 400);
    }
  }

  async editTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, name, icon, mark } = req.body;
      await prisma.tag.update({ where: { id: parseInt(id) }, data: { name, icon, mark } });
      sendSuccess(res);
    } catch (err) {
      console.error('editTag error:', err);
      sendError(res, '编辑标签失败', 400);
    }
  }

  async getTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const tag = await prisma.tag.findUnique({ where: { id: parseInt(id) } });
      sendSuccess(res, tag);
    } catch (err) {
      console.error('getTag error:', err);
      sendError(res, '获取标签失败', 400);
    }
  }

  async getTagList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tags = await prisma.tag.findMany();
      sendSuccess(res, tags);
    } catch (err) {
      console.error('getTagList error:', err);
      sendError(res, '获取标签列表失败', 400);
    }
  }

  async getTagArticleCount(req: AuthRequest, res: Response): Promise<void> {
    try {
      const tags = await prisma.tag.findMany({
        include: {
          articleTags: {
            include: {
              article: {
                include: {
                  articleConfig: true,
                },
              },
            },
          },
        },
      });

      const result = tags.map(tag => ({
        id: tag.id,
        name: tag.name,
        icon: tag.icon,
        mark: tag.mark,
        articleCount: tag.articleTags.filter(at =>
          at.article.articleConfig &&
          at.article.articleConfig.isDel === false &&
          at.article.articleConfig.status === 'default'
        ).length,
      }));

      sendSuccess(res, result);
    } catch (err) {
      console.error('getTagArticleCount error:', err);
      sendError(res, '获取标签文章数量失败', 400);
    }
  }
}

export default new TagController();
