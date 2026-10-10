export interface ApiResponse<T> {
  code: number;
  data: T | null;
  message: string;
}

export interface User {
  id: string;
  email: string;
  name: string | null;
  createdAt: string;
}

export interface WordItem {
  id: string;
  spelling: string;
  phonetic: string | null;
  meaning: string;
  example: string | null;
  partOfSpeech: string | null;
  collocations: Collocation[] | null;
  examples: Example[] | null;
  writingPosition: string | null;
  substitutions: string | null;
  upgrades: Upgrade[] | null;
  upgradeExamples: Example[] | null;
  proficiency: number;
  nextReviewAt: string;
  reviewCount: number;
  repetitions: number;
  interval: number;
}

export interface ReviewItem {
  wordId: string;
  spelling: string;
  phonetic: string | null;
  meaning: string;
  example: string | null;
  partOfSpeech: string | null;
  collocations: Collocation[] | null;
  examples: Example[] | null;
  writingPosition: string | null;
  substitutions: string | null;
  upgrades: Upgrade[] | null;
  upgradeExamples: Example[] | null;
  proficiency: number;
  repetitions: number;
  interval: number;
  reviewCount: number;
}

export interface BookWord {
  id: string;
  spelling: string;
  phonetic: string | null;
  meaning: string;
  example: string | null;
  partOfSpeech: string | null;
  collocations: Collocation[] | null;
  examples: Example[] | null;
  writingPosition: string | null;
  substitutions: string | null;
  upgrades: Upgrade[] | null;
  upgradeExamples: Example[] | null;
  position: number;
}

export interface WordBook {
  id: string;
  name: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { words: number };
}

export interface Stats {
  masteredCount: number;
  learningCount: number;
  newCount: number;
  totalReviews: number;
  todayReviewed: number;
  checkInDays: number;
  streak: number;
}

// ---------- 词汇卡片粘贴解析 / 导入 ----------

export interface Collocation {
  en: string;
  zh?: string;
}

export interface Example {
  en: string;
  zh?: string;
}

export interface Upgrade {
  word: string;
  note?: string;
}

/** 一张解析后的结构化单词卡片（可编辑） */
export interface ImportCard {
  spelling: string;
  partOfSpeech?: string;
  meaning?: string;
  phonetic?: string;
  collocations?: Collocation[];
  examples?: Example[];
  writingPosition?: string;
  substitutions?: string;
  upgrades?: Upgrade[];
  upgradeExamples?: Example[];
}

/** 一张完整单词卡片的展示数据（词书/单词列表/导入预览通用） */
export interface WordCardData {
  spelling: string;
  partOfSpeech?: string | null;
  phonetic?: string | null;
  meaning?: string | null;
  collocations?: Collocation[] | null;
  examples?: Example[] | null;
  writingPosition?: string | null;
  substitutions?: string | null;
  upgrades?: Upgrade[] | null;
  upgradeExamples?: Example[] | null;
}

export interface ParseIssue {
  index: number;
  reason: string;
}

export interface ParseResult {
  cards: ImportCard[];
  issues: ParseIssue[];
}

export interface ImportError {
  index: number;
  spelling?: string;
  reason: string;
}

export interface ImportResult {
  imported: number;
  updated: number;
  skipped: number;
  errors: ImportError[];
}
