'use client';

import { usePathname } from 'next/navigation';
import { Typography } from '@mui/material';
import { motion } from 'framer-motion';

// Yeni API ile motion bileşenlerini oluşturuyoruz
const MotionDiv = motion.create('div');
const MotionTypography = motion.create(Typography);

const getPageTitle = (pathname: string) => {
  if (pathname.includes('/login')) return <>Hoş Geldiniz</>;
  if (pathname.includes('/register')) return <>Aramıza<br />Katılın</>;
  if (pathname.includes('/forgot-password')) return <>Şifrenizi<br />Sıfırlayın</>;
  return 'SZ Metal Panel';
};

const AuthLeftPanel = () => {
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname);

  return (
    <MotionDiv
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
      initial={{ backgroundColor: '#ffae00ff' }}
      animate={{
        backgroundColor: [
          '#ffae00ff',
          '#df7900',
          '#f0880aff',
          '#df7900',
          '#ffae00ff',
        ],
      }}
      transition={{
        duration: 15,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
    >
      <MotionTypography
        key={pathname}
        variant="h1"
        lineHeight={1.15}
        fontWeight={600}
        textAlign="center"
        color="white"
        zIndex={99}
        sx={{ textShadow: '2px 2px 15px rgba(0, 0, 0, 0.75)', opacity: 0.85 }}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      >
        {pageTitle}
      </MotionTypography>
    </MotionDiv>
  );
};

export default AuthLeftPanel;
