import { Request } from 'express';

export function getRealIp(request: Request): string {
  const forwarded = request.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp.split(',')[0].trim();
  }
  return request.ip || request.socket.remoteAddress || '0.0.0.0';
}
