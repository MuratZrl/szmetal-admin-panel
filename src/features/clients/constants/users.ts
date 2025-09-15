// src/constants/users.ts
export const ROLE_OPTIONS = ['Admin', 'Manager', 'User'] as const;
export type AppRole = typeof ROLE_OPTIONS[number];

export const STATUS_OPTIONS = ['Active', 'Inactive', 'Banned'] as const;
export type AppStatus = typeof STATUS_OPTIONS[number];

export function isAppRole(v: unknown): v is AppRole {
  return typeof v === 'string' && (ROLE_OPTIONS as readonly string[]).includes(v);
}
export function isAppStatus(v: unknown): v is AppStatus {
  return typeof v === 'string' && (STATUS_OPTIONS as readonly string[]).includes(v);
}
export function isUUID(v: unknown): v is string {
  return typeof v === 'string' &&
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
}
