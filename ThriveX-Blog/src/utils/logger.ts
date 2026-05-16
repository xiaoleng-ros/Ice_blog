// 日志工具：开发环境保留所有日志，生产环境自动移除敏感信息
const isDev: boolean = process.env.NODE_ENV === 'development';

export const logger = {
  // 开发环境输出，生产环境静默
  log: (...args: unknown[]) => isDev && console.log(...args),
  info: (...args: unknown[]) => isDev && console.info(...args),
  debug: (...args: unknown[]) => isDev && console.debug(...args),
  warn: (...args: unknown[]) => console.warn(...args), // 警告始终保留
  error: (...args: unknown[]) => console.error(...args), // 错误始终保留
};
