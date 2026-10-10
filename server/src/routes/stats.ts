import { Router } from 'express';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { ok } from '../utils/response';
import { localDateString, startOfToday } from '../utils/datetime';

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res) => {
  const userId = req.userId!;

  const [mastered, learning, newCount, totalReviews, todayReviewed, checkIns] = await Promise.all([
    prisma.userWord.count({ where: { userId, proficiency: 2 } }),
    prisma.userWord.count({ where: { userId, proficiency: 1 } }),
    prisma.userWord.count({ where: { userId, proficiency: 0 } }),
    prisma.reviewLog.count({ where: { userId } }),
    prisma.reviewLog.count({ where: { userId, reviewedAt: { gte: startOfToday() } } }),
    prisma.checkIn.findMany({ where: { userId }, select: { date: true }, orderBy: { date: 'desc' } }),
  ]);

  const dates = [...new Set(checkIns.map((c) => c.date))];

  res.json(ok({
    masteredCount: mastered,
    learningCount: learning,
    newCount,
    totalReviews,
    todayReviewed,
    checkInDays: dates.length,
    streak: calcStreak(dates),
  }));
});

// 连续打卡天数：今天未打卡时从昨天起算，不中断 streak
function calcStreak(dates: string[]): number {
  const set = new Set(dates);
  const cursor = new Date();
  if (!set.has(localDateString(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }
  let streak = 0;
  while (set.has(localDateString(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
}

export default router;
