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
