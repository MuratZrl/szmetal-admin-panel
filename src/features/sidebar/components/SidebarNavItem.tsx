// src/features/sidebar/components/SidebarNavItem.tsx
'use client';

import Link from 'next/link';
import { Badge, ListItem, ListItemButton, Tooltip } from '@mui/material';
import type { SidebarLink } from '../types';

type Props = {
  link: SidebarLink;
  active: boolean;
  unreadCount: number;
  compact?: boolean;
  onLogout?: () => void;
};

export default function SidebarNavItem({ link, active, unreadCount, compact, onLogout }: Props) {
  const { label, labelTr, href, icon: Icon, disabled } = link;
  const isLogout = label === 'Logout';
  const iconEl = label === 'Orders'
    ? <Badge badgeContent={unreadCount} color="error"><Icon fontSize="medium" /></Badge>
    : <Icon fontSize="medium" />;

  return (
    <ListItem disablePadding sx={{ justifyContent: 'center', width: compact ? 'auto' : '100%' }}>
      <Tooltip title={labelTr ?? label} placement="right" arrow>
        {isLogout ? (
          <ListItemButton
            onClick={onLogout}
            aria-label="Logout"
            aria-current={active ? 'page' : undefined}
            selected={active}
            disabled={disabled}
            sx={{ justifyContent: compact ? 'center' : undefined, width: compact ? 44 : undefined, height: compact ? 44 : undefined, minWidth: compact ? 44 : undefined, px: compact ? 0 : undefined }}
          >
            {iconEl}
          </ListItemButton>
        ) : (
          <ListItemButton
            component={Link}
            href={href!}
            prefetch
            aria-label={label}
            aria-current={active ? 'page' : undefined}
            selected={active}
            disabled={disabled}
            draggable={false}
            sx={{ justifyContent: compact ? 'center' : undefined, width: compact ? 44 : undefined, height: compact ? 44 : undefined, minWidth: compact ? 44 : undefined, px: compact ? 0 : undefined }}
          >
            {iconEl}
          </ListItemButton>
        )}
      </Tooltip>
    </ListItem>
  );
}
