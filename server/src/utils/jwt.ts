import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET ?? 'dev-secret';

// 记住我 → 30 天；否则会话级 → 2 小时
export const REMEMBER_TTL = '30d';
export const SESSION_TTL = '2h';

type ExpiresIn = SignOptions['expiresIn'];

// userId 放在标准 subject 字段，避免在 payload 上做宽泛类型断言
export const signToken = (userId: string, expiresIn: ExpiresIn): string =>
  jwt.sign({}, SECRET, { subject: userId, expiresIn });

export const verifyToken = (token: string): string => {
  const decoded = jwt.verify(token, SECRET);
  const sub = typeof decoded === 'string' ? decoded : decoded.sub;
  if (!sub) {
    throw new Error('invalid token');
  }
  return sub;
};
