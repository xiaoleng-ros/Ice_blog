import app from './app';
import config from './config';
import { logger } from './middlewares/logger.middleware';
import { PrismaClient } from '@prisma/client';

// 全局 BigInt JSON 序列化支持
// Prisma 模型中的 BigInt 字段（如 size）会导致 JSON.stringify 报错
// 通过添加 toJSON 方法，使 BigInt 自动转为 Number 再序列化
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    app.listen(config.server.port, () => {
      logger.info(`Server is running on port ${config.server.port}`);
      logger.info(`Environment: ${config.server.env}`);
      logger.info(`API Documentation: http://localhost:${config.server.port}/api-docs`);
    });
  } catch (err) {
    logger.error('Failed to start server:', err as Error);
    process.exit(1);
  }
}

main();

process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  await prisma.$disconnect();
  process.exit(0);
});
