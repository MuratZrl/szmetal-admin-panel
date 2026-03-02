'use client';
// src/features/dashboard/components/DashboardHeader.client.tsx

import * as React from 'react';
import {
  Box,
  Chip,
  Paper,
  Typography,
  Avatar,
  useTheme,
  useMediaQuery,
  Stack,
  Divider,
} from '@mui/material';
import { alpha } from '@mui/material/styles';

import RatesTicker from './RatesTicker.client';
import MetalsTicker from './MetalsTicker.client';
import TimeTicker from './TimeTicker.client';

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

  // ─── Background colors ───────────────────────────────
  const borderColor = alpha(theme.palette.divider, isDark ? 0.6 : 0.7);

  const neutralA = alpha(theme.palette.grey[500], isDark ? 0.05 : 0.06);
  const neutralB = alpha(theme.palette.grey[900], isDark ? 0.05 : 0.08);
  const neutralGradient = `linear-gradient(135deg, ${neutralA}, ${neutralB})`;

  const glowMain = alpha(theme.palette.common.white, isDark ? 0.25 : 0.14);
  const glowSecondary = alpha(theme.palette.grey[300], isDark ? 0.5 : 0.20);
  const blendMode = 'soft-light';

  // ─── Data strip background ───────────────────────────
  const stripBg = isDark
    ? alpha(theme.palette.common.white, 0.03)
    : alpha(theme.palette.common.black, 0.025);
  const stripBorder = alpha(theme.palette.divider, isDark ? 0.15 : 0.12);

  // ─── Avatar ring ─────────────────────────────────────
  const avatarBorder = alpha(theme.palette.primary.main, isDark ? 0.4 : 0.24);
  const avatarGlow = alpha(theme.palette.primary.main, isDark ? 0.12 : 0.08);

  // ─── Role / Greeting ─────────────────────────────────
  const roleInfo = getRoleInfo(role);
  const greet = greetPrefix ?? getGreetInTR('Europe/Istanbul');
  const titleFont = dense ? 16 : isMdDown ? 18 : 20;

  // ─── Segment label style ─────────────────────────────
  const segmentLabelSx = {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: 1.2,
    color: 'text.disabled',
    lineHeight: 1,
    mb: 0.5,
    display: { xs: 'none', sm: 'block' } as const,
    textTransform: 'uppercase' as const,
  };

  return (
    <Paper
      component="header"
      role="banner"
      sx={{
        position: 'relative',
        overflow: 'hidden',
        mb: 2,
        pt: { xs: 1.5, sm: 2 },
        px: { xs: 1.25, sm: 1.75, md: 2 },
        pb: { xs: 1.25, sm: 1.5 },
        borderRadius: 2.5,
        bgcolor: alpha(theme.palette.background.paper, 0.92),
        border: `1px solid ${borderColor}`,
        backdropFilter: 'blur(7px)',
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
      {/* ─── Brand accent line ────────────────────────── */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 3,
          background: `linear-gradient(90deg, ${theme.palette.primary.main}, ${alpha(theme.palette.primary.main, 0.3)})`,
          zIndex: 2,
        }}
      />

      {/* ─── Content wrapper ──────────────────────────── */}
      <Box sx={{ position: 'relative', zIndex: 1 }}>

        {/* ═══ ROW 1: Greeting + Time ═══════════════════ */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          {/* LEFT: Avatar + Greeting */}
          <Stack direction="row" spacing={dense ? 1 : 1.5} alignItems="center" sx={{ minWidth: 0 }}>
            <Box position="relative" sx={{ flex: '0 0 auto' }}>
              <Avatar
                src={image ?? undefined}
                alt={username || 'Kullanıcı'}
                sx={{
                  width: { xs: 48, sm: 56, md: 60 },
                  height: { xs: 48, sm: 56, md: 60 },
                  bgcolor: isDark
                    ? alpha(theme.palette.primary.main, 0.2)
                    : alpha(theme.palette.primary.main, 0.08),
                  color: 'primary.main',
                  border: `2px solid ${avatarBorder}`,
                  boxShadow: `0 0 0 3px ${avatarGlow}`,
                }}
                imgProps={{ referrerPolicy: 'no-referrer' }}
              />

              {/* Online indicator with pulse */}
              <Box
                component="span"
                aria-hidden
                sx={{
                  position: 'absolute',
                  right: 1,
                  bottom: 1,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  bgcolor: 'success.main',
                  border: `2px solid ${theme.palette.background.paper}`,
                  '@keyframes headerPulse': {
                    '0%, 100%': {
                      boxShadow: `0 0 0 0 ${alpha(theme.palette.success.main, 0.4)}`,
                    },
                    '50%': {
                      boxShadow: `0 0 0 4px ${alpha(theme.palette.success.main, 0)}`,
                    },
                  },
                  animation: 'headerPulse 2s ease-in-out infinite',
                }}
              />
            </Box>

            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                fontWeight={800}
                lineHeight={1.25}
                noWrap
                color="text.secondary"
                sx={{
                  fontSize: { xs: titleFont, sm: titleFont, md: titleFont + 2 },
                  letterSpacing: 0.2,
                  textShadow: isDark ? '0 1px 0 rgba(0,0,0,0.45)' : 'none',
                }}
              >
                {greet},{' '}
                <Box
                  component="span"
                  sx={{ color: 'text.primary', fontWeight: 800 }}
                >
                  {username || 'Kullanıcı'}
                </Box>
              </Typography>

              <Stack direction="row" spacing={1} alignItems="center" mt={0.5}>
                <Chip
                  size="small"
                  label={role ? roleInfo.label : '—'}
                  variant={roleInfo.variant}
                  color={roleInfo.color}
                  sx={{
                    height: 24,
                    fontWeight: 700,
                    '& .MuiChip-label': { px: 0.75 },
                    ...roleInfo.sx,
                  }}
                />

                {!dense && (
                  <Typography
                    variant="caption"
                    noWrap
                    sx={{ color: 'text.disabled', fontWeight: 500 }}
                  >
                    Platform&apos;a hoş geldiniz.
                  </Typography>
                )}
              </Stack>
            </Box>
          </Stack>

          {/* RIGHT: TimeTicker — visible sm+ */}
          <Box sx={{ display: { xs: 'none', sm: 'block' }, flex: '0 0 auto' }}>
            <TimeTicker timeZone="Europe/Istanbul" dense showSeconds={!isSmDown} />
          </Box>
        </Stack>

        {/* ═══ ROW 2: Live Data Strip ═══════════════════ */}
        <Box
          sx={{
            mt: { xs: 1.25, sm: 1.5 },
            mx: { xs: -0.25, sm: -0.5 },
            px: { xs: 0.75, sm: 1.5 },
            py: { xs: 0.75, sm: 1 },
            borderRadius: 1.5,
            bgcolor: stripBg,
            border: `1px solid ${stripBorder}`,
          }}
        >
          <Stack
            direction="row"
            divider={
              <Divider
                orientation="vertical"
                flexItem
                sx={{
                  borderColor: alpha(theme.palette.divider, isDark ? 0.2 : 0.15),
                  my: 0.5,
                }}
              />
            }
            sx={{
              alignItems: 'center',
              justifyContent: { xs: 'space-around', sm: 'flex-start' },
            }}
          >
            {/* Segment: Döviz */}
            <Box
              sx={{
                flex: { xs: '1 1 0', sm: '0 1 auto' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                px: { xs: 0.5, sm: 1.5, md: 2 },
                minWidth: 0,
              }}
            >
              <Typography variant="overline" sx={segmentLabelSx}>
                Döviz
              </Typography>
              <RatesTicker
                provider="tcmb"
                layout={isMdDown ? 'dual' : 'two'}
                density={isMdDown ? 'ultra' : 'compact'}
                showMeta={!isMdDown}
              />
            </Box>

            {/* Segment: Metal */}
            <Box
              sx={{
                flex: { xs: '1 1 0', sm: '0 1 auto' },
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                px: { xs: 0.5, sm: 1.5, md: 2 },
                minWidth: 0,
              }}
            >
              <Typography variant="overline" sx={segmentLabelSx}>
                Metal
              </Typography>
              <MetalsTicker
                density={isMdDown ? 'ultra' : 'compact'}
                showMeta={!isMdDown}
              />
            </Box>

            {/* Segment: Saat — mobile only (xs) */}
            <Box
              sx={{
                flex: '1 1 0',
                display: { xs: 'flex', sm: 'none' },
                flexDirection: 'column',
                alignItems: 'center',
                px: 0.5,
                minWidth: 0,
              }}
            >
              <TimeTicker timeZone="Europe/Istanbul" dense showSeconds={false} />
            </Box>
          </Stack>
        </Box>

      </Box>
    </Paper>
  );
}
