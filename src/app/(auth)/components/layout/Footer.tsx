// app/(auth)/components/layout/Footer.tsx
import { Box, Typography } from '@mui/material';

export default function Footer() {
  return (
    <Box
      component="footer"
      
      sx={(t) => ({
        textAlign: 'center',
        width: '100%',
        py: 2,
        px: 2,
        bgcolor: 'transparent',
        borderTop: `1px solid ${t.palette.divider}`,
        color: 'text.secondary',
        fontSize: 14,
      })}
    >
    
      <Typography variant="body2" gutterBottom color="text.main">
        © {new Date().getFullYear()} Alutem. Tüm hakları saklıdır.
      </Typography>
    
    </Box>
  );
}
