'use client';

import * as React from 'react';

import { useRouter, usePathname } from 'next/navigation';

import { Drawer, Box } from '@mui/material';

import { SIDEBAR_WIDTH } from '@/constants/layout';

import SidebarNav from './SidebarNav';
import SidebarLogo from './SidebarLogo';
import SidebarFooter from './SidebarFooter';

import type { SidebarLink, Role } from '../types';
import { filterLinksByRole } from '../utils/filterLinks';

import { useSidebarRealtime } from '@/features/sidebar/hooks/useSidebarRealtime.client';

type Props = {
  initialRole: Role;
  initialUnread: number;
  userId: string | null;
  mainLinks: SidebarLink[];
};

/** moved etiketlerini, target etiketinden hemen sonra yerleştirir. */
function reorderAfter<T extends { label: string }>(
  items: readonly T[],
  target: string,
  moved: readonly string[]
): T[] {
  const present = new Map(items.map(i => [i.label, i]));
  const movedItems: T[] = [];
  const movedSet = new Set<string>();

  for (const m of moved) {
    const it = present.get(m);
    if (it) {
      movedItems.push(it);
      movedSet.add(m);
    }
  }

  const base: T[] = items.filter(i => !movedSet.has(i.label));
  const idx = base.findIndex(i => i.label === target);
  if (idx === -1 || movedItems.length === 0) return items.slice();

  return [...base.slice(0, idx + 1), ...movedItems, ...base.slice(idx + 1)];
}

export default function SidebarRoot({ initialRole, initialUnread, userId, mainLinks }: Props) {
  const role: Role = initialRole;
  const loading = false;

  const [unread, setUnread] = React.useState<number>(initialUnread);
  const router = useRouter();
  const pathname = usePathname();

  useSidebarRealtime(userId, () => setUnread(prev => prev + 1));

  const filtered = React.useMemo(
    () => filterLinksByRole(mainLinks, role, loading),
    [mainLinks, role, loading]
  );

  // Products → Create Request → Orders sırası
  const centerLinks = React.useMemo(
    () => reorderAfter(filtered, 'Products', ['Create Request', 'Orders'] as const),
    [filtered]
  );

  // /orders sayfasına her girişte okunduya çek ve badge’i sıfırla
  const clearingRef = React.useRef(false);
  React.useEffect(() => {
    if (!pathname?.startsWith('/orders')) return;
    if (clearingRef.current) return;
    clearingRef.current = true;

    (async () => {
      try {
        await fetch('/api/orders/mark-read', {
          method: 'POST',
          credentials: 'include',
          headers: { 'content-type': 'application/json' },
        });
        setUnread(0);
      } finally {
        // Sonraki sayfa geçişinde tekrar tetiklenebilsin
        clearingRef.current = false;
      }
    })();
  }, [pathname]);

  const logoutLink = React.useMemo(
    () => mainLinks.find(l => l.label === 'Logout') ?? null,
    [mainLinks]
  );

  const handleLogout = React.useCallback(async () => {
    try {
      await fetch('/api/logout', { method: 'POST', credentials: 'include' });
    } finally {
      router.replace('/login');
      router.refresh();
    }
  }, [router]);

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
        <SidebarNav links={centerLinks} unreadCount={unread} loading={loading} compact={compact} />
      </Box>
      <SidebarFooter logoutLink={logoutLink} unreadCount={unread} onLogout={handleLogout} />
    </Drawer>
  );
}
