import app from './app';
import config from './config';
import { logger } from './middlewares/logger.middleware';
import { prisma } from './utils/prisma';

/**
 * 数据库心跳保活定时器引用
 */
let heartbeatTimer: NodeJS.Timeout | null = null;

/**
 * 数据库心跳保活机制
 * 每隔 25 秒向 Neon Serverless PostgreSQL 发送一次简单查询，
 * 防止数据库实例因闲置而进入休眠状态（冷启动延迟 3~8 秒）
 * Neon 的默认闲置超时约为 5 分钟，25 秒间隔足够安全
 */
function startDatabaseHeartbeat(): void {
  const HEARTBEAT_INTERVAL_MS = 25_000;

  heartbeatTimer = setInterval(async () => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      logger.debug('💓 数据库心跳检测成功');
    } catch (err) {
      logger.warn('⚠️ 数据库心跳检测失败，将在下次间隔重试:', (err as Error).message);
    }
  }, HEARTBEAT_INTERVAL_MS);

  logger.info(`🫀 数据库心跳已启动，间隔 ${HEARTBEAT_INTERVAL_MS / 1000}s`);
}

/**
 * 停止数据库心跳定时器
 */
function stopDatabaseHeartbeat(): void {
  if (heartbeatTimer) {
    clearInterval(heartbeatTimer);
    heartbeatTimer = null;
    logger.info('🫀 数据库心跳已停止');
  }
}

async function main() {
  try {
    await prisma.$connect();
    logger.info('Database connected successfully');

    // 启动数据库心跳保活（防止 Neon Serverless 冷启动延迟）
    startDatabaseHeartbeat();

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
  stopDatabaseHeartbeat();
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  logger.info('Shutting down gracefully...');
  stopDatabaseHeartbeat();
  await prisma.$disconnect();
  process.exit(0);
});
