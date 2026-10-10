import type { ReactNode } from 'react';
import type { WordCardData } from '../types';

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="border-t border-gray-100 pt-4 mt-4">
      <h4 className="text-xs font-semibold text-gray-400 mb-2">{title}</h4>
      {children}
    </div>
  );
}

function WordCardBody({ card }: { card: WordCardData }) {
  return (
    <>
      {/* 单词头 */}
      <div className="flex items-baseline gap-3 flex-wrap">
        <span className="text-2xl sm:text-3xl font-bold">{card.spelling}</span>
        {card.partOfSpeech && (
          <span className="px-2 py-0.5 rounded bg-indigo-100 text-indigo-700 text-sm font-medium">
            {card.partOfSpeech}
          </span>
        )}
        {card.phonetic && <span className="text-gray-400">/{card.phonetic}/</span>}
      </div>

      {/* 核心释义 */}
      {card.meaning && <p className="mt-2 text-gray-700">{card.meaning}</p>}

      {/* 核心词伙 */}
      {card.collocations && card.collocations.length > 0 && (
        <Section title="核心词伙">
          <ul className="space-y-1.5">
            {card.collocations.map((c, i) => (
              <li key={i} className="flex flex-wrap gap-x-2 text-sm">
                <span className="font-medium">{c.en}</span>
                {c.zh && <span className="text-gray-500">{c.zh}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 词伙例句 */}
      {card.examples && card.examples.length > 0 && (
        <Section title="词伙例句">
          <ul className="space-y-3">
            {card.examples.map((e, i) => (
              <li key={i}>
                <p className="text-sm text-gray-800">{e.en}</p>
                {e.zh && <p className="text-sm text-gray-500 mt-0.5">{e.zh}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 写作定位 */}
      {card.writingPosition && (
        <Section title="写作定位">
          <p className="text-sm text-gray-700 leading-relaxed">{card.writingPosition}</p>
        </Section>
      )}

      {/* 替换与避坑 */}
      {card.substitutions && (
        <Section title="替换与避坑">
          <p className="text-sm text-gray-700 leading-relaxed">{card.substitutions}</p>
        </Section>
      )}

      {/* 升级替换 */}
      {card.upgrades && card.upgrades.length > 0 && (
        <Section title="升级替换">
          <ul className="space-y-1.5">
            {card.upgrades.map((u, i) => (
              <li key={i} className="flex flex-wrap gap-x-2 text-sm">
                <span className="font-medium">{u.word}</span>
                {u.note && <span className="text-gray-500">{u.note}</span>}
              </li>
            ))}
          </ul>
        </Section>
      )}

      {/* 升级例句 */}
      {card.upgradeExamples && card.upgradeExamples.length > 0 && (
        <Section title="升级例句">
          <ul className="space-y-3">
            {card.upgradeExamples.map((e, i) => (
              <li key={i}>
                <p className="text-sm text-gray-800">{e.en}</p>
                {e.zh && <p className="text-sm text-gray-500 mt-0.5">{e.zh}</p>}
              </li>
            ))}
          </ul>
        </Section>
      )}
    </>
  );
}

// 一张完整单词卡片：分模块展示，例句英文一行、中文一行。
// bare=true 时只渲染内容，供复习卡片等已有外层容器的场景复用。
export function WordCard({ card, bare = false }: { card: WordCardData; bare?: boolean }) {
  if (bare) return <WordCardBody card={card} />;
  return (
    <div className="bg-white rounded-2xl shadow p-5 sm:p-6">
      <WordCardBody card={card} />
    </div>
  );
}
