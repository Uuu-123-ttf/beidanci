import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { ok, fail, Code } from '../utils/response';
import { review, proficiencyOf } from '../utils/sm2';
import { addDays, localDateString } from '../utils/datetime';

const router = Router();

// 今日待复习队列（按到期时间升序，最多 50 个）
router.get('/today', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;
  const now = new Date();

  const [total, items] = await Promise.all([
    prisma.userWord.count({ where: { userId, nextReviewAt: { lte: now } } }),
    prisma.userWord.findMany({
      where: { userId, nextReviewAt: { lte: now } },
      include: { word: true },
      orderBy: { nextReviewAt: 'asc' },
      take: 50,
    }),
  ]);

  res.json(ok({
    total,
    items: items.map((i) => ({
      wordId: i.word.id,
      spelling: i.word.spelling,
      phonetic: i.word.phonetic,
      meaning: i.word.meaning,
      example: i.word.example,
      partOfSpeech: i.word.partOfSpeech,
      collocations: i.word.collocations,
      examples: i.word.examples,
      writingPosition: i.word.writingPosition,
      substitutions: i.word.substitutions,
      upgrades: i.word.upgrades,
      upgradeExamples: i.word.upgradeExamples,
      proficiency: i.proficiency,
      repetitions: i.repetitions,
      interval: i.interval,
      reviewCount: i.reviewCount,
    })),
  }));
});

const ratingSchema = z.object({
  rating: z.number().int().min(0, '评分需在 0-5').max(5, '评分需在 0-5'),
});

// 提交评分：SM-2 计算下次复习时间，写复习日志，并自动打卡
router.post('/:wordId', requireAuth, async (req: AuthRequest, res) => {
  const parsed = ratingSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(fail(Code.BAD_REQUEST, parsed.error.issues[0]?.message ?? '参数错误'));
    return;
  }

  const wordId = req.params.wordId as string;
  const rating = parsed.data.rating;
  const userId = req.userId!;

  const uw = await prisma.userWord.findUnique({ where: { userId_wordId: { userId, wordId } } });
  if (!uw) {
    res.status(404).json(fail(Code.NOT_FOUND, '单词不在学习列表'));
    return;
  }

  const result = review(
    { easinessFactor: uw.easinessFactor, interval: uw.interval, repetitions: uw.repetitions, lapses: uw.lapses },
    rating,
  );

  const now = new Date();
  const nextReviewAt = addDays(now, result.nextInterval);
  const reviewCount = uw.reviewCount + 1;

  const [updated] = await prisma.$transaction([
    prisma.userWord.update({
      where: { userId_wordId: { userId, wordId } },
      data: {
        easinessFactor: result.easinessFactor,
        interval: result.interval,
        repetitions: result.repetitions,
        lapses: result.lapses,
        reviewCount,
        nextReviewAt,
        lastReviewedAt: now,
        proficiency: proficiencyOf(result.repetitions, reviewCount),
      },
    }),
    prisma.reviewLog.create({ data: { userId, wordId, rating } }),
    prisma.checkIn.upsert({
      where: { userId_date: { userId, date: localDateString(now) } },
      update: {},
      create: { userId, date: localDateString(now) },
    }),
  ]);

  res.json(ok({
    rating,
    nextReviewAt,
    nextInterval: result.nextInterval,
    repetitions: result.repetitions,
    proficiency: updated.proficiency,
  }));
});

export default router;
