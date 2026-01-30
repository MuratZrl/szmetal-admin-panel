'use client';
// src/features/sidebar/components/SidebarSkeleton.client.tsx

import * as React from 'react';

import { Box, Stack, Skeleton, Divider, Grid } from '@mui/material';

type SidebarSkeletonProps = {
  collapsed?: boolean;
  navItemLines?: number;
  showFooter?: boolean;
};

export default function SidebarSkeleton({
  collapsed = false,
  navItemLines = 8,
  showFooter = true,
}: SidebarSkeletonProps) {
  // Genişlikler: daraltılmış ve normal durum için duyarlı değerler
  const sidebarWidth = collapsed
    ? { xs: 64, sm: 72, md: 80 }
    : { xs: 240, sm: 256, md: 280 };

  // Nav satırlarının genişliklerini biraz çeşitlendirelim ki robot gibi durmasın
  const widths: number[] = React.useMemo(() => {
    const base = [0.92, 0.85, 0.78, 0.9, 0.67, 0.8, 0.74, 0.88, 0.7, 0.95];
    return Array.from({ length: navItemLines }, (_, i) => {
      const ratio = base[i % base.length];
      return Math.round(((collapsed ? 40 : 180) * ratio));
    });
  }, [navItemLines, collapsed]);

  return (
    <Box
      component="aside"
      aria-label="sidebar"
      sx={{
        width: sidebarWidth,
        flexShrink: 0,
        borderRight: theme => `1px solid ${theme.palette.divider}`,
        bgcolor: theme => theme.palette.background.paper,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box sx={{ p: 1.5 }}>
        <Stack alignItems="center" spacing={1}>
          <Skeleton
            variant="rounded"
            width={collapsed ? 36 : 60}
            height={40}
            sx={{ mx: 'auto' }}
          />
          {!collapsed && (
            <Skeleton variant="text" width={96} height={18} />
          )}
        </Stack>
      </Box>

      <Divider />

      <Box sx={{ px: 1.5, py: 1.25 }}>
        <Grid container spacing={1}>
          <Grid size={{ xs: 12, sm: 12, md: 12 }} >
            <Stack direction="row" spacing={1.25} alignItems="center">
              <Skeleton variant="circular" width={32} height={32} />
              {!collapsed && (
                <Stack spacing={0.5} sx={{ flex: 1, minWidth: 0 }}>
                  <Skeleton variant="text" width="70%" height={16} />
                  <Skeleton variant="text" width="45%" height={14} />
                </Stack>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Box>

      <Divider />

      <Box sx={{ px: 1, pt: 1, pb: 1, overflowY: 'auto', flex: 1 }}>
        <Grid container spacing={0.5}>
          {widths.map((w, idx) => (
            <Grid key={idx} size={{ xs: 12, sm: 12, md: 12 }} >
              <Stack direction="row" spacing={1} alignItems="center" sx={{ px: 0.5, py: 0.5 }}>
                <Skeleton variant="circular" width={collapsed ? 18 : 20} height={collapsed ? 18 : 20} />
                <Skeleton
                  variant="rounded"
                  width={collapsed ? 0 : w}
                  height={14}
                  sx={{ display: collapsed ? 'none' : 'block' }}
                />
              </Stack>
            </Grid>
          ))}
        </Grid>
      </Box>

      {showFooter && (
        <>
          <Divider />
          <Box sx={{ p: 1.25 }}>
            <Stack direction="row" spacing={1} alignItems="center" justifyContent={collapsed ? 'center' : 'space-between'}>
              <Skeleton variant="circular" width={24} height={24} />
              {!collapsed && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Skeleton variant="circular" width={24} height={24} />
                  <Skeleton variant="circular" width={24} height={24} />
                </Stack>
              )}
            </Stack>
          </Box>
        </>
      )}
    </Box>
  );
}
