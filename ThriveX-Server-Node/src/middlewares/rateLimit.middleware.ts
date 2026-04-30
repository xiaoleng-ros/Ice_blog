import rateLimit from 'express-rate-limit';
import config from '../config';

export const apiLimiter = rateLimit({
  windowMs: config.rateLimit.duration * 1000,
  max: config.rateLimit.tokens,
  message: {
    code: 429,
    message: '请求过于频繁，请稍后再试',
    data: null,
  },
  standardHeaders: true,
  legacyHeaders: false,
});
