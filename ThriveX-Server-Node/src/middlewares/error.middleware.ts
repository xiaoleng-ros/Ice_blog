import { Request, Response, NextFunction } from 'express';
import { error } from '../utils/result';

export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  console.error('Error:', err);

  const statusCode = (err as any).statusCode || 500;
  const message = err.message || '服务器内部错误';

  res.status(statusCode).json(error(message, statusCode));
}

export function notFoundHandler(req: Request, res: Response): void {
  res.status(404).json(error('接口不存在', 404));
}
