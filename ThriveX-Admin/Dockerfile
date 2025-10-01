# 多阶段构建 Dockerfile for ThriveX-Admin

# ================================
# 构建阶段 (Build Stage)
# ================================
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 复制 package.json 和 pnpm-lock.yaml (利用Docker缓存层)
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 构建应用
RUN pnpm run build

# ================================
# 开发阶段 (Development Stage)
# ================================
FROM node:20-alpine AS development

# 设置工作目录
WORKDIR /app

# 安装 pnpm
RUN npm install -g pnpm

# 创建非root用户 (安全最佳实践)
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nextjs -u 1001

# 复制 package.json 和 pnpm-lock.yaml
COPY package.json pnpm-lock.yaml ./

# 安装依赖
RUN pnpm install --frozen-lockfile

# 复制源代码
COPY . .

# 更改文件所有权
RUN chown -R nextjs:nodejs /app
USER nextjs

# 暴露端口 (根据vite.config.js中的配置)
EXPOSE 9100

# 启动开发服务器
CMD ["pnpm", "run", "dev", "--host", "0.0.0.0"]

# ================================
# 生产阶段 (Production Stage)
# ================================
FROM nginx:alpine AS production

# 创建非root用户 (nginx用户组已存在，只需创建用户)
RUN adduser -S -u 1001 -G nginx nginx || true

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 创建自定义nginx配置
RUN echo 'server {' > /etc/nginx/conf.d/default.conf && \
    echo '    listen 80;' >> /etc/nginx/conf.d/default.conf && \
    echo '    server_name localhost;' >> /etc/nginx/conf.d/default.conf && \
    echo '    root /usr/share/nginx/html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    index index.html index.htm;' >> /etc/nginx/conf.d/default.conf && \
    echo '    location / {' >> /etc/nginx/conf.d/default.conf && \
    echo '        try_files $uri $uri/ /index.html;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '    location /api/ {' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_pass http://backend:3000/;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header Host $host;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Real-IP $remote_addr;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;' >> /etc/nginx/conf.d/default.conf && \
    echo '        proxy_set_header X-Forwarded-Proto $scheme;' >> /etc/nginx/conf.d/default.conf && \
    echo '    }' >> /etc/nginx/conf.d/default.conf && \
    echo '}' >> /etc/nginx/conf.d/default.conf

# 设置正确的权限
RUN chown -R nginx:nginx /usr/share/nginx/html && \
    chown -R nginx:nginx /var/cache/nginx && \
    chown -R nginx:nginx /var/log/nginx && \
    chown -R nginx:nginx /etc/nginx/conf.d && \
    touch /var/run/nginx.pid && \
    chown -R nginx:nginx /var/run/nginx.pid

# 切换到非root用户
USER nginx

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]