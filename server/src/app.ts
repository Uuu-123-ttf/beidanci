import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth';
import usersRouter from './routes/users';
import wordsRouter from './routes/words';
import reviewRouter from './routes/review';
import wordbooksRouter from './routes/wordbooks';
import statsRouter from './routes/stats';
import importRouter from './routes/import';
import { notFound, errorHandler } from './middleware/error';
import { ok } from './utils/response';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const app = express();

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json(ok({ status: 'ok' }));
});

app.use('/api/auth', authRouter);
app.use('/api/users', usersRouter);
app.use('/api/words', wordsRouter);
app.use('/api/review', reviewRouter);
app.use('/api/wordbooks', wordbooksRouter);
app.use('/api/stats', statsRouter);
app.use('/api/import', importRouter);

// 生产环境：托管前端构建产物，并对 react-router 路由做 SPA 回退
const distDir = path.resolve(__dirname, '../../client/dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));
  app.use((req, res, next) => {
    if (req.method !== 'GET' || req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(distDir, 'index.html'));
  });
}

app.use(notFound);
app.use(errorHandler);

export default app;
