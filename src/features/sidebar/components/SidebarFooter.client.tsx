'use client';
// src/features/sidebar/components/SidebarFooter.tsx

import { Box } from '@mui/material';
import ThemeToggle from '@/theme/ThemeToggle.client';
import SidebarNavItem from './SidebarNavItem'; // ← sonda duran "a"yı SİL
import type { SidebarLink } from '../types';

type Props = {
  logoutLink: SidebarLink | null;
  unreadCount: number;
  onLogout: () => void;
  compact?: boolean;
};

export default function SidebarFooter({ logoutLink, onLogout, compact = true }: Props) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems={compact ? 'center' : 'stretch'}
      flexDirection="column"
      sx={{ gap: .75, width: '100%', px: compact ? 0 : 1 }}
    >
      <ThemeToggle placement={compact ? 'right' : 'bottom'} />

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
