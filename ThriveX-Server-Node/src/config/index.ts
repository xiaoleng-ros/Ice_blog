import dotenv from 'dotenv';

dotenv.config();

export const config = {
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: (() => {
      if (!process.env.JWT_SECRET) {
        throw new Error('JWT_SECRET environment variable is required');
      }
      return process.env.JWT_SECRET;
    })(),
    expiresIn: process.env.JWT_EXPIRES_IN || '259200000',
  },
  server: {
    port: parseInt(process.env.PORT || '9002', 10),
    env: process.env.NODE_ENV || 'development',
  },
  cors: {
    origin: (() => {
      const origins = (process.env.CORS_ORIGIN || 'http://localhost:9000').split(',');
      const env = process.env.NODE_ENV || 'development';
      if (origins.includes('*') && env === 'production') {
        console.warn('WARNING: CORS_ORIGIN 包含通配符 *，生产环境存在安全风险');
      }
      return origins;
    })(),
  },
  rateLimit: {
    tokens: parseInt(process.env.RATE_LIMIT_TOKENS || '100', 10),
    duration: parseInt(process.env.RATE_LIMIT_DURATION || '60', 10),
    blacklistThreshold: parseInt(process.env.BLACKLIST_THRESHOLD || '10', 10),
    blacklistDuration: parseInt(process.env.BLACKLIST_DURATION || '60', 10),
  },
  file: {
    uploadDir: process.env.FILE_UPLOAD_DIR || './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.qq.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
};

export default config;
