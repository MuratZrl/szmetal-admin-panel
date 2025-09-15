'use client';

import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
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

const MotionTypography = motion(Typography);

export default function AuthLeftPanel() {
  
  const theme = useTheme();
  const [index, setIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const id = setInterval(() => setIndex(p => (p + 1) % texts.length), 5000);
    return () => clearInterval(id);
  }, []);

  if (!mounted) return null;

  // Overlay'i sabitle (tema değişse de aynı kalsın)
  const overlayStart = 'rgba(41, 39, 36, 0.70)';
  const overlayEnd   = 'rgba(63, 58, 49, 0.50)';

  // Yazı rengini sadece temadan al (sadece yazılar değişsin)
  const textColor =
    theme.palette.mode === 'dark' ? theme.palette.grey[100] : theme.palette.common.white;

  const textShadow = `0 6px 18px ${alpha(theme.palette.common.black, 0.35)}`;

  return (
    <Box
      sx={{
        position: 'relative',
        backgroundImage: `linear-gradient(135deg, ${overlayStart}, ${overlayEnd}), url('/left-panel-background.jpg')`,
        backgroundRepeat: 'no-repeat, no-repeat',
        backgroundSize: '100% 100%, cover',
        backgroundPosition: { xs: 'center, 80% 50%', md: 'center, 100% 50%' },
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <AnimatePresence mode="wait">
        <MotionTypography
          key={`${texts[index]}-${theme.palette.mode}`} // toggle'da re-animate
          initial={{ opacity: 0, scale: 0.95, letterSpacing: '0.1em' }}
          animate={{ opacity: 1, scale: 1, letterSpacing: '0' }}
          exit={{ opacity: 0, scale: 1.05, letterSpacing: '0.05em' }}
          transition={{ duration: 1.5, ease: 'easeInOut' }}
          variant="h3"
          textAlign="center"
          fontWeight={700}
          sx={{
            color: textColor,
            textShadow,
            transition: 'color 300ms ease', // renk yumuşak geçsin
            position: 'absolute',
            width: '100%',
          }}
        >
          {texts[index]}
        </MotionTypography>
      </AnimatePresence>
    </Box>
  );
}
