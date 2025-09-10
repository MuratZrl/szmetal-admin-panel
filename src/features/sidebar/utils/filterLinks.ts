// src/features/sidebar/utils/filterLinks.ts
import type { SidebarLink, Role } from '../types';
import { isAdminOnly } from '@/lib/supabase/auth/routeGuards';

export function filterLinksByRole(links: SidebarLink[], role: Role, loading: boolean): SidebarLink[] {
  if (role === 'Admin') return links;

  if (role === 'User') {
    return links.filter(l => !l.href || !isAdminOnly(l.href));
  }

  if (loading) {
    return links.map(l => ({ ...l, disabled: true } as SidebarLink & { disabled?: boolean }));
  }

  return [];
}
