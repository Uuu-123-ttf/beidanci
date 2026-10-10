import { useState } from 'react';
import type { ReviewItem } from '../types';
import { WordCard } from './WordCard';

export function Flashcard({ item }: { item: ReviewItem }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div
      className="w-full max-w-xl mx-auto h-[min(75vh,30rem)] cursor-pointer select-none"
      onClick={() => setFlipped((f) => !f)}
    >
      <div className="w-full h-full [perspective:1200px]">
        <div
          className={`relative w-full h-full transition-transform duration-500 [transform-style:preserve-3d] ${
            flipped ? '[transform:rotateY(180deg)]' : ''
          }`}
        >
          {/* 正面：只显示最精简信息 */}
          <div className="absolute inset-0 bg-white rounded-2xl shadow flex flex-col items-center justify-center p-6 [backface-visibility:hidden]">
            <span className="text-3xl font-semibold">{item.spelling}</span>
            {item.phonetic && <span className="text-gray-400 mt-2">/{item.phonetic}/</span>}
            <span className="text-gray-400 mt-6 text-sm">点击卡片查看详情</span>
          </div>

          {/* 背面：完整展示所有字段，超长可滚动 */}
          <div className="absolute inset-0 bg-white rounded-2xl shadow overflow-y-auto [transform:rotateY(180deg)] [backface-visibility:hidden]">
            <div className="p-5 sm:p-6">
              <WordCard card={item} bare />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
