// src/lib/auth/routeGuards.ts
export type Role = 'Admin' | 'User';

export const ADMIN_ONLY_PATTERNS: ReadonlyArray<string | RegExp> = [
  '/dashboard',
  '/requests',
  '/clients',
  '/categories',
  '/admin',
  /^\/products\/new\/?$/i,
  /^\/products\/[^/]+\/edit\/?$/i,
];

export function isAdminOnly(pathname: string): boolean {
  return ADMIN_ONLY_PATTERNS.some(p =>
    typeof p === 'string' ? pathname.startsWith(p) : p.test(pathname)
  );
}
