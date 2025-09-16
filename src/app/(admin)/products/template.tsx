// app/(admin)/products/template.tsx
import * as React from 'react';
import { Box } from '@mui/material';

export default function ProductsTemplate({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ width: '100%', py: 2 }}>
      {children}
    </Box>
  );
}
