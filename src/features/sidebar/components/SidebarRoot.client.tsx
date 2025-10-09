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

type Props = {
  /** Server bazen null döndürebilir; içeride güvenli 'User' kullanıyoruz. */
  initialRole: Role | null;
  initialUnread: number;
  userId: string | null;
  mainLinks: SidebarLink[];
};

export default function SidebarRoot({
  initialRole,
  initialUnread,
  userId,
  mainLinks,
}: Props) {
  const roleResolved: Role = initialRole ?? 'User';
  const loading = false;

  const [unread, setUnread] = React.useState<number>(initialUnread);
  React.useEffect(() => setUnread(initialUnread), [initialUnread]);

  const router = useRouter();
  useSidebarRealtime(userId, () => setUnread(p => p + 1));

  const filtered = React.useMemo(
    () => filterLinksByRole(mainLinks, roleResolved, loading),
    [mainLinks, roleResolved, loading]
  );

  // Footer linki: section === 'footer' öncelikli, yoksa etikete düş
  const logoutLink = React.useMemo(
    () =>
      mainLinks.find(l => (l.section ?? 'main') === 'footer') ??
      mainLinks.find(l => l.label === 'Logout') ??
      null,
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
            backgroundColor: bg,
            borderRight: `1px solid ${theme.palette.divider}`,

            // Mutlak denge: dış grid ile NAV tam merkezde
            // Satırlar: [logo][TOP 1fr][NAV][BOTTOM 1fr][FOOTER]
            padding: 0,                 // padding merkez hesabını bozar, alt/üst box'lara verdik
            display: 'grid',
            gridTemplateRows: 'auto 1fr auto 1fr auto',
            minHeight: '100dvh',
          };
        },
      }}
    >
      {/* 1) Logo */}
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3.5 }}>
        <SidebarLogo />
      </Box>

      {/* 2) Üst 1fr spacer (otomatik) */}
      <Box aria-hidden />

      {/* 3) NAV: dış gridte iki 1fr arasında tam merkezde */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          px: 1,
        }}
      >
        <SidebarNav
          links={filtered}
          unreadCount={unread}
          loading={loading}
          compact={compact}
        />
      </Box>

      {/* 4) Alt bölge (1fr): iç grid ile Quick tam NAV-Footer ortasında */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateRows: '1fr auto 1fr', // [spacer][QUICK][spacer]
          px: 1,
          minHeight: 0,
        }}
      >
        <Box aria-hidden />
        <SidebarQuickActions links={filtered} compact />
        <Box aria-hidden />
      </Box>

      {/* 5) Footer en altta */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          pb: 3.5,
        }}
      >
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
