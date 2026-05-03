import { Response } from 'express';
import { PrismaClient, Prisma } from '@prisma/client';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';
import { isAdmin } from '../utils/auth';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';

const prisma = new PrismaClient();

class ArticleController {
  async addArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, description, content, cover, cateIds, tagIds, config, createTime } = req.body;

      const article = await prisma.article.create({
        data: {
          title,
          description,
          content,
          cover,
          createTime: createTime || Date.now().toString(),
        },
      });

      if (cateIds && cateIds.length > 0) {
        await prisma.articleCate.createMany({
          data: cateIds.map((cateId: number) => ({
            articleId: article.id,
            cateId,
          })),
        });
      }

      if (tagIds && tagIds.length > 0) {
        await prisma.articleTag.createMany({
          data: tagIds.map((tagId: number) => ({
            articleId: article.id,
            tagId,
          })),
        });
      }

      await prisma.articleConfig.create({
        data: {
          articleId: article.id,
          status: config?.status || 'default',
          password: config?.password || '',
          isEncrypt: config?.isEncrypt === 1 || config?.isEncrypt === true,
          isDraft: config?.isDraft === 1 || config?.isDraft === true,
          isDel: config?.isDel === 1 || config?.isDel === true,
        },
      });

      res.json(success());
    } catch (err) {
      console.error('addArticle error:', err);
      res.json(error('创建文章失败'));
    }
  }

  async deleteArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, is_del } = req.params;

      if (is_del === '1') {
        await prisma.article.delete({
          where: { id: parseInt(id) },
        });
      } else {
        await prisma.articleConfig.update({
          where: { articleId: parseInt(id) },
          data: { isDel: true },
        });
      }

      res.json(success());
    } catch (err) {
      console.error('deleteArticle error:', err);
      res.json(error('删除文章失败'));
    }
  }

  async reductionArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.articleConfig.update({
        where: { articleId: parseInt(id) },
        data: { isDel: false },
      });

      res.json(success());
    } catch (err) {
      console.error('reductionArticle error:', err);
      res.json(error('还原文章失败'));
    }
  }

  async batchDeleteArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      await prisma.articleConfig.updateMany({
        where: { articleId: { in: ids } },
        data: { isDel: true },
      });

      res.json(success());
    } catch (err) {
      console.error('batchDeleteArticle error:', err);
      res.json(error('批量删除文章失败'));
    }
  }

  async editArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, title, description, content, cover, cateIds, tagIds, config, createTime } = req.body;

      await prisma.article.update({
        where: { id },
        data: {
          title,
          description,
          content,
          cover,
          createTime: createTime || undefined,
        },
      });

      if (cateIds) {
        await prisma.articleCate.deleteMany({
          where: { articleId: id },
        });
        if (cateIds.length > 0) {
          await prisma.articleCate.createMany({
            data: cateIds.map((cateId: number) => ({
              articleId: id,
              cateId,
            })),
          });
        }
      }

      if (tagIds) {
        await prisma.articleTag.deleteMany({
          where: { articleId: id },
        });
        if (tagIds.length > 0) {
          await prisma.articleTag.createMany({
            data: tagIds.map((tagId: number) => ({
              articleId: id,
              tagId,
            })),
          });
        }
      }

      if (config) {
        await prisma.articleConfig.update({
          where: { articleId: id },
          data: {
            status: config.status || 'default',
            password: config.password || '',
            isEncrypt: config.isEncrypt === 1 || config.isEncrypt === true,
            isDraft: config.isDraft === 1 || config.isDraft === true,
            isDel: config.isDel === 1 || config.isDel === true,
          },
        });
      }

      res.json(success());
    } catch (err) {
      console.error('editArticle error:', err);
      res.json(error('编辑文章失败'));
    }
  }

  async getArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;
      const { password } = req.query;
      const token = req.headers.authorization?.replace('Bearer ', '');
      const admin = token ? isAdmin(req) : false;

      const article = await prisma.article.findUnique({
        where: { id: parseInt(id) },
        include: {
          articleConfig: true,
          articleCates: { include: { cate: true } },
          articleTags: { include: { tag: true } },
        },
      });

      if (!article) {
        res.json(error('文章不存在'));
        return;
      }

      if (article.articleConfig?.isEncrypt && !admin) {
        if (!password) {
          res.json(error('请输入文章访问密码', 612));
          return;
        }
        if (password !== article.articleConfig.password) {
          res.json(error('文章访问密码错误', 613));
          return;
        }
      }

      if (article.articleConfig?.isEncrypt && !admin) {
        article.description = '该文章是加密的';
        article.content = '该文章是加密的';
      }

      const prevArticle = await prisma.article.findFirst({
        where: {
          id: { lt: parseInt(id) },
          articleConfig: {
            isDel: false,
            status: 'default',
          },
        },
        orderBy: { id: 'desc' },
        select: { id: true, title: true },
      });

      const nextArticle = await prisma.article.findFirst({
        where: {
          id: { gt: parseInt(id) },
          articleConfig: {
            isDel: false,
            status: 'default',
          },
        },
        orderBy: { id: 'asc' },
        select: { id: true, title: true },
      });

      const result = {
        ...article,
        prev: prevArticle || null,
        next: nextArticle || null,
      };

      res.json(success(result));
    } catch (err) {
      console.error('getArticle error:', err);
      res.json(error('获取文章失败'));
    }
  }

  async getArticleList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, size, key, status, isDraft, isDel } = req.query;

      const where: any = {};

      if (key) {
        where.OR = [
          { title: { contains: key as string, mode: 'insensitive' } },
          { description: { contains: key as string, mode: 'insensitive' } },
        ];
      }

      const articleConfigWhere: any = {};
      
      if (isDraft !== undefined) {
        articleConfigWhere.isDraft = isDraft === '1' || isDraft === 'true';
      }
      
      if (isDel !== undefined) {
        articleConfigWhere.isDel = isDel === '1' || isDel === 'true';
      }
      
      if (status) {
        articleConfigWhere.status = status as string;
      }
      
      if (Object.keys(articleConfigWhere).length > 0) {
        where.articleConfig = articleConfigWhere;
      }

      const pageNum = parseInt(page as string) || 1;
      const sizeNum = parseInt(size as string) || 10;
      const skip = (pageNum - 1) * sizeNum;

      const [articles, total] = await Promise.all([
        prisma.article.findMany({
          where,
          include: {
            articleConfig: true,
            articleCates: { include: { cate: true } },
            articleTags: { include: { tag: true } },
          },
          orderBy: { createTime: 'desc' },
          skip,
          take: sizeNum,
        }),
        prisma.article.count({ where }),
      ]);

      res.json(success({
        result: articles,
        total,
        page: pageNum,
        size: sizeNum,
        pages: Math.ceil(total / sizeNum),
      }));
    } catch (err) {
      console.error('getArticleList error:', err);
      res.json(error('获取文章列表失败'));
    }
  }

  async getArticleByCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cate_id } = req.params;

      const articleCates = await prisma.articleCate.findMany({
        where: { cateId: parseInt(cate_id) },
        include: {
          article: {
            include: {
              articleConfig: true,
              articleCates: { include: { cate: true } },
              articleTags: { include: { tag: true } },
            },
          },
        },
      });

      const articles = articleCates
        .filter((ac: { article: { articleConfig: { isDel: boolean } | null } }) => ac.article.articleConfig && !ac.article.articleConfig.isDel)
        .map((ac: { article: any }) => ac.article);

      res.json(success(articles));
    } catch (err) {
      console.error('getArticleByCate error:', err);
      res.json(error('获取分类文章失败'));
    }
  }

  async getArticleByTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { tag_id } = req.params;

      const articleTags = await prisma.articleTag.findMany({
        where: { tagId: parseInt(tag_id) },
        include: {
          article: {
            include: {
              articleConfig: true,
              articleCates: { include: { cate: true } },
              articleTags: { include: { tag: true } },
            },
          },
        },
      });

      const articles = articleTags
        .filter((at: { article: { articleConfig: { isDel: boolean } | null } }) => at.article.articleConfig && !at.article.articleConfig.isDel)
        .map((at: { article: any }) => at.article);

      res.json(success(articles));
    } catch (err) {
      console.error('getArticleByTag error:', err);
      res.json(error('获取标签文章失败'));
    }
  }

  async getHotArticles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const articles = await prisma.article.findMany({
        include: {
          articleConfig: true,
        },
        orderBy: { view: 'desc' },
        take: 10,
      });

      const filtered = articles.filter(
        (a: { articleConfig: { isDel: boolean; status: string } | null }) => a.articleConfig && !a.articleConfig.isDel && a.articleConfig.status === 'default'
      );

      res.json(success(filtered));
    } catch (err) {
      console.error('getHotArticles error:', err);
      res.json(error('获取热门文章失败'));
    }
  }

  async getRandomArticles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const articles = await prisma.article.findMany({
        include: {
          articleConfig: true,
        },
        where: {
          articleConfig: {
            isDel: false,
            status: 'default',
          },
        },
      });

      const shuffled = articles.sort(() => Math.random() - 0.5);
      res.json(success(shuffled.slice(0, 5)));
    } catch (err) {
      console.error('getRandomArticles error:', err);
      res.json(error('获取随机文章失败'));
    }
  }

  async incrementView(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.article.update({
        where: { id: parseInt(id) },
        data: { view: { increment: 1 } },
      });

      res.json(success());
    } catch (err) {
      console.error('incrementView error:', err);
      res.json(error('更新浏览量失败'));
    }
  }

  async getArchives(req: AuthRequest, res: Response): Promise<void> {
    try {
      const articles = await prisma.article.findMany({
        include: {
          articleConfig: true,
        },
        where: {
          articleConfig: {
            isDel: false,
            status: 'default',
          },
        },
        orderBy: { createTime: 'desc' },
      });

      const archives: Record<string, any[]> = {};

      articles.forEach((article: any) => {
        const year = article.createTime.substring(0, 4);
        if (!archives[year]) {
          archives[year] = [];
        }
        archives[year].push(article);
      });

      res.json(success(archives));
    } catch (err) {
      console.error('getArchives error:', err);
      res.json(error('获取文章归档失败'));
    }
  }

  async importArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const form = formidable({
        multiples: true,
        uploadDir: './uploads',
        keepExtensions: true,
      });

      form.parse(req, async (err, fields, files) => {
        if (err) {
          console.error('importArticle parse error:', err);
          res.json(error('解析文件失败'));
          return;
        }

        const fileList = Array.isArray(files.list) ? files.list : [files.list];

        for (const file of fileList) {
          if (!file) continue;

          const filePath = file.filepath;
          const content = fs.readFileSync(filePath, 'utf-8');

          if (!file.originalFilename?.endsWith('.md')) {
            fs.unlinkSync(filePath);
            continue;
          }

          const lines = content.split('\n');
          let title = '';
          let description = '';
          const articleContentLines: string[] = [];

          let foundTitle = false;
          let foundDescription = false;
          let startContent = false;

          for (const line of lines) {
            if (!foundTitle && line.startsWith('# ')) {
              title = line.substring(2).trim();
              foundTitle = true;
              continue;
            }

            if (!foundDescription && line.trim() === '') {
              foundDescription = true;
              continue;
            }

            if (foundDescription && !foundTitle && line.startsWith('#')) {
              foundDescription = false;
              foundTitle = true;
              title = line.substring(2).trim();
              continue;
            }

            if (foundDescription && !line.startsWith('#')) {
              description = line.trim();
              foundDescription = false;
              startContent = true;
              continue;
            }

            if (startContent) {
              articleContentLines.push(line);
            }
          }

          const articleContent = articleContentLines.join('\n').trim();

          if (title) {
            await prisma.article.create({
              data: {
                title,
                description: description || '',
                content: articleContent || '',
                cover: '',
                createTime: Date.now().toString(),
              },
            });
          }

          fs.unlinkSync(filePath);
        }

        res.json(success());
      });
    } catch (err) {
      console.error('importArticle error:', err);
      res.json(error('导入文章失败'));
    }
  }

  async exportArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      const where = ids && ids.length > 0
        ? { id: { in: ids as number[] } }
        : {};

      const articles = await prisma.article.findMany({
        where,
        include: {
          articleCates: { include: { cate: true } },
          articleTags: { include: { tag: true } },
        },
      });

      const zip = new JSZip();

      for (const article of articles) {
        const categories = article.articleCates.map((ac: { cate: { name: string } }) => ac.cate.name).join(', ');
        const tags = article.articleTags.map((at: { tag: { name: string } }) => at.tag.name).join(', ');

        const markdownContent = `# ${article.title}\n\n${article.description}\n\n${article.content}\n\n---\n分类: ${categories || '未分类'}\n标签: ${tags || '无'}\n创建时间: ${article.createTime}\n`;

        const safeFileName = article.title.replace(/[<>:"/\\|?*]/g, '_');
        zip.file(`${safeFileName}.md`, markdownContent);
      }

      const zipBuffer = await zip.generateAsync({ type: 'nodebuffer' });

      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', `attachment; filename=articles_${Date.now()}.zip`);
      res.send(zipBuffer);
    } catch (err) {
      console.error('exportArticle error:', err);
      res.json(error('导出文章失败'));
    }
  }
}

export default new ArticleController();
