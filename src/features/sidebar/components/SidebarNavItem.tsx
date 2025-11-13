// src/features/sidebar/components/SidebarNavItem.tsx
'use client';

import { ListItem, ListItemButton, Tooltip, Box, Typography } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';

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

  const buttonSx: SxProps<Theme> = (theme) => {
    const base = theme.palette.accent?.main ?? theme.palette.primary.main;
    return {
      justifyContent: compact ? 'center' : 'flex-start',
      gap: compact ? 0 : 10,
      width: compact ? 44 : '100%',
      height: 44,
      minWidth: compact ? 44 : undefined,
      px: compact ? 0 : 1.25,
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
    : ({ href: link.href ?? '#' } as const);

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
