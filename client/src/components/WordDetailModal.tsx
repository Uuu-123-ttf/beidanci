import { WordCard } from './WordCard';
import type { WordCardData } from '../types';

export function WordDetailModal({
  card,
  onClose,
}: {
  card: WordCardData | null;
  onClose: () => void;
}) {
  if (!card) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-start sm:items-center justify-center p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div className="w-full max-w-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/40"
            aria-label="关闭"
          >
            ✕
          </button>
        </div>
        <WordCard card={card} />
      </div>
    </div>
  );
}
