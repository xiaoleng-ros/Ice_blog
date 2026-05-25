import { Response } from 'express';
import { Result, ResultData } from '../types/result';

export function success<T>(data?: T, message: string = 'ok'): Result<T> {
  return {
    code: 200,
    message,
    data: data || null,
  };
}

export function error(message: string, code: number = 400): Result<null> {
  return {
    code,
    message,
    data: null,
  };
}

export function ok(data: Record<string, any>): ResultData {
  return {
    code: 200,
    message: 'ok',
    data,
  };
}

export function created<T>(data?: T, message: string = '操作成功'): Result<T> {
  return {
    code: 200,
    message,
    data: data || null,
  };
}

export function fail<T>(message: string = '操作失败'): Result<T> {
  return {
    code: 400,
    message,
    data: null,
  };
}

/**
 * 统一发送成功响应（HTTP 200）
 * @param res Express Response 对象
 * @param data 响应数据
 * @param message 响应消息
 */
export function sendSuccess<T>(res: Response, data?: T, message: string = 'ok'): void {
  res.status(200).json(success(data, message));
}

/**
 * 统一发送错误响应，自动设置 HTTP 状态码
 * 业务错误码与 HTTP 状态码映射：
 *   400 → Bad Request
 *   401 → Unauthorized
 *   403 → Forbidden
 *   404 → Not Found
 *   429 → Too Many Requests
 *   500 → Internal Server Error
 * @param res Express Response 对象
 * @param message 错误消息
 * @param code 业务错误码（同时作为 HTTP 状态码）
 */
export function sendError(res: Response, message: string, code: number = 400): void {
  res.status(code).json(error(message, code));
}
