import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/express';
import { verifyToken } from '../utils/jwt';
import { PrismaClient } from '@prisma/client';
import { isBlacklisted } from '../utils/blackList';
import { getRealIp } from '../utils/ip';
import { error } from '../utils/result';

const prisma = new PrismaClient();

export async function authMiddleware(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const ip = getRealIp(req);

    if (isBlacklisted(ip)) {
      res.json(error('您已被加入黑名单，请稍后再试', 403));
      return;
    }

    if (req.method === 'OPTIONS') {
      next();
      return;
    }

    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      res.json(error('请先登录', 401));
      return;
    }

    try {
      const payload = verifyToken(token);

      const user = await prisma.user.findUnique({
        where: { id: payload.userId },
        select: { id: true, username: true, role: true },
      });

      if (!user) {
        res.json(error('用户不存在', 401));
        return;
      }

      const tokenExists = await prisma.userToken.findFirst({
        where: {
          token,
          userId: payload.userId,
        },
      });

      if (!tokenExists) {
        res.json(error('无效或过期的 Token', 401));
        return;
      }

      req.user = {
        userId: user.id,
        username: user.username,
        role: user.role,
      };

      next();
    } catch (err) {
      res.json(error('Token 验证失败', 401));
      return;
    }
  } catch (err) {
    next(err);
  }
}

export function noTokenRequired(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  next();
}
