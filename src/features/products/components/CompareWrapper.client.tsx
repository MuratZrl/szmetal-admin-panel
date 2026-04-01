'use client';
// src/features/products/components/CompareWrapper.client.tsx

import * as React from 'react';
import { Box } from '@mui/material';

import { CompareProvider } from '@/features/products/contexts/CompareContext.client';
import CompareBar from '@/features/products/components/CompareBar.client';

export default function CompareWrapper({ children }: { children: React.ReactNode }) {
  return (
    <CompareProvider>
      <Box sx={{ width: '100%', py: 2 }}>
        {children}
      </Box>
      <CompareBar />
    </CompareProvider>
  );
}
