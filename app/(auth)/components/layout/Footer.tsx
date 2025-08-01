// app/(auth)/components/layout/Footer.tsx
'use client';

import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        textAlign: 'center',
        width: '100%',

        py: 2,
        px: 2,
        borderTop: '1px solid rgba(255, 255, 255, 0.2)',
        color: 'white',
        fontSize: 14,
        opacity: 0.75,
      }}
    >

      <Typography 
        variant="body2" 
        gutterBottom
      >
        © {new Date().getFullYear()} Alutem. Tüm hakları saklıdır.
      </Typography>
      
    </Box>
  );
};

export default Footer;
