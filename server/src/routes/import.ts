import { Router } from 'express';
import { z } from 'zod';
import { Prisma } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { ok, fail, Code } from '../utils/response';
import { parseCards, validateSpelling } from '../utils/parseCard';

const router = Router();

const collocationSchema = z.object({ en: z.string(), zh: z.string().optional() });
const exampleSchema = z.object({ en: z.string(), zh: z.string().optional() });
const upgradeSchema = z.object({ word: z.string(), note: z.string().optional() });

const cardSchema = z.object({
  spelling: z.string(),
  partOfSpeech: z.string().optional(),
  meaning: z.string().optional(),
  phonetic: z.string().optional(),
  collocations: z.array(collocationSchema).optional(),
  examples: z.array(exampleSchema).optional(),
  writingPosition: z.string().optional(),
  substitutions: z.string().optional(),
  upgrades: z.array(upgradeSchema).optional(),
  upgradeExamples: z.array(exampleSchema).optional(),
});

// 已存在单词时，只合并本次卡片提供的非空字段（空字段保留旧值，避免清空已有数据）
function buildCardUpdate(card: z.infer<typeof cardSchema>): Prisma.WordUpdateInput {
  const data: Prisma.WordUpdateInput = {};
  const meaning = card.meaning?.trim();
  if (meaning) data.meaning = meaning;
  const phonetic = card.phonetic?.trim();
  if (phonetic) data.phonetic = phonetic;
  const partOfSpeech = card.partOfSpeech?.trim();
  if (partOfSpeech) data.partOfSpeech = partOfSpeech;
  const writingPosition = card.writingPosition?.trim();
  if (writingPosition) data.writingPosition = writingPosition;
  const substitutions = card.substitutions?.trim();
  if (substitutions) data.substitutions = substitutions;
  if (card.collocations?.length) data.collocations = card.collocations as Prisma.InputJsonValue;
  if (card.examples?.length) data.examples = card.examples as Prisma.InputJsonValue;
  if (card.upgrades?.length) data.upgrades = card.upgrades as Prisma.InputJsonValue;
  if (card.upgradeExamples?.length) data.upgradeExamples = card.upgradeExamples as Prisma.InputJsonValue;
  return data;
}

const parseSchema = z.object({ text: z.string().max(200000) });
const importSchema = z.object({
  cards: z.array(cardSchema).max(500),
  wordBookId: z.string().optional(),
});

// 只解析不写库，供前端预览
router.post('/parse', requireAuth, async (req: AuthRequest, res) => {
  const parsed = parseSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(fail(Code.BAD_REQUEST, parsed.error.issues[0]?.message ?? '参数错误'));
    return;
  }
  res.json(ok(parseCards(parsed.data.text)));
});

// 批量入库：新词创建；已存在词合并本次非空字段；传词书则建立关联
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  const parsed = importSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json(fail(Code.BAD_REQUEST, parsed.error.issues[0]?.message ?? '参数错误'));
    return;
  }

  const { cards, wordBookId } = parsed.data;
  const userId = req.userId!;

  if (wordBookId) {
    const book = await prisma.wordBook.findFirst({ where: { id: wordBookId, ownerId: userId } });
    if (!book) {
      res.status(404).json(fail(Code.NOT_FOUND, '词书不存在'));
      return;
    }
  }

  let imported = 0;
  let updated = 0;
  let skipped = 0;
  const errors: { index: number; spelling?: string; reason: string }[] = [];
  const seen = new Set<string>();

  for (const [i, card] of cards.entries()) {
    const spelling = (card.spelling ?? '').trim().toLowerCase();

    if (!spelling || !validateSpelling(spelling)) {
      errors.push({ index: i, spelling: card.spelling || undefined, reason: '单词为空或含非法字符' });
      continue;
    }
    if (seen.has(spelling)) {
      skipped += 1; // 同批次内重复
      continue;
    }
    seen.add(spelling);

    try {
      let wordId: string;
      const existing = await prisma.word.findUnique({ where: { spelling } });
      if (existing) {
        // 已存在：合并本次卡片提供的非空字段；无新增字段才算跳过
        const update = buildCardUpdate(card);
        if (Object.keys(update).length > 0) {
          await prisma.word.update({ where: { id: existing.id }, data: update });
          updated += 1;
        } else {
          skipped += 1;
        }
        wordId = existing.id;
      } else {
        const created = await prisma.word.create({
          data: {
            spelling,
            meaning: card.meaning ?? '',
            phonetic: card.phonetic?.trim() || null,
            partOfSpeech: card.partOfSpeech?.trim() || null,
            collocations: (card.collocations ?? undefined) as Prisma.InputJsonValue | undefined,
            examples: (card.examples ?? undefined) as Prisma.InputJsonValue | undefined,
            writingPosition: card.writingPosition?.trim() || null,
            substitutions: card.substitutions?.trim() || null,
            upgrades: (card.upgrades ?? undefined) as Prisma.InputJsonValue | undefined,
            upgradeExamples: (card.upgradeExamples ?? undefined) as Prisma.InputJsonValue | undefined,
          },
        });
        wordId = created.id;
        imported += 1;
      }

      await prisma.userWord.upsert({
        where: { userId_wordId: { userId, wordId } },
        update: {},
        create: { userId, wordId },
      });

      if (wordBookId) {
        await prisma.wordBookWord.upsert({
          where: { wordBookId_wordId: { wordBookId, wordId } },
          update: {},
          create: { wordBookId, wordId },
        });
      }
    } catch {
      errors.push({ index: i, spelling, reason: '入库失败' });
    }
  }

  res.json(ok({ imported, updated, skipped, errors }));
});

export default router;
