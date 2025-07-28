import Image from 'next/image';
import { ReactNode } from 'react';
import { Paper, Box } from '@mui/material';
import Footer from './Footer';

type Props = {
  children: ReactNode;
};

const AuthRightPanel = ({ children }: Props) => {
  return (
    <Box sx={{ position: 'relative', width: '100%', height: '100vh' }}>

      {/* Logo - Sağ üst köşe */}
      <Box
        sx={{
          position: 'absolute',
          top: 16,
          right: 16,
          zIndex: 15,
          height: 40, // sabit ölçü
        }}
      >
        <Image
          src="/szmetal-logo.png"
          alt="SZ Metal Logo"
          fill
          style={{ objectFit: 'cover' }}
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"     
        />
      </Box>

      {/* Ana içerik alanı */}
      <Paper
        square
        sx={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundImage: 'linear-gradient(to right, red, darkred)',
          px: 2,
        }}
      >
        <Box sx={{ width: '100%' }}>{children}</Box>
      </Paper>

      {/* Footer - Sayfanın en altına sabitlenmiş */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          width: '100%',
        }}
      >
        <Footer />
      </Box>

    </Box>
  );
};

export default AuthRightPanel;
