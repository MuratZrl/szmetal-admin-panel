'use client';
// src/features/notifications/components/NotificationBell.client.tsx

import * as React from 'react';
import { Badge, Box, ListItemButton, Tooltip, Typography } from '@mui/material';
import { alpha, type SxProps, type Theme } from '@mui/material/styles';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import NotificationsIcon from '@mui/icons-material/Notifications';

import NotificationPanel from './NotificationPanel.client';

type Props = {
  unreadCount: number;
  compact?: boolean;
  onMarkRead?: (count: number) => void;
};

const compactButtonSx: SxProps<Theme> = (theme) => {
  const base = theme.palette.accent?.main ?? theme.palette.primary.main;
  return {
    justifyContent: 'center',
    width: 44,
    height: 44,
    minWidth: 44,
    px: 0,
    borderRadius: '50%',
    '&:hover': { backgroundColor: alpha(base, 0.10) },
    '&.Mui-selected': { backgroundColor: alpha(base, 0.18) },
    '&.Mui-selected:hover': { backgroundColor: alpha(base, 0.22) },
    '&.Mui-focusVisible': { backgroundColor: alpha(base, 0.14) },
  };
};

export default function NotificationBell({ unreadCount, compact = true, onMarkRead }: Props) {
  const [open, setOpen] = React.useState(false);
  const anchorRef = React.useRef<HTMLButtonElement>(null);

  const handleToggle = React.useCallback(() => {
    setOpen((prev) => !prev);
  }, []);

  const handleClose = React.useCallback(() => {
    setOpen(false);
  }, []);

  const hasUnread = unreadCount > 0;
  const Icon = hasUnread ? NotificationsIcon : NotificationsNoneIcon;

  const bellIcon = (
    <Badge
      badgeContent={unreadCount}
      color="error"
      max={99}
      sx={{
        '& .MuiBadge-badge': {
          fontSize: 10,
          minWidth: 16,
          height: 16,
          px: 0.4,
        },
      }}
    >
      <Icon fontSize="small" />
    </Badge>
  );

  if (compact) {
    return (
      <>
        <Tooltip title="Bildirimler" placement="right" arrow disableInteractive enterTouchDelay={0}>
          <ListItemButton
            ref={anchorRef}
            component="button"
            type="button"
            onClick={handleToggle}
            aria-label="Bildirimler"
            sx={compactButtonSx}
          >
            <Box component="span" sx={{ display: 'inline-flex', pointerEvents: 'none' }}>
              {bellIcon}
            </Box>
          </ListItemButton>
        </Tooltip>

        <NotificationPanel
          open={open}
          anchorEl={anchorRef.current}
          onClose={handleClose}
          onMarkRead={onMarkRead}
          compact={compact}
        />
      </>
    );
  }

  return (
    <>
      <ListItemButton
        ref={anchorRef}
        component="button"
        type="button"
        onClick={handleToggle}
        aria-label="Bildirimler"
        sx={{
          borderRadius: 2,
          px: 1.5,
          py: 0.75,
          gap: 1.5,
        }}
      >
        <Box component="span" sx={{ display: 'inline-flex' }}>
          {bellIcon}
        </Box>
        <Typography variant="body2" component="span" sx={{ fontWeight: 500 }}>
          Bildirimler
        </Typography>
      </ListItemButton>

      <NotificationPanel
        open={open}
        anchorEl={anchorRef.current}
        onClose={handleClose}
        onMarkRead={onMarkRead}
        compact={compact}
      />
    </>
  );
}
