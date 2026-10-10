import { api } from './client';
import type {
  User,
  WordItem,
  ReviewItem,
  WordBook,
  BookWord,
  Stats,
  ImportCard,
  ParseResult,
  ImportResult,
} from '../types';

export const authApi = {
  register: (payload: { email: string; password: string; name?: string; rememberMe?: boolean }) =>
    api<{ token: string; user: User }>('/api/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: { email: string; password: string; rememberMe?: boolean }) =>
    api<{ token: string; user: User }>('/api/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  me: () => api<User>('/api/users/me'),
  updateMe: (payload: { name?: string; oldPassword?: string; newPassword?: string }) =>
    api<User>('/api/users/me', { method: 'PATCH', body: JSON.stringify(payload) }),
};

export const wordsApi = {
  add: (payload: { spelling: string; meaning: string; phonetic?: string; example?: string }) =>
    api<WordItem>('/api/words', { method: 'POST', body: JSON.stringify(payload) }),
  list: (params: { q?: string; status?: string; page?: number; pageSize?: number }) => {
    const qs = new URLSearchParams();
    if (params.q) qs.set('q', params.q);
    if (params.status) qs.set('status', params.status);
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    return api<{ items: WordItem[]; total: number; page: number; pageSize: number }>(`/api/words?${qs.toString()}`);
  },
  remove: (wordId: string) => api<null>(`/api/words/${wordId}`, { method: 'DELETE' }),
};

export const reviewApi = {
  today: () => api<{ items: ReviewItem[]; total: number }>('/api/review/today'),
  submit: (wordId: string, rating: number) =>
    api<{ rating: number; nextReviewAt: string; nextInterval: number; repetitions: number; proficiency: number }>(
      `/api/review/${wordId}`,
      { method: 'POST', body: JSON.stringify({ rating }) },
    ),
};

export const wordbooksApi = {
  create: (name: string) => api<WordBook>('/api/wordbooks', { method: 'POST', body: JSON.stringify({ name }) }),
  list: () => api<WordBook[]>('/api/wordbooks'),
  detail: (id: string) => api<WordBook & { words: BookWord[] }>(`/api/wordbooks/${id}`),
  addWords: (id: string, words: { spelling: string; meaning: string; phonetic?: string; example?: string }[]) =>
    api<{ added: number }>(`/api/wordbooks/${id}/words`, { method: 'POST', body: JSON.stringify({ words }) }),
  importToLearning: (id: string) => api<{ imported: number }>(`/api/wordbooks/${id}/import`, { method: 'POST' }),
  remove: (id: string) => api<null>(`/api/wordbooks/${id}`, { method: 'DELETE' }),
};

export const statsApi = {
  get: () => api<Stats>('/api/stats'),
};

export const importApi = {
  parse: (text: string) =>
    api<ParseResult>('/api/import/parse', { method: 'POST', body: JSON.stringify({ text }) }),
  importCards: (cards: ImportCard[], wordBookId?: string) =>
    api<ImportResult>('/api/import', { method: 'POST', body: JSON.stringify({ cards, wordBookId }) }),
};
