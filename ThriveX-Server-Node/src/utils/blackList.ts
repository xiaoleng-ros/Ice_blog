import NodeCache from 'node-cache';
import config from '../config';

const blacklistCache = new NodeCache({
  stdTTL: config.rateLimit.blacklistDuration * 60,
  checkperiod: 60,
});

const rateLimitCache = new NodeCache({
  stdTTL: config.rateLimit.duration,
  checkperiod: 10,
});

export function addToBlacklist(ip: string): void {
  blacklistCache.set(ip, true);
}

export function isBlacklisted(ip: string): boolean {
  return blacklistCache.get(ip) === true;
}

export function incrementRateLimit(ip: string): number {
  const count = rateLimitCache.get<number>(ip) || 0;
  const newCount = count + 1;
  rateLimitCache.set(ip, newCount);
  return newCount;
}

export function getRateLimitCount(ip: string): number {
  return rateLimitCache.get<number>(ip) || 0;
}

export function shouldBlacklist(ip: string): boolean {
  return getRateLimitCount(ip) >= config.rateLimit.blacklistThreshold;
}

export function clearRateLimit(ip: string): void {
  rateLimitCache.del(ip);
}
