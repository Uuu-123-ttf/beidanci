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

app.use(notFound);
app.use(errorHandler);

export default app;
