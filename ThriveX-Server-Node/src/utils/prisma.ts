import { PrismaClient } from '@prisma/client';

/**
 * Prisma 客户端单例
 * 全局只创建一个实例，避免连接池耗尽
 * 开发环境防止热重载创建多个实例
 */
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
