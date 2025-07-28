import React from 'react';
import Sidebar from './_components_/layout/Sidebar';
import Breadcrumb from './_components_/layout/Breadcrumb';
import Header from './_components_/layout/Header';

import { Box, Paper, CssBaseline } from '@mui/material';

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
            px: 1.5,
            py: 1,
          }}
        >

          <Paper elevation={3} sx={{ p: 2, backgroundColor: 'white', borderRadius: 7 }}>

            <Breadcrumb />

            <Header />

            {/* Ortak Paper kapsayıcı */}
            <Paper
              elevation={4}
              sx={{
                width: '100%',
                p: { xs: 2 },
                my: 2,
                borderRadius: 7,
                backgroundColor: '#e7e7e750',
              }}
            >

              <Box>
                {children}
              </Box>

            </Paper>


          </Paper>


        </Box>
      </Box>
    </>
  );
}
