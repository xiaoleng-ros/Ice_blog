import jwt from 'jsonwebtoken';
import config from '../config';
import { TokenPayload } from '../types/express';

export function createToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, {
    expiresIn: parseInt(config.jwt.expiresIn, 10),
  });
}

export function verifyToken(token: string): TokenPayload {
  return jwt.verify(token, config.jwt.secret) as TokenPayload;
}

export function decodeToken(token: string): TokenPayload | null {
  const decoded = jwt.decode(token);
  return decoded as TokenPayload | null;
}
