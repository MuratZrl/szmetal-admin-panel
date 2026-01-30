'use client';
// src/features/sidebar/components/SidebarNav.tsx

import { usePathname } from 'next/navigation';

import { List, ListItem, ListItemButton, IconButton, CircularProgress } from '@mui/material';

import SidebarNavItem from './SidebarNavItem';

import type { SidebarLink } from '../types';

type Props = {
  links: SidebarLink[];
  unreadCount: number;
  loading: boolean;
  compact?: boolean;
};

function makeKey(link: SidebarLink, idx: number) {
  // En sağlam: varsa stabil id kullan
  const anyLink = link as unknown as { id?: string };
  if (anyLink.id && anyLink.id.trim()) return anyLink.id;

  const section = (link.section ?? 'main').trim();
  const href = (link.href ?? '').trim();
  const label = (link.label ?? '').trim();

  // Href tek başına güvenli olmayabilir, label tek başına hiç güvenli değil.
  // Birleştir, yine de garanti olsun diye idx ekle.
  return `${section}::${href}::${label}::${idx}`;
}

export default function SidebarNav({ links, loading, compact }: Props) {
  const pathname = usePathname();

  if (loading) {
    return (
      <List
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: compact ? 'center' : 'stretch',
          gap: 0.5,
          width: '100%',
        }}
      >
        <ListItem disablePadding sx={{ justifyContent: 'center' }}>
          <ListItemButton sx={{ justifyContent: 'center' }}>
            <IconButton size="small" disabled>
              <CircularProgress size={35} color="inherit" />
            </IconButton>
          </ListItemButton>
        </ListItem>
      </List>
    );
  }

  const main = links.filter((l) => (l.section ?? 'main') === 'main');

  return (
    <List
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: compact ? 'center' : 'stretch',
        gap: 0.75,
        width: '100%',
      }}
    >
      {main.map((link, idx) => {
        const href = link.href;
        const isActive =
          Boolean(
            href &&
              pathname &&
              (pathname === href || pathname.startsWith(`${href}/`) || pathname.startsWith(`${href}?`)),
          );

        return (
          <SidebarNavItem
            key={makeKey(link, idx)}
            link={link}
            active={isActive}
            compact={compact}
          />
        );
      })}
    </List>
  );
}
