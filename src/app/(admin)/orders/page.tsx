// app/(admin)/orders/page.tsx
export const revalidate = 0;
export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import * as React from 'react';
import { Box, Stack, Typography } from '@mui/material';

import InboxGrid from '@/features/orders/components/InboxGrid.client';
import { fetchInboxForCurrentUser } from '@/features/orders/services/index.server';
import { requirePageAccess } from '@/lib/supabase/auth/guards.server';

export default async function OrdersInboxPage() {
  // Inactive ise /account, rol yetmiyorsa /unauthorized
  await requirePageAccess('/orders');

  const { userId, rows } = await fetchInboxForCurrentUser();

  return (
    <Box sx={{ p: 2 }}>
      <Stack spacing={2}>
        <Typography variant="h6">Gelen Kutusu</Typography>
        <InboxGrid initialRows={rows} userId={userId} />
      </Stack>
    </Box>
  );
}
