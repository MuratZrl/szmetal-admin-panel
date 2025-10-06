// src/features/account/ProfileHeader.tsx
'use client';

import * as React from 'react';
import { Avatar, Box, Typography, Chip, Button } from '@mui/material';
import { alpha } from '@mui/material/styles';
import type { SxProps, Theme } from '@mui/material/styles';
import type { UserData } from '@/features/account/hooks/useAccount';
import { getRoleInfo } from '@/utils/roles';

export type ProfileHeaderProps = {
  userData: UserData;
  onUploadClick: (file?: File) => void;
  onRemove: () => void;
  uploading: boolean;
  roleLabel?: string;
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
        gap: { xs: 1.5, sm: 2 },
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },          // ← küçükte dikey
        alignItems: { xs: 'stretch', sm: 'center' },
        justifyContent: 'space-between',
        borderRadius: 2,
        border: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
      }}
    >
      {/* Sol: Avatar + Kullanıcı bilgileri */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: { xs: 1.5, sm: 2 },
          minWidth: 0,
          flex: '1 1 auto',
        }}
      >
        <Avatar
          src={userData?.image || undefined}
          alt={userData?.username ?? 'Avatar'}
          sx={(t) => ({
            width: { xs: 56, sm: 64, md: 72 },
            height: { xs: 56, sm: 64, md: 72 },
            bgcolor:
              t.palette.mode === 'dark'
                ? alpha(t.palette.primary.main, 0.2)
                : alpha(t.palette.primary.main, 0.08),
            color: t.palette.primary.main,
            flex: '0 0 auto',
          })}
          imgProps={{
            onError: (e) => {
              (e.currentTarget as HTMLImageElement).src = '/avatar.jpg';
            },
            draggable: false,
            loading: 'lazy',
          }}
        />

        <Box
          sx={{
            height: { xs: 'auto', sm: 72 },
            display: 'flex',
            flexDirection: 'column',
            justifyContent: { xs: 'flex-start', sm: 'space-between' },
            gap: { xs: 0.5, sm: 0 },
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

      {/* Sağ: Butonlar */}
      <Box
        sx={{
          display: 'flex',
          gap: 1,
          flexWrap: 'wrap',                                    // ← taşma yok
          width: { xs: '100%', sm: 'auto' },                  // ← xs’te tam genişlik
          justifyContent: { xs: 'stretch', sm: 'flex-end' },
        }}
      >
        <Button
          component="label"
          variant="outlined"
          size="small"
          disabled={uploading}
          sx={{
            px: { xs: 1.25, sm: 2 },
            textTransform: 'capitalize',
            whiteSpace: 'nowrap',
            width: { xs: '100%', sm: 'auto' },               // ← xs’te full width
          }}
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
          sx={{
            px: { xs: 1, sm: 1.5 },
            textTransform: 'capitalize',
            whiteSpace: 'nowrap',
            minWidth: { xs: 0, sm: 80 },
            width: { xs: 'auto', sm: 'auto' },
          }}
        >
          Kaldır
        </Button>
      </Box>
    </Box>
  );
}
