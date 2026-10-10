# 背单词

全栈背单词网站：React + TypeScript + Tailwind CSS v4 + Vite 前端，Node.js + Express + Prisma + PostgreSQL 后端，JWT 认证，SM-2 间隔重复算法。

## 目录结构

```
背单词/
├── server/          # Express + Prisma 后端（端口 3001）
└── client/          # React + Vite 前端（端口 5173）
```

## 运行

### 1. 数据库

使用便携版 PostgreSQL，需先启动：

```bash
bash C:/Users/admin/pg-tools/start-db.sh
```

连接串在 `server/.env`（`DATABASE_URL`），默认库 `vocab`。

### 2. 后端

首次先根据模板创建环境变量文件，并填入你自己的值（`JWT_SECRET` 改成随机串、`DATABASE_URL` 指向你的数据库）：

```bash
cd server
cp .env.example .env
npm install
npx prisma migrate deploy   # 首次需建表
npm start                   # http://localhost:3001
```

### 3. 前端

```bash
cd client
npm install
npm run dev                 # http://localhost:5173（/api 自动代理到 3001）
```

生产构建：`cd client && npm run build`（输出到 `dist/`）。

## 功能

- 注册 / 登录（JWT：勾选「记住我」30 天 + localStorage 自动登录；不勾选 2 小时 + sessionStorage 关浏览器失效；登录后记住邮箱自动填充，不存密码）
- 添加单词（大小写不敏感，小写存储）
- 今日复习：卡片翻转，正面精简、背面完整展示单词卡片（词伙/例句/写作定位/升级替换等），认识(5)/模糊(3)/不认识(1) 评分，SM-2 算法调度
- 词书：新建、批量导入、一键导入到学习列表
- 粘贴导入：把结构化单词笔记粘贴后「解析 → 预览（可编辑/删除）→ 入库」，支持词性/核心词伙/词伙例句/写作定位/替换与避坑/升级替换/升级例句
- 统计：连续打卡、累计打卡、已掌握/学习中/新词、复习次数
- 设置：改昵称、改密码

## 接口约定

统一返回 `{ code, data, message }`，`code === 0` 表示成功。
