#!/bin/bash

# ThriveX Blog 一键部署脚本
# 用法: ./deploy.sh [all|backend|blog|admin]

set -e

PROJECT_DIR="/home/ubuntu/Ice_blog"
DEPLOY_TYPE=${1:-all}

echo "=========================================="
echo "🚀 ThriveX Blog 部署脚本"
echo "部署类型: $DEPLOY_TYPE"
echo "=========================================="

cd $PROJECT_DIR

# 拉取最新代码
echo "📥 拉取最新代码..."
git pull origin main

# 后端部署
if [ "$DEPLOY_TYPE" = "all" ] || [ "$DEPLOY_TYPE" = "backend" ]; then
    echo ""
    echo "📦 部署后端 API..."
    cd ThriveX-Server-Node

    npm install --production
    npx prisma generate
    npm run build

    pm2 restart thrivex-api || pm2 start dist/server.js --name thrivex-api

    echo "✅ 后端部署完成"
    cd ..
fi

# 博客前端部署
if [ "$DEPLOY_TYPE" = "all" ] || [ "$DEPLOY_TYPE" = "blog" ]; then
    echo ""
    echo "📦 部署博客前端..."
    cd ThriveX-Blog

    npm install
    npm run build

    pm2 restart thrivex-blog || pm2 start npm --name thrivex-blog -- start

    echo "✅ 博客前端部署完成"
    cd ..
fi

# 管理后台部署
if [ "$DEPLOY_TYPE" = "all" ] || [ "$DEPLOY_TYPE" = "admin" ]; then
    echo ""
    echo "📦 部署管理后台..."
    cd ThriveX-Admin

    npm install
    npm run build

    echo "✅ 管理后台部署完成"
    cd ..
fi

# 显示服务状态
echo ""
echo "=========================================="
echo "📊 服务状态"
echo "=========================================="
pm2 status

echo ""
echo "✅ 部署完成！"
