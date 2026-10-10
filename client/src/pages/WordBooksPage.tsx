import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';
import { wordbooksApi } from '../api';
import type { WordBook, BookWord } from '../types';
import { WordDetailModal } from '../components/WordDetailModal';

export function WordBooksPage() {
  const [books, setBooks] = useState<WordBook[]>([]);
  const [name, setName] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [detailWords, setDetailWords] = useState<BookWord[]>([]);
  const [bulk, setBulk] = useState('');
  const [message, setMessage] = useState('');
  const [selectedCard, setSelectedCard] = useState<BookWord | null>(null);

  const load = async (): Promise<void> => {
    setBooks(await wordbooksApi.list());
  };

  useEffect(() => {
    void load();
  }, []);

  const create = async (e: FormEvent): Promise<void> => {
    e.preventDefault();
    await wordbooksApi.create(name);
    setName('');
    void load();
  };

  const openDetail = async (id: string): Promise<void> => {
    const d = await wordbooksApi.detail(id);
    setSelected(id);
    setDetailWords(d.words);
    setMessage('');
  };

  const importBook = async (id: string): Promise<void> => {
    const res = await wordbooksApi.importToLearning(id);
    setMessage(`已导入 ${res.imported} 个新单词到学习列表`);
  };

  const addBulk = async (): Promise<void> => {
    if (!selected) return;
    const words = bulk
      .split('\n')
      .map((line) => {
        const [spelling, ...rest] = line.split(/[,\t]/);
        return { spelling: spelling?.trim() ?? '', meaning: rest.join(' ').trim() };
      })
      .filter((w) => w.spelling && w.meaning);

    if (words.length === 0) {
      setMessage('请按「单词,释义」每行一个填写');
      return;
    }
    await wordbooksApi.addWords(selected, words);
    setBulk('');
    setMessage(`已添加 ${words.length} 个单词`);
    void openDetail(selected);
  };

  const removeBook = async (id: string): Promise<void> => {
    await wordbooksApi.remove(id);
    if (selected === id) setSelected(null);
    void load();
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <form onSubmit={create} className="bg-white rounded-xl shadow p-4 flex gap-2 mb-4">
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="新建词书名"
            required
            className="border rounded-lg px-3 py-2 text-sm flex-1"
          />
          <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">新建</button>
        </form>

        <ul className="space-y-2">
          {books.map((b) => (
            <li key={b.id} className="bg-white rounded-xl shadow px-4 py-3 flex items-center justify-between">
              <button onClick={() => void openDetail(b.id)} className="text-left">
                <span className="font-medium">{b.name}</span>
                <span className="text-gray-400 text-sm ml-2">{b._count?.words ?? 0} 词</span>
              </button>
              <button onClick={() => void removeBook(b.id)} className="text-gray-400 hover:text-red-500 text-sm">
                删除
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        {selected ? (
          <div className="bg-white rounded-xl shadow p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium">批量导入（每行「单词,释义」）</h3>
              <button
                onClick={() => void importBook(selected)}
                className="bg-green-500 text-white px-3 py-1.5 rounded-lg text-sm"
              >
                导入到学习
              </button>
            </div>
            <textarea
              value={bulk}
              onChange={(e) => setBulk(e.target.value)}
              rows={6}
              placeholder={'apple, 苹果\nbanana, 香蕉'}
              className="w-full border rounded-lg px-3 py-2 text-sm mb-2"
            />
            <button onClick={() => void addBulk()} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm">
              添加
            </button>
            {message && <p className="text-sm text-gray-600 mt-3">{message}</p>}

            <ul className="mt-4 space-y-1 max-h-64 overflow-auto">
              {detailWords.map((w) => (
                <li key={w.id}>
                  <button
                    onClick={() => setSelectedCard(w)}
                    className="w-full text-left text-sm flex justify-between gap-4 px-2 py-1 rounded hover:bg-gray-50"
                  >
                    <span className="font-medium">{w.spelling}</span>
                    <span className="text-gray-600">{w.meaning}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-16">选择左侧词书查看详情</p>
        )}
      </div>

      <WordDetailModal card={selectedCard} onClose={() => setSelectedCard(null)} />
    </div>
  );
}
