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
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import RatesTicker from './RatesTicker.client';
import TimeTicker from './TimeTicker.client';

// 👇 ROL STİLLERİ TEK KAYNAK
import { getRoleInfo } from '@/utils/roles';

type Props = {
  username: string;
  role: string;
  image: string | null;
  greetPrefix?: string;
  compact?: boolean;
  loading?: boolean;
};

/* ---------------------- Helpers ---------------------- */

// İstanbul saatine göre selamlama
function getGreetInTR(timeZone: string = 'Europe/Istanbul'): string {
  try {
    const now = new Date();
    const fmt = new Intl.DateTimeFormat('tr-TR', { timeZone, hour: 'numeric', hour12: false });
    const parts = fmt.format(now);
    const hour = Number(String(parts).replace(/\D/g, '')) || 12;
    if (hour >= 5 && hour < 12) return 'Günaydın';
    if (hour >= 12 && hour < 18) return 'İyi günler';
    if (hour >= 18 && hour < 23) return 'İyi akşamlar';
    return 'İyi geceler';
  } catch {
    return 'Merhaba';
  }
}

// İsimden baş harf(ler)
function initials(name: string): string {
  const n = (name || 'Kullanıcı').trim();
  const parts = n.split(/\s+/).slice(0, 2);
  const letters = parts.map(p => p.charAt(0)).join('');
  return letters.toUpperCase();
}

/* ---------------------- Component ---------------------- */

export default function DashboardHeaderClient({
  username,
  role,
  image,
  greetPrefix,
  compact,
}: Props) {
  const theme = useTheme();
  const isSmDown = useMediaQuery(theme.breakpoints.down('sm'));
  const isMdDown = useMediaQuery(theme.breakpoints.down('md'));
  const isDark = theme.palette.mode === 'dark';

  const dense = compact || isSmDown;

  // Arka plan
  const borderColor = alpha(theme.palette.divider, isDark ? 0.6 : 0.7);

  const neutralA = alpha(theme.palette.grey[500], isDark ? 0.1 : 0.06);
  const neutralB = alpha(theme.palette.grey[900], isDark ? 0.05 : 0.08);
  const neutralGradient = `linear-gradient(135deg, ${neutralA}, ${neutralB})`;

  const glowMain   = alpha(theme.palette.common.white, isDark ? 0.10 : 0.14);
  const glowSecondary = alpha(theme.palette.grey[300], isDark ? 0.07 : 0.10);

  const blendMode = 'soft-light';

  // Avatar
  const avatarBg = alpha(theme.palette.primary.main, isDark ? 0.24 : 0.18);
  const statusDot = theme.palette.success.main;

  // Rol görselleri: stil util'den, ikon lokal
  const roleInfo = getRoleInfo(role);

  const greet = greetPrefix ?? getGreetInTR('Europe/Istanbul');

  const avatarSize = dense ? 40 : isMdDown ? 48 : 64;
  const titleFont = dense ? 16 : isMdDown ? 18 : 20;

  return (
    <Paper
      component="header"
      role="banner"
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        mb: 2,
        p: { xs: 1.25, sm: 1.75, md: 2 },
        borderRadius: 2.5,
        bgcolor: alpha(theme.palette.background.paper, 0.9),
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(4px)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background: neutralGradient,
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          inset: 0,
          background:
            `radial-gradient(1200px 220px at 8% -10%, ${glowMain}, transparent 55%),` +
            `radial-gradient(900px 180px at 110% 80%, ${glowSecondary}, transparent 70%)`,
          zIndex: 0,
          mixBlendMode: blendMode,
          pointerEvents: 'none',
        },
      }}
    >
      <Grid container spacing={{ xs: 1.25, sm: 2 }} alignItems="center" sx={{ position: 'relative', zIndex: 1 }}>
        {/* Sol */}
        <Grid size={{ xs: 12, sm: 8, md: 8 }} sx={{ minWidth: 0 }}>
          <Stack direction="row" spacing={dense ? 1 : 1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Box position="relative" sx={{ flex: '0 0 auto' }}>
              <Avatar
                src={image ?? undefined}
                alt={username || 'Kullanıcı'}
                sx={{
                  width: avatarSize,
                  height: avatarSize,
                  bgcolor: avatarBg,
                  color: theme.palette.primary.contrastText,
                  fontWeight: 700,
                }}
                imgProps={{ referrerPolicy: 'no-referrer' }}
              >
                {initials(username)}
              </Avatar>

              {/* online indicator */}
              <Box
                component="span"
                aria-hidden
                sx={{
                  position: 'absolute',
                  right: 2,
                  bottom: 2,
                  width: 10,
                  height: 10,
                  borderRadius: '50%',
                  bgcolor: statusDot,
                  border: `2px solid ${theme.palette.background.paper}`,
                }}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                fontWeight={800}
                lineHeight={1.25}
                noWrap
                color="text.primary"
                sx={{
                  fontSize: { xs: titleFont, sm: titleFont, md: titleFont + 2 },
                  letterSpacing: 0.2,
                  textShadow: isDark ? '0 1px 0 rgba(0,0,0,0.45)' : 'none',
                }}
              >
                {greet},{' '}
                <Box component="span" sx={{ color: isDark ? 'primary.contrastText' : 'text.primary' }}>
                  {username || 'Kullanıcı'}
                </Box>
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center" mt={1}>
                <Chip
                  size="small"
                  label={role ? roleInfo.label : '—'}
                  variant={roleInfo.variant}   // <- helpers ile aynı (outlined)
                  color={roleInfo.color}       // <- helpers ile aynı renk eşlemesi
                  sx={{
                    height: 24,
                    fontWeight: 700,
                    '& .MuiChip-label': { px: 0.75 },
                    ...roleInfo.sx,            // <- dark-mode label tonu vb.
                  }}
                />

                {!dense && (
                  <>
                    <Divider orientation="vertical" flexItem sx={{ mx: 0.5, borderColor: alpha(theme.palette.divider, 0.6) }} />
                    <Typography variant="caption" color="text.secondary" noWrap>
                      İyi çalışmalar dileriz.
                    </Typography>
                  </>
                )}
              </Stack>
            </Box>
          </Stack>
        </Grid>

        {/* Sağ */}
        <Grid size={{ xs: 12, sm: 4, md: 4 }}>
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
