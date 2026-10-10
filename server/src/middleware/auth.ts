import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/jwt';
import { fail, Code } from '../utils/response';

export interface AuthRequest extends Request {
  userId?: string;
}

export const requireAuth = (req: AuthRequest, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    res.status(401).json(fail(Code.UNAUTHORIZED, '未登录'));
    return;
  }

  try {
    req.userId = verifyToken(token);
    next();
  } catch {
    res.status(401).json(fail(Code.UNAUTHORIZED, '登录已过期，请重新登录'));
  }
};
