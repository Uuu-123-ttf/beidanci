import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { ok, fail, Code } from '../utils/response';
import { hashPassword, verifyPassword } from '../utils/password';

const router = Router();

// 当前登录用户信息（用于前端启动时校验 token）
router.get('/me', requireAuth, async (req: AuthRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId },
    select: { id: true, email: true, name: true, createdAt: true },
  });

  if (!user) {
    res.status(401).json(fail(Code.UNAUTHORIZED, '用户不存在'));
    return;
  }

  res.json(ok(user));
});

const updateMeSchema = z.object({
  name: z.string().trim().min(1, '昵称不能为空').max(30).optional(),
  oldPassword: z.string().min(1).optional(),
  newPassword: z.string().min(6, '新密码至少 6 位').max(72).optional(),
});

// 更新昵称 / 修改密码
router.patch('/me', requireAuth, async (req: AuthRequest, res) => {
  const parsed = updateMeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(fail(Code.BAD_REQUEST, parsed.error.issues[0]?.message ?? '参数错误'));
    return;
  }

  const { name, oldPassword, newPassword } = parsed.data;
  const userId = req.userId!;

  const data: { name?: string; passwordHash?: string } = {};
  if (name !== undefined) data.name = name;

  if (newPassword) {
    if (!oldPassword) {
      res.status(400).json(fail(Code.BAD_REQUEST, '修改密码需提供原密码'));
      return;
    }
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !(await verifyPassword(oldPassword, user.passwordHash))) {
      res.status(400).json(fail(Code.BAD_REQUEST, '原密码错误'));
      return;
    }
    data.passwordHash = await hashPassword(newPassword);
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, email: true, name: true, createdAt: true },
  });
  res.json(ok(user));
});

export default router;
