// ============================================================
// 粘贴文本 → 结构化词汇卡片 的解析器
//
// 输入格式约定：
//   第一行：单词 (词性 释义)
//   后续：以【小标题】或“小标题：”分块（见 SECTION_MAP）
//   词伙/升级替换用 ；或，分隔；例句是 “英文 (中文)” 一行一条
//
// 多张卡片切分启发式：满足「单个英文词 + 结尾括号，且括号前部分
// 不含分隔符，且前面是空行（或为首行）」的行视为新卡片的头行。
// 局限：多词拼写（如 "look after"）作为非首张卡时不会被自动切分。
// ============================================================

import type {
  ParsedCard,
  Collocation,
  Example,
  Upgrade,
  ParseIssue,
  ParseResult,
} from '../types/card';

// 段落小标题 → 卡片字段（同时支持【标题】与“标题：”两种写法）
const SECTION_MAP: Record<string, keyof ParsedCard> = {
  核心词伙: 'collocations',
  词伙: 'collocations',
  词伙例句: 'examples',
  例句: 'examples',
  写作定位: 'writingPosition',
  替换与避坑: 'substitutions',
  升级替换: 'upgrades',
  升级例句: 'upgradeExamples',
  音标: 'phonetic',
  发音: 'phonetic',
};

// 拼写：字母开头，可含字母/连字符/撇号/空格
const SPELLING_RE = /^[A-Za-z][A-Za-z'\- ]*$/;

// 头行：单词 + 可选 (词性 释义)
const HEADER_RE = /^([A-Za-z][A-Za-z'\- ]*?)\s*(?:\(([^()]*)\))?\s*$/;

// 括号内的词性前缀：v. / n. / adj. / adv. / vt. / vi. / n./v. 等
const POS_RE = /^([A-Za-z]{1,5}\.(?:\s*\/\s*[A-Za-z]{1,5}\.)*)\s*(.*)$/;

export function validateSpelling(spelling: string): boolean {
  return SPELLING_RE.test(spelling);
}

function normalize(text: string): string {
  return text
    .replace(/\r\n?/g, '\n')
    .replace(/（/g, '(')
    .replace(/）/g, ')')
    .trim();
}

// 头行判定：单个英文词 + 结尾括号，且无分隔符（用于区分例句/词伙行）
function isHeaderLine(line: string): boolean {
  const m = line.match(HEADER_RE);
  if (!m || m[2] === undefined) return false;
  const word = m[1]!.trim();
  if (/[；;，,。./]/.test(word)) return false;
  return !/\s/.test(word);
}

// 把整段文本切成若干张卡的「行数组」
function splitCards(lines: string[]): string[][] {
  const cards: string[][] = [];
  let current: string[] = [];
  let prevBlank = false;

  for (const raw of lines) {
    const line = raw.trim();
    if (line === '') {
      prevBlank = true;
      continue;
    }
    if (isHeaderLine(line) && prevBlank && current.length > 0) {
      cards.push(current);
      current = [line];
    } else {
      current.push(line);
    }
    prevBlank = false;
  }
  if (current.length > 0) cards.push(current);
  return cards;
}

// 解析头行：设置 spelling / partOfSpeech / meaning
function parseHeader(line: string, card: ParsedCard): void {
  // 括号形式：拼写宽松捕获（合法性由 validateSpelling 把关，见主入口）
  const m = line.match(/^(.+?)\s*\(([^()]*)\)\s*$/);
  if (m) {
    card.spelling = m[1]!.trim();
    const inner = m[2]!;
    const pos = inner.match(POS_RE);
    if (pos) {
      card.partOfSpeech = pos[1]!.trim();
      card.meaning = pos[2]!.trim() || undefined;
    } else {
      card.meaning = inner.trim() || undefined;
    }
    return;
  }
  // 无括号：整行作为单词，若后面跟释义则一并记录
  const fallback = line.match(/^(\S+)\s*(.*)$/);
  if (fallback) {
    card.spelling = fallback[1]!.trim();
    const rest = fallback[2]!.trim();
    if (rest) card.meaning = rest;
  }
}

// 识别段落小标题行，返回 { 名称, 行内内容 }
function matchSection(line: string): { name: string; inline: string } | null {
  const bracketed = line.match(/^【(.+?)】\s*[:：]?\s*(.*)$/);
  if (bracketed) {
    return { name: bracketed[1]!.trim(), inline: bracketed[2]! };
  }
  const plain = line.match(/^([^：:()【】]{1,12})[:：]\s*(.*)$/);
  if (plain && plain[1]!.trim() in SECTION_MAP) {
    return { name: plain[1]!.trim(), inline: plain[2]! };
  }
  return null;
}

// 顶层分隔（括号内不拆分）
function splitTopLevel(s: string, seps: string): string[] {
  const parts: string[] = [];
  let depth = 0;
  let buf = '';
  for (const ch of s) {
    if (ch === '(') depth += 1;
    if (ch === ')') depth = Math.max(0, depth - 1);
    if (seps.includes(ch) && depth === 0) {
      parts.push(buf);
      buf = '';
      continue;
    }
    buf += ch;
  }
  if (buf.trim() !== '' || parts.length === 0) parts.push(buf);
  return parts.map((p) => p.trim()).filter(Boolean);
}

// 把 "english (中文)" 拆成 { en, zh }；只丢弃右括号之后的标点，
// 无括号时整句保留（英文例句的句号不能删）
function splitEnZh(item: string): { en: string; zh?: string } {
  const s = item.trim();
  if (!s) return { en: '' };
  const m = s.match(/^(.*?)\s*\(([^()]*)\)\s*[。.，,；;]*\s*$/);
  if (m && m[1]!.trim()) {
    return { en: m[1]!.trim(), zh: m[2]!.trim() || undefined };
  }
  return { en: s };
}

function parseCollocations(content: string): Collocation[] {
  return splitTopLevel(content, '；;，,')
    .map(splitEnZh)
    .filter((c) => c.en !== '');
}

function parseExamples(lines: string[]): Example[] {
  return lines
    .map((l) => l.trim())
    .filter(Boolean)
    .map(splitEnZh)
    .filter((e) => e.en !== '');
}

function parseUpgrades(content: string): Upgrade[] {
  return splitTopLevel(content, '，,')
    .map(splitEnZh)
    .map((c) => ({ word: c.en, note: c.zh }))
    .filter((u) => u.word !== '');
}

function parseUpgradeExamples(content: string): Example[] {
  return splitTopLevel(content, '/')
    .map(splitEnZh)
    .filter((e) => e.en !== '');
}

function applySection(card: ParsedCard, field: keyof ParsedCard, lines: string[]): void {
  const content = lines
    .filter((l) => l.trim() !== '')
    .join('\n')
    .trim();
  switch (field) {
    case 'phonetic':
      card.phonetic = content || undefined;
      break;
    case 'writingPosition':
      card.writingPosition = content || undefined;
      break;
    case 'substitutions':
      card.substitutions = content || undefined;
      break;
    case 'collocations':
      card.collocations = parseCollocations(content);
      break;
    case 'examples':
      card.examples = parseExamples(lines);
      break;
    case 'upgrades':
      card.upgrades = parseUpgrades(content);
      break;
    case 'upgradeExamples':
      card.upgradeExamples = parseUpgradeExamples(content);
      break;
    default:
      break;
  }
}

// 解析一张卡（头行 + 若干小标题块）
function parseCard(lines: string[]): ParsedCard {
  const card: ParsedCard = { spelling: '' };
  if (lines.length === 0) return card;
  parseHeader(lines[0]!, card);

  let sectionName: string | null = null;
  let sectionLines: string[] = [];

  const flush = (): void => {
    if (sectionName !== null) {
      const field = SECTION_MAP[sectionName];
      if (field) applySection(card, field, sectionLines);
    }
    sectionName = null;
    sectionLines = [];
  };

  for (const line of lines.slice(1)) {
    const sec = matchSection(line);
    if (sec) {
      flush();
      sectionName = sec.name;
      if (sec.inline.trim() !== '') sectionLines.push(sec.inline);
    } else if (line.trim() !== '') {
      sectionLines.push(line);
    }
  }
  flush();
  return card;
}

// 主入口：粘贴文本 → { cards, issues }
export function parseCards(raw: string): ParseResult {
  const lines = normalize(raw).split('\n');
  const blocks = splitCards(lines);

  const cards: ParsedCard[] = [];
  const issues: ParseIssue[] = [];

  blocks.forEach((block, index) => {
    const card = parseCard(block);
    const spelling = card.spelling.trim();
    if (!spelling) {
      issues.push({ index, reason: '缺少单词（spelling）' });
    } else if (!validateSpelling(spelling)) {
      issues.push({ index, reason: `单词含非法字符：${spelling}` });
    }
    card.spelling = spelling;
    cards.push(card);
  });

  return { cards, issues };
}
