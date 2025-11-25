// src/features/products/components/ui/ProductCard/CustomerMoldBadge.client.tsx
'use client';

import { Box } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

export function CustomerMoldBadge() {
  const theme = useTheme();
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 8,
        left: 8,
        zIndex: 3,
        px: 1.25,
        py: 0.25,
        borderRadius: 999,
        bgcolor: alpha(theme.palette.warning.main, 0.95),
        color: theme.palette.getContrastText(theme.palette.warning.main),
        fontSize: '0.7rem',
        fontWeight: 700,
        textTransform: 'uppercase',
        letterSpacing: 0.4,
        boxShadow: theme.shadows[3],
      }}
    >
      Müşteri Kalıbı
    </Box>
  );
}
