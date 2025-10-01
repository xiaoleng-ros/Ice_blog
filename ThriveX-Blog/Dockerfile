# ===========================================
# 多阶段构建 Dockerfile for ThriveX-Blog
# ===========================================

# 基础镜像 - 使用官方Node.js 20 Alpine镜像（轻量级）
FROM node:20-alpine AS base

# 安装必要的系统依赖
RUN apk add --no-cache libc6-compat

# 设置工作目录
WORKDIR /app

# 复制package文件
COPY package*.json ./
COPY .npmrc ./

# ===========================================
# 依赖安装阶段
# ===========================================
FROM base AS deps

# 安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 安装所有依赖（包括开发依赖）
RUN npm ci

# ===========================================
# 构建阶段
# ===========================================
FROM base AS builder

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制源代码
COPY . .

# 设置环境变量
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# 构建应用
RUN npm run build

# ===========================================
# 开发阶段
# ===========================================
FROM base AS development

# 复制依赖
COPY --from=deps /app/node_modules ./node_modules

# 复制源代码
COPY . .

# 创建非root用户（安全最佳实践）
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 设置文件权限
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露开发端口
EXPOSE 3000

# 设置环境变量
ENV NODE_ENV development
ENV NEXT_TELEMETRY_DISABLED 1

# 启动开发服务器
CMD ["npm", "run", "dev"]

# ===========================================
# 生产运行阶段
# ===========================================
FROM base AS production

# 设置环境变量
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 创建非root用户（安全最佳实践）
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 复制构建产物
COPY --from=builder /app/public ./public

# 设置正确的权限并复制构建输出
RUN mkdir .next
RUN chown nextjs:nodejs .next

# 从构建阶段复制构建输出
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# 切换到非root用户
USER nextjs

# 暴露生产端口
EXPOSE 9001

# 设置启动命令
CMD ["node", "server.js"]

# ===========================================
# 默认目标为生产环境
# ===========================================
FROM production AS default