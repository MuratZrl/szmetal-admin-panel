'use client';

import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';

const texts = [
  'Kullanıcı dostu arayüz',
  'Verilerinizi güvenle yönetin',
  'SZ Metal ile güçlü alt yapı',
  'Gerçek zamanlı analiz ve raporlama',
  'Her cihazda erişilebilir kontrol paneli',
  'Hızlı, güvenilir ve esnek sistem mimarisi',
  'İhtiyaçlarınıza özel çözümler',
];

const MotionTypography = motion.create(Typography); // ✅ yeni ve doğru kullanım

const AuthLeftPanel = () => {
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false); // 👈 SSR sırasında render'ı engeller

  useEffect(() => {
    setMounted(true); // 👈 client mount edildiğinde göster

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % texts.length);
    }, 5000);

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
          initial={{ opacity: 0, scale: 0.95, letterSpacing: '0.1em' }}
          animate={{ opacity: 1, scale: 1, letterSpacing: '0' }}
          exit={{ opacity: 0, scale: 1.05, letterSpacing: '0.05em' }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          variant="h3"
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
