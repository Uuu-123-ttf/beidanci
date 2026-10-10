#!/usr/bin/env bash
# 在腾讯云 Cloud Studio（或任意 Linux 环境）一键装好并启动背单词应用
#
# 用法：
#   1. 先建好 server/.env：cp server/.env.example server/.env
#      填入 DATABASE_URL（Neon 连接串）和 JWT_SECRET（随机长串）
#   2. 在终端执行：bash cloudstudio-start.sh
set -euo pipefail
cd "$(dirname "$0")"

if [ ! -f server/.env ]; then
  echo "❌ 缺少 server/.env。请先执行："
  echo "   cp server/.env.example server/.env"
  echo "   然后编辑 server/.env，填入："
  echo "   - DATABASE_URL = Neon 的连接串（postgresql://...）"
  echo "   - JWT_SECRET   = 一长串随机字符"
  exit 1
fi

echo "==> 1/5 安装后端依赖"
(cd server && npm install)

echo "==> 2/5 生成 Prisma Client"
(cd server && npx prisma generate)

echo "==> 3/5 应用数据库迁移"
(cd server && npx prisma migrate deploy)

echo "==> 4/5 安装前端依赖并构建"
(cd client && npm install && npm run build)

echo "==> 5/5 启动服务（端口 ${PORT:-3001}）"
echo "    启动后，在 Cloud Studio 的「端口」面板把 ${PORT:-3001} 设为公开，"
echo "    复制生成的访问链接，即可在 iPad 浏览器打开使用。"
cd server
exec npm start
