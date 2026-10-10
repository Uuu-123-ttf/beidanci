// SM-2 间隔重复算法
export interface Sm2State {
  easinessFactor: number;
  interval: number;
  repetitions: number;
  lapses: number;
}

export interface Sm2Result extends Sm2State {
  nextInterval: number; // 距下次复习的天数
}

const MIN_EF = 1.3;

// quality 0-5，>=3 记为答对，<3 记为遗忘
export function review(state: Sm2State, quality: number): Sm2Result {
  const q = Math.max(0, Math.min(5, Math.round(quality)));
  const ef = Math.max(
    MIN_EF,
    state.easinessFactor + (0.1 - (5 - q) * (0.08 + (5 - q) * 0.02)),
  );

  // 遗忘：重置连续次数，间隔回到 1 天
  if (q < 3) {
    return {
      easinessFactor: ef,
      interval: 1,
      repetitions: 0,
      lapses: state.lapses + 1,
      nextInterval: 1,
    };
  }

  // 答对：首次 1 天，第二次 6 天，之后按 EF 递增
  let interval: number;
  if (state.repetitions === 0) {
    interval = 1;
  } else if (state.repetitions === 1) {
    interval = 6;
  } else {
    interval = Math.round(state.interval * ef);
  }

  return {
    easinessFactor: ef,
    interval,
    repetitions: state.repetitions + 1,
    lapses: state.lapses,
    nextInterval: interval,
  };
}

// 掌握程度：0 新词 / 1 学习中 / 2 已掌握（连续答对 3 次视为掌握）
export function proficiencyOf(repetitions: number, reviewCount: number): number {
  if (repetitions >= 3) return 2;
  if (reviewCount > 0) return 1;
  return 0;
}
