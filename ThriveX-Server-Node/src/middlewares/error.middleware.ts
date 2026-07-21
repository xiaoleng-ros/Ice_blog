import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/result';
import config from '../config';

// 修复 P2：错误响应脱敏，防止 Prisma 内部错误暴露表结构、字段名、SQL
// 同时避免直接把 err.stack 返回给客户端
const SENSITIVE_PATTERNS = [
  /prisma/i,
  /database/i,
  /sql/i,
  /query/i,
  /relation/i,
  /foreign key/i,
  /unique constraint/i,
  /connection/i,
];

/** 判断错误消息是否包含敏感信息 */
function isSensitiveMessage(message: string): boolean {
  return SENSITIVE_PATTERNS.some((pattern) => pattern.test(message));
}

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  const statusCode = (err as any).statusCode || 500;

  // 开发环境打印完整错误便于调试
  if (config.server.env !== 'production') {
    console.error('Error:', err);
  } else {
    // 生产环境只打印错误消息，不打印 stack（stack 由 logger 单独写入日志文件）
    console.error(`[Error] ${req.method} ${req.originalUrl} ${err.message}`);
  }

  // 生产环境：500 错误统一返回"服务器内部错误"，不暴露内部细节
  // Prisma 等数据库错误统一脱敏
  let message = err.message || '服务器内部错误';
  if (config.server.env === 'production') {
    if (statusCode >= 500 || isSensitiveMessage(message)) {
      message = '服务器内部错误，请稍后重试';
    }
  }

  res.status(statusCode).json(error(message, statusCode));
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(error('接口不存在', 404));
}
