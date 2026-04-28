# Ice Blog

一个现代化的博客系统，采用前后端分离架构。

## 项目结构

```
Ice_blog/
├── ThriveX-Blog/      # 前端博客展示 (Next.js 15)
├── ThriveX-Admin/     # 管理后台 (React + Vite)
├── ThriveX-Server/    # 后端服务 (Spring Boot)
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

### 后端服务 (ThriveX-Server)
- Spring Boot 2.7.12
- MyBatis-Plus
- MySQL + Redis

## 快速开始

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

需要 JDK 8+ 和 Maven：

```bash
cd ThriveX-Server
mvn spring-boot:run
```

## 环境要求

- Node.js 20+
- JDK 8+ (后端)
- MySQL 8.0+
- Redis
- Maven 3.6+
