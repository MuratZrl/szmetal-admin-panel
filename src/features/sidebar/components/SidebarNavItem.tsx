// src/features/sidebar/components/SidebarNavItem.tsx
'use client';

import Link from '@/components/Link';
import { ListItem, ListItemButton, Tooltip, Box, Badge } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';
import type { SidebarLink } from '../types';

export default function SidebarNavItem({
  link,
  active,
  compact,
  onLogout,
  unreadCount,
}: {
  link: SidebarLink;
  active: boolean;
  compact?: boolean;
  onLogout?: () => void;
  unreadCount?: number;
}) {
  // Yeni tip: ikon komponenti doğrudan link.icon içinde geliyor
  const Icon = link.icon;

  // Logout algısı artık prop üzerinden
  const isLogout = Boolean(onLogout);
  const title = link.labelTr ?? link.label;

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

  const buttonProps = isLogout
    ? ({ component: 'button', type: 'button', onClick: onLogout } as const)
    : ({ component: Link, href: link.href ?? '#', prefetch: false } as const);

  // Logout için rozet gösterme; diğerlerinde 0/undefined ise gizle
  const count = isLogout ? 0 : Math.max(0, unreadCount ?? 0);

  const ButtonEl = (
    <ListItemButton
      {...buttonProps}
      aria-label={title}
      aria-current={active ? 'page' : undefined}
      selected={active}
      disabled={link.disabled}
      draggable={false}
      sx={buttonSx}
    >
      <Box component="span" sx={{ display: 'inline-flex' }}>
        {count > 0 ? (
          <Badge
            badgeContent={count}
            max={99}
            color="error"
            overlap="circular"
            anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
          >
            <Icon fontSize="medium" />
          </Badge>
        ) : (
          <Icon fontSize="medium" />
        )}
      </Box>
    </ListItemButton>
  );

  return (
    <ListItem
      disablePadding
      sx={{ justifyContent: 'center', width: compact ? 'auto' : '100%' }}
    >
      {compact ? (
        <Tooltip title={title} placement="right" arrow disableInteractive enterTouchDelay={0}>
          {ButtonEl}
        </Tooltip>
      ) : (
        ButtonEl
      )}
    </ListItem>
  );
}
