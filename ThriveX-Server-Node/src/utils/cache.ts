import NodeCache from 'node-cache';
import config from '../config';

/**
 * 统一缓存工具
 * 用于缓存高频 API 查询结果，减少数据库查询压力
 * stdTTL: 缓存过期时间（秒），默认 300 秒
 * maxKeys: 最大缓存 key 数量，超过后按 LRU 自动清理
 */
const cache = new NodeCache({
  stdTTL: config.cache.stdTTL,
  checkperiod: 60,
  maxKeys: config.cache.maxKeys,
  useClones: false,
});

/**
 * 包装函数：先读缓存，命中则返回；未命中则执行回调并写入缓存
 * @param key 缓存键
 * @param fetcher 数据获取函数（通常是查数据库）
 * @param ttl 自定义过期时间（秒），不传则使用全局默认
 */
export async function wrap<T>(key: string, fetcher: () => Promise<T>, ttl?: number): Promise<T> {
  if (!config.cache.enabled) {
    return fetcher();
  }
  const hit = cache.get<T>(key);
  if (hit !== undefined) {
    return hit;
  }
  const fresh = await fetcher();
  cache.set(key, fresh, ttl ?? config.cache.stdTTL);
  return fresh;
}

/**
 * 清除指定前缀的所有缓存（用于写操作后批量失效）
 * @param prefix 缓存键前缀
 * @returns 清除的 key 数量
 */
export function flushByPrefix(prefix: string): number {
  const keys = cache.keys();
  const matched = keys.filter((k) => k.startsWith(prefix));
  matched.forEach((k) => cache.del(k));
  return matched.length;
}

/**
 * 获取缓存统计信息
 */
export function getStats() {
  return {
    keys: cache.keys().length,
    hits: cache.getStats().hits,
    misses: cache.getStats().misses,
    enabled: config.cache.enabled,
    stdTTL: config.cache.stdTTL,
    maxKeys: config.cache.maxKeys,
  };
}

export default cache;
