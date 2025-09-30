// src/features/dashboard/components/DashboardHeader.client.tsx
'use client';

import * as React from 'react';
import {
  Box, Chip, Paper, Typography, Avatar, useTheme, useMediaQuery, Grid, Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import RatesTicker from './RatesTicker.client';
import TimeTicker from './TimeTicker.client';

type Props = { username: string; role: string; image: string | null; greetPrefix?: string };

function roleChipColor(role: string | null):
  'default' | 'primary' | 'secondary' | 'success' | 'info' | 'warning' | 'error' {
  const r = (role ?? '').toLowerCase();
  if (r === 'admin') return 'warning';
  if (r === 'manager') return 'info';
  if (r === 'user') return 'default';
  if (r === 'banned') return 'error';
  return 'default';
}

export default function DashboardHeaderClient({ username, role, image, greetPrefix }: Props) {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  const borderColor = alpha(theme.palette.divider, 0.5);
  const gradientAlpha = isDark ? 0.04 : 0.025;
  const gradient = `linear-gradient(135deg, ${alpha(theme.palette.primary.main, gradientAlpha)}, ${alpha(theme.palette.info.main, gradientAlpha)})`;
  const avatarBg = alpha(theme.palette.primary.main, 0.22);

  const roleKey = roleChipColor(role);
  const greet = greetPrefix ?? 'Merhaba';

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
      }}
    >
      <Grid container spacing={{ xs: 1.25, sm: 2 }} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Sol */}
        <Grid size={{ xs: 12, md: 8, sm: 8 }} sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={{ xs: 1, sm: 1.5 }} alignItems="center" sx={{ minWidth: 0 }}>
            <Avatar
              src={image ?? undefined}
              alt={username}
              sx={{
                width: { xs: 36, sm: 44 },
                height: { xs: 36, sm: 44 },
                bgcolor: avatarBg,
                color: theme.palette.primary.contrastText,
                flex: '0 0 auto',
              }}
            >
              {(username?.charAt(0) ?? 'K').toUpperCase()}
            </Avatar>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                fontWeight={700}
                lineHeight={1.15}
                noWrap
                color="text.primary"
                sx={{ fontSize: { xs: 16, sm: 18 }, textShadow: isDark ? '0 1px 0 rgba(0,0,0,0.45)' : 'none' }}
              >
                {greet},{' '}
                <Box component="span" sx={{ color: isDark ? 'primary.light' : 'secondary.main' }}>
                  {username}
                </Box>
              </Typography>

              <Chip
                size="small"
                label={role}
                color={roleKey}
                variant="outlined"
                sx={{
                  mt: 0.5,
                  fontWeight: 700,
                  display: { xs: 'none', sm: 'inline-flex' },
                  ...(isDark
                    ? (roleKey === 'default'
                        ? { '& .MuiChip-label': { color: alpha(theme.palette.text.primary, 0.85) } }
                        : { '& .MuiChip-label': { color: theme.palette[roleKey].light } })
                    : {}),
                }}
              />
            </Box>
          </Stack>
        </Grid>

        {/* Sağ */}
        <Grid size={{ xs: 12, md: 4, sm: 4 }}>
          <Stack
            direction="row"
            spacing={{ xs: 1, sm: 1.25, md: 2 }}
            alignItems="center"
            justifyContent={{ xs: 'space-between', sm: 'flex-end' }}
            sx={{ width: '100%', flexWrap: 'wrap', rowGap: 1 }}
          >
            <RatesTicker provider="tcmb" layout={isMdDown ? 'dual' : 'two'} density={isMdDown ? 'ultra' : 'compact'} showMeta={!isMdDown} />
            <TimeTicker timeZone="Europe/Istanbul" dense showSeconds={!isSmDown} />
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
}
