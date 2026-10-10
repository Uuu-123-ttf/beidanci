import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { ok, fail, Code } from '../utils/response';

const router = Router();

const createSchema = z.object({ name: z.string().trim().min(1, '词书名不能为空').max(50) });

router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = createSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(fail(Code.BAD_REQUEST, parsed.error.issues[0]?.message ?? '参数错误'));
    return;
  }

  const book = await prisma.wordBook.create({ data: { name: parsed.data.name, ownerId: req.userId! } });
  res.status(201).json(ok(book));
});

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const books = await prisma.wordBook.findMany({
    where: { ownerId: req.userId! },
    include: { _count: { select: { words: true } } },
    orderBy: { createdAt: 'desc' },
  });
  res.json(ok(books));
});

router.get('/:id', requireAuth, async (req: AuthRequest, res) => {
  const book = await prisma.wordBook.findFirst({
    where: { id: req.params.id as string, ownerId: req.userId! },
    include: { words: { include: { word: true }, orderBy: { position: 'asc' } } },
  });
  if (!book) {
    res.status(404).json(fail(Code.NOT_FOUND, '词书不存在'));
    return;
  }

  res.json(ok({
    ...book,
    words: book.words.map((w) => ({ ...w.word, position: w.position })),
  }));
});

const addWordsSchema = z.object({
  words: z.array(z.object({
    spelling: z.string().trim().min(1).max(100),
    meaning: z.string().trim().min(1),
    phonetic: z.string().trim().max(100).optional(),
    example: z.string().trim().max(500).optional(),
  })).min(1, '至少一个单词').max(500, '一次最多 500 个'),
});

// 批量往词书加单词（全局词典去重 + 关联词书）
router.post('/:id/words', requireAuth, async (req: AuthRequest, res) => {
  const bookId = req.params.id as string;
  const parsed = addWordsSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(fail(Code.BAD_REQUEST, parsed.error.issues[0]?.message ?? '参数错误'));
    return;
  }

  const book = await prisma.wordBook.findFirst({ where: { id: bookId, ownerId: req.userId! } });
  if (!book) {
    res.status(404).json(fail(Code.NOT_FOUND, '词书不存在'));
    return;
  }

  const maxPos = await prisma.wordBookWord.aggregate({ where: { wordBookId: bookId }, _max: { position: true } });
  let position = maxPos._max?.position ?? 0;

  const links: { wordBookId: string; wordId: string; position: number }[] = [];
  for (const w of parsed.data.words) {
    const spelling = w.spelling.toLowerCase();
    const word = await prisma.word.upsert({
      where: { spelling },
      update: { meaning: w.meaning },
      create: { spelling, meaning: w.meaning, phonetic: w.phonetic?.trim() || null, example: w.example?.trim() || null },
    });
    links.push({ wordBookId: bookId, wordId: word.id, position: ++position });
  }

  await prisma.wordBookWord.createMany({ data: links, skipDuplicates: true });
  res.json(ok({ added: parsed.data.words.length }));
});

// 把词书里的单词批量导入当前用户学习列表
router.post('/:id/import', requireAuth, async (req: AuthRequest, res) => {
  const book = await prisma.wordBook.findFirst({
    where: { id: req.params.id as string, ownerId: req.userId! },
    include: { words: true },
  });
  if (!book) {
    res.status(404).json(fail(Code.NOT_FOUND, '词书不存在'));
    return;
  }

  const userId = req.userId!;
  const wordIds = book.words.map((w) => w.wordId);
  const existing = await prisma.userWord.findMany({ where: { userId, wordId: { in: wordIds } }, select: { wordId: true } });
  const existingSet = new Set(existing.map((e) => e.wordId));
  const toAdd = wordIds.filter((id) => !existingSet.has(id));

  if (toAdd.length > 0) {
    await prisma.userWord.createMany({ data: toAdd.map((wordId) => ({ userId, wordId })) });
  }

  res.json(ok({ imported: toAdd.length }));
});

router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  await prisma.wordBook.deleteMany({ where: { id: req.params.id as string, ownerId: req.userId! } });
  res.json(ok(null, '已删除'));
});

export default router;
