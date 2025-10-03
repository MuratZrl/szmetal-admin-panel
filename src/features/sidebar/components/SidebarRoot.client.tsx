// features/sidebar/components/SidebarRoot.client.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Drawer, Box } from '@mui/material';
import { SIDEBAR_WIDTH } from '@/constants/layout';
import SidebarLogo from './SidebarLogo';
import SidebarNav from './SidebarNav';
import SidebarFooter from './SidebarFooter';
import { filterLinksByRole } from '../utils/filterLinks';
import type { SidebarLink, Role } from '../types';
import { useSidebarRealtime } from '@/features/sidebar/hooks/useSidebarRealtime.client';

type Props = {
  initialRole: Role;
  initialUnread: number;
  userId: string | null;
  mainLinks: SidebarLink[];
};

export default function SidebarRoot({ initialRole, initialUnread, userId, mainLinks }: Props) {
  const role: Role = initialRole;
  const loading = false;

  // unread server ile aynı başlayıp client'ta artacak
  const [unread, setUnread] = React.useState<number>(initialUnread);
  const router = useRouter();

  // sadece mount sonrası çalışır; hydration'ı bozmaz
  useSidebarRealtime(userId, () => setUnread(prev => prev + 1));

  const filtered = React.useMemo(
    () => filterLinksByRole(mainLinks, role, loading),
    [mainLinks, role, loading]
  );

  const logoutLink = React.useMemo(
    () => mainLinks.find(l => l.label === 'Logout') ?? null,
    [mainLinks]
  );

  const compact = true;

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        display: { xs: 'none', sm: 'flex' },
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': (theme) => {
          const bg =
            theme.palette.mode === 'dark'
              ? theme.palette.background.default
              : theme.palette.background.paper;
          return {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            borderRadius: 0,
            backgroundColor: bg,
            borderRight: `1px solid ${theme.palette.divider}`,
            paddingTop: theme.spacing(3.5),
            paddingBottom: theme.spacing(3.5),
          };
        },
      }}
    >
      <SidebarLogo />
      <Box display="flex" flexDirection="column" alignItems="center" flex={1} justifyContent="center">
        {/* Tooltip placement tek tek SidebarNavItem içinde verilecek.
           Lokal ThemeProvider KULLANMA. */}
        <SidebarNav links={filtered} unreadCount={unread} loading={loading} compact={compact} />
      </Box>
      <SidebarFooter
        logoutLink={logoutLink}
        unreadCount={unread}
        onLogout={() => {
          fetch('/api/logout', { method: 'POST', credentials: 'include' })
            .finally(() => {
              router.replace('/login');
              router.refresh();
            });
        }}
      />
    </Drawer>
  );
}
