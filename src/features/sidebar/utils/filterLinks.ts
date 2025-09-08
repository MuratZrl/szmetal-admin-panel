// src/features/sidebar/utils/filterLinks.ts
import type { SidebarLink, Role } from '../types';

export function filterLinksByRole(links: SidebarLink[], role: Role, loading: boolean): SidebarLink[] {
  if (loading) return links.map(l => ({ ...l, disabled: true }));
  if (role === 'Admin') return links.filter(l => l.label !== 'Logout' || !l.href);
  if (role === 'User')  return links.filter(l => !l.roles || l.roles.includes('User'));
  return [];
}
