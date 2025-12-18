// src/features/sidebar/components/SidebarNavItem.tsx
'use client';

import { ListItem, ListItemButton, Tooltip, Box, Typography } from '@mui/material';

import type { SidebarLink } from '../types';

export default function SidebarNavItem({
  link,
  active,
  compact,
  onLogout,
}: {
  link: SidebarLink;
  active: boolean;
  compact?: boolean;
  onLogout?: () => void;
}) {
  const Icon = link.icon;
  const isLogout = Boolean(onLogout);
  const title = link.labelTr ?? link.label;

  const buttonProps = isLogout
    ? ({ component: 'button', type: 'button', onClick: onLogout } as const)
    : ({ href: link.href ?? '#' } as const);

  const ButtonEl = (
    <ListItemButton
      className={`SidebarNavItemButton${compact ? ' is-compact' : ''}`}
      {...buttonProps}
      aria-label={title}
      aria-current={active ? 'page' : undefined}
      selected={active}
      disabled={link.disabled}
      draggable={false}
    >
      <Box component="span" sx={{ display: 'inline-flex' }}>
        <Icon fontSize="medium" />
      </Box>

      {!compact && (
        <Typography
          variant="body2"
          component="span"
          sx={{
            fontWeight: active ? 600 : 500,
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            flex: 1,
          }}
        >
          {title}
        </Typography>
      )}
    </ListItemButton>
  );

  return (
    <ListItem disablePadding sx={{ justifyContent: 'center', width: compact ? 'auto' : '100%' }}>
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
