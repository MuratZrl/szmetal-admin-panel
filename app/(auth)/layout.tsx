import React from 'react';
import { Box, Grid } from '@mui/material';

import AuthLeftPanel from './components/layout/LeftPanel';
import AuthRightPanel from './components/layout/RightPanel';

export default function AuthLayout({ children }: { children: React.ReactNode }) {

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', color: 'text.primary' }}>
      
      <Grid container sx={{ height: '100vh' }}>

        {/* Sol Panel */}
        <Grid size={{ md: 7 }} sx={{ display: { xs: 'none', md: 'block' } }}>
          <AuthLeftPanel />
        </Grid>

        {/* Sağ Panel */}
        <Grid size={{ xs: 12, md: 5 }} >
          <AuthRightPanel>{children}</AuthRightPanel>
        </Grid>
        
      </Grid>

    </Box>
  );
}
