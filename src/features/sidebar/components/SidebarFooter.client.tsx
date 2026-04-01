'use client';
// src/features/sidebar/components/SidebarFooter.tsx

import { Box } from '@mui/material';
import ThemeToggle from '@/theme/ThemeToggle.client';
import NotificationBell from '@/features/notifications/components/NotificationBell.client';
import SidebarNavItem from './SidebarNavItem';
import type { SidebarLink } from '../types';

type Props = {
  logoutLink: SidebarLink | null;
  unreadCount: number;
  onLogout: () => void;
  onMarkRead?: (count: number) => void;
  compact?: boolean;
};

export default function SidebarFooter({ logoutLink, unreadCount, onLogout, onMarkRead, compact = true }: Props) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems={compact ? 'center' : 'stretch'}
      flexDirection="column"
      sx={{ gap: .75, width: '100%', px: compact ? 0 : 1 }}
    >
      <ThemeToggle placement={compact ? 'right' : 'bottom'} compact={compact} />

      <NotificationBell
        unreadCount={unreadCount}
        compact={compact}
        onMarkRead={onMarkRead}
      />

      {logoutLink ? (
        <SidebarNavItem
          link={logoutLink}
          active={false}
          compact={compact}
          onLogout={onLogout}
        />
      ) : null}
    </Box>
  );
}
