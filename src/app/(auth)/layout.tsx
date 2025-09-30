// app/(auth)/layout.tsx
import * as React from 'react';
import { Box, Grid } from '@mui/material';
import AuthLeftPanel from './components/layout/LeftPanel';
import AuthRightPanel from './components/layout/RightPanel';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default' }}>
      <Grid container columns={12} sx={{ m: 0, width: 1, height: 1, p: 0 }}>
        <Grid size={{ md: 7 }} sx={{ display: { xs: 'none', md: 'block' }, height: 1, p: 0 }}>
          <AuthLeftPanel />
        </Grid>
        <Grid size={{ xs: 12, md: 5 }} sx={{ height: 1, p: 0 }}>
          <AuthRightPanel>{children}</AuthRightPanel>
        </Grid>
      </Grid>
    </Box>
  );
}
