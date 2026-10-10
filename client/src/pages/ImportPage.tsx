import { useEffect, useState } from 'react';
import { importApi, wordbooksApi } from '../api';
import type { ImportCard, ParseIssue, ImportResult, WordBook } from '../types';
import { WordDetailModal } from '../components/WordDetailModal';

const SAMPLE = `Reinforce (v. 加强，强化；加固；增援)

【核心词伙】：reinforce one's belief (强化某人的信念)；reinforce the importance of (强调/强化……的重要性)；reinforce mutual trust (增进互信)；reinforce a stereotype (加深刻板印象)；reinforce the foundation (加固基础)。

【词伙例句】：

Regular exercise can reinforce both physical health and mental resilience. (规律的锻炼可以增强身体健康和心理韧性。)

Cultural exchange programs help reinforce mutual trust between different nations. (文化交流项目有助于增进不同国家之间的互信。)

【写作定位】：第三段（提出对策，呼吁加强某方面的教育/措施）。

【替换与避坑】：替换 strengthen / enhance / consolidate。

【升级替换】：consolidate (巩固，加强，强调稳固已有成果)，cement (巩固，加强，比喻像水泥一样牢固)，bolster (支持，增强，常搭配信心/经济)。

升级例句：The two countries have consolidated their economic ties through trade agreements. (两国通过贸易协定巩固了经济联系。) / The new policy is designed to bolster consumer confidence. (新政策旨在增强消费者信心。)`;

export function ImportPage() {
  const [text, setText] = useState('');
  const [cards, setCards] = useState<ImportCard[]>([]);
  const [issues, setIssues] = useState<ParseIssue[]>([]);
  const [books, setBooks] = useState<WordBook[]>([]);
  const [wordBookId, setWordBookId] = useState('');
  const [parsing, setParsing] = useState(false);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState('');
  const [viewCard, setViewCard] = useState<ImportCard | null>(null);

  useEffect(() => {
    void wordbooksApi.list().then(setBooks).catch(() => setBooks([]));
  }, []);

  const parse = async (): Promise<void> => {
    setError('');
    setResult(null);
    setParsing(true);
    try {
      const res = await importApi.parse(text);
      setCards(res.cards);
      setIssues(res.issues);
      if (res.cards.length === 0) setError('没有解析到任何单词卡片');
    } catch (err) {
      setError(err instanceof Error ? err.message : '解析失败');
    } finally {
      setParsing(false);
    }
  };

  const doImport = async (): Promise<void> => {
    setError('');
    setImporting(true);
    try {
      const res = await importApi.importCards(cards, wordBookId || undefined);
      setResult(res);
    } catch (err) {
      setError(err instanceof Error ? err.message : '导入失败');
    } finally {
      setImporting(false);
    }
  };

  const updateCard = (index: number, patch: Partial<ImportCard>): void => {
    setCards((prev) => prev.map((c, i) => (i === index ? { ...c, ...patch } : c)));
  };

  const removeCard = (index: number): void => {
    setCards((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow p-5">
        <h2 className="font-medium mb-3">粘贴单词笔记</h2>
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={10}
          placeholder={`第一行：单词 (词性 释义)\n后续：以【小标题】分块，如【核心词伙】【词伙例句】【写作定位】【替换与避坑】【升级替换】…`}
          className="w-full border rounded-lg px-3 py-2 text-sm font-mono"
        />
        <div className="mt-3 flex items-center gap-3">
          <button
            onClick={() => void parse()}
            disabled={parsing || !text.trim()}
            className="bg-indigo-600 text-white px-5 py-2 rounded-lg text-sm disabled:opacity-50"
          >
            {parsing ? '解析中…' : '解析'}
          </button>
          <button
            onClick={() => setText(SAMPLE)}
            className="text-gray-500 text-sm hover:underline"
          >
            填入示例
          </button>
        </div>
      </div>

      {issues.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-700">
          <p className="font-medium mb-1">有 {issues.length} 处未通过校验：</p>
          <ul className="list-disc pl-5 space-y-0.5">
            {issues.map((iss, i) => (
              <li key={i}>第 {iss.index + 1} 段：{iss.reason}</li>
            ))}
          </ul>
        </div>
      )}

      {cards.length > 0 && (
        <div className="bg-white rounded-xl shadow p-5">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <h2 className="font-medium">预览（{cards.length} 张）</h2>
            <select
              value={wordBookId}
              onChange={(e) => setWordBookId(e.target.value)}
              className="border rounded-lg px-3 py-2 text-sm"
            >
              <option value="">不加入词书</option>
              {books.map((b) => (
                <option key={b.id} value={b.id}>
                  加入「{b.name}」
                </option>
              ))}
            </select>
            <button
              onClick={() => void doImport()}
              disabled={importing}
              className="bg-green-600 text-white px-5 py-2 rounded-lg text-sm disabled:opacity-50"
            >
              {importing ? '导入中…' : '确认导入'}
            </button>
          </div>

          <ul className="space-y-3">
            {cards.map((card, i) => (
              <li key={i} className="border rounded-lg p-3">
                <div className="grid grid-cols-1 md:grid-cols-[1fr_5rem_1fr] gap-2">
                  <input
                    value={card.spelling}
                    onChange={(e) => updateCard(i, { spelling: e.target.value })}
                    className="border rounded-lg px-3 py-2 text-sm font-medium"
                    placeholder="单词"
                  />
                  <input
                    value={card.partOfSpeech ?? ''}
                    onChange={(e) => updateCard(i, { partOfSpeech: e.target.value || undefined })}
                    className="border rounded-lg px-3 py-2 text-sm"
                    placeholder="词性"
                  />
                  <input
                    value={card.meaning ?? ''}
                    onChange={(e) => updateCard(i, { meaning: e.target.value || undefined })}
                    className="border rounded-lg px-3 py-2 text-sm"
                    placeholder="释义"
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                  <span>
                    词伙 {card.collocations?.length ?? 0} · 例句 {card.examples?.length ?? 0} ·
                    升级 {card.upgrades?.length ?? 0} · 升级例句 {card.upgradeExamples?.length ?? 0}
                  </span>
                  <div className="flex gap-3">
                    <button onClick={() => setViewCard(card)} className="text-indigo-500 hover:text-indigo-700">
                      查看卡片
                    </button>
                    <button onClick={() => removeCard(i)} className="text-red-400 hover:text-red-600">
                      删除
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm text-green-700">
          <p>
            导入完成：新增 {result.imported} 个，更新 {result.updated} 个，跳过 {result.skipped} 个，失败{' '}
            {result.errors.length} 个
          </p>
          {result.errors.length > 0 && (
            <ul className="list-disc pl-5 mt-2">
              {result.errors.map((e, i) => (
                <li key={i}>
                  {e.spelling ?? `第 ${e.index + 1} 条`}：{e.reason}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {error && <p className="text-red-500 text-sm">{error}</p>}

      <WordDetailModal card={viewCard} onClose={() => setViewCard(null)} />
    </div>
  );
}
