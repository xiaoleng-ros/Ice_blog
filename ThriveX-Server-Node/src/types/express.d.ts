import { Request } from 'express';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    username: string;
    role?: string;
  };
}

export interface TokenPayload {
  userId: number;
  username: string;
  role?: string;
}
