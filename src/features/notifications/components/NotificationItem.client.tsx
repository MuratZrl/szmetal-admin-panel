'use client';
// src/features/notifications/components/NotificationItem.client.tsx

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, ButtonBase, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';

import type { NotificationRow } from '../types';
import { NOTIFICATION_META } from '../constants';
import { timeAgo } from '../utils/timeAgo';

type Props = {
  notification: NotificationRow;
  onMarkRead?: (id: string) => void;
};

export default function NotificationItem({ notification, onMarkRead }: Props) {
  const router = useRouter();
  const isUnread = !notification.read_at;

  const meta = NOTIFICATION_META[notification.type] ?? NOTIFICATION_META.system;
  const Icon = meta.icon;
  const href = meta.getHref?.(notification.data) ?? null;

  const handleClick = React.useCallback(() => {
    if (isUnread && onMarkRead) {
      onMarkRead(notification.id);
    }
    if (href) {
      router.push(href as `/products/${string}`);
    }
  }, [isUnread, onMarkRead, notification.id, href, router]);

  return (
    <ButtonBase
      onClick={handleClick}
      sx={(t) => ({
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        px: 2,
        py: 1.25,
        width: '100%',
        textAlign: 'left',
        borderRadius: 0,
        transition: 'background-color 0.15s ease',
        bgcolor: isUnread
          ? t.palette.mode === 'dark'
            ? alpha(t.palette.primary.main, 0.06)
            : alpha(t.palette.primary.main, 0.04)
          : 'transparent',
        '&:hover': {
          bgcolor: t.palette.mode === 'dark'
            ? alpha(t.palette.action.hover, 0.08)
            : alpha(t.palette.action.hover, 0.04),
        },
        borderBottom: '1px solid',
        borderColor: 'divider',
        cursor: href ? 'pointer' : 'default',
      })}
    >
      {/* İkon */}
      <Box
        sx={(t) => ({
          mt: 0.25,
          flexShrink: 0,
          width: 32,
          height: 32,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: alpha(t.palette.mode === 'dark' ? t.palette.common.white : t.palette.common.black, 0.06),
        })}
      >
        <Icon sx={{ fontSize: 18, color: meta.color }} />
      </Box>

      {/* İçerik */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: isUnread ? 600 : 400,
            lineHeight: 1.4,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {notification.message}
        </Typography>

        <Typography variant="caption" color="text.disabled" sx={{ mt: 0.25, display: 'block' }}>
          {timeAgo(notification.created_at)}
        </Typography>
      </Box>

      {/* Okunmadı noktası */}
      {isUnread && (
        <Box
          sx={(t) => ({
            mt: 1,
            flexShrink: 0,
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: t.palette.primary.main,
          })}
        />
      )}
    </ButtonBase>
  );
}
