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

type OrdersBroadcast = { type: 'read-all' };

export default function SidebarRoot({ initialRole, initialUnread, userId, mainLinks }: Props) {
  const role: Role = initialRole;
  const loading = false;

  // 1) unread state
  const [unread, setUnread] = React.useState<number>(initialUnread);

  // 2) initialUnread prop değişirse state’i senkronla (router.refresh sonrası)
  React.useEffect(() => {
    setUnread(initialUnread);
  }, [initialUnread]);

  const router = useRouter();

  // Realtime INSERT → unread +1 (eski davranışın aynen kalsın)
  useSidebarRealtime(userId, () => setUnread(prev => prev + 1));

  // 3) Orders sayfasından gelen "read-all" mesajını dinle
  React.useEffect(() => {
    const bc = new BroadcastChannel('orders');
    bc.onmessage = (ev: MessageEvent) => {
      const data = ev.data as unknown;
      const msg = data as Partial<OrdersBroadcast> | null;
      if (msg && msg.type === 'read-all') {
        setUnread(0);
      }
    };
    return () => bc.close();
  }, []);

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
            borderRight: `1px solid ${theme.palette.divider}`,
            paddingTop: theme.spacing(3.5),
            paddingBottom: theme.spacing(3.5),
            borderRadius: 0,
            backgroundColor: bg,
          };
        },
      }}
    >
      <SidebarLogo />
      <Box display="flex" flexDirection="column" alignItems="center" flex={1} justifyContent="center">
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
