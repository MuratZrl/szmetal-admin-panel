'use client';

import * as React from 'react';

import type { Route } from 'next';
import Link from 'next/link';
import Image, { StaticImageData } from 'next/image';

import { Box, Paper } from '@mui/material';
import { useTheme } from '@mui/material/styles';

import ThemeToggle from '@/theme/ThemeToggle.client';

type LogoSrc = StaticImageData | string;

type LogoProps = {
  href: string;      // iç rota veya dış URL
  alt: string;
  srcLight: LogoSrc;
  srcDark: LogoSrc;
  width?: number;
  height?: number;
};

type Props = {
  logo: LogoProps;           // sadece 1 logo
  maxContentWidth?: number;
  showDivider?: boolean;
  height?: number;           // header yüksekliği (px)
};

function isExternal(href: string): boolean {
  return /^https?:\/\//i.test(href);
}

export default function Header({
  logo,
  maxContentWidth = 1040,
  showDivider = true,
  height = 64,
}: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const renderLogo = (cfg: LogoProps) => {
    const w = cfg.width ?? 120;
    const h = cfg.height ?? 36;

    const img = (
      <Box sx={{ position: 'relative', width: w, height: h }}>
        <Image
          src={isDark ? cfg.srcDark : cfg.srcLight}
          alt={cfg.alt}
          fill
          style={{
            objectFit: 'contain',
            objectPosition: 'left center',
            filter: 'drop-shadow(0 0 1px rgba(0,0,0,0.35))', // beyaz logoya mikro kontrast
          }}
          priority
          draggable={false}
        />
      </Box>
    );

    if (isExternal(cfg.href)) {
      return (
        <a href={cfg.href} aria-label={cfg.alt} target="_blank" rel="noopener noreferrer">
          {img}
        </a>
      );
    }

    return (
      <Link href={cfg.href as Route} aria-label={cfg.alt}>
        {img}
      </Link>
    );
  
  };

  return (
    <Box 
      bgcolor={'transparent'}
      sx={{ 
        position: 'absolute', 
        inset: 0, 
        top: 0, 
        height, 
        zIndex: 3, 
        pointerEvents: 'none' 
      }}
    >
      <Paper
        square
        elevation={0}
        sx={{
          px: 2,
          height,
          display: 'flex',
          alignItems: 'center',
          bgcolor: 'transparent',
          borderBottom: showDivider ? t => `1px solid ${t.palette.divider}` : 'none',
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
            pointerEvents: 'auto', // tıklanabilsin
          }}
        >
          {/* Sol: Alutem logosu */}
          {renderLogo(logo)}

          {/* Sağ: Tema toggle */}
          <ThemeToggle />
        </Box>
      </Paper>
    </Box>
  );
}
