import React from 'react';
import Sidebar from './_components_/layout/Sidebar';
import Breadcrumb from './_components_/layout/Breadcrumb';
import Header from './_components_/layout/Header';

import { Box, CssBaseline } from '@mui/material';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <CssBaseline />
      <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'grey.50', color: 'grey.900' }}>

        <Sidebar />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: { sm: '60px', xs: 0 },
            overflowX: 'hidden',
            px: 2,
            py: 2,
          }}
        >

          <Breadcrumb />
          <Header />

          <Box>
            {children}
          </Box>

        </Box>
      </Box>
    </>
  );
}
