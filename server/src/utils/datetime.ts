// 本地时区的 "YYYY-MM-DD"（避免 UTC 时区导致打卡天数错位）
export const localDateString = (d: Date): string => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

export const addDays = (d: Date, days: number): Date => {
  const r = new Date(d);
  r.setDate(r.getDate() + days);
  return r;
};

export const startOfToday = (): Date => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};
