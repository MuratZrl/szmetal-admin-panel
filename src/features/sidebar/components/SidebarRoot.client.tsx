// src/features/sidebar/components/SidebarRoot.client.tsx
'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { Box, Drawer } from '@mui/material';
import { SIDEBAR_WIDTH } from '@/constants/layout';
import SidebarLogo from './SidebarLogo';
import SidebarNav from './SidebarNav';
import SidebarQuickActions from './SidebarSub';
import SidebarFooter from './SidebarFooter';
import { filterLinksByRole } from '../utils/filterLinks';
import type { SidebarLink, Role } from '../types';
import { useSidebarRealtime } from '@/features/sidebar/hooks/useSidebarRealtime.client';

import type { Tables } from '@/types/supabase';

type StatusUI = 'Active' | 'Inactive' | 'Banned' | null;

// DB'den gelen serbest metni UI union'a çevir
function toStatusUI(s: Tables<'users'>['status'] | null): StatusUI {
  const x = String(s ?? '').toLowerCase();
  if (x === 'active') return 'Active';
  if (x === 'inactive') return 'Inactive';
  if (x === 'banned') return 'Banned';
  return null;
}

type Props = {
  initialRole: Role | null;
  initialStatus: Tables<'users'>['status'] | null; // ← DB string | null gelsin
  initialUnread: number;
  userId: string | null;
  mainLinks: SidebarLink[];
};

export default function SidebarRoot({
  initialRole,
  initialStatus,
  initialUnread,
  userId,
  mainLinks,
}: Props) {
  const roleResolved: Role = initialRole ?? 'User';
  const statusUI = React.useMemo(() => toStatusUI(initialStatus), [initialStatus]);
  const loading = false;

  const [unread, setUnread] = React.useState<number>(initialUnread);
  React.useEffect(() => setUnread(initialUnread), [initialUnread]);

  const router = useRouter();
  useSidebarRealtime(userId, () => setUnread(p => p + 1));

  const filtered = React.useMemo(
    // Inactive ise /create_request’i saklayabilsin diye statusUI’yi geçir
    () => filterLinksByRole(mainLinks, roleResolved, loading, statusUI ?? 'Active'),
    [mainLinks, roleResolved, loading, statusUI]
  );

  const logoutLink = React.useMemo(
    () =>
      mainLinks.find(l => (l.section ?? 'main') === 'footer') ??
      mainLinks.find(l => l.label === 'Logout') ?? null,
    [mainLinks]
  );

  const compact = true;
  const logoHref = (statusUI === 'Inactive' ? '/account' as const : '/create_request' as const);

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        display: { xs: 'none', sm: 'flex' },
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': (theme) => {
          const bg = theme.palette.mode === 'dark'
            ? theme.palette.background.default
            : theme.palette.background.paper;
          return {
            width: SIDEBAR_WIDTH,
            boxSizing: 'border-box',
            backgroundColor: bg,
            borderRight: `1px solid ${theme.palette.divider}`,
            padding: 0,
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto 1fr auto',
            minHeight: '100dvh',
          };
        },
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3.5 }}>
        <SidebarLogo href={logoHref} />
      </Box>

      <Box aria-hidden />
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', px: 1 }}>
        <SidebarNav links={filtered} unreadCount={unread} loading={loading} compact={compact} />
      </Box>

      <Box sx={{ display: 'grid', gridTemplateRows: '1fr auto 1fr', px: 1, minHeight: 0 }}>
        <Box aria-hidden />
        <SidebarQuickActions links={filtered} compact />
        <Box aria-hidden />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pb: 3.5 }}>
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
      </Box>
    </Drawer>
  );
}
