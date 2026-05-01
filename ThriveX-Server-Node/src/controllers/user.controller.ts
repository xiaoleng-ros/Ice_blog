import { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { AuthRequest } from '../types/express';
import { success, error } from '../utils/result';
import { createToken } from '../utils/jwt';

const prisma = new PrismaClient();

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

      res.json(success());
    } catch (err) {
      console.error('addUser error:', err);
      res.json(error('创建用户失败'));
    }
  }

  async deleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { id } = req.params;

      await prisma.user.delete({
        where: { id: parseInt(id) },
      });

      res.json(success());
    } catch (err) {
      console.error('deleteUser error:', err);
      res.json(error('删除用户失败'));
    }
  }

  async batchDeleteUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { ids } = req.body;

      await prisma.user.deleteMany({
        where: { id: { in: ids } },
      });

      res.json(success());
    } catch (err) {
      console.error('batchDeleteUser error:', err);
      res.json(error('批量删除用户失败'));
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

      res.json(success());
    } catch (err) {
      console.error('editUser error:', err);
      res.json(error('编辑用户失败'));
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

      res.json(success(user));
    } catch (err) {
      console.error('getUser error:', err);
      res.json(error('获取用户失败'));
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

      res.json(success(users));
    } catch (err) {
      console.error('getUserList error:', err);
      res.json(error('获取用户列表失败'));
    }
  }

  async getUserPaging(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { page, size, username, nickname } = req.query;

      const where: any = {};
      if (username) where.username = { contains: username as string };
      if (nickname) where.nickname = { contains: nickname as string };

      const pageNum = parseInt(page as string) || 1;
      const sizeNum = parseInt(size as string) || 10;

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

      res.json(success({
        records: users,
        total,
        page: pageNum,
        size: sizeNum,
        totalPages: Math.ceil(total / sizeNum),
      }));
    } catch (err) {
      console.error('getUserPaging error:', err);
      res.json(error('分页获取用户失败'));
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { username, password } = req.body;

      const user = await prisma.user.findUnique({
        where: { username },
      });

      if (!user) {
        res.json(error('用户不存在'));
        return;
      }

      const isValid = await bcrypt.compare(password, user.password);

      if (!isValid) {
        res.json(error('密码错误'));
        return;
      }

      const token = createToken({ userId: user.id, username: user.username, role: user.role });

      const expireTime = new Date();
      expireTime.setDate(expireTime.getDate() + 3);

      await prisma.userToken.create({
        data: {
          userId: user.id,
          token,
          expireTime,
        },
      });

      res.json(success({
        token,
        userInfo: {
          id: user.id,
          username: user.username,
          nickname: user.nickname,
          avatar: user.avatar,
          role: user.role,
        },
      }, '登录成功'));
    } catch (err) {
      console.error('login error:', err);
      res.json(error('登录失败'));
    }
  }

  async changePassword(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { oldPass, newPass } = req.body;
      const userId = req.user?.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
      });

      if (!user) {
        res.json(error('用户不存在'));
        return;
      }

      const isValid = await bcrypt.compare(oldPass, user.password);

      if (!isValid) {
        res.json(error('原密码错误'));
        return;
      }

      const hashedPassword = await bcrypt.hash(newPass, 10);

      await prisma.user.update({
        where: { id: userId },
        data: { password: hashedPassword },
      });

      res.json(success());
    } catch (err) {
      console.error('changePassword error:', err);
      res.json(error('修改密码失败'));
    }
  }

  async logout(req: AuthRequest, res: Response): Promise<void> {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      const userId = req.user?.userId;

      if (token) {
        await prisma.userToken.deleteMany({
          where: { token, userId },
        });
      }

      res.json(success());
    } catch (err) {
      console.error('logout error:', err);
      res.json(error('登出失败'));
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

      res.json(success(user));
    } catch (err) {
      console.error('getUserInfo error:', err);
      res.json(error('获取用户信息失败'));
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

      res.json(success(author));
    } catch (err) {
      console.error('getAuthor error:', err);
      res.json(error('获取作者信息失败'));
    }
  }

  async checkToken(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { token } = req.query;

      if (!token || typeof token !== 'string') {
        res.json(error('Token 不能为空'));
        return;
      }

      const tokenRecord = await prisma.userToken.findFirst({
        where: { token },
      });

      if (!tokenRecord) {
        res.json(error('Token 无效或已过期'));
        return;
      }

      if (tokenRecord.expireTime && new Date(tokenRecord.expireTime) < new Date()) {
        res.json(error('Token 已过期'));
        return;
      }

      res.json(success());
    } catch (err) {
      console.error('checkToken error:', err);
      res.json(error('校验 Token 失败'));
    }
  }
}

export default new UserController();
