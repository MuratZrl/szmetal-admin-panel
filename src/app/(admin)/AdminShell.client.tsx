'use client';
// src/app/(admin)/AdminShell.client.tsx

import * as React from 'react';

import { AppBar, Box, IconButton, Paper, Toolbar } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';

import { SIDEBAR_WIDTH } from '@/constants/layout';
import SidebarRoot from '@/features/sidebar/components/SidebarRoot.client';
import SidebarLogo from '@/features/sidebar/components/SidebarLogo';
import Breadcrumb from '@/components/layout/Breadcrumb';

import AuthRefresh from '@/app/(admin)/AuthRefresh.client';
import AccessAutoRedirect from '@/features/auth/AccessAuthRedirect.client';

import type { SidebarInitialData } from '@/features/sidebar/services/sidebar.server';
import type { SidebarLink } from '@/features/sidebar/types';

type Props = {
  initialData: SidebarInitialData;
  mainLinks: SidebarLink[];
  children: React.ReactNode;
};

export default function AdminShell({ initialData, mainLinks, children }: Props): React.JSX.Element {
  const [mobileOpen, setMobileOpen] = React.useState<boolean>(false);

  const logoHref =
    initialData.status === 'Inactive' ? ('/account' as const) : ('/create_request' as const);

  return (
    <>
      <AuthRefresh enabled={process.env.NODE_ENV === 'production'} />
      <AccessAutoRedirect selfUserId={initialData.userId} />

      <Box
        sx={{
          display: 'flex',
          minHeight: '100dvh',
          bgcolor: 'background.default',
          color: 'text.primary',
        }}
      >
        <SidebarRoot
          initialRole={initialData.role}
          initialStatus={initialData.status}
          initialUnread={initialData.unreadCount}
          userId={initialData.userId}
          mainLinks={mainLinks}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />

        <AppBar
          position="fixed"
          color="inherit"
          elevation={0}
          sx={{
            display: { xs: 'flex', sm: 'none' },
            borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <Toolbar variant="regular" sx={{ minHeight: 56 }}>
            <IconButton
              edge="start"
              aria-label="Menüyü aç"
              onClick={() => setMobileOpen(true)}
              color="inherit"
            >
              <MenuIcon />
            </IconButton>

            <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
              <SidebarLogo href={logoHref} variant="expanded" size={{ width: 104, height: 42 }} />
            </Box>
          </Toolbar>
        </AppBar>

        <Box
          component="main"
          sx={{
            flexGrow: 1,
            ml: { xs: 0, sm: `${SIDEBAR_WIDTH}px` },
            overflowX: 'hidden',
            overflowY: 'auto',
            px: { xs: 1.25, sm: 2, md: 3 },
            py: { xs: 1, md: 2 },
          }}
        >
          <Box sx={{ height: { xs: 56, sm: 0 } }} />

          <Box sx={{ width: '100%' }}>
            <Paper
              variant="outlined"
              sx={{
                px: { xs: 1.5, md: 2 },
                py: { xs: 1.5, md: 2 },
                borderRadius: 2.5,
                bgcolor: 'var(--rs-surface-1)',
              }}
            >
              <Breadcrumb />

              <Paper
                variant="outlined"
                sx={{
                  width: '100%',
                  px: { xs: 1.5, md: 3 },
                  py: { xs: 1.5, md: 2 },
                  mt: 2,
                  borderRadius: 3,
                  bgcolor: 'var(--rs-surface-2)',
                }}
              >
                {children}
              </Paper>
            </Paper>
          </Box>
        </Box>
      </Box>
    </>
  );
}
