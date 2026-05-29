import NodeCache from 'node-cache';

/**
 * 统一缓存工具
 * 用于缓存高频 API 查询结果，减少数据库查询压力
 * stdTTL: 缓存过期时间（秒），默认 30 秒
 * checkperiod: 定期检查过期缓存的时间间隔（秒）
 */
const cache = new NodeCache({
  stdTTL: 30,
  checkperiod: 60,
});

export default cache;