// src/features/sidebar/components/SidebarRoot.client.tsx
'use client';

import * as React from 'react';
import { Drawer, Box } from '@mui/material';
import { SIDEBAR_WIDTH } from '@/constants/layout';
import { supabase } from '@/lib/supabase/supabaseClient';
import SidebarLogo from './SidebarLogo';
import SidebarNav from './SidebarNav';
import SidebarFooter from './SidebarFooter';
import { filterLinksByRole } from '../utils/filterLinks';
import { useSidebarRealtime } from '../hooks/useSidebarRealtime.client';
import type { SidebarLink, Role } from '../types';

type Props = {
  initialRole: Role;
  initialUnread: number;
  userId: string | null;
  mainLinks: SidebarLink[];
};

export default function SidebarRoot({ initialRole, initialUnread, userId, mainLinks }: Props) {
  // rol ve loading sabit, state’e gerek yok
  const role: Role = initialRole;
  const loading = false;

  const [unread, setUnread] = React.useState<number>(initialUnread);

  useSidebarRealtime(userId, () => setUnread(prev => prev + 1));

  const links = React.useMemo(
    () => filterLinksByRole(mainLinks, role, loading),
    [mainLinks, role, loading]
  );
  const logoutLink = React.useMemo(
    () => mainLinks.find(l => l.label === 'Logout') ?? null,
    [mainLinks]
  );

  const handleLogout = React.useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (!error) window.location.href = '/login';
  }, []);

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        display: { xs: 'none', sm: 'flex' },
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': theme => ({
          width: SIDEBAR_WIDTH,
          boxSizing: 'border-box',
          borderRadius: 0,
          backgroundColor: theme.palette.surface[1],
          borderRight: `1px solid ${theme.palette.surface.outline}`,
          paddingTop: theme.spacing(3.5),
          paddingBottom: theme.spacing(3.5),
        }),
      }}
    >
      <SidebarLogo />

      <Box display="flex" flexDirection="column" alignItems="center" flex={1} justifyContent="center">
        <SidebarNav links={links} unreadCount={unread} loading={loading} />
      </Box>

      <SidebarFooter logoutLink={logoutLink} unreadCount={unread} onLogout={handleLogout} />
    </Drawer>
  );
}
