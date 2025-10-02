// src/features/sidebar/components/SidebarNavItem.tsx
'use client';

import * as React from 'react';
import { Badge, ListItem, ListItemButton, Tooltip, Box } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';
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
      '& .MuiBadge-root': { pointerEvents: 'none' },
      '&:hover': { backgroundColor: alpha(base, 0.10) },
      '&.Mui-selected': { backgroundColor: alpha(base, 0.18) },
      '&.Mui-selected:hover': { backgroundColor: alpha(base, 0.22) },
      '&.Mui-focusVisible': { backgroundColor: alpha(base, 0.14) },
      '&.Mui-disabled': { backgroundColor: theme.palette.action.disabledBackground },
    };
  };

  const iconEl = (
    <Box component="span" sx={{ display: 'inline-flex' }}>
      {label === 'Orders' ? (
        <Badge badgeContent={unreadCount} color="error">
          <Icon fontSize="medium" />
        </Badge>
      ) : (
        <Icon fontSize="medium" />
      )}
    </Box>
  );

  // MUI v6 kullanıyorsan Popper ayarları slotProps ile verilir.
  // v5’te PopperProps çalışır. İkisi de güvenli olsun diye her ikisini de ekliyorum.
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

  const Button = (
    <ListItemButton
      component={isLogout ? 'button' : 'a'}
      type={isLogout ? 'button' : undefined}
      href={isLogout ? undefined : href!}
      onClick={isLogout ? onLogout : undefined}
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
      {compact ? (
        <Tooltip {...tooltipCommon}>{Button}</Tooltip>
      ) : (
        Button
      )}
    </ListItem>
  );
}
