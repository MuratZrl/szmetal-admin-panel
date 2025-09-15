// app/(admin)/layout.tsx
import * as React from 'react';
import Providers from '@/providers';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';

import Breadcrumb from '@/components/layout/Breadcrumb';
import { SIDEBAR_WIDTH } from '@/constants/layout';

// 🔁 yeni importlar
import Sidebar from '@/features/sidebar'; // barrel export
import { getSidebarInitialData } from '@/features/sidebar/services/sidebar.server';
import { mainLinks } from '@/constants/mainlinks';

// Supabase auth cookie'lerine güveniyorsan bu iyi fikir.
// İstemiyorsan kaldır; ama "cached user" saçmalıkları görürsen geri ekle.
export const dynamic = 'force-dynamic';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  
  // 🔁 SSR: rol + unread + userId
  const initialData = await getSidebarInitialData();

  return (
    <Providers>

      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >

        {/* 🔁 Artık Sidebar'a veri geçiyoruz */}
        <Sidebar initialData={initialData} mainLinks={mainLinks} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: { sm: `${SIDEBAR_WIDTH}px`, xs: 0, md: 1 },
            overflowX: 'hidden',
            px: { xs: 1.5 },
            py: { xs: 1, md: 2 },
          }}
        >
          
          {/* Dış çerçeve: surface[1] */}
          <Paper
            variant="outlined"
            sx={{
              p: 2,
              borderRadius: 'calc(var(--rs-radius) * 2)',
              bgcolor: 'var(--rs-surface-1)',
            }}
          >

            <Breadcrumb />

            {/* İçerik kutusu: surface[2] */}
            <Paper
              variant="outlined"
              sx={{
                width: '100%',
                px: { xs: 2, md: 3 },
                py: { xs: 1.5, md: 2 },
                my: 2,
                borderRadius: 'calc(var(--rs-radius) * 2)',
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
