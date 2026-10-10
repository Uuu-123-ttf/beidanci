import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { ok, fail, Code } from '../utils/response';

const router = Router();

const addWordSchema = z.object({
  spelling: z.string().trim().min(1, '单词不能为空').max(100),
  meaning: z.string().trim().min(1, '释义不能为空'),
  phonetic: z.string().trim().max(100).optional(),
  example: z.string().trim().max(500).optional(),
});

const STATUS_TO_PROFICIENCY = { new: 0, learning: 1, mastered: 2 } as const;

const listQuery = z.object({
  q: z.string().optional(),
  status: z.enum(['new', 'learning', 'mastered']).optional(),
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
});

// 新增单词：全局词典按小写拼写去重，并加入当前用户学习列表
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = addWordSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(fail(Code.BAD_REQUEST, parsed.error.issues[0]?.message ?? '参数错误'));
    return;
  }

  const { spelling, meaning } = parsed.data;
  const phonetic = parsed.data.phonetic?.trim() || null;
  const example = parsed.data.example?.trim() || null;
  const normalized = spelling.toLowerCase();
  const userId = req.userId!;

  const updateData: { meaning: string; phonetic?: string; example?: string } = { meaning };
  if (phonetic) updateData.phonetic = phonetic;
  if (example) updateData.example = example;

  const word = await prisma.word.upsert({
    where: { spelling: normalized },
    update: updateData,
    create: { spelling: normalized, meaning, phonetic, example },
  });

  await prisma.userWord.upsert({
    where: { userId_wordId: { userId, wordId: word.id } },
    update: {},
    create: { userId, wordId: word.id },
  });

  res.status(201).json(ok(word));
});

// 我的单词列表：支持搜索、按掌握状态筛选、分页
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = listQuery.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json(fail(Code.BAD_REQUEST, parsed.error.issues[0]?.message ?? '参数错误'));
    return;
  }

  const { q, status, page, pageSize } = parsed.data;
  const userId = req.userId!;

  const where: Prisma.UserWordWhereInput = { userId };
  if (q) where.word = { spelling: { contains: q.toLowerCase() } };
  if (status) where.proficiency = STATUS_TO_PROFICIENCY[status];

  const [total, items] = await Promise.all([
    prisma.userWord.count({ where }),
    prisma.userWord.findMany({
      where,
      include: { word: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  res.json(ok({
    total,
    page,
    pageSize,
    items: items.map((i) => ({
      ...i.word,
      proficiency: i.proficiency,
      nextReviewAt: i.nextReviewAt,
      reviewCount: i.reviewCount,
      repetitions: i.repetitions,
      interval: i.interval,
    })),
  }));
});

// 从学习列表移除（不删除全局单词）
router.delete('/:wordId', requireAuth, async (req: AuthRequest, res) => {
  await prisma.userWord.deleteMany({ where: { userId: req.userId!, wordId: req.params.wordId as string } });
  res.json(ok(null, '已移除'));
});

export default router;
