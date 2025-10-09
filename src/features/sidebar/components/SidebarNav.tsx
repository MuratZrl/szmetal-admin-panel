// src/features/sidebar/components/SidebarNav.tsx
'use client';

import * as React from 'react';
import { List, ListItem, ListItemButton, IconButton, CircularProgress } from '@mui/material';
import { usePathname } from 'next/navigation';
import SidebarNavItem from './SidebarNavItem';
import type { SidebarLink } from '../types';

type Props = {
  links: SidebarLink[];
  unreadCount: number;
  loading: boolean;
  compact?: boolean;
};

export default function SidebarNav({ links, unreadCount, loading, compact }: Props) {
  const pathname = usePathname();

  if (loading) {
    return (
      <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
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

  const main = links.filter(l => (l.section ?? 'main') === 'main');

  return (
    <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
      {main.map(link => (
        <SidebarNavItem
          key={link.href ?? link.label}
          link={link}
          unreadCount={unreadCount}
          active={Boolean(link.href && pathname?.startsWith(link.href))}
          compact={compact}
        />
      ))}
    </List>
  );
}
