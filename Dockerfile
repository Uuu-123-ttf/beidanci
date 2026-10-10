# ---- 1. 构建前端（React + Vite）----
FROM node:20-alpine AS client-build
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# ---- 2. 安装后端依赖并生成 Prisma Client ----
FROM node:20-alpine AS server-deps
WORKDIR /app/server
COPY server/package*.json ./
RUN npm install
COPY server/prisma ./prisma
RUN npx prisma generate

# ---- 3. 运行时：一个进程同时提供 API + 前端静态文件 ----
FROM node:20-alpine
# Prisma 引擎在 Alpine 上需要 OpenSSL
RUN apk add --no-cache openssl
WORKDIR /app/server
ENV NODE_ENV=production
COPY --from=server-deps /app/server/node_modules ./node_modules
COPY server/ ./
COPY --from=client-build /app/client/dist ../client/dist
EXPOSE 3001
# 先应用数据库迁移，再启动服务（监听 $PORT，默认 3001）
CMD ["sh", "-c", "npx prisma migrate deploy && npm start"]
