#  Ice Blog

> 一个现代化的个人博客系统，采用前后端分离架构，基于 [ThriveX](https://github.com/LiuYuYang01/ThriveX-Admin) 开源项目二次开发 ✨

<p align="center">
  <img src="https://img.shields.io/badge/React-19-blue?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/Node.js-Express-green?logo=node.js" alt="Node.js" />
  <img src="https://img.shields.io/badge/PostgreSQL-Neon-blue?logo=postgresql" alt="PostgreSQL" />
  <img src="https://img.shields.io/badge/License-MIT-yellow" alt="License" />
</p>

---

##  目录

- [🌟 项目起源](#-项目起源)
- [🎯 核心特性](#-核心特性)
- [🆚 与原项目对比](#-与原项目对比)
- [📦 项目结构](#-项目结构)
- [🛠️ 技术栈](#-技术栈)
- [🚀 快速开始](#-快速开始)
- [️ 环境变量配置](#-环境变量配置)
- [📸 功能展示](#-功能展示)
- [📝 开源许可](#-开源许可)
- [🙏 致谢](#-致谢)
- [💬 获取帮助](#-获取帮助)

---

## 🌟 项目起源

本项目 Fork 自 [ThriveX](https://github.com/LiuYuYang01/ThriveX-Admin)（作者：[刘宇阳](https://github.com/LiuYuYang01)，主页：https://liuyuyang.net），在原项目基础上进行**功能扩展**和**技术栈优化**，保留了 ThriveX 的核心架构和设计理念。

### 🎯 为什么选择 Ice Blog？

| 优势 | 说明 |
|------|------|
| 🚀 **轻量部署** | 无需 JDK、Maven、Redis，只需 Node.js + PostgreSQL |
| ☁️ **云端数据库** | 支持 Neon PostgreSQL，零运维成本 |
| 🎨 **现代化 UI** | Next.js 15 + HeroUI + Tailwind CSS 4.x |
| 📱 **响应式设计** | 完美适配桌面端和移动端 |
| 🔧 **持续迭代** | 在 ThriveX 基础上不断优化和扩展 |

---

##  核心特性

### 📝 内容管理
- ✍️ **文章管理** — 支持 Markdown 编辑，实时预览
- 💬 **说说/闪念** — 记录生活碎片，支持图文混排
-  **分类标签** — 灵活的文章分类和标签系统
-  **草稿管理** — 自动保存，随时继续创作

### 🖼️ 多媒体
- 📷 **相册管理** — 支持图片上传、分类浏览
-  **轮播图** — 首页轮播展示，支持自定义
- ️ **足迹地图** — 高德地图集成，记录旅行足迹

###  社交互动
- 💌 **留言墙** — 访客留言，支持审核机制
-  **友链管理** — 友情链接交换，支持申请审核
- 💬 **评论系统** — 文章评论，支持嵌套回复

### ⚙️ 系统配置
- 🎨 **主题切换** — 多种博客主题风格
- 📊 **数据统计** — 访问量、文章数等数据看板
- 🔐 **权限管理** — 角色权限控制
- 📧 **邮件通知** — 新评论邮件提醒
- 📡 **RSS 订阅** — 支持 RSS 输出

---

##  与原项目对比

###  相同点

- ✅ 采用相同的前后端分离架构
- ✅ 管理后台使用 React + Vite + Ant Design
- ✅ 前端博客使用 Next.js
- ✅ 后端服务使用 Express + Prisma + PostgreSQL
- ✅ 数据库使用 Neon PostgreSQL（云端数据库）
- ✅ 支持相同的核心功能（文章、说说、相册、轮播图等）

### 📊 主要区别

| 方面 | ThriveX（原项目） | Ice Blog（本案） |
|------|-------------------|------------------|
| 🔧 后端技术 | Spring Boot + MyBatis-Plus + MySQL + Redis | Node.js + Express + Prisma + PostgreSQL |
| 📦 部署复杂度 | 需要 JDK + Maven + MySQL + Redis | 只需 Node.js + PostgreSQL（可选） |
| ️ 数据存储 | 本地 MySQL | 云端 Neon PostgreSQL |
| 🎯 功能定位 | 通用博客系统 | 在 ThriveX 基础上持续迭代 |
|  前端 UI | 传统 Ant Design 风格 | HeroUI + Tailwind CSS 4.x 现代化设计 |

---

## 📦 项目结构

```
Ice_blog/
├──  ThriveX-Blog/          # 🌐 前端博客展示 (Next.js 15 + HeroUI + Tailwind CSS 4.x)
├── 📁 ThriveX-Admin/         # 🎛️ 管理后台 (React 19 + Vite + Ant Design 6)
├── 📁 ThriveX-Server-Node/   # ️ 后端服务 (Node.js + Express + Prisma)
├──  .gitignore
└──  README.md
```

---

## ️ 技术栈

### 🌐 前端博客 (ThriveX-Blog)

| 技术 | 版本 | 用途 |
|------|------|------|
| ⚛️ Next.js | 15.1.9 | React 全栈框架 |
| ⚛️ React | 19.0.1 | UI 构建库 |
| 🎨 Tailwind CSS | 4.x | 原子化 CSS 框架 |
|  HeroUI | 2.7.2 | UI 组件库 |
| 🎬 Framer Motion | 12.7.4 | 动画库 |
| 🗃️ Zustand | 5.0.3 | 状态管理 |
| 📝 WangEditor | 5.6.34 | 富文本编辑器 |
| 📊 ECharts | 5.5.1 | 数据可视化 |
| 🗺️ 高德地图 | 1.0.1 | 地图服务 |

### ️ 管理后台 (ThriveX-Admin)

| 技术 | 版本 | 用途 |
|------|------|------|
| ⚛️ React | 19.2.4 | UI 构建库 |
| ⚡ Vite | 7.3.1 | 构建工具 |
| 🎨 Ant Design | 6.3.1 | UI 组件库 |
| 🎨 Tailwind CSS | 4.2.1 | 原子化 CSS 框架 |
| 📝 ByteMD | 1.22.0 | Markdown 编辑器 |
| 📊 ECharts | 5.6.0 | 数据可视化 |
| ️ Zustand | 4.5.4 | 状态管理 |
|  Axios | 1.7.2 | HTTP 请求库 |

### ⚙️ 后端服务 (ThriveX-Server-Node)

| 技术 | 版本 | 用途 |
|------|------|------|
| 🟢 Node.js | 20+ | 运行时环境 |
| 🚂 Express | 4.18.2 | Web 框架 |
| ️ Prisma | 5.22.0 | ORM 框架 |
|  PostgreSQL | Neon | 云端数据库 |
| 🔐 JWT | 9.0.2 | 身份认证 |
| 📧 Nodemailer | 6.9.9 | 邮件发送 |
| ️ 七牛云 | 7.15.2 | 对象存储 |
|  RSS Parser | 3.13.0 | RSS 解析 |
|  bcryptjs | 2.4.3 | 密码加密 |

---

##  快速开始

### 📋 环境要求

| 工具 | 版本要求 | 说明 |
|------|----------|------|
| 🟢 Node.js | 20+ | JavaScript 运行时 |
| 📦 pnpm | 8+ | 包管理器（推荐） |
| 🐘 PostgreSQL | 可选 | 本地数据库（使用 Neon 则无需安装） |

### 🌐 前端博客

```bash
# 进入项目目录
cd ThriveX-Blog

# 安装依赖
pnpm install

# 启动开发服务器 (http://localhost:9000)
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

### 🎛️ 管理后台

```bash
# 进入项目目录
cd ThriveX-Admin

# 安装依赖
pnpm install

# 启动开发服务器 (http://localhost:9001)
pnpm dev

# 构建生产版本
pnpm build
```

### ⚙️ 后端服务

```bash
# 进入项目目录
cd ThriveX-Server-Node

# 安装依赖
npm install

# 生成 Prisma 客户端
npm run prisma:generate

# 启动开发服务器 (http://localhost:9002)
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

---

## ️ 环境变量配置

###  后端配置

复制 `.env.example` 为 `.env` 并配置：

```env
# 🗄️ 数据库配置
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# 🔐 JWT 配置
JWT_SECRET="your-secret-key"
JWT_EXPIRES_IN="259200000"

# 🌐 服务配置
PORT=9002
NODE_ENV=development

#  CORS 配置
CORS_ORIGIN="http://localhost:9000,http://localhost:9001"

# 📁 文件上传配置
FILE_UPLOAD_DIR="./uploads"
MAX_FILE_SIZE=10485760

# 📧 邮件配置
SMTP_HOST="smtp.qq.com"
SMTP_PORT=465
SMTP_USER="xxx@qq.com"
SMTP_PASS="your-password"

# ️ 限流配置
RATE_LIMIT_TOKENS=100
RATE_LIMIT_DURATION=60
BLACKLIST_THRESHOLD=10
BLACKLIST_DURATION=60
```

### 🌐 前端配置

```env
# 🔗 API 地址
VITE_PROJECT_API="http://localhost:9002/api"
```

---

## 📸 功能展示

### 🏠 博客首页
- 📰 文章列表展示
- 🎠 轮播图展示
- 📊 数据统计看板

###  文章详情
- ✍️ Markdown 渲染
- 💬 评论系统
- ️ 标签分类
-  分享功能

### 🎛️ 管理后台
- 📊 数据仪表盘
- ✍️ 文章编辑器
-  图片管理
- ⚙️ 系统配置

---

##  开源许可

本项目基于 **MIT 许可证** 开源，同时保留 ThriveX 的版权标识。

```
Copyright (c) 2024 Ice Blog
Copyright (c) 2023 ThriveX - LiuYuYang

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction...
```

---

##  致谢

- 🌟 感谢原项目作者 [刘宇阳](https://github.com/LiuYuYang01) 的开源贡献
-  基于完整的 [ThriveX](https://github.com/LiuYuYang01/ThriveX-Admin) 博客系统进行二次开发，包括：
  - 🎛️ **ThriveX-Admin** — 管理后台
  - 🌐 **ThriveX-Blog** — 前端博客
  - ️ **ThriveX-Server** — 后端服务
- ❤️ 感谢所有开源社区贡献者

---

## 💬 获取帮助

如果你在部署或使用过程中遇到问题：

- 🐛 在 GitHub 提交 [Issue](https://github.com/your-repo/issues)
- 💬 加入讨论群交流
-  查看 [Wiki 文档](https://github.com/your-repo/wiki)

---

<p align="center">
  Made with ❤️ by Ice Blog Team
</p>
