'use client';
// src/features/notifications/components/NotificationPanel.client.tsx

import * as React from 'react';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Popper,
  Stack,
  Typography,
  ClickAwayListener,
} from '@mui/material';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import DeleteSweepOutlinedIcon from '@mui/icons-material/DeleteSweepOutlined';
import NotificationsOffOutlinedIcon from '@mui/icons-material/NotificationsOffOutlined';

import type { NotificationRow, NotificationListResponse } from '../types';
import NotificationItem from './NotificationItem.client';

type Props = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  onMarkRead?: (count: number) => void;
  compact?: boolean;
};

export default function NotificationPanel({ open, anchorEl, onClose, onMarkRead, compact }: Props) {
  const [items, setItems] = React.useState<NotificationRow[]>([]);
  const [hasMore, setHasMore] = React.useState(false);
  const [loading, setLoading] = React.useState(false);
  const [fetched, setFetched] = React.useState(false);

  // Panel açıldığında bildirimleri getir
  React.useEffect(() => {
    if (!open) return;
    if (fetched) return;

    let active = true;
    setLoading(true);

    fetch('/api/notifications?limit=20')
      .then((res) => res.json())
      .then((data: NotificationListResponse) => {
        if (!active) return;
        setItems(data.items ?? []);
        setHasMore(data.hasMore ?? false);
        setFetched(true);
      })
      .catch(() => {})
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => { active = false; };
  }, [open, fetched]);

  // Panel kapandığında cache'i temizle (sonraki açılışta tekrar fetch)
  React.useEffect(() => {
    if (!open) {
      const t = setTimeout(() => setFetched(false), 500);
      return () => clearTimeout(t);
    }
  }, [open]);

  const handleMarkRead = React.useCallback(
    (id: string) => {
      fetch('/api/notifications/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: [id] }),
      }).catch(() => {});

      setItems((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read_at: new Date().toISOString() } : n)),
      );
      onMarkRead?.(1);
    },
    [onMarkRead],
  );

  const handleMarkAllRead = React.useCallback(() => {
    const unreadCount = items.filter((n) => !n.read_at).length;
    if (unreadCount === 0) return;

    fetch('/api/notifications/read-all', { method: 'POST' }).catch(() => {});

    setItems((prev) =>
      prev.map((n) => (n.read_at ? n : { ...n, read_at: new Date().toISOString() })),
    );
    onMarkRead?.(unreadCount);
  }, [items, onMarkRead]);

  const handleClearAll = React.useCallback(() => {
    if (items.length === 0) return;
    const unreadCount = items.filter((n) => !n.read_at).length;

    fetch('/api/notifications/clear', { method: 'POST' }).catch(() => {});

    setItems([]);
    setHasMore(false);
    if (unreadCount > 0) onMarkRead?.(unreadCount);
  }, [items, onMarkRead]);

  const handleLoadMore = React.useCallback(() => {
    if (!hasMore || loading || items.length === 0) return;

    const cursor = items[items.length - 1]!.created_at;
    setLoading(true);

    fetch(`/api/notifications?limit=20&cursor=${encodeURIComponent(cursor)}`)
      .then((res) => res.json())
      .then((data: NotificationListResponse) => {
        setItems((prev) => [...prev, ...(data.items ?? [])]);
        setHasMore(data.hasMore ?? false);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [hasMore, loading, items]);

  if (!open || !anchorEl) return null;

  const unreadCount = items.filter((n) => !n.read_at).length;

  return (
    <Popper
      open={open}
      anchorEl={anchorEl}
      placement={compact ? 'right-end' : 'right-end'}
      modifiers={[
        { name: 'offset', options: { offset: [0, 8] } },
        { name: 'preventOverflow', options: { padding: 16, boundary: 'viewport' } },
      ]}
      sx={{ zIndex: 1400 }}
    >
      <ClickAwayListener onClickAway={onClose}>
        <Paper
          elevation={12}
          sx={(t) => ({
            width: 360,
            maxHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 2.5,
            border: '1px solid',
            borderColor: 'divider',
            overflow: 'hidden',
            bgcolor: t.palette.background.paper,
          })}
        >
          {/* Başlık */}
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ px: 2, py: 1.5, borderBottom: '1px solid', borderColor: 'divider' }}
          >
            <Typography variant="subtitle2" fontWeight={700}>
              Bildirimler
            </Typography>

            <Stack direction="row" spacing={0.5}>
              {unreadCount > 0 && (
                <Button
                  size="small"
                  startIcon={<DoneAllIcon sx={{ fontSize: 16 }} />}
                  onClick={handleMarkAllRead}
                  sx={{ textTransform: 'none', fontSize: 12, px: 1 }}
                >
                  Okundu
                </Button>
              )}

              {items.length > 0 && (
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteSweepOutlinedIcon sx={{ fontSize: 16 }} />}
                  onClick={handleClearAll}
                  sx={{ textTransform: 'none', fontSize: 12, px: 1 }}
                >
                  Temizle
                </Button>
              )}
            </Stack>
          </Stack>

          {/* Liste */}
          <Box sx={{ flex: 1, overflowY: 'auto' }}>
            {loading && items.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={28} />
              </Box>
            ) : items.length === 0 ? (
              <Stack alignItems="center" spacing={1} sx={{ py: 5, px: 2 }}>
                <NotificationsOffOutlinedIcon sx={{ fontSize: 40, color: 'text.disabled' }} />
                <Typography variant="body2" color="text.secondary">
                  Bildirim yok
                </Typography>
              </Stack>
            ) : (
              <>
                {items.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onMarkRead={handleMarkRead}
                  />
                ))}

                {hasMore && (
                  <Box sx={{ display: 'flex', justifyContent: 'center', py: 1.5 }}>
                    <Button
                      size="small"
                      onClick={handleLoadMore}
                      disabled={loading}
                      sx={{ textTransform: 'none', fontSize: 12 }}
                    >
                      {loading ? 'Yükleniyor...' : 'Daha fazla'}
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>
        </Paper>
      </ClickAwayListener>
    </Popper>
  );
}
