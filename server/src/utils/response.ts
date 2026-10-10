import { Code } from './codes';

export { Code };

// 统一返回 { code, data, message }
export interface ApiResponse<T = unknown> {
  code: number;
  data: T | null;
  message: string;
}

export const ok = <T>(data: T, message = 'success'): ApiResponse<T> => ({
  code: Code.OK,
  data,
  message,
});

export const fail = (code: number, message: string): ApiResponse<null> => ({
  code,
  data: null,
  message,
});
