// src/features/sidebar/utils/filterLinks.ts
import type { SidebarLink, Role } from '../types';

type Status = 'Active' | 'Inactive' | 'Banned';

const ADMIN_ONLY_PREFIXES: ReadonlyArray<string> = ['/dashboard'];
const USER_ALLOWED_PREFIXES: ReadonlyArray<string> = [
  '/account', '/create_request', '/orders', '/products',
];
const ACCOUNT_PREFIX = '/account';

function isExternal(href: string): boolean {
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(href) || /^[a-z]+:/i.test(href);
}
function normalizePath(href: string): string {
  if (!href) return '';
  if (isExternal(href)) return href;
  const [noHash] = href.split('#');
  const [noQuery] = noHash.split('?');
  return noQuery.endsWith('/') && noQuery !== '/' ? noQuery.slice(0, -1) : noQuery;
}
function isUnder(prefix: string, href: string): boolean {
  const p = normalizePath(href);
  return p === prefix || p.startsWith(prefix + '/');
}
function isAccountHref(href: string | undefined): boolean {
  if (!href || isExternal(href)) return false;
  return isUnder(ACCOUNT_PREFIX, href);
}
export function isAdminOnly(href: string | undefined): boolean {
  if (!href || isExternal(href)) return false;
  const p = normalizePath(href);
  return ADMIN_ONLY_PREFIXES.some(prefix => p === prefix || p.startsWith(prefix + '/'));
}
function isUserAllowedActive(href: string | undefined): boolean {
  if (!href) return false;
  if (isExternal(href)) return true;
  const p = normalizePath(href);
  return USER_ALLOWED_PREFIXES.some(prefix => p === prefix || p.startsWith(prefix + '/'));
}

function canSeeLink(href: string | undefined, role: Role, status: Status): boolean {
  if (status === 'Banned') return false;
  if (status === 'Inactive') return isAccountHref(href); // ← sadece /account

  if (role === 'Admin') return true;
  if (role === 'Manager') return !isAdminOnly(href);
  return isUserAllowedActive(href);
}

export function filterLinksByRole(
  links: SidebarLink[],
  role: Role,
  loading: boolean,
  status: Status = 'Active'
): SidebarLink[] {
  if (loading) return links;
  return links.filter(link => canSeeLink(link.href, role, status));
}

export function isLinkVisibleFor(
  link: SidebarLink,
  role: Role,
  status: Status = 'Active'
): boolean {
  return canSeeLink(link.href, role, status);
}
