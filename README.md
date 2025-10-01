# ThriveX 博客系统 - 开发环境部署指南

## 项目简介

ThriveX 是一个现代化的全栈博客系统，包含以下三个主要组件：

- **ThriveX-Blog**: 前端博客展示页面 (Next.js)
- **ThriveX-Admin**: 管理后台界面 (Vite + React)  
- **ThriveX-Server**: 后端 API 服务 (Spring Boot)

## 快速开始

### 前置要求

- Docker 20.10+
- Docker Compose 2.0+
- Git

### 一键启动开发环境

```bash
# 克隆项目
git clone <repository-url>
cd Ice_blog

# 启动所有服务
docker-compose up -d

# 查看服务状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

### 访问地址

启动成功后，可以通过以下地址访问各个服务：

| 服务 | 地址 | 说明 |
|------|------|------|
| 前端博客 | http://localhost:3000 | 博客展示页面 |
| 管理后台 | http://localhost:9100 | 后台管理界面 |
| 后端API | http://localhost:9003 | RESTful API 服务 |
| MySQL | localhost:3306 | 数据库服务 |
| Redis | localhost:6379 | 缓存服务 |

### 开发调试

#### 前端开发
- **博客前端**: 支持热重载，修改 `ThriveX-Blog` 目录下的文件会自动更新
- **管理后台**: 支持热重载，修改 `ThriveX-Admin` 目录下的文件会自动更新

#### 后端开发
- **Java 远程调试**: 端口 5005，可以使用 IDE 连接进行断点调试
- **日志查看**: `docker-compose logs -f thrivex-server`

### 数据库配置

#### MySQL 连接信息
- **主机**: localhost
- **端口**: 3306
- **数据库**: thrivex_blog
- **用户名**: thrivex
- **密码**: thrivex123456
- **Root密码**: root123456

#### Redis 连接信息
- **主机**: localhost
- **端口**: 6379
- **密码**: redis123456

### 常用命令

```bash
# 启动所有服务
docker-compose up -d

# 停止所有服务
docker-compose down

# 重启特定服务
docker-compose restart thrivex-blog
docker-compose restart thrivex-admin
docker-compose restart thrivex-server

# 查看服务日志
docker-compose logs -f thrivex-blog
docker-compose logs -f thrivex-admin
docker-compose logs -f thrivex-server

# 进入容器
docker-compose exec thrivex-blog sh
docker-compose exec thrivex-admin sh
docker-compose exec thrivex-server bash

# 重新构建服务
docker-compose build thrivex-blog
docker-compose build thrivex-admin
docker-compose build thrivex-server

# 清理并重新启动
docker-compose down -v
docker-compose up -d --build
```

### 开发环境特性

1. **代码热重载**: 前端项目支持实时代码更新
2. **数据持久化**: MySQL 和 Redis 数据会持久化保存
3. **远程调试**: Java 后端支持远程调试
4. **日志输出**: 所有服务的日志都可以通过 docker-compose logs 查看
5. **网络隔离**: 所有服务运行在独立的 Docker 网络中

### 故障排除

#### 端口冲突
如果遇到端口冲突，可以修改 `docker-compose.yml` 中的端口映射：

```yaml
ports:
  - "3001:3000"  # 将前端端口改为 3001
```

#### 服务启动失败
1. 检查 Docker 是否正常运行
2. 确保端口没有被其他程序占用
3. 查看服务日志：`docker-compose logs <service-name>`

#### 数据库连接问题
1. 确保 MySQL 服务已启动：`docker-compose ps`
2. 检查数据库初始化是否完成：`docker-compose logs mysql`
3. 验证连接信息是否正确

### 项目结构