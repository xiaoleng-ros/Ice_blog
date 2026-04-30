import { Request, Response, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { error } from '../utils/result';

export function validateRequest(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorMessage = errors.array().map(e => e.msg).join(', ');
    res.json(error(errorMessage, 400));
    return;
  }
  next();
}
