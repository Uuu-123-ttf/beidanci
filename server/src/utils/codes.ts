// 业务状态码：0 成功，非 0 失败
export const Code = {
  OK: 0,
  BAD_REQUEST: 40000,
  UNAUTHORIZED: 40100,
  INVALID_CREDENTIALS: 40101,
  NOT_FOUND: 40400,
  EMAIL_EXISTS: 40900,
  INTERNAL_ERROR: 50000,
} as const;

export type CodeValue = (typeof Code)[keyof typeof Code];
