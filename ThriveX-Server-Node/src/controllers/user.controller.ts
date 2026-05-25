import { Response } from 'express';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../types/express';
import { sendSuccess, sendError } from '../utils/result';
import { createToken } from '../utils/jwt';
import { prisma } from '../utils/prisma';
import NodeCache from 'node-cache';

/** 登录失败计数缓存，TTL 15 分钟自动清除 */
const loginFailCache = new NodeCache({ stdTTL: 900, checkperiod: 60 });

/** 最大登录失败次数，超过后锁定 15 分钟 */
const MAX_LOGIN_FAILS = 5;

class UserController {
  async addUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username, password, nickname, avatar, email, role } = req.body;

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await prisma.user.create({
        data: {
          username,
          password: hashedPassword,
          nickname,
          avatar,
          email,
          role: role || 'user',
          createTime: new Date().toISOString(),
        },
      });

      sendSuccess(res);
    } catch (err) {
      console.error('addUser error:', err);
      sendError(res, '创建用户失败', 500);
    }
  }

  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id: parseInt(id) },
      });

      sendSuccess(res);
    } catch (err) {
      console.error('deleteUser error:', err);
      sendError(res, '删除用户失败', 500);
    }
  }

  async batchDeleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      await prisma.user.deleteMany({
        where: { id: { in: ids.map((i: any) => parseInt(i)) } },
      });

      sendSuccess(res);
    } catch (err) {
      console.error('batchDeleteUser error:', err);
      sendError(res, '批量删除用户失败', 500);
    }
  }

  async editUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id, nickname, avatar, email, role, status } = req.body;

      await prisma.user.update({
        where: { id: parseInt(id) },
        data: {
          nickname,
          avatar,
          email,
          role,
          status,
        },
      });

      sendSuccess(res);
    } catch (err) {
      console.error('editUser error:', err);
      sendError(res, '编辑用户失败', 500);
    }
  }

  async getUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      const user = await prisma.user.findUnique({
        where: { id: parseInt(id) },
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
          email: true,
          role: true,
          status: true,
          createTime: true,
        },
      });

      sendSuccess(res, user);
    } catch (err) {
      console.error('getUser error:', err);
      sendError(res, '获取用户失败', 500);
    }
  }

  async getUserList(req: AuthRequest, res: Response): Promise<void> {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
          email: true,
          role: true,
          status: true,
          createTime: true,
        },
      });

      sendSuccess(res, users);
    } catch (err) {
      console.error('getUserList error:', err);
      sendError(res, '获取用户列表失败', 500);
    }
  }

  async getUserPaging(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, size, username, nickname } = req.query;

      const where: any = {};
      if (username) where.username = { contains: username as string };
      if (nickname) where.nickname = { contains: nickname as string };

      const pageNum = parseInt(page as string) || 1;
      const sizeNum = Math.min(parseInt(size as string) || 10, 100);

      const [users, total] = await Promise.all([
        prisma.user.findMany({
          where,
          select: {
            id: true,
            username: true,
            nickname: true,
            avatar: true,
            email: true,
            role: true,
            status: true,
            createTime: true,
          },
          skip: (pageNum - 1) * sizeNum,
          take: sizeNum,
        }),
        prisma.user.count({ where }),
      ]);

      sendSuccess(res, {
        records: users,
        total,
        page: pageNum,
        size: sizeNum,
        totalPages: Math.ceil(total / sizeNum),
      });
    } catch (err) {
      console.error('getUserPaging error:', err);
      sendError(res, '分页获取用户失败', 500);
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      // 登录失败次数检查（防暴力破解）
      const cacheKey = `login_fail_${username}`;
      const failCount: number = loginFailCache.get(cacheKey) || 0;

      if (failCount >= MAX_LOGIN_FAILS) {
        sendError(res, '登录失败次数过多，请 15 分钟后再试', 429);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        loginFailCache.set(cacheKey, failCount + 1);
        sendError(res, '用户不存在', 401);
        return;
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        loginFailCache.set(cacheKey, failCount + 1);
        const remaining = MAX_LOGIN_FAILS - failCount - 1;
        sendError(res, remaining > 0 ? `密码错误，还剩 ${remaining} 次尝试机会` : '登录失败次数过多，请 15 分钟后再试', remaining > 0 ? 401 : 429);
        return;
      }

      // 登录成功，清除失败计数
      loginFailCache.del(cacheKey);

      // Invalidate all existing tokens for this user
      await prisma.userToken.deleteMany({ where: { userId: user.id } });

      const token = createToken({ userId: user.id, username: user.username, role: user.role });

      // Token 有效期改为 30 天
      const expireTime = new Date();
      expireTime.setDate(expireTime.getDate() + 30);

      await prisma.userToken.create({
        data: {
          userId: user.id,
          token,
          expireTime,
        },
      });

      sendSuccess(res, {
        token,
        userInfo: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role,
        },
      }, '登录成功');
    } catch (err) {
      console.error('login error:', err);
      sendError(res, '登录失败', 500);
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { oldPass, newPass } = req.body;
      const userId = req.user?.userId;

      if (!userId) {
        sendError(res, '未登录', 401);
        return;
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        sendError(res, '用户不存在', 404);
        return;
      }

      const isValid = await bcrypt.compare(oldPass, user.password);

      if (!isValid) {
        sendError(res, '原密码错误', 400);
        return;
      }

      const hashedPassword = await bcrypt.hash(newPass, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      sendSuccess(res);
    } catch (err) {
      console.error('changePassword error:', err);
      sendError(res, '修改密码失败', 500);
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const userId = req.user?.userId;

      if (token && token.length > 0) {
        await prisma.userToken.deleteMany({
          where: { token, userId },
        });
      }

      sendSuccess(res);
    } catch (err) {
      console.error('logout error:', err);
      sendError(res, '登出失败', 500);
    }
  }

  async getUserInfo(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
          email: true,
          role: true,
          status: true,
          createTime: true,
        },
      });

      sendSuccess(res, user);
    } catch (err) {
      console.error('getUserInfo error:', err);
      sendError(res, '获取用户信息失败', 500);
    }
  }

  async getAuthor(req: AuthRequest, res: Response): Promise<void> {
    try {
      const author = await prisma.user.findFirst({
        where: { role: 'admin' },
        select: {
          id: true,
          username: true,
          nickname: true,
          avatar: true,
          email: true,
          role: true,
        },
      });

      if (!author) {
        sendError(res, '未找到作者信息', 404);
        return;
      }

      sendSuccess(res, {
        ...author,
        name: author?.nickname || author?.username || '',
      });
    } catch (err) {
      console.error('getAuthor error:', err);
      sendError(res, '获取作者信息失败', 500);
    }
  }

  async checkToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        sendError(res, 'Token 不能为空', 400);
        return;
      }

      const tokenRecord = await prisma.userToken.findFirst({
        where: { token },
      });

      if (!tokenRecord) {
        sendError(res, 'Token 无效或已过期', 401);
        return;
      }

      if (tokenRecord.expireTime && new Date(tokenRecord.expireTime) < new Date()) {
        sendError(res, 'Token 已过期', 401);
        return;
      }

      sendSuccess(res);
    } catch (err) {
      console.error('checkToken error:', err);
      sendError(res, '校验 Token 失败', 500);
    }
  }
}

export default new UserController();
