// src/app/(auth)/components/layout/MainPanel.tsx
'use client';

import * as React from 'react';

import { Box, Paper } from '@mui/material';

import Header from '@/app/(auth)/components/layout/Header';
import Footer from '@/app/(auth)/components/layout/Footer';

type Props = {
  children: React.ReactNode;
};

const C1 = '#4f4f4fff';
const C2 = '#151515ff';

export default function AuthMainPanel({ children }: Props) {
  return (
    <Box sx={{ position: 'relative', width: 1, height: 1, overflow: 'hidden' }}>
      {/* Statik gradient arka plan */}
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(145deg, ${C1}, ${C2})`,
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
          backgroundColor: 'rgba(255,255,255,0.05)',
          backdropFilter: 'blur(10px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 2,
        }}
      >
        <Box sx={{ width: '100%', maxWidth: 700 }}>{children}</Box>
      </Paper>

      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
          zIndex: 2,
        }}
      >
        <Footer />
      </Box>
    </Box>
  );
}
