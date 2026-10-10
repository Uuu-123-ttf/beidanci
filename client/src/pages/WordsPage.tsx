import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { wordsApi } from '../api';
import type { WordItem } from '../types';
import { WordDetailModal } from '../components/WordDetailModal';

const PROFICIENCY: Record<number, { text: string; cls: string }> = {
  0: { text: '新词', cls: 'bg-gray-100 text-gray-600' },
  1: { text: '学习中', cls: 'bg-amber-100 text-amber-700' },
  2: { text: '已掌握', cls: 'bg-green-100 text-green-700' },
};

export function WordsPage() {
  const [spelling, setSpelling] = useState('');
  const [meaning, setMeaning] = useState('');
  const [phonetic, setPhonetic] = useState('');
  const [example, setExample] = useState('');
  const [items, setItems] = useState<WordItem[]>([]);
  const [total, setTotal] = useState(0);
  const [q, setQ] = useState('');
  const [error, setError] = useState('');
  const [selectedWord, setSelectedWord] = useState<WordItem | null>(null);

  const load = async (search = ''): Promise<void> => {
    const res = await wordsApi.list({ q: search, page: 1, pageSize: 100 });
    setItems(res.items);
    setTotal(res.total);
  };

  useEffect(() => {
    void load();
  }, []);

  const add = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    setError('');
    try {
      await wordsApi.add({
        spelling,
        meaning,
        phonetic: phonetic.trim() || undefined,
        example: example.trim() || undefined,
      });
      setSpelling('');
      setMeaning('');
      setPhonetic('');
      setExample('');
      void load(q);
    } catch (err) {
      setError(err instanceof Error ? err.message : '出错了');
    }
  };

  const remove = async (id: string): Promise<void> => {
    await wordsApi.remove(id);
    void load(q);
  };

  return (
    <div>
      <form
        onSubmit={add}
        className="bg-white rounded-xl shadow p-4 mb-6 grid grid-cols-1 md:grid-cols-2 gap-3"
      >
        <input
          value={spelling}
          onChange={(e) => setSpelling(e.target.value)}
          placeholder="单词（如 apple）"
          required
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <input
          value={phonetic}
          onChange={(e) => setPhonetic(e.target.value)}
          placeholder="音标（可选）"
          className="border rounded-lg px-3 py-2 text-sm"
        />
        <input
          value={meaning}
          onChange={(e) => setMeaning(e.target.value)}
          placeholder="释义"
          required
          className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
        />
        <input
          value={example}
          onChange={(e) => setExample(e.target.value)}
          placeholder="例句（可选）"
          className="border rounded-lg px-3 py-2 text-sm md:col-span-2"
        />
        {error && <p className="text-red-500 text-sm md:col-span-2">{error}</p>}
        <button className="bg-indigo-600 text-white py-2 rounded-lg text-sm md:col-span-2">
          添加单词
        </button>
      </form>

      <div className="flex items-center justify-between mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void load(q);
          }}
          placeholder="搜索单词…"
          className="border rounded-lg px-3 py-2 text-sm w-48"
        />
        <span className="text-sm text-gray-500">共 {total} 个</span>
      </div>

      <ul className="space-y-2">
        {items.map((w) => {
          const p = PROFICIENCY[w.proficiency] ?? PROFICIENCY[0];
          return (
            <li
              key={w.id}
              onClick={() => setSelectedWord(w)}
              className="bg-white rounded-xl shadow px-4 py-3 flex items-center justify-between cursor-pointer hover:bg-gray-50"
            >
              <div>
                <span className="font-medium">{w.spelling}</span>
                {w.phonetic && <span className="text-gray-400 text-sm ml-2">/{w.phonetic}/</span>}
                <p className="text-gray-600 text-sm mt-0.5">{w.meaning}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`text-xs px-2 py-1 rounded-full ${p.cls}`}>{p.text}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    void remove(w.id);
                  }}
                  className="text-gray-400 hover:text-red-500 text-sm"
                >
                  删除
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <WordDetailModal card={selectedWord} onClose={() => setSelectedWord(null)} />
    </div>
  );
}
