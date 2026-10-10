import { useEffect, useState } from 'react';
import { reviewApi } from '../api';
import type { ReviewItem } from '../types';
import { Flashcard } from '../components/Flashcard';

const RATING_BUTTONS = [
  { label: '不认识', rating: 1, cls: 'bg-red-500 hover:bg-red-600' },
  { label: '模糊', rating: 3, cls: 'bg-amber-500 hover:bg-amber-600' },
  { label: '认识', rating: 5, cls: 'bg-green-500 hover:bg-green-600' },
];

export function ReviewPage() {
  const [items, setItems] = useState<ReviewItem[]>([]);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(0);
  const [loading, setLoading] = useState(true);

  const load = async (): Promise<void> => {
    setLoading(true);
    const res = await reviewApi.today();
    setItems(res.items);
    setIndex(0);
    setDone(0);
    setLoading(false);
  };

  useEffect(() => {
    void load();
  }, []);

  const rate = async (rating: number): Promise<void> => {
    const item = items[index];
    if (!item) return;
    await reviewApi.submit(item.wordId, rating);
    setDone((d) => d + 1);
    setIndex((i) => i + 1);
  };

  const item = items[index];

  if (loading) {
    return <p className="text-center text-gray-500 py-16">加载中…</p>;
  }

  if (!item) {
    return (
      <div className="text-center py-16">
        <p className="text-4xl mb-3">🎉</p>
        <p className="text-gray-700 mb-6">
          {items.length > 0 ? `今日复习已完成，共复习 ${done} 个单词` : '今天没有待复习的单词'}
        </p>
        <button onClick={() => void load()} className="text-indigo-600 text-sm hover:underline">
          刷新队列
        </button>
      </div>
    );
  }

  return (
    <div>
      <p className="text-center text-sm text-gray-500 mb-4">剩余 {items.length - index} 个</p>
      <Flashcard key={item.wordId} item={item} />
      <div className="flex justify-center gap-4 mt-6">
        {RATING_BUTTONS.map((b) => (
          <button
            key={b.label}
            onClick={() => void rate(b.rating)}
            className={`${b.cls} text-white px-8 py-2 rounded-lg`}
          >
            {b.label}
          </button>
        ))}
      </div>
    </div>
  );
}
