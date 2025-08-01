'use client';

import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const texts = [
  'Kullanıcı dostu arayüz',
  'Verilerinizi güvenle yönetin',
  'SZ Metal ile güçlü alt yapı',
];

const MotionTypography = motion.create(Typography); // ✅ yeni ve doğru kullanım

const AuthLeftPanel = () => {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false); // 👈 SSR sırasında render'ı engeller

  useEffect(() => {
    setMounted(true); // 👈 client mount edildiğinde göster

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  if (!mounted) return null;

  return (
    <Box
      style={{
        position: 'relative', // ✅
        backgroundImage: `
          linear-gradient(135deg, #292724ff, #3f3a31b9),
          url('/left-panel-background.jpg')
        `,
        backgroundSize: 'cover',
        backgroundRepeat: 'no-repeat',
        backgroundPosition: 'center',

        width: '100%',
        height: '100%',

        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',

      }}
    >
      <AnimatePresence mode="wait">
        <MotionTypography
          key={texts[index]}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6, ease: 'easeInOut' }}
          variant="h2"
          textAlign="center"
          fontWeight={600}
          color="white"
          sx={{
            textShadow: '2px 2px 15px rgba(0, 0, 0, 0.25)',
            position: 'absolute', // 👈 önemli!
            width: '100%', // içerik kaymasın
          }}
        >
          {texts[index]}
        </MotionTypography>
      </AnimatePresence>
    </Box>
  );
};

export default AuthLeftPanel;
