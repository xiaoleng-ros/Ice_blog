import { Response } from 'express';
import { Prisma } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { isAdmin } from '../utils/auth';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';
import JSZip from 'jszip';
import { prisma } from '../utils/prisma';
import cache from '../utils/cache';

class ArticleController {
  async addArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { title, description, content, cover, cateIds, tagIds, config } = req.body;

      const article = await prisma.article.create({
        data: {
          title,
          description,
          content,
          cover,
          createTime: Date.now().toString(),
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

      // 加密文章密码使用 bcrypt hash
      const hashedPassword = config?.password ? await bcrypt.hash(config.password, 10) : '';

      await prisma.articleConfig.create({
        data: {
          articleId: article.id,
          status: config?.status || 'default',
          password: hashedPassword,
          isEncrypt: config?.isEncrypt === 1 || config?.isEncrypt === true,
          isDraft: config?.isDraft === 1 || config?.isDraft === true,
          isDel: config?.isDel === 1 || config?.isDel === true,
        },
      });

      // 新增文章后清除热门/随机文章缓存
      cache.del('article_hot');
      cache.del('article_random');
      sendSuccess(res, { id: article.id });
    } catch (err) {
      console.error('addArticle error:', err);
      sendError(res, '创建文章失败', 400);
    }
  }

  async deleteArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, isDel } = req.params;

      if (isDel === '1') {
        await prisma.article.delete({
          where: { id: parseInt(id) },
        });
      } else {
        await prisma.articleConfig.update({
          where: { articleId: parseInt(id) },
          data: { isDel: true },
        });
      }

