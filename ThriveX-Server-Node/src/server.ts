import app from './app';
import config from './config';
import { logger } from './middlewares/logger.middleware';
import { PrismaClient } from '@prisma/client';

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
