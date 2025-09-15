// src/features/users/components/UserDetailCard.client.tsx
'use client';

import * as React from 'react';

import { Paper, Typography, Divider, Stack, Chip, Box } from '@mui/material';

import type { UserPublic, AppRole } from '@/features/requests/services/id/user.server';

type Props = { user: UserPublic | null };

function KeyValue({ label, value }: { label: string; value?: string | null }) {
  const v = value?.toString().trim();
  return (
    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
      <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
        {label}
      </Typography>
      <Typography variant="body2">{v && v.length > 0 ? v : '---'}</Typography>
    </Box>
  );
}

function roleChipColor(role: AppRole | string | null | undefined):
  'default' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' {
  switch (role) {
    case 'Admin':   return 'secondary';
    case 'Manager': return 'info';
    case 'User':    return 'default';
    case 'Banned':  return 'error';
    default:        return 'default';
  }
}

export default function UserDetailCard({ user }: Props) {
  return (
    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
      <Typography variant="subtitle1" sx={{ mb: 1 }}>Kullanıcı Bilgileri</Typography>
      <Divider sx={{ mb: 1 }} />

      {!user ? (
        <Typography variant="body2" color="text.secondary">Kullanıcı bilgisi bulunamadı.</Typography>
      ) : (
        <Stack spacing={1.0}>
          <KeyValue label="Kullanıcı Adı" value={user.username} />
          <KeyValue label="E-posta" value={user.email} />
          <KeyValue label="Telefon" value={user.phone} />
          <KeyValue label="Ülke" value={user.country} />
          <KeyValue label="Şirket" value={user.company} />
          <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
            <Typography variant="body2" color="text.secondary" sx={{ minWidth: 140 }}>
              Rol
            </Typography>
            <Chip
              label={user.role ?? '---'}
              variant="outlined"
              color={roleChipColor(user.role)}
              size="small"
            />
          </Box>
        </Stack>
      )}
    </Paper>
  );
}
