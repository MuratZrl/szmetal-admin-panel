'use client';
// src/app/(auth)/AuthShell.client.tsx

import * as React from 'react';
import { Box, Grid } from '@mui/material';
import AuthMainPanel from './components/layout/MainPanel';

export default function AuthShell({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default' }}>
      <Grid container columns={12} sx={{ m: 0, width: 1, height: 1, p: 0 }}>
        <Grid size={{ xs: 12 }} sx={{ height: 1, p: 0 }}>
          <AuthMainPanel>{children}</AuthMainPanel>
        </Grid>
      </Grid>
    </Box>
  );
}
