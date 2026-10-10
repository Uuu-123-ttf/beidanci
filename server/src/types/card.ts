// ============================================================
// 词汇卡片解析/导入的领域类型（与前端 client/src/types.ts 对应）
// 这些类型是「粘贴文本 → 结构化卡片」的契约，JSON 字段的存储形状
// 也据此对齐（见 prisma schema 的 Json 字段）。
// ============================================================

/** 词伙：如 "reinforce one's belief (强化某人的信念)" */
export interface Collocation {
  en: string;
  zh?: string;
}

/** 例句：英文 + 可选中文翻译 */
export interface Example {
  en: string;
  zh?: string;
}

/** 升级替换：如 "consolidate (巩固，加强…)" */
export interface Upgrade {
  word: string;
  note?: string;
}

/** 一张解析后的结构化单词卡片 */
export interface ParsedCard {
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

/** 解析时某一条（或某块）内容失败的原因，不阻断其它内容 */
export interface ParseIssue {
  /** 卡片在粘贴文本中的序号（0 起），用于定位是哪一段解析失败 */
  index: number;
  reason: string;
}

/** 解析接口的出参 */
export interface ParseResult {
  cards: ParsedCard[];
  issues: ParseIssue[];
}

/** 导入时单条失败的原因 */
export interface ImportError {
  index: number;
  spelling?: string;
  reason: string;
}

/** 导入接口的出参 */
export interface ImportResult {
  imported: number;
  skipped: number;
  errors: ImportError[];
}
