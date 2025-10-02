// src/app/(auth)/components/layout/RightPanel.tsx
'use client';

import * as React from 'react';
import { Box, Paper } from '@mui/material';
import { motion, useAnimationControls, useReducedMotion } from 'framer-motion';

import Header from '@/app/(auth)/components/layout/Header';
import Footer from '@/app/(auth)/components/layout/Footer';

type Props = {
  children: React.ReactNode;
};

// Durağan gradient renkleri (keyframe sırası)
const GRADIENTS = [
  '#370000ff',
  '#860000ff',
] as const;

type CSSVars = {
  '--c1': string;
  '--c2': string;
};

export default function AuthRightPanel({ children }: Props) {
  const controls = useAnimationControls();
  const prefersReducedMotion = useReducedMotion();

  // Hydration ve StrictMode’da “start-after-mount” uyarısı yememek için
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  React.useEffect(() => {
    if (!mounted || prefersReducedMotion) return;

    // İlk boyada varsayılan değerleri koy
    controls.set({ '--c1': GRADIENTS[0], '--c2': GRADIENTS[1] });

    // c1 ve c2’yi farklı fazda döndür (yumuşak akan degrade)
    const c1Seq = GRADIENTS.slice(); // 0..n
    const c2Seq = GRADIENTS.slice(1).concat(GRADIENTS[0]); // 1..n,0

    // Her adım ~7s; toplam süre adım sayısıyla çarpılır
    controls.start({
      '--c1': c1Seq as unknown as string | string[],
      '--c2': c2Seq as unknown as string | string[],
      transition: {
        duration: 7 * GRADIENTS.length,
        ease: 'easeInOut',
        repeat: Infinity,
      },
    });

    return () => {
      controls.stop();
    };
  }, [controls, mounted, prefersReducedMotion]);

  // İlk frame’de gradient görünsün diye başlangıç değişkenleri
  const initialVars: CSSVars = { '--c1': GRADIENTS[0], '--c2': GRADIENTS[1] };

  return (
    <Box sx={{ position: 'relative', width: 1, height: 1, overflow: 'hidden' }}>
      {mounted && (
        <motion.div
          animate={prefersReducedMotion ? undefined : controls}
          style={{
            position: 'absolute',
            inset: 0,
            width: '100%',
            height: '100%',
            // Not: Burada renkleri CSS değişkenlerinden alıyoruz.
            background: 'linear-gradient(145deg, var(--c1), var(--c2))',
            // İlk render’da boş kalmasın
            ...initialVars,
            // Performans için
            willChange: 'transform, opacity',
            zIndex: 0,
          }}
        />
      )}

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
