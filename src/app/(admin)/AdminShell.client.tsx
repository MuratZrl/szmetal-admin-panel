// src/app/(admin)/AdminShell.client.tsx
'use client';

import * as React from 'react';

import { Box, Paper, AppBar, Toolbar, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import { SIDEBAR_WIDTH } from '@/constants/layout';
import SidebarRoot from '@/features/sidebar/components/SidebarRoot.client';
import SidebarLogo from '@/features/sidebar/components/SidebarLogo';
import Breadcrumb from '@/components/layout/Breadcrumb';
import type { SidebarInitialData } from '@/features/sidebar/services/sidebar.server';

import type { SidebarLink } from '@/features/sidebar/types';

export default function AdminShell({
  initialData,
  mainLinks,
  children,
}: {
  initialData: SidebarInitialData;
  mainLinks: SidebarLink[];
  children: React.ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = React.useState<boolean>(false);

  // Logo tıklanınca nereye gitsin: Inactive ise /account, aksi halde /create_request
  const logoHref = initialData.status === 'Inactive' ? ('/account' as const) : ('/create_request' as const);

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default', color: 'text.primary' }}>
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
        sx={{ display: { xs: 'flex', sm: 'none' }, borderBottom: theme => `1px solid ${theme.palette.divider}` }}
      >
        <Toolbar variant="regular" sx={{ minHeight: 56 }}>
          <IconButton edge="start" aria-label="menu" onClick={() => setMobileOpen(true)}>
            <MenuIcon />
          </IconButton>

          <Box sx={{ ml: 1, display: 'flex', alignItems: 'center' }}>
            {/* Burada boyutu küçült: örn. 104x42 gayet dengeli */}
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
          px: { xs: 1.25 },
          py: { xs: 1, md: 2 },
        }}
      >
        {/* Mobil AppBar yüksekliği kadar spacer */}
        <Box sx={{ height: { xs: 56, sm: 0 } }} />

        <Paper variant="outlined" sx={{ px: 2, py: 2, borderRadius: 2.5, bgcolor: 'var(--rs-surface-1)' }}>
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
  );
}
