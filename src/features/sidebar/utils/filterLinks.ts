// src/features/sidebar/utils/filterLinks.ts
import type { SidebarLink, Role } from '../types';

type Status = 'Active' | 'Inactive' | 'Banned';

/**
 * Yönetim dışı için kapalı sayfalar (Manager göremez, User zaten göremez).
 * Gerekirse yeni prefix ekleyebilirsin.
 */
const ADMIN_ONLY_PREFIXES: ReadonlyArray<string> = ['/dashboard'];

/**
 * Sıradan kullanıcıya açık sayfalar.
 * User rolü yalnızca bunları görür (Inactive ise create_request hariç).
 */
const USER_ALLOWED_PREFIXES: ReadonlyArray<string> = ['/account', '/create_request', '/orders', '/products'];

/* ------------------------------- helpers ------------------------------- */

function isExternal(href: string): boolean {
  // http(s) veya mailto vb. ise iç kuralları uygulamayalım
  return /^(?:[a-z][a-z0-9+.-]*:)?\/\//i.test(href) || /^[a-z]+:/i.test(href);
}

function normalizePath(href: string): string {
  if (!href) return '';
  if (isExternal(href)) return href;

  // Query ve hash'i at
  const [noHash] = href.split('#');
  const [noQuery] = noHash.split('?');

  // Sonda tek slash varsa kaldır
  return noQuery.endsWith('/') && noQuery !== '/' ? noQuery.slice(0, -1) : noQuery;
}

export function isAdminOnly(href: string | undefined): boolean {
  if (!href) return false;
  if (isExternal(href)) return false;

  const p = normalizePath(href);
  return ADMIN_ONLY_PREFIXES.some(prefix => p === prefix || p.startsWith(prefix + '/'));
}

function isUserAllowed(href: string | undefined, status: Status): boolean {
  if (!href) return false;
  if (isExternal(href)) return true;

  const p = normalizePath(href);

  // Inactive kullanıcı create_request göremez
  if (status === 'Inactive' && (p === '/create_request' || p.startsWith('/create_request/'))) {
    return false;
  }

  return USER_ALLOWED_PREFIXES.some(prefix => p === prefix || p.startsWith(prefix + '/'));
}

function canSeeLink(href: string | undefined, role: Role, status: Status): boolean {
  if (role === 'Admin') return true;
  if (role === 'Manager') return !isAdminOnly(href);
  // role === 'User'
  return isUserAllowed(href, status);
}

/* --------------------------------- API --------------------------------- */

/**
 * Linkleri rol ve durum kurallarına göre FİLTRELER.
 * Not: `loading=true` iken tasarım bozulmasın diye filtre uygulamaz, olduğu gibi döner.
 * Link nesnelerinin şekline dokunmaz; "children/disabled" gibi alanlar eklemez.
 */
export function filterLinksByRole(
  links: SidebarLink[],
  role: Role,
  loading: boolean,
  status: Status = 'Active'
): SidebarLink[] {
  if (loading) return links;

  if (role === 'Admin') return links;

  if (status === 'Banned') {
    // Banned zaten login olamaz; UI tarafında boş menü güvenli tercih.
    return [];
  }

  return links.filter(link => canSeeLink(link.href, role, status));
}

/** İstersen dışarı da aç: User’ın erişebileceği mi? */
export function isLinkVisibleFor(
  link: SidebarLink,
  role: Role,
  status: Status = 'Active'
): boolean {
  return canSeeLink(link.href, role, status);
}
