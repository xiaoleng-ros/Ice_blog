import dotenv from 'dotenv';

dotenv.config();

/** 校验 JWT_SECRET 强度，防止使用弱密钥导致 token 被伪造 */
function validateJwtSecret(secret: string): string {
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is required');
  }
  // 长度至少 32 字符（256 位），抵御暴力爆破
  if (secret.length < 32) {
    throw new Error(
      `JWT_SECRET 长度不足（当前 ${secret.length} 字符，至少 32 字符）。` +
      `请使用强随机字符串，例如运行 node -e "console.log(require('crypto').randomBytes(48).toString('hex'))" 生成`
    );
  }
  // 熵值校验：不允许常见弱密钥
  const weakSecrets = new Set(['yuyang', 'secret', 'your-secret-key', 'changeme', 'admin', 'password']);
  if (weakSecrets.has(secret.toLowerCase())) {
    throw new Error('JWT_SECRET 不能使用常见弱密钥，请使用随机生成的强字符串');
  }
  // 字符多样性校验：至少包含 2 种字符类型（字母/数字/符号）
  const charTypes = [
    /[a-z]/.test(secret),
    /[A-Z]/.test(secret),
    /[0-9]/.test(secret),
    /[^a-zA-Z0-9]/.test(secret),
  ].filter(Boolean).length;
  if (charTypes < 2) {
    throw new Error('JWT_SECRET 字符多样性不足，至少包含 2 种字符类型（大小写字母/数字/符号）');
  }
  return secret;
}

export const config = {
  database: {
    url: process.env.DATABASE_URL || '',
  },
  jwt: {
    secret: validateJwtSecret(process.env.JWT_SECRET || ''),
    expiresIn: process.env.JWT_EXPIRES_IN || '259200000',
  },
  server: {
    port: parseInt(process.env.PORT || '9002', 10),
    env: process.env.NODE_ENV || 'development',
  },
  cors: {
    origin: (() => {
      const origins = (process.env.CORS_ORIGIN || 'http://localhost:9000')
        .split(',')
        .map((s: string) => s.trim())
        .filter(Boolean);
      const env = process.env.NODE_ENV || 'development';
      if (origins.includes('*') && env === 'production') {
        // 生产环境强制移除通配符，防止安全风险
        console.error('ERROR: CORS_ORIGIN 包含通配符 *，生产环境不允许使用，已自动移除');
        return origins.filter((o: string) => o !== '*');
      }
      // 修复 P3：校验每个 origin 必须是合法的 http(s) URL，防止误填导致 CSRF
      // 例如 .env 误填 `https://evil.com, https://your.domain` 时，evil.com 会被允许跨域请求
      const validOrigins: string[] = [];
      for (const o of origins) {
        if (o === '*') {
          validOrigins.push(o);
          continue;
        }
        try {
          const url = new URL(o);
          if (url.protocol !== 'http:' && url.protocol !== 'https:') {
            console.warn(`[cors] Origin "${o}" 协议非法（仅允许 http/https），已忽略`);
            continue;
          }
          // 不允许携带路径的 origin（防止 https://evil.com/path 被配置成可信源）
          if (url.pathname !== '/' || url.search !== '' || url.hash !== '') {
            console.warn(`[cors] Origin "${o}" 不应包含路径/查询/片段，已忽略`);
            continue;
          }
          validOrigins.push(o);
        } catch {
          console.warn(`[cors] Origin "${o}" 格式非法，已忽略`);
        }
      }
      return validOrigins;
    })(),
  },
  rateLimit: {
    tokens: parseInt(process.env.RATE_LIMIT_TOKENS || '100', 10),
    duration: parseInt(process.env.RATE_LIMIT_DURATION || '60', 10),
    blacklistThreshold: parseInt(process.env.BLACKLIST_THRESHOLD || '10', 10),
    blacklistDuration: parseInt(process.env.BLACKLIST_DURATION || '60', 10),
  },
  file: {
    uploadDir: process.env.FILE_UPLOAD_DIR || './uploads',
    maxSize: parseInt(process.env.MAX_FILE_SIZE || '10485760', 10),
  },
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.qq.com',
    port: parseInt(process.env.SMTP_PORT || '465', 10),
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
  },
  cache: {
    enabled: process.env.CACHE_ENABLED !== 'false',
    stdTTL: parseInt(process.env.CACHE_TTL || '300', 10),
    maxKeys: parseInt(process.env.CACHE_MAX_KEYS || '1000', 10),
  },
};

export default config;
