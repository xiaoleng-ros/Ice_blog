import { Request, Response, NextFunction } from 'express';
import cache, { getStats } from '../utils/cache';
import config from '../config';

/**
 * 不参与缓存的路径白名单（鉴权、上传、健康检查等）
 */
const SKIP_PATHS = [
  '/api/auth',
  '/api/file',
  '/api/oss',
  '/api/email',
  '/api/record',
  '/api/footprint',
  '/health',
  '/uploads',
];

/**
 * 不参与缓存失效的写操作路径
 */
const SKIP_INVALIDATE = [
  '/api/auth/login',
  '/api/auth/register',
];

/**
 * 判断请求是否跳过缓存
 */
function shouldSkip(req: Request): boolean {
  return SKIP_PATHS.some((p) => req.path.startsWith(p));
}

/**
 * 判断写操作是否跳过失效
 */
function shouldSkipInvalidate(req: Request): boolean {
  return SKIP_INVALIDATE.some((p) => req.path.startsWith(p));
}

/**
 * API 自动缓存中间件
 * - GET 请求：先查缓存，命中直接返回；未命中自动写入
 * - POST/PUT/DELETE 请求：响应成功后自动失效相关前缀的缓存
 */
export function apiCache(req: Request, res: Response, next: NextFunction): void {
  if (!config.cache.enabled || shouldSkip(req)) {
    return next();
  }

  const isRead = req.method === 'GET';
  const cacheKey = `api:${req.method}:${req.originalUrl}`;

  if (isRead) {
    const hit = cache.get(cacheKey);
    if (hit !== undefined) {
      res.setHeader('X-Cache', 'HIT');
      res.setHeader('X-Cache-TTL', String(config.cache.stdTTL));
      res.json(hit);
      return;
    }

    res.setHeader('X-Cache', 'MISS');

    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        cache.set(cacheKey, body);
      }
      return originalJson(body);
    };
  } else {
    const originalJson = res.json.bind(res);
    res.json = (body: unknown) => {
      if (res.statusCode >= 200 && res.statusCode < 300 && !shouldSkipInvalidate(req)) {
        const basePrefix = `api:GET:${req.baseUrl}${req.path}`;
        const keys = cache.keys();
        let cleared = 0;
        keys.forEach((k) => {
          if (k.startsWith(basePrefix)) {
            cache.del(k);
            cleared++;
          }
        });
        if (cleared > 0) {
          res.setHeader('X-Cache-Invalidated', String(cleared));
        }
      }
      return originalJson(body);
    };
  }

  next();
}

/**
 * 缓存统计接口处理器
 * 返回当前缓存命中率、key 数量等
 */
export function cacheStatsHandler(_req: Request, res: Response): void {
  res.json({
    code: 200,
    msg: 'success',
    result: getStats(),
  });
}

export default apiCache;
