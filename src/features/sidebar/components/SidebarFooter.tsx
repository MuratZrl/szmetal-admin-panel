'use client';

import * as React from 'react';
import { Box } from '@mui/material';

import ThemeToggleSidebar from '@/theme/ThemeToggle.client';
import SidebarNavItem from './SidebarNavItem';
import type { SidebarLink } from '../types';

type Props = {
  logoutLink: SidebarLink | null;
  unreadCount: number;
  onLogout: () => void;
};

export default function SidebarFooter({ logoutLink, unreadCount, onLogout }: Props) {
  return (
    <Box
      display="flex"
      justifyContent="center"
      alignItems="center"
      flexDirection="column"
      sx={{ gap: 0.5 }}
    >
      <ThemeToggleSidebar />

      {logoutLink ? (
        <SidebarNavItem
          link={logoutLink}
          unreadCount={unreadCount}
          active={false}
          compact
          onLogout={onLogout}
        />
      ) : null}
    </Box>
  );
}
