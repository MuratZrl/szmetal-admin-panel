// app/(admin)/layout.tsx
import * as React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import Breadcrumb from '@/components/layout/Breadcrumb';
import Header from '@/components/layout/Header';

import Providers from '@/app/(admin)/providers';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

const SIDEBAR_WIDTH = 72; // Sidebar ile aynı

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <Providers>
      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          bgcolor: 'background.default', // callback yok
          color: 'text.primary',
        }}
      >
        <Sidebar />

        <Box
          component={'main'}
          sx={{
            flexGrow: 1,
            ml: { sm: `${SIDEBAR_WIDTH}px`, xs: 0 },
            overflowX: 'hidden',
            px: { xs: 1.5, md: 2 },
            py: { xs: 1, md: 1.5 },
          }}
        >
          {/* Dış çerçeve: surface[1] */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              // theme.shape.borderRadius * 2 yerine CSS var kullan
              borderRadius: 'calc(var(--mui-shape-borderRadius) * 2)',
              bgcolor: 'var(--rs-surface-1)', // CssBaseline'da bastık
            }}
          >
            <Breadcrumb />
            <Header />

            {/* İçerik kutusu: surface[2] */}
            <Paper
              variant="outlined"
              sx={{
                width: '100%',
                px: { xs: 2, md: 3 },
                py: { xs: 1.5, md: 2 },
                my: 2,
                borderRadius: 'calc(var(--mui-shape-borderRadius) * 2)',
                bgcolor: 'var(--rs-surface-2)',
              }}
            >
              <Box>{children}</Box>
            </Paper>
          </Paper>
        </Box>
      </Box>
    </Providers>
  );
}
