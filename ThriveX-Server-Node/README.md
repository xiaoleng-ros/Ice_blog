# ThriveX Server Node.js

现代化博客系统后端 - Node.js + Express + Prisma + Neon PostgreSQL

## 技术栈

- **运行时**: Node.js 18+
- **框架**: Express 4.x
- **ORM**: Prisma 5.x
- **数据库**: Neon PostgreSQL (Serverless)
- **认证**: JWT
- **文档**: Swagger/OpenAPI

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制 `.env.example` 为 `.env` 并配置：

```bash
cp .env.example .env
```

编辑 `.env` 文件，配置 Neon PostgreSQL 连接字符串：

```env
DATABASE_URL="postgresql://user:password@ep-cool-name-123456.us-east-2.aws.neon.tech/thrivex?sslmode=require"
JWT_SECRET="your-secret-key"
```

### 3. 初始化数据库

```bash
# 生成 Prisma Client
npm run prisma:generate

# 推送数据库结构
npm run prisma:push

# 或者使用迁移（推荐用于生产环境）
npm run prisma:migrate
```

### 4. 启动开发服务器

```bash
npm run dev
```

服务器将在 http://localhost:8080 启动

API 文档：http://localhost:8080/api-docs

## 可用脚本

| 脚本 | 说明 |
|------|------|
| `npm run dev` | 启动开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run start` | 启动生产服务器 |
| `npm run prisma:generate` | 生成 Prisma Client |
| `npm run prisma:push` | 推送数据库结构 |
| `npm run prisma:migrate` | 运行数据库迁移 |
| `npm run lint` | 运行 ESLint |
| `npm run lint:fix` | 自动修复 ESLint 问题 |

## API 接口

### 认证

| 方法 | 路径 | 说明 |
|------|------|------|
| POST | /user/login | 用户登录 |
| POST | /user/register | 用户注册 |
| POST | /user/loginout | 用户登出 |

### 文章管理

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /article | 获取文章列表 |
| GET | /article/:id | 获取单篇文章 |
| POST | /article | 新增文章 |
| PATCH | /article | 编辑文章 |
| DELETE | /article/:id/:is_del | 删除文章 |

### 分类/标签

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /cate | 获取分类列表 |
| GET | /tag | 获取标签列表 |

### 评论

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /comment/article/:id | 获取文章评论 |
| POST | /comment | 发表评论 |

更多接口请查看 API 文档。

## 项目结构

```
ThriveX-Server-Node/
├── src/
│   ├── app.ts                 # Express 应用入口
│   ├── server.ts              # 服务器启动文件
│   ├── config/                # 配置目录
│   ├── controllers/            # 控制器
│   ├── services/               # 业务逻辑
│   ├── routes/                 # 路由
│   ├── middlewares/            # 中间件
│   ├── utils/                  # 工具函数
│   ├── types/                  # TypeScript 类型
│   └── constants/              # 常量
├── prisma/
│   └── schema.prisma           # Prisma 模型
├── uploads/                    # 文件上传目录
└── logs/                      # 日志目录
```

## 部署

### Docker

```bash
# 构建并启动
docker-compose up -d

# 查看日志
docker-compose logs -f
```

### PM2

```bash
# 启动
pm2 start pm2.config.js

# 查看状态
pm2 status

# 查看日志
pm2 logs
```

## 许可证

MIT
