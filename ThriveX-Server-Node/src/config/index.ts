import dotenv from 'dotenv';

dotenv.config();

export const config = {
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'yuyang',
    expiresIn: process.env.JWT_EXPIRES_IN || '259200000',
  },
  server: {
    port: parseInt(process.env.PORT || '9002', 10),
    env: process.env.NODE_ENV || 'development',
  },
  cors: {
    origin: (process.env.CORS_ORIGIN || 'http://localhost:9000').split(','),
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
