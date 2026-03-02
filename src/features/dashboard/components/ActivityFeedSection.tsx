'use client';
// src/features/dashboard/components/ActivityFeedSection.tsx
import * as React from 'react';
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Stack,
  Avatar,
  Divider,
} from '@mui/material';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import InventoryIcon from '@mui/icons-material/Inventory';
import type { ActivityItem } from '../services/activityFeed.server';

function getIcon(item: ActivityItem) {
  if (item.type === 'new_user') return <PersonAddIcon fontSize="small" />;
  return <InventoryIcon fontSize="small" />;
}

function getColor(item: ActivityItem): 'info' | 'primary' {
  if (item.type === 'new_user') return 'info';
  return 'primary';
}

function formatRelativeTime(isoDate: string): string {
  const diff = Date.now() - new Date(isoDate).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return 'Az önce';
  if (mins < 60) return `${mins} dk önce`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours} saat önce`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days} gün önce`;
  return new Date(isoDate).toLocaleDateString('tr-TR', {
    day: '2-digit',
    month: 'short',
  });
}

type Props = { items: ActivityItem[] };

export default function ActivityFeedSection({ items }: Props) {
  if (!items.length) return null;

  return (
    <Card
      sx={{
        borderRadius: 2,
        boxShadow: (theme) =>
          theme.palette.mode === 'light'
            ? '0 1px 2px rgba(0,0,0,0.04), 0 2px 8px rgba(0,0,0,0.06), 0 8px 24px rgba(0,0,0,0.04)'
            : undefined,
      }}
    >
      <CardHeader
        title={
          <Typography variant="h6" fontWeight={600}>
            Son Aktiviteler
          </Typography>
        }
        action={
          <Typography
            variant="body2"
            sx={{ fontStyle: 'italic', color: 'text.secondary', pr: 1 }}
          >
            Tüm Zamanlar
          </Typography>
        }
        sx={{ py: 1.5, px: 2, '& .MuiCardHeader-action': { alignSelf: 'center' } }}
      />
      <Divider />
      <CardContent sx={{ py: 1, maxHeight: 400, overflow: 'auto' }}>
        <Stack spacing={0}>
          {items.map((item, i) => (
            <Box key={item.id}>
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="flex-start"
                py={1}
              >
                <Avatar
                  sx={{
                    width: 32,
                    height: 32,
                    bgcolor: `${getColor(item)}.main`,
                    color: `${getColor(item)}.contrastText`,
                  }}
                >
                  {getIcon(item)}
                </Avatar>
                <Box flex={1} minWidth={0}>
                  <Typography variant="body2" noWrap>
                    {item.message}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" mt={0.25}>
                    {formatRelativeTime(item.timestamp)}
                  </Typography>
                </Box>
              </Stack>
              {i < items.length - 1 && <Divider />}
            </Box>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}
