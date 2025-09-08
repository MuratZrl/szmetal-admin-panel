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
};

export default function SidebarNav({ links, unreadCount, loading }: Props) {
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

  return (
    <List sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
      {links.filter(l => l.label !== 'Logout').map(link => (
        <SidebarNavItem
          key={link.href ?? link.label}
          link={link}
          unreadCount={unreadCount}
          active={Boolean(link.href && pathname?.startsWith(link.href))}
        />
      ))}
    </List>
  );
}
