// src/features/dashboard/components/PremiumSection.client.tsx
'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Paper,
  Stack,
  Typography,
  Button,
  useTheme,
} from '@mui/material';
import { alpha, darken, type Theme } from '@mui/material/styles';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';

type Props = {
  title?: string;
  description?: string;
  ctaLabel?: string;
  href?: string;              // Eğer verilir ise buton Link olarak render edilir
  onClick?: () => void;       // Eğer href yoksa onClick çalışır
  disabled?: boolean;
  /** Dış sarmalayıcıya ek stil gerekirse */
  sx?: NonNullable<React.ComponentProps<typeof Paper>['sx']>;
};

/** Palette’te accent varsa kullan, yoksa primary’ye düş */
function getAccent(theme: Theme): string {
  const paletteWithAccent = theme.palette as unknown as { accent?: { main?: string } };
  return paletteWithAccent.accent?.main ?? theme.palette.primary.main;
}

export default function PremiumSection({
  title = 'Premium Özelliğine Erişin',
  description = 'Gelişmiş raporlara, daha detaylı analizlere ve öncelikli desteğe hemen ulaşın.',
  ctaLabel = 'Yükselt',
  href,
  onClick,
  disabled,
  sx,
}: Props): React.JSX.Element {
  const theme = useTheme();
  const accent = getAccent(theme);
  const isDark = theme.palette.mode === 'dark';

  const glassBg = alpha(theme.palette.background.paper, isDark ? 0.28 : 0.5);
  const borderCol = alpha(theme.palette.divider, 0.6);
  const ringCol = alpha(accent, 0.22);

  return (
    <Paper
      role="region"
      aria-label="Premium özellik tanıtımı"
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        bgcolor: glassBg,
        border: `1px solid ${borderCol}`,
        backdropFilter: 'blur(10px) saturate(120%)',
        WebkitBackdropFilter: 'blur(10px) saturate(120%)',

        // Yumuşak accent parıltısı
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: '-30% -10% auto -10%',
          height: '70%',
          background: `radial-gradient(60% 60% at 50% 50%, ${alpha(accent, 0.18)} 0%, transparent 70%)`,
          pointerEvents: 'none',
        },

        ...sx,
      }}
    >
      <Stack
        spacing={{ xs: 1.25, sm: 1.5 }}
        alignItems="center"
        justifyContent="center"
        textAlign="center"
      >
        {/* Kilit ikonu, cam yüzey ve halka efekti */}
        <Box
          aria-hidden
          sx={{
            position: 'relative',
            width: 72,
            height: 72,
            borderRadius: '50%',
            display: 'grid',
            placeItems: 'center',
            bgcolor: alpha(accent, isDark ? 0.16 : 0.12),
            border: `1px solid ${alpha(accent, 0.35)}`,
            boxShadow: `inset 0 1px 0 ${alpha('#fff', isDark ? 0.08 : 0.22)}, 0 8px 24px ${alpha(accent, 0.25)}`,
            backdropFilter: 'blur(6px)',
            WebkitBackdropFilter: 'blur(6px)',
            '&::after': {
              content: '""',
              position: 'absolute',
              inset: -8,
              borderRadius: 'inherit',
              border: `2px solid ${ringCol}`,
              filter: 'blur(2px)',
            },
          }}
        >
          <LockOutlinedIcon
            fontSize="medium"
            sx={{
              color: theme.palette.getContrastText(accent),
              // İkonu biraz daha görünür kılmak için iki tonlu maske
              textShadow: `0 1px 0 ${alpha('#000', 0.35)}`,
            }}
          />
        </Box>

        <Typography
          variant="h6"
          fontWeight={800}
          sx={{ letterSpacing: 0.2 }}
        >
          {title}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ maxWidth: 560 }}
        >
          {description}
        </Typography>

        <Stack direction="row" spacing={1.25} sx={{ pt: 0.5 }}>
          {href ? (
            <Button
              component={Link}
              href={href}
              prefetch={false}
              aria-label={ctaLabel}
              disabled={disabled}
              sx={{
                px: 2.25,
                bgcolor: accent,
                color: theme.palette.getContrastText(accent),
                '&:hover': { bgcolor: darken(accent, 0.12) },
              }}
            >
              {ctaLabel}
            </Button>
          ) : (
            <Button
              onClick={onClick}
              aria-label={ctaLabel}
              disabled={disabled}
              sx={{
                px: 2.25,
                bgcolor: accent,
                color: theme.palette.getContrastText(accent),
                '&:hover': { bgcolor: darken(accent, 0.12) },
              }}
            >
              {ctaLabel}
            </Button>
          )}

          <Button
            variant="outlined"
            color="inherit"
            href={href ?? undefined}
            component={href ? Link : 'button'}
            onClick={href ? undefined : onClick}
            disabled={disabled}
            sx={{
              borderColor: alpha(theme.palette.text.primary, 0.24),
            }}
          >
            Detaylar
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
