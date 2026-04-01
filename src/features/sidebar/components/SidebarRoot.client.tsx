'use client';
// src/features/sidebar/components/SidebarRoot.client.tsx

import * as React from 'react';

import { Box, Drawer, Stack, Grid, Skeleton } from '@mui/material';
import { type Theme } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { SIDEBAR_WIDTH_COMPACT, SIDEBAR_WIDTH_EXPANDED } from '@/constants/layout';
import SidebarLogo from './SidebarLogo';
import SidebarNav from './SidebarNav.client';
import SidebarQuickActions from './SidebarSub.client';
import SidebarFooter from './SidebarFooter.client';
import { filterLinksByRole } from '../utils/filterLinks';
import type { SidebarLink, Role } from '../types';

import { useSidebarRealtime } from '@/features/sidebar/hooks/useSidebarRealtime.client';

import type { Tables } from '@/types/supabase';

type StatusUI = 'Active' | 'Inactive' | 'Banned' | null;

function toStatusUI(s: Tables<'users'>['status'] | null): StatusUI {
  const x = String(s ?? '').toLowerCase();
  if (x === 'active') return 'Active';
  if (x === 'inactive') return 'Inactive';
  if (x === 'banned') return 'Banned';
  return null;
}

type Props = {
  initialRole: Role | null;
  initialStatus: Tables<'users'>['status'] | null;
  initialUnread: number;
  userId: string | null;
  mainLinks: SidebarLink[];
  loading?: boolean;
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
  expanded?: boolean;
  onToggleExpanded?: () => void;
};

const MOBILE_SIDEBAR_WIDTH = 280;

const TRANSITION = 'width 0.25s cubic-bezier(0.4, 0, 0.2, 1)';

export default function SidebarRoot({
  initialRole,
  initialStatus,
  initialUnread,
  userId,
  mainLinks,
  loading = false,
  mobileOpen = false,
  onCloseMobile,
  expanded = false,
  onToggleExpanded,
}: Props) {
  const roleResolved: Role = initialRole ?? 'User';
  const statusUI = React.useMemo(() => toStatusUI(initialStatus), [initialStatus]);

  const [unread, setUnread] = React.useState<number>(initialUnread);
  React.useEffect(() => setUnread(initialUnread), [initialUnread]);

  useSidebarRealtime(userId, () => setUnread(p => p + 1));

  const isLoading =
    loading || initialRole === null || initialStatus === null || mainLinks.length === 0;

  const filtered = React.useMemo(
    () => filterLinksByRole(mainLinks, roleResolved, isLoading, statusUI ?? 'Active'),
    [mainLinks, roleResolved, isLoading, statusUI]
  );

  const logoutLink = React.useMemo(
    () =>
      mainLinks.find(l => (l.section ?? 'main') === 'footer') ??
      mainLinks.find(l => l.label === 'Logout') ??
      null,
    [mainLinks]
  );

  const logoHref = '/account' as const;

  const desktopWidth = expanded ? SIDEBAR_WIDTH_EXPANDED : SIDEBAR_WIDTH_COMPACT;
  const compact = !expanded;

  // Drawer kağıdı: genişliği parametreyle veren fabrika
  const paperSx =
    (w: number, animate = false) =>
    (theme: Theme) => {
      const bg =
        theme.palette.mode === 'dark'
          ? theme.palette.background.default
          : theme.palette.background.paper;
      return {
        width: w,
        boxSizing: 'border-box',
        backgroundColor: bg,
        borderRight: `1px solid ${theme.palette.divider}`,
        padding: 0,
        display: 'grid',
        gridTemplateRows: 'auto 1fr auto 1fr auto',
        minHeight: '100dvh',
        ...(animate ? { transition: TRANSITION } : {}),
      };
    };

  const renderSkeleton = () => (
    <>
      <Box sx={{ display: 'flex', justifyContent: 'center', pt: 3.5 }}>
        <Skeleton variant="rounded" width={60} height={40} />
      </Box>

      <Box aria-hidden />
      <Box sx={{ px: 1, pt: 1, pb: 1 }}>
        <Grid container spacing={0.5}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid key={i} size={{ xs: 12 }} >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 0.5, py: 0.5 }}>
                <Skeleton variant="circular" width={20} height={20} />
                {!compact && <Skeleton variant="rounded" width={140} height={14} />}
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Box sx={{ display: 'grid', gridTemplateRows: '1fr auto 1fr', px: 1, minHeight: 0 }}>
        <Box aria-hidden />
        <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 0.5, py: 1 }}>
          <Skeleton variant="circular" width={18} height={18} />
          {!compact && <Skeleton variant="rounded" width={140} height={14} />}
        </Stack>
        <Box aria-hidden />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', pb: 3.5 }}>
        <Stack direction="row" spacing={1.5} alignItems="center">
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="circular" width={24} height={24} />
          <Skeleton variant="circular" width={24} height={24} />
        </Stack>
      </Box>
    </>
  );

  const renderContent = (isCompact: boolean) => {
    if (isLoading) return renderSkeleton();

    return (
      <>
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', pt: 3.5, gap: 2 }}>
          <SidebarLogo
            href={logoHref}
            variant={isCompact ? 'compact' : 'expanded'}
          />

          {onToggleExpanded && (
            <Box
              onClick={onToggleExpanded}
              sx={(t) => ({
                width: 28,
                height: 28,
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                color: t.palette.text.disabled,
                '&:hover': {
                  color: t.palette.text.primary,
                  bgcolor: t.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.06)',
                },
              })}
            >
              {isCompact ? <ChevronRightIcon sx={{ fontSize: 18 }} /> : <ChevronLeftIcon sx={{ fontSize: 18 }} />}
            </Box>
          )}
        </Box>

        <Box aria-hidden />
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: isCompact ? 'center' : 'stretch', px: 1, width: '100%' }}>
          <SidebarNav links={filtered} unreadCount={unread} loading={false} compact={isCompact} />
        </Box>

        <Box sx={{ display: 'grid', gridTemplateRows: '1fr auto 1fr', px: 1, minHeight: 0 }}>
          <Box aria-hidden />
          <SidebarQuickActions links={filtered} compact={isCompact} />
          <Box aria-hidden />
        </Box>

        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: isCompact ? 'center' : 'stretch', pb: 2, gap: 1.5, px: isCompact ? 0 : 1 }}>
          <SidebarFooter
            logoutLink={logoutLink}
            unreadCount={unread}
            compact={isCompact}
            onLogout={() => {
              fetch('/api/logout', { method: 'POST', credentials: 'include' }).finally(() => {
                window.location.replace('/login');
              });
            }}
          />
        </Box>
      </>
    );
  };

  return (
    <>
      {/* Mobil: geniş (metinli) */}
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={onCloseMobile}
        ModalProps={{ keepMounted: true, disableScrollLock: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': paperSx(MOBILE_SIDEBAR_WIDTH),
        }}
      >
        {renderContent(false)}
      </Drawer>

      {/* Masaüstü: kompakt/genişletilmiş */}
      <Drawer
        variant="permanent"
        anchor="left"
        sx={{
          display: { xs: 'none', sm: 'block' },
          flexShrink: 0,
          '& .MuiDrawer-paper': paperSx(desktopWidth, true),
        }}
      >
        {renderContent(compact)}
      </Drawer>
    </>
  );
}
