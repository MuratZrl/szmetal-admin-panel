'use client';

import { ReactNode, useEffect } from 'react';
import { Box, Paper } from '@mui/material';
import { motion, useAnimation } from 'framer-motion';
import Footer from './Footer';

import ParticlesBackground from '../ui/ParticlesBackground';

type Props = {
  children: ReactNode;
};

// Sabit gradient renkler (düz renk gibi ele alınacak)
const gradients = [
  '#514a9d',
  '#186decff',
  '#3af0d1ff',
  '#2adb89ff', 
  '#b1f11bff', 
  '#1bf171ff', 
  '#1bd1f1ff', 
  '#1b8df1ff', 
  '#221bf1ff', 
  '#621bf1ff', 
  '#d11bf1ff', 
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
