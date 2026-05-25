import jwt from 'jsonwebtoken';
import config from '../config';
import { TokenPayload } from '../types/express';

export function createToken(payload: TokenPayload): string {
  const expiresIn: unknown = isNaN(Number(config.jwt.expiresIn)) ? config.jwt.expiresIn : parseInt(config.jwt.expiresIn, 10);
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: expiresIn as number | undefined,
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
}

export function decodeToken(token: string): TokenPayload | null {
  const decoded = jwt.decode(token);
  return decoded as TokenPayload | null;
}
