# Ice Blog

一个现代化的博客系统，采用前后端分离架构，基于 [ThriveX](https://github.com/LiuYuYang01/ThriveX-Admin) 开源项目二次开发。

## 项目起源

本项目Fork自 [ThriveX](https://github.com/LiuYuYang01/ThriveX-Admin)（作者：[刘宇阳](https://github.com/LiuYuYang01)，主页：https://liuyuyang.net），
在原项目基础上进行功能扩展和优化，保留了 ThriveX 的核心架构和设计理念。

## 与原项目(ThriveX)的异同

### 相同点

- 采用相同的前后端分离架构
- 管理后台使用 React + Vite + Ant Design
- 前端博客使用 Next.js
- 后端服务（Node.js版）使用 Express + Prisma + PostgreSQL
- 数据库使用 Neon PostgreSQL（云端数据库）
- 支持相同的核心功能（文章、说说、相册、轮播图等）

### 主要区别

| 方面 | ThriveX（原项目） | Ice Blog（本案） |
|------|-------------------|------------------|
| 后端技术 | Spring Boot + MyBatis-Plus + MySQL + Redis | Node.js + Express + Prisma + PostgreSQL |
| 部署复杂度 | 需要 JDK + Maven + MySQL + Redis | 只需 Node.js + PostgreSQL（可选） |
| 数据存储 | 本地 MySQL | 云端 Neon PostgreSQL |
| 功能定位 | 通用博客系统 | 在 ThriveX 基础上持续迭代 |

## 项目结构

```
Ice_blog/
├── ThriveX-Blog/          # 前端博客展示 (Next.js 15 + HeroUI + Tailwind CSS 4.x)
├── ThriveX-Admin/         # 管理后台 (React 19 + Vite + Ant Design 6)
├── ThriveX-Server-Node/   # 后端服务 (Node.js + Express + Prisma)
└── .gitignore
```

## 技术栈

### 前端展示 (ThriveX-Blog)

- Next.js 15 + React 19
- Tailwind CSS 4.x
- HeroUI
- Framer Motion
- Zustand

### 管理后台 (ThriveX-Admin)

- React 19 + Vite
- Ant Design 6
- Tailwind CSS
- ECharts

### 后端服务 (ThriveX-Server-Node)

- Node.js + Express
- Prisma ORM
- Neon PostgreSQL（云端数据库）
- JWT 认证

## 快速开始

### 环境要求

- Node.js 20+
- PostgreSQL（使用 Neon 云端数据库无需本地安装）

### 前端项目

```bash
# 安装依赖
cd ThriveX-Blog
pnpm install

# 启动开发服务器
pnpm dev
```

### 管理后台

```bash
cd ThriveX-Admin
pnpm install
pnpm dev
```

### 后端服务

```bash
cd ThriveX-Server-Node
npm install
npm run dev
```

## 环境变量配置

复制 `.env.example` 为 `.env` 并配置：

```env
# 数据库
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# JWT
JWT_SECRET="your-secret-key"

# 服务端口
PORT=9002

# CORS
CORS_ORIGIN="http://localhost:9000,http://localhost:9001"
```

## 功能特性

- 文章管理（支持 Markdown 编辑）
- 说说/闪念功能
- 足迹地图展示
- 相册管理
- 友链管理
- 留言墙
- RSS 订阅
- 网站配置
- 存储管理（支持本地存储）

## 开源许可

本项目基于 MIT 许可证开源，同时保留 ThriveX 的版权标识。

## 致谢

- 感谢原项目作者 [刘宇阳](https://github.com/LiuYuYang01) 的开源贡献
- 基于 [ThriveX](https://github.com/LiuYuYang01/ThriveX-Admin) 项目进行二次开发

## 获取帮助

如果你在部署或使用过程中遇到问题，可以在 GitHub 提交 Issue。
