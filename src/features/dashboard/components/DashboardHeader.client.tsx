// src/features/dashboard/components/DashboardHeader.client.tsx
'use client';

import * as React from 'react';
import {
  Box,
  Chip,
  Paper,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
  Grid,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import TimeTicker from './TimeTicker.client';
import RatesTicker from './RatesTicker.client';

type Props = { username: string; role: string; image: string | null };

function roleChipColor(role: string | null):
  'default' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' {
  const r = (role ?? '').toLowerCase();
  if (r === 'admin') return 'secondary';
  if (r === 'manager') return 'info';
  if (r === 'user') return 'default';
  if (r === 'banned') return 'error';
  return 'default';
}

export default function DashboardHeaderClient({ username, role, image }: Props) {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));

  const borderColor = alpha(theme.palette.divider, 0.5);
  const gradient = `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.10)}, ${alpha(
    theme.palette.info.main,
    0.10
  )})`;
  const avatarBg = alpha(theme.palette.primary.main, 0.2);

  return (
    <Paper
      component="header"
      role="banner"
      elevation={0}
      sx={{
        mb: 2,
        p: { xs: 1.5, sm: 2 },
        borderRadius: 2,
        bgcolor: 'transparent',
        position: 'relative',
        overflow: 'hidden',
        border: `1px solid ${borderColor}`,
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: gradient,
          zIndex: 0,
        },
        backdropFilter: 'blur(6px)',
      }}
    >
      <Grid
        container
        spacing={{ xs: 1.25, sm: 2 }}
        alignItems="center"
        sx={{ position: 'relative', zIndex: 1 }}
      >
        {/* Sol: avatar + selamlama */}
        <Grid size={{ xs: 12, md: 8, sm: 8 }} sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} alignItems="center" sx={{ minWidth: 0 }}>
            <Avatar
              src={image ?? undefined}
              alt={username}
              sx={{
                width: { xs: 36, sm: 44 },
                height: { xs: 36, sm: 44 },
                bgcolor: avatarBg,
                flex: '0 0 auto',
              }}
            >
              {(username?.charAt(0) ?? 'K').toUpperCase()}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                fontWeight={600}
                lineHeight={1.15}
                noWrap
                sx={{ fontSize: { xs: 16, sm: 18 } }}
              >
                Merhaba,{' '}
                <Box component="span" sx={{ color: 'primary.main' }}>
                  {username}
                </Box>
              </Typography>

              {/* Küçük ekranda yer kazancı için role Chip’i gizle */}
              <Chip
                size="small"
                label={role}
                color={roleChipColor(role)}
                variant="outlined"
                sx={{
                  mt: 0.5,
                  fontWeight: 600,
                  display: { xs: 'none', sm: 'inline-flex' },
                }}
              />
            </Box>
          </Stack>
        </Grid>

        {/* Sağ: canlı saat + kurlar */}
        <Grid size={{ xs: 12, md: 4, sm: 4 }} >
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 1.25, md: 2 }}
            alignItems="center"
            justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
            sx={{ width: '100%', flexWrap: 'wrap', rowGap: 1 }}
          >
            <RatesTicker
              provider="tcmb"
              layout={isMdDown ? 'dual' : 'two'}
              density={isMdDown ? 'ultra' : 'compact'}
              showMeta={!isMdDown}
            />
            <TimeTicker
              timeZone="Europe/Istanbul"
              dense
              showSeconds={!isSmDown}
            />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
