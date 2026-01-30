'use client';
// src/app/(auth)/components/layout/Header.tsx

import * as React from 'react';

import type { Route } from 'next';
import Link from 'next/link';
import Image, { type StaticImageData } from 'next/image';

import { Box, Paper } from '@mui/material';

import { useTheme } from '@mui/material/styles'; // ✅ MUI theme'den oku

import ThemeToggle from '@/theme/ThemeToggle.client';

type LogoSrc = StaticImageData | string;
type ExternalHref = `http${string}`;

type LogoProps = {
  href: Route | ExternalHref;
  alt: string;
  srcLight: LogoSrc; // açık tema için
  srcDark: LogoSrc;  // koyu tema için
  width?: number;
  height?: number;
};

type Props = { logo: LogoProps; maxContentWidth?: number; showDivider?: boolean; height?: number };

export default function Header({ logo, maxContentWidth = 1040, showDivider = true, height = 64 }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark'; // ✅ tek doğru kaynak

  // SSG/SSR hydratation titremesini kesmek istersen (opsiyonel ama sağlıklı)
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;

  const renderLogo = (cfg: LogoProps) => {
    const w = cfg.width ?? 120;
    const h = cfg.height ?? 36;

    const img = (
      <Box sx={{ position: 'relative', width: w, height: h }}>
        <Image
          src={isDark ? cfg.srcDark : cfg.srcLight}
          alt={cfg.alt}
          fill
          style={{ objectFit: 'contain', objectPosition: 'left center' }}
          priority
          draggable={false}
        />
      </Box>
    );

    const isExternal = (href: LogoProps['href']): href is ExternalHref => /^https?:\/\//i.test(href);
    return isExternal(cfg.href)
      ? <a href={cfg.href} aria-label={cfg.alt} target="_blank" rel="noopener noreferrer">{img}</a>
      : <Link href={cfg.href}>{img}</Link>;
  };

  return (
    <Box sx={{ position: 'absolute', inset: 0, top: 0, height, zIndex: 5, pointerEvents: 'none' }}>
      <Paper
        square
        elevation={0}
        sx={{
          px: 2,
          height,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'transparent',
          borderRadius: 0,
          borderBottom: t => (showDivider ? `1px solid ${t.palette.divider}` : 'none'),
        }}
      >
        <Box
          sx={{
            width: '100%',
            maxWidth: maxContentWidth,
            mx: 'auto',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            pointerEvents: 'auto',
            position: 'relative',
            zIndex: 6,
          }}
        >
          {renderLogo(logo)}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', width: 44, height: 44 }}>
              <ThemeToggle />
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
}
