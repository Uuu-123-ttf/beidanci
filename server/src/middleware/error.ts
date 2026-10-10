import { Request, Response, NextFunction } from 'express';
import { fail, Code } from '../utils/response';

export const notFound = (_req: Request, res: Response): void => {
  res.status(404).json(fail(Code.NOT_FOUND, '接口不存在'));
};

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error('[error]', err);
  res.status(500).json(fail(Code.INTERNAL_ERROR, '服务器内部错误'));
};
