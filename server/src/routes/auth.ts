import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { hashPassword, verifyPassword } from '../utils/password';
import { signToken, REMEMBER_TTL, SESSION_TTL } from '../utils/jwt';
import { ok, fail, Code } from '../utils/response';

const router = Router();

const registerSchema = z.object({
  email: z.email('邮箱格式不正确'),
  password: z.string().min(6, '密码至少 6 位').max(72, '密码过长'),
  name: z.string().trim().min(1, '昵称不能为空').max(30, '昵称过长').optional(),
  rememberMe: z.boolean().optional(),
});

const loginSchema = z.object({
  email: z.email('邮箱格式不正确'),
  password: z.string().min(1, '请输入密码'),
  rememberMe: z.boolean().optional(),
});

const publicUser = { id: true, email: true, name: true, createdAt: true } as const;

router.post('/register', async (req, res) => {
  const parsed = registerSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(fail(Code.BAD_REQUEST, parsed.error.issues[0]?.message ?? '参数错误'));
    return;
  }

  const { email, password, name } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existing) {
    res.status(409).json(fail(Code.EMAIL_EXISTS, '该邮箱已注册'));
    return;
  }

  const user = await prisma.user.create({
    data: { email: normalizedEmail, passwordHash: await hashPassword(password), name: name ?? null },
    select: publicUser,
  });

  const ttl = parsed.data.rememberMe ? REMEMBER_TTL : SESSION_TTL;
  res.status(201).json(ok({ token: signToken(user.id, ttl), user }));
});

router.post('/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(fail(Code.BAD_REQUEST, parsed.error.issues[0]?.message ?? '参数错误'));
    return;
  }

  const { email, password } = parsed.data;
  const normalizedEmail = email.toLowerCase();

  const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (!user) {
    res.status(401).json(fail(Code.INVALID_CREDENTIALS, '邮箱或密码错误'));
    return;
  }

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) {
    res.status(401).json(fail(Code.INVALID_CREDENTIALS, '邮箱或密码错误'));
    return;
  }

  const ttl = parsed.data.rememberMe ? REMEMBER_TTL : SESSION_TTL;
  res.json(ok({ token: signToken(user.id, ttl), user: { id: user.id, email: user.email, name: user.name } }));
});

export default router;
