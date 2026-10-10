import type { ApiResponse } from '../types';

const TOKEN_KEY = 'vocab_token';
const EMAIL_KEY = 'vocab_email';

// 记住我 → localStorage（30 天）；否则 → sessionStorage（关浏览器即失效）
export const getToken = (): string | null =>
  localStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(TOKEN_KEY);
export const setToken = (token: string, remember: boolean): void => {
  clearToken();
  (remember ? localStorage : sessionStorage).setItem(TOKEN_KEY, token);
};
export const clearToken = (): void => {
  localStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(TOKEN_KEY);
};

// 记住邮箱用于下次自动填充（仅邮箱，不存密码）
export const getRememberedEmail = (): string => localStorage.getItem(EMAIL_KEY) ?? '';
export const setRememberedEmail = (email: string): void => localStorage.setItem(EMAIL_KEY, email);

export class ApiError extends Error {
  code: number;
  constructor(message: string, code: number) {
    super(message);
    this.code = code;
  }
}

// 统一封装：附加 token、解析 { code, data, message }，非 0 抛 ApiError
export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const body = (await res.json()) as ApiResponse<T>;
  if (body.code !== 0) {
    throw new ApiError(body.message, body.code);
  }
  return body.data as T;
}
