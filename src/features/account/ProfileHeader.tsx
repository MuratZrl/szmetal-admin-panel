// src/features/account/ProfileHeader.tsx
'use client';

import * as React from 'react';
import { Avatar, Box, Typography, Chip, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';

// Yolun projendeki konuma göre: 
// import type { UserData } from './useAccount';
// veya
// import type { UserData } from './hooks/useAccount';
import type { UserData } from '@/features/account/hooks/useAccount';

import { getRoleInfo } from '@/features/account/helpers';

export type ProfileHeaderProps = {
  userData: UserData;
  onUploadClick: (file?: File) => void;
  onRemove: () => void;
  uploading: boolean;
  roleLabel?: string;            // ← opsiyonel
  roleStyle?: SxProps<Theme>;
};

export default function ProfileHeader({
  userData,
  onUploadClick,
  onRemove,
  uploading,
  roleLabel,
  roleStyle,
}: ProfileHeaderProps) {
  const hasAvatar = typeof userData?.image === 'string' && userData.image.trim().length > 0;
  const chip = getRoleInfo(userData.role);

  return (
    <Box
      sx={{
        p: { xs: 1, sm: 1.5 },
        mb: 3,
        gap: 2,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      <Box display="flex" alignItems="center" gap={2}>
        <Avatar
          src={userData?.image || undefined}
          alt={userData?.username ?? 'Avatar'}
          sx={(t) => ({
            width: 72,
            height: 72,
            bgcolor:
              t.palette.mode === 'dark'
                ? alpha(t.palette.primary.main, 0.2)
                : alpha(t.palette.primary.main, 0.08),
            color: t.palette.primary.main,
            border: '1px solid',
            borderColor: 'divider',
            flex: '0 0 auto',
          })}
          imgProps={{
            onError: (e) => {
              (e.currentTarget as HTMLImageElement).src = '/avatar.jpg';
            },
            draggable: false,
          }}
        />

        <Box
          sx={{
            height: 72,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            minWidth: 0,
            py: 0.25,
            flex: '1 1 auto',
          }}
        >
          <Typography
            variant="subtitle1"
            fontWeight={600}
            color="text.primary"
            noWrap
            sx={{ lineHeight: 1.2, textOverflow: 'ellipsis', overflow: 'hidden' }}
            title={userData?.username ?? 'Yükleniyor...'}
          >
            {userData?.username ?? 'Yükleniyor...'}
          </Typography>

          <Typography
            variant="body2"
            color="text.secondary"
            noWrap
            sx={{ lineHeight: 1.2, textOverflow: 'ellipsis', overflow: 'hidden' }}
            title={userData?.email ?? ''}
          >
            {userData?.email ?? ''}
          </Typography>

          <Chip
            label={roleLabel || chip.label}
            size="small"
            color={chip.color}
            variant={chip.variant}
            sx={{
              alignSelf: 'flex-start',
              maxWidth: '100%',
              '& .MuiChip-label': { px: 1 },
              ...(roleStyle || chip.sx || {}),
            }}
          />
        </Box>
      </Box>

      <Box display="flex" gap={1}>
        <Button
          component="label"
          variant="outlined"
          size="small"
          disabled={uploading}
          sx={{ px: 2, whiteSpace: 'nowrap', textTransform: 'capitalize' }}
        >
          {uploading ? 'Yükleniyor...' : hasAvatar ? 'Resmi Değiştir' : 'Resim Yükle'}
          <input
            hidden
            accept="image/*"
            type="file"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
              const file = e.currentTarget.files?.[0];
              onUploadClick(file);
              e.currentTarget.value = '';
            }}
          />
        </Button>

        <Button
          variant="text"
          color="error"
          size="small"
          onClick={onRemove}
          disabled={uploading || !hasAvatar}
          sx={{ textTransform: 'capitalize' }}
        >
          Kaldır
        </Button>
      </Box>
    </Box>
  );
}
