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

  // Tek merkezden durum renkleri: hover / selected / focus-visible
  // Burada accent üzerinden gidiyorum. İstersen theme.palette.primary.main’e çevir.
  const buttonSx: SxProps<Theme> = (theme) => {
    const base = theme.palette.accent?.main ?? theme.palette.primary.main;

    return {
      justifyContent: compact ? 'center' : undefined,
      width: compact ? 44 : undefined,
      height: compact ? 44 : undefined,
      minWidth: compact ? 44 : undefined,
      px: compact ? 0 : undefined,
      borderRadius: compact ? '50%' : theme.shape.borderRadius,
      // İkon rozeti tıklamayı yutmasın
      '& .MuiBadge-root': { pointerEvents: 'none' },

      // HOVER
      '&:hover': {
        backgroundColor: alpha(base, 0.10), // hover yoğunluğu
      },

      // SELECTED
      '&.Mui-selected': {
        backgroundColor: alpha(base, 0.18),
      },
      '&.Mui-selected:hover': {
        backgroundColor: alpha(base, 0.22),
      },

      // KEYBOARD FOCUS (focus-visible)
      '&.Mui-focusVisible': {
        backgroundColor: alpha(base, 0.14),
        // istersen minik bir halka da ekleyebilirsin:
        // boxShadow: `0 0 0 2px ${alpha(base, 0.32)} inset`,
      },

      // Disabled durumda arka planı sakinleştir
      '&.Mui-disabled': {
        backgroundColor: theme.palette.action.disabledBackground,
      },
    };
  };

  const iconEl = (
    <Box component="span" sx={{ display: 'inline-flex', pointerEvents: 'none' }}>
      {label === 'Orders' ? (
        <Badge badgeContent={unreadCount} color="error">
          <Icon fontSize="medium" />
        </Badge>
      ) : (
        <Icon fontSize="medium" />
      )}
    </Box>
  );

  return (
    <ListItem disablePadding sx={{ justifyContent: 'center', width: compact ? 'auto' : '100%' }}>
      {isLogout ? (
        <ListItemButton
          component="button"
          type="button"
          onClick={onLogout}
          aria-label="Logout"
          aria-current={active ? 'page' : undefined}
          selected={active}
          disabled={disabled}
          draggable={false}
          title={compact ? title : undefined}
          sx={buttonSx}
        >
          {compact ? (
            <Tooltip title={title} placement="right" arrow disableInteractive enterTouchDelay={0}>
              {iconEl}
            </Tooltip>
          ) : (
            iconEl
          )}
        </ListItemButton>
      ) : (
        <ListItemButton
          href={href!}
          aria-label={title}
          aria-current={active ? 'page' : undefined}
          selected={active}
          disabled={disabled}
          draggable={false}
          title={compact ? title : undefined}
          sx={buttonSx}
        >
          {compact ? (
            <Tooltip title={title} placement="right" arrow disableInteractive enterTouchDelay={0}>
              {iconEl}
            </Tooltip>
          ) : (
            iconEl
          )}
        </ListItemButton>
      )}
    </ListItem>
  );
}
