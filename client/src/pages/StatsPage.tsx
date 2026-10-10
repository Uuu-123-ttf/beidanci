import { useEffect, useState } from 'react';
import { statsApi } from '../api';
import type { Stats } from '../types';

export function StatsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    void statsApi.get().then(setStats);
  }, []);

  if (!stats) {
    return <p className="text-center text-gray-500 py-16">加载中…</p>;
  }

  const cards = [
    { label: '连续打卡', value: `${stats.streak} 天` },
    { label: '累计打卡', value: `${stats.checkInDays} 天` },
    { label: '已掌握', value: String(stats.masteredCount) },
    { label: '学习中', value: String(stats.learningCount) },
    { label: '新词', value: String(stats.newCount) },
    { label: '累计复习', value: String(stats.totalReviews) },
    { label: '今日复习', value: String(stats.todayReviewed) },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {cards.map((c) => (
        <div key={c.label} className="bg-white rounded-xl shadow p-5 text-center">
          <p className="text-3xl font-bold text-indigo-600">{c.value}</p>
          <p className="text-gray-500 text-sm mt-1">{c.label}</p>
        </div>
      ))}
    </div>
  );
}
