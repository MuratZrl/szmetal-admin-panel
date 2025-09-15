'use client';

import { ReactNode, useEffect } from 'react';

import { Box, Paper } from '@mui/material';

import { motion, useAnimation } from 'framer-motion';

import ParticlesBackground from '@/app/(auth)/components/ui/ParticlesBackground';

import Header from '@/app/(auth)/components/layout/Header';
import Footer from '@/app/(auth)/components/layout/Footer';

type Props = {
  children: ReactNode;
};

// Sabit gradient renkler (düz renk gibi ele alınacak)
const gradients = [
  '#9f0000ff',
  '#ad0000ff',
  '#aa0000ff',
  '#910000ff', 
  '#940000ff', 
  '#7d0000ff', 
  '#790000ff', 
  '#630000ff', 
  '#550000ff', 
  '#5e0000ff', 
  '#550000ff', 
  '#380000ff', 
];

const AuthRightPanel = ({ children }: Props) => {
  const controls = useAnimation();

  useEffect(() => {
    const loopGradient = async () => {
      while (true) {
        for (let i = 0; i < gradients.length; i++) {
          const next = gradients[(i + 1) % gradients.length];
          
          await controls.start({
            background: `linear-gradient(145deg, ${gradients[i]}, ${next})`, // ✅ backtick kullanıldı
            transition: { duration: 7, ease: 'easeInOut' },
          });
        }
      }
    };

    loopGradient(); // ✅ animasyonu başlat
  }, [controls]);

  return (
    <Box sx={{ position: 'relative', width: 1, height: 1, overflow: 'hidden' }}>
      
      {/* Arka plan - framer motion ile */}
      <motion.div
        animate={controls}
        style={{
          position: 'absolute', inset: 0,
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `linear-gradient(135deg, ${gradients[0]}, ${gradients[1]})`,
          backgroundSize: '400% 400%',
          zIndex: 0,
        }}
      />

      {/* Header en üstte */}
      <Header
        logo={{
          href: 'https://www.alutem.com.tr', // dış link olduğu için <a> ile açılır
          alt: 'Alutem',
          srcLight: '/logo_black.png',   // açık tema
          srcDark:  '/logo_white.png',   // koyu tema
          width: 120,
          height: 65, 
        }}
        maxContentWidth={700}
        height={100}
      />

      {/* Saydam blur layer */}
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

        <ParticlesBackground />

        <Box sx={{ width: '100%', maxWidth: 700 }}>{children}</Box>
      </Paper>

      {/* Footer */}
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
};

export default AuthRightPanel;
