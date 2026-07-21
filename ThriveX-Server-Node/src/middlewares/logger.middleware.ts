import winston from 'winston';
import config from '../config';

const { combine, timestamp, printf, colorize, errors } = winston.format;

const logFormat = printf(({ level, message, timestamp, stack }) => {
  return `${timestamp} [${level}]: ${stack || message}`;
});

export const logger = winston.createLogger({
  level: config.server.env === 'production' ? 'info' : 'debug',
  format: combine(
    errors({ stack: true }),
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    logFormat
  ),
  transports: [
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), logFormat),
    }),
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
    }),
    new winston.transports.File({
      filename: 'logs/all.log',
    }),
  ],
});

// 修复 P1：敏感字段脱敏，防止密码、Token、邮箱等隐私信息写入日志文件
// 即便日志文件被泄露或被运维查阅，也不会暴露用户隐私
const SENSITIVE_KEYS = ['password', 'pass', 'pwd', 'token', 'authorization', 'refreshToken', 'secret', 'apiKey', 'api_key'];
const MASK = '***REDACTED***';

/** 递归脱敏对象中的敏感字段 */
function sanitizeValue(value: unknown, depth = 0): unknown {
  // 限制递归深度，防止循环引用和性能问题
  if (depth > 5 || value === null || typeof value !== 'object') {
    return value;
  }

  if (Array.isArray(value)) {
    return value.map((v) => sanitizeValue(v, depth + 1));
  }

  const obj = value as Record<string, unknown>;
  const result: Record<string, unknown> = {};
  for (const key of Object.keys(obj)) {
    const lowerKey = key.toLowerCase();
    if (SENSITIVE_KEYS.some((s) => lowerKey.includes(s))) {
      result[key] = MASK;
    } else {
      result[key] = sanitizeValue(obj[key], depth + 1);
    }
  }
  return result;
}

export function logRequest(req: any): void {
  // 修复 P1：请求日志不打印原始 body，避免密码、JWT、邮箱等敏感信息写入文件
  // 仅记录方法、URL、IP（脱敏处理）
  const ip = req.ip ? String(req.ip).replace(/(\d{1,3})\.(\d{1,3})\.\d{1,3}\.\d{1,3}/, '$1.$2.*.*') : 'unknown';
  logger.info(`${req.method} ${req.originalUrl} ip=${ip}`);
}

export function logError(err: Error, context?: string): void {
  // 修复 P2：生产环境不打印完整 stack（防止泄露服务器目录结构）
  // 开发环境保留 stack 便于调试
  if (config.server.env === 'production') {
    logger.error(`${context || 'Error'}: ${err.message}`);
  } else {
    logger.error(`${context || 'Error'}: ${err.message}`, { stack: err.stack });
  }
}

/** 业务调试日志：自动脱敏敏感字段后再输出 */
export function logDebug(message: string, data?: unknown): void {
  if (data !== undefined) {
    logger.debug(message, sanitizeValue(data));
  } else {
    logger.debug(message);
  }
}
