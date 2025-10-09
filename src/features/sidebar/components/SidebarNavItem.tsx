// src/features/sidebar/components/SidebarNavItem.tsx
'use client';

import * as React from 'react';
import { ListItem, ListItemButton, Tooltip, Box } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';
import type { SidebarLink } from '../types';
import { LinkAdapter } from '@/theme'; // <- theme/index.tsx içinde export’lu

type Props = {
  link: SidebarLink;
  active: boolean;
  unreadCount: number;   // prop kalsın; üst katmanları kırmayalım
  compact?: boolean;
  onLogout?: () => void;
};

export default function SidebarNavItem({ link, active, /* unreadCount */ compact, onLogout }: Props) {
  const { label, labelTr, href, icon: Icon, disabled } = link;
  const isLogout = label === 'Logout';
  const title = labelTr ?? label;

  const buttonSx: SxProps<Theme> = (theme) => {
    const base = theme.palette.accent?.main ?? theme.palette.primary.main;
    return {
      justifyContent: compact ? 'center' : undefined,
      width: compact ? 44 : undefined,
      height: compact ? 44 : undefined,
      minWidth: compact ? 44 : undefined,
      px: compact ? 0 : undefined,
      borderRadius: compact ? '50%' : theme.shape.borderRadius,
      '&:hover': { backgroundColor: alpha(base, 0.10) },
      '&.Mui-selected': { backgroundColor: alpha(base, 0.18) },
      '&.Mui-selected:hover': { backgroundColor: alpha(base, 0.22) },
      '&.Mui-focusVisible': { backgroundColor: alpha(base, 0.14) },
      '&.Mui-disabled': { backgroundColor: (t) => t.palette.action.disabledBackground },
    };
  };

  // Rozet FALAN yok. Direkt ikon.
  const iconEl = (
    <Box component="span" sx={{ display: 'inline-flex' }}>
      <Icon fontSize="medium" />
    </Box>
  );

  const tooltipCommon = {
    title,
    placement: 'right' as const,
    arrow: true,
    disableInteractive: true,
    enterTouchDelay: 0,
    PopperProps: {
      modifiers: [
        { name: 'offset', options: { offset: [0, 8] } },
        { name: 'flip', options: { fallbackPlacements: [] } },
      ],
    },
    slotProps: {
      popper: {
        modifiers: [
          { name: 'offset', options: { offset: [0, 8] } },
          { name: 'flip', options: { fallbackPlacements: [] } },
        ],
      },
    },
  };

  const buttonProps = isLogout
    ? ({
        component: 'button',
        type: 'button' as const,
        onClick: onLogout,
      })
    : ({
        component: LinkAdapter,
        href,
        prefetch: false,
      });

  const Button = (
    <ListItemButton
      {...buttonProps}
      aria-label={isLogout ? 'Logout' : title}
      aria-current={active ? 'page' : undefined}
      selected={active}
      disabled={disabled}
      draggable={false}
      sx={buttonSx}
    >
      {iconEl}
    </ListItemButton>
  );

  return (
    <ListItem disablePadding sx={{ justifyContent: 'center', width: compact ? 'auto' : '100%' }}>
      {compact ? <Tooltip {...tooltipCommon}>{Button}</Tooltip> : Button}
    </ListItem>
  );
}
