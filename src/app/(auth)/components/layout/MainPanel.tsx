'use client';
// src/app/(auth)/components/layout/MainPanel.tsx

import * as React from 'react';
import { Box, Paper } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

import Header from '@/app/(auth)/components/layout/Header';
import Footer from '@/app/(auth)/components/layout/Footer';

type Props = { children: React.ReactNode };

export default function AuthMainPanel({ children }: Props) {
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // Açıkta açık, koyuda koyu bir gradient. “Sabitleme” yok.
  const G1 = isDark ? '#000000ff' : '#e5e5e5ff';
  const G2 = isDark ? '#2f2f2fff' : '#505050ff';

  // Cam efektini de temaya bağla
  const glassBg = isDark
    ? alpha('#FFFFFF', 0.06)
    : alpha('#000000', 0.06);

  const glassBorder = alpha(
    isDark ? '#FFFFFF' : '#717171ff',
    isDark ? 0.14 : 0.99
  );

  return (
    <Box sx={{ position: 'relative', width: 1, height: 1, overflow: 'hidden' }}>
      
      {/* Tema-duyarlı gradient */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(145deg, ${G1}, ${G2})`,
          zIndex: 0,
        }}
      />

      <Header
        logo={{
          href: 'https://www.alutem.com.tr',
          alt: 'Alutem',
          srcLight: '/logo_black.png',
          srcDark: '/logo_white.png',
          width: 120,
          height: 65,
        }}
        maxContentWidth={700}
        height={100}
      />

      <Paper
        square
        sx={{
          width: '100%',
          height: '100%',
          position: 'relative',
          zIndex: 1,
          backgroundColor: glassBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
          border: `1px solid ${glassBorder}`,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 700 }}>{children}</Box>
      </Paper>

      <Box sx={{ position: 'absolute', bottom: 0, left: 0, width: '100%', zIndex: 2 }}>
        <Footer />
      </Box>
      
    </Box>
  );
}
