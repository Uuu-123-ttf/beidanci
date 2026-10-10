// 解析器单元测试：`npx tsx src/utils/parseCard.test.ts`
import assert from 'node:assert/strict';
import { parseCards } from './parseCard';

let passed = 0;
function check(name: string, fn: () => void): void {
  fn();
  passed += 1;
  console.log(`  ✓ ${name}`);
}

const SAMPLE = `Reinforce (v. 加强，强化；加固；增援)

【核心词伙】：reinforce one's belief (强化某人的信念)；reinforce the importance of (强调/强化……的重要性)；reinforce mutual trust (增进互信)；reinforce a stereotype (加深刻板印象)；reinforce the foundation (加固基础)。

【词伙例句】：

Regular exercise can reinforce both physical health and mental resilience. (规律的锻炼可以增强身体健康和心理韧性。)

Cultural exchange programs help reinforce mutual trust between different nations. (文化交流项目有助于增进不同国家之间的互信。)

Misleading information online may reinforce existing stereotypes rather than break them down. (网上的误导性信息可能会加深现有的刻板印象，而非打破它们。)

【写作定位】：第三段（提出对策，呼吁加强某方面的教育/措施）或第二段（分析积极/消极影响，指出某事物强化了某种趋势）。

【替换与避坑】：替换 strengthen / enhance / consolidate。避坑：reinforce 强调"在原有基础上进一步加固或增强"，而不是从无到有地创造。

【升级替换】：consolidate (巩固，加强，强调稳固已有成果)，cement (巩固，加强，比喻像水泥一样牢固)，bolster (支持，增强，常搭配信心/经济)。

升级例句：The two countries have consolidated their economic ties through trade agreements. (两国通过贸易协定巩固了经济联系。) / The new policy is designed to bolster consumer confidence. (新政策旨在增强消费者信心。)`;

check('完整样本解析', () => {
  const { cards, issues } = parseCards(SAMPLE);
  assert.equal(issues.length, 0);
  assert.equal(cards.length, 1);
  const c = cards[0]!;
  assert.equal(c.spelling, 'Reinforce');
  assert.equal(c.partOfSpeech, 'v.');
  assert.equal(c.meaning, '加强，强化；加固；增援');
  assert.equal(c.collocations?.length, 5);
  assert.equal(c.collocations?.[0]?.en, 'reinforce one\'s belief');
  assert.equal(c.collocations?.[0]?.zh, '强化某人的信念');
  assert.equal(c.examples?.length, 3);
  assert.equal(c.examples?.[0]?.zh, '规律的锻炼可以增强身体健康和心理韧性。');
  assert.ok(c.writingPosition?.includes('第三段'));
  assert.ok(c.substitutions?.includes('strengthen'));
  assert.equal(c.upgrades?.length, 3);
  assert.equal(c.upgrades?.[0]?.word, 'consolidate');
  assert.equal(c.upgrades?.[0]?.note, '巩固，加强，强调稳固已有成果');
  assert.equal(c.upgradeExamples?.length, 2);
  assert.equal(c.upgradeExamples?.[1]?.en, 'The new policy is designed to bolster consumer confidence.');
});

check('只有单词没有释义', () => {
  const { cards, issues } = parseCards('apple');
  assert.equal(issues.length, 0);
  assert.equal(cards[0]!.spelling, 'apple');
  assert.equal(cards[0]!.meaning, undefined);
});

check('有释义但无词性', () => {
  const { cards } = parseCards('apple (苹果)');
  assert.equal(cards[0]!.spelling, 'apple');
  assert.equal(cards[0]!.partOfSpeech, undefined);
  assert.equal(cards[0]!.meaning, '苹果');
});

check('全角括号混用', () => {
  const { cards } = parseCards('banana （n. 香蕉）');
  assert.equal(cards[0]!.spelling, 'banana');
  assert.equal(cards[0]!.partOfSpeech, 'n.');
  assert.equal(cards[0]!.meaning, '香蕉');
});

check('多张卡片（空行分隔）', () => {
  const { cards } = parseCards('apple (n. 苹果)\n\nbanana (n. 香蕉)');
  assert.equal(cards.length, 2);
  assert.equal(cards[0]!.spelling, 'apple');
  assert.equal(cards[1]!.spelling, 'banana');
});

check('例句无中文翻译', () => {
  const { cards } = parseCards('go (v. 去)\n【例句】：\nLet us go.');
  assert.equal(cards[0]!.examples?.[0]?.en, 'Let us go.');
  assert.equal(cards[0]!.examples?.[0]?.zh, undefined);
});

check('多余空行不影响解析', () => {
  const { cards } = parseCards('\n\napple (n. 苹果)\n\n\n');
  assert.equal(cards.length, 1);
  assert.equal(cards[0]!.spelling, 'apple');
});

check('空文本', () => {
  const { cards } = parseCards('');
  assert.equal(cards.length, 0);
});

check('非法拼写被标记', () => {
  const { cards, issues } = parseCards('apple123 (n. 苹果)');
  assert.equal(cards.length, 1);
  assert.equal(issues.length, 1);
  assert.ok(issues[0]!.reason.includes('非法'));
});

console.log(`\n${passed} 项全部通过`);
