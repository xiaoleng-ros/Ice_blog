import { AuthRequest } from '../types/express';

export function isAdmin(req: AuthRequest): boolean {
  return req.user?.role === 'admin';
}

export function getClientIp(req: AuthRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  if (typeof forwarded === 'string') {
    return forwarded.split(',')[0].trim();
  }
  const realIp = req.headers['x-real-ip'];
  if (typeof realIp === 'string') {
    return realIp.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || '0.0.0.0';
}