      cache.del('article_hot');
      cache.del('article_random');
      sendSuccess(res);
    } catch (err) {
      console.error('deleteArticle error:', err);
      sendError(res, '删除文章失败', 400);
    }
  }

  async reductionArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.articleConfig.update({
        where: { articleId: parseInt(id) },
        data: { isDel: false },
      });

      cache.del('article_hot');
      cache.del('article_random');
      sendSuccess(res);
    } catch (err) {
      console.error('reductionArticle error:', err);
      sendError(res, '还原文章失败', 400);
    }
  }

  async batchDeleteArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      await prisma.articleConfig.updateMany({
        where: { articleId: { in: ids } },
        data: { isDel: true },
      });

      cache.del('article_hot');
      cache.del('article_random');
      sendSuccess(res);
    } catch (err) {
      console.error('batchDeleteArticle error:', err);
      sendError(res, '批量删除文章失败', 400);
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
        // 加密文章密码使用 bcrypt hash
        const hashedPassword = config.password ? await bcrypt.hash(config.password, 10) : '';

        await prisma.articleConfig.update({
          where: { articleId: id },
          data: {
            status: config.status || 'default',
            password: hashedPassword,
            isEncrypt: config.isEncrypt === 1 || config.isEncrypt === true,
            isDraft: config.isDraft === 1 || config.isDraft === true,
            isDel: config.isDel === 1 || config.isDel === true,
          },
        });
      }

      cache.del('article_hot');
      cache.del('article_random');
      sendSuccess(res);
    } catch (err) {
      console.error('editArticle error:', err);
      sendError(res, '编辑文章失败', 400);
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
        sendError(res, '文章不存在', 400);
        return;
      }

      if (article.articleConfig?.isEncrypt && !admin) {
        if (!password) {
          sendError(res, '请输入文章访问密码', 403);
          return;
        }
        // 使用 bcrypt 比对加密密码
        const isPasswordValid = await bcrypt.compare(password as string, article.articleConfig.password || '');
        if (!isPasswordValid) {
          sendError(res, '文章访问密码错误', 403);
          return;
        }
      }

      const articleId = parseInt(id);

      const [prevArticle, nextArticle] = await Promise.all([
        prisma.article.findFirst({
          where: {
            id: { lt: articleId },
            articleConfig: {
              isDel: false,
              status: 'default',
            },
          },
          orderBy: { id: 'desc' },
          select: { id: true, title: true },
        }),
        prisma.article.findFirst({
          where: {
            id: { gt: articleId },
            articleConfig: {
              isDel: false,
              status: 'default',
            },
          },
          orderBy: { id: 'asc' },
          select: { id: true, title: true },
        }),
      ]);

      const result = {
        ...article,
        cateList: article.articleCates?.map((ac) => ac.cate) || [],
        tagList: article.articleTags?.map((at) => at.tag) || [],
        prev: prevArticle || null,
        next: nextArticle || null,
      };

      sendSuccess(res, result);
    } catch (err) {
      console.error('getArticle error:', err);
      sendError(res, '获取文章失败', 400);
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
      
      // 默认过滤草稿，除非明确指定 isDraft 参数
      if (isDraft !== undefined) {
        articleConfigWhere.isDraft = isDraft === '1' || isDraft === 'true';
      } else {
        articleConfigWhere.isDraft = false;
      }
      
      if (isDel !== undefined) {
        articleConfigWhere.isDel = isDel === '1' || isDel === 'true';
      } else {
        articleConfigWhere.isDel = false;
      }
      
      if (status) {
        articleConfigWhere.status = status as string;
      }
      
      where.articleConfig = articleConfigWhere;

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

      // 将 Prisma 返回的 articleCates 和 articleTags 映射为前端期望的 cateList 和 tagList
      const mappedArticles = articles.map((article) => ({
        ...article,
        cateList: article.articleCates?.map((ac) => ac.cate) || [],
        tagList: article.articleTags?.map((at) => at.tag) || [],
      }));

      sendSuccess(res, {
        result: mappedArticles,
        total,
        page: pageNum,
        size: sizeNum,
        pages: Math.ceil(total / sizeNum),
      });
    } catch (err) {
      console.error('getArticleList error:', err);
      sendError(res, '获取文章列表失败', 400);
    }
  }

  async getArticleByCate(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { cateId: cateIdStr } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const size = parseInt(req.query.size as string) || 10;
      const skip = (page - 1) * size;

      const cateId = parseInt(cateIdStr);

      const [articleCates, total] = await Promise.all([
        prisma.articleCate.findMany({
          where: {
            cateId,
            article: {
              articleConfig: {
                isDel: false,
              },
            },
          },
          skip,
          take: size,
          include: {
            article: {
              include: {
                articleConfig: true,
                articleCates: { include: { cate: true } },
                articleTags: { include: { tag: true } },
              },
            },
          },
        }),
        prisma.articleCate.count({
          where: {
            cateId,
            article: {
              articleConfig: {
                isDel: false,
              },
            },
          },
        }),
      ]);

      const articles = articleCates.map((ac: { article: any }) => ac.article);

      sendSuccess(res, {
        result: articles,
        total,
        page,
        size,
        pages: Math.ceil(total / size),
      });
    } catch (err) {
      console.error('getArticleByCate error:', err);
      sendError(res, '获取分类文章失败', 400);
    }
  }

  async getArticleByTag(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { tagId: tagIdStr } = req.params;
      const page = parseInt(req.query.page as string) || 1;
      const size = parseInt(req.query.size as string) || 10;
      const skip = (page - 1) * size;

      const tagId = parseInt(tagIdStr);

      const [articleTags, total] = await Promise.all([
        prisma.articleTag.findMany({
          where: {
            tagId,
            article: {
              articleConfig: {
                isDel: false,
              },
            },
          },
          skip,
          take: size,
          include: {
            article: {
              include: {
                articleConfig: true,
                articleCates: { include: { cate: true } },
                articleTags: { include: { tag: true } },
              },
            },
          },
        }),
        prisma.articleTag.count({
          where: {
            tagId,
            article: {
              articleConfig: {
                isDel: false,
              },
            },
          },
        }),
      ]);

      const articles = articleTags.map((at: { article: any }) => at.article);

      sendSuccess(res, {
        result: articles,
        total,
        page,
        size,
        pages: Math.ceil(total / size),
      });
    } catch (err) {
      console.error('getArticleByTag error:', err);
      sendError(res, '获取标签文章失败', 400);
    }
  }

  async getHotArticles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const CACHE_KEY = 'article_hot';
      const cached = cache.get(CACHE_KEY);
      if (cached) {
        sendSuccess(res, cached);
        return;
      }

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
        orderBy: { view: 'desc' },
        take: 10,
      });

            cache.set('article_hot', articles);
      sendSuccess(res, articles);
    } catch (err) {
      console.error('getHotArticles error:', err);
      sendError(res, '获取热门文章失败', 400);
    }
  }

  async getRandomArticles(req: AuthRequest, res: Response): Promise<void> {
    try {
      const CACHE_KEY = 'article_random';
      const cached = cache.get(CACHE_KEY);
      if (cached) {
        sendSuccess(res, cached);
        return;
      }

      const total = await prisma.article.count({
        where: {
          articleConfig: {
            isDel: false,
            status: 'default',
          },
        },
      });

      const take = Math.min(5, total);
      const skip = total > take ? Math.floor(Math.random() * (total - take)) : 0;

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
        orderBy: { id: 'asc' },
        skip,
        take,
      });

            cache.set('article_random', articles);
      sendSuccess(res, articles);
    } catch (err) {
      console.error('getRandomArticles error:', err);
      sendError(res, '获取随机文章失败', 400);
    }
  }

  async incrementView(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.article.update({
        where: { id: parseInt(id) },
        data: { view: { increment: 1 } },
      });

      sendSuccess(res);
    } catch (err) {
      console.error('incrementView error:', err);
      sendError(res, '更新浏览量失败', 400);
    }
  }

  async getArchives(req: AuthRequest, res: Response): Promise<void> {
    try {
      // 只查询归档需要的字段，减少内存占用
      const articles = await prisma.article.findMany({
        select: {
          id: true,
          title: true,
          createTime: true,
        },
        where: {
          articleConfig: {
            isDel: false,
            status: 'default',
          },
        },
        orderBy: { createTime: 'desc' },
      });

      const archives: Record<string, { id: number; title: string; createTime: string }[]> = {};

      articles.forEach((article) => {
        const year = (article.createTime || '').substring(0, 4);
        if (!archives[year]) {
          archives[year] = [];
        }
        archives[year].push({
          id: article.id,
          title: article.title,
          createTime: article.createTime,
        });
      });

      sendSuccess(res, archives);
    } catch (err) {
      console.error('getArchives error:', err);
      sendError(res, '获取文章归档失败', 400);
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
          sendError(res, '解析文件失败', 400);
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

        sendSuccess(res);
      });
    } catch (err) {
      console.error('importArticle error:', err);
      sendError(res, '导入文章失败', 400);
    }
  }

  async exportArticle(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      if (ids !== undefined && !Array.isArray(ids)) {
        sendError(res, '参数 ids 必须是数组', 400);
        return;
      }

      const validIds = Array.isArray(ids) ? ids.filter((id: unknown) => typeof id === 'number') : [];

      const where = validIds.length > 0
        ? { id: { in: validIds } }
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
      sendError(res, '导出文章失败', 400);
    }
  }
}

export default new ArticleController();



