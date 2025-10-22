// src/app/(admin)/layout.tsx
import * as React from 'react';
import { redirect } from 'next/navigation';
import { Box, Paper } from '@mui/material';

import Breadcrumb from '@/components/layout/Breadcrumb';
import { SIDEBAR_WIDTH } from '@/constants/layout';
import Sidebar from '@/features/sidebar';
import { getSidebarInitialData } from '@/features/sidebar/services/sidebar.server';
import { mainLinks } from '@/constants/mainlinks';

import AuthRefresh from './AuthRefresh.client';
import AccessAutoRedirect from '@/features/auth/AccessAuthRedirect.client';

export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const initialData = await getSidebarInitialData();

  if (!initialData.userId) redirect('/login');

  return (
    <>
      {/* Supabase oturum çerezlerini yenilemek için */}
      <AuthRefresh />

      {/* Rol/Status değişirse sayfayı yenilemeden anında yönlendir */}
      <AccessAutoRedirect selfUserId={initialData.userId} />

      <Box
        sx={{
          display: 'flex',
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <Sidebar initialData={initialData} mainLinks={mainLinks} />

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: { sm: `${SIDEBAR_WIDTH}px`, xs: 0, md: 0 },
            overflowX: 'hidden',
            px: { xs: 1.25 },
            py: { xs: 1, md: 2 },
          }}
        >
          <Paper
            variant="outlined"
            sx={{
              px: 2,
              py: 2,
              borderRadius: 2.5,
              bgcolor: 'var(--rs-surface-1)',
            }}
          >
            <Breadcrumb />

            <Paper
              variant="outlined"
              sx={{
                width: '100%',
                px: { xs: 2, md: 3 },
                py: { xs: 1.5, md: 2 },
                my: 2,
                borderRadius: 3,
                bgcolor: 'var(--rs-surface-2)',
              }}
            >
              {children}
            </Paper>
          </Paper>
        </Box>
      </Box>
    </>
  );
}
