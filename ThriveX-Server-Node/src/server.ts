import app from './app';
import config from './config';
import { logger } from './middlewares/logger.middleware';
import { prisma } from './utils/prisma';

// 自定义 JSON 序列化，处理 BigInt 类型
// Prisma 模型中的 BigInt 字段（如 size）会导致 JSON.stringify 报错
const originalStringify = JSON.stringify;
JSON.stringify = function (value: any, replacer?: any, space?: any): string {
  const bigIntReplacer = (key: string, val: unknown) => {
    if (typeof val === 'bigint') {
      return Number(val);
    }
    return val;
  };
  return originalStringify(value, bigIntReplacer, space);
};

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